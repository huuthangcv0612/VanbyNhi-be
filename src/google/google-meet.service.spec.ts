import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BadGatewayException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleMeetService } from './google-meet.service.js';

describe('GoogleMeetService', () => {
  let service: GoogleMeetService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      GOOGLE_MEET_ACCESS_TYPE: 'TRUSTED',
    });
    service = new GoogleMeetService(configService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cấu hình GOOGLE_MEET_ACCESS_TYPE', () => {
    it('chấp nhận các giá trị accessType hợp lệ (OPEN, TRUSTED, RESTRICTED)', () => {
      const openService = new GoogleMeetService(
        new ConfigService({ GOOGLE_MEET_ACCESS_TYPE: 'open' }),
      );
      expect(openService.getValidatedAccessType()).toBe('OPEN');

      const trustedService = new GoogleMeetService(
        new ConfigService({ GOOGLE_MEET_ACCESS_TYPE: 'TRUSTED' }),
      );
      expect(trustedService.getValidatedAccessType()).toBe('TRUSTED');

      const restrictedService = new GoogleMeetService(
        new ConfigService({ GOOGLE_MEET_ACCESS_TYPE: 'restricted' }),
      );
      expect(restrictedService.getValidatedAccessType()).toBe('RESTRICTED');
    });

    it('fallback an toàn về TRUSTED khi giá trị không hợp lệ hoặc để trống', () => {
      const invalidService = new GoogleMeetService(
        new ConfigService({ GOOGLE_MEET_ACCESS_TYPE: 'INVALID_TYPE' }),
      );
      expect(invalidService.getValidatedAccessType()).toBe('TRUSTED');

      const emptyService = new GoogleMeetService(new ConfigService({}));
      expect(emptyService.getValidatedAccessType()).toBe('TRUSTED');
    });
  });

  describe('Xác thực meetingUri an toàn', () => {
    it('chấp nhận URL Google Meet hợp lệ', () => {
      const res = service.validateMeetingUri('https://meet.google.com/abc-mnop-xyz');
      expect(res).toEqual({
        meetingUri: 'https://meet.google.com/abc-mnop-xyz',
        meetingCode: 'abc-mnop-xyz',
      });
    });

    it('từ chối URL không sử dụng HTTPS', () => {
      expect(() =>
        service.validateMeetingUri('http://meet.google.com/abc-mnop-xyz'),
      ).toThrow(/không sử dụng giao thức HTTPS/);
    });

    it('từ chối URL có hostname giả mạo hoặc subdomain lừa đảo', () => {
      expect(() =>
        service.validateMeetingUri('https://meet.google.com.evil.com/abc-mnop-xyz'),
      ).toThrow(/không thuộc tên miền meet.google.com/);

      expect(() =>
        service.validateMeetingUri('https://evil-site.com/meet.google.com'),
      ).toThrow(/không thuộc tên miền meet.google.com/);
    });

    it('từ chối URL có mã phòng chứa ký tự không hợp lệ hoặc rỗng', () => {
      expect(() =>
        service.validateMeetingUri('https://meet.google.com/'),
      ).toThrow(/không chứa mã cuộc họp hợp lệ/);

      expect(() =>
        service.validateMeetingUri('https://meet.google.com/abc/def/ghi'),
      ).toThrow(/không chứa mã cuộc họp hợp lệ/);
    });

    it('từ chối chuỗi rỗng hoặc URL sai cú pháp', () => {
      expect(() => service.validateMeetingUri('')).toThrow(BadGatewayException);
      expect(() => service.validateMeetingUri('not-a-valid-url')).toThrow(
        BadGatewayException,
      );
    });
  });

  describe('Tạo phòng Google Meet qua API (createSpace)', () => {
    it('khởi tạo thành công phòng Meet và không trả về token hoặc dữ liệu nhạy cảm', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'spaces/jQCFfuBOdN5z',
          meetingUri: 'https://meet.google.com/abc-mnop-xyz',
          meetingCode: 'abc-mnop-xyz',
          config: { accessType: 'TRUSTED' },
        }),
      } as any);

      const space = await service.createSpace('secret-google-access-token');

      // Phải trả về đúng thông tin phòng họp
      expect(space).toEqual({
        name: 'spaces/jQCFfuBOdN5z',
        meetingUri: 'https://meet.google.com/abc-mnop-xyz',
        meetingCode: 'abc-mnop-xyz',
      });

      // Tuyệt đối không chứa token hay secret
      expect(space).not.toHaveProperty('accessToken');
      expect(space).not.toHaveProperty('config');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://meet.googleapis.com/v2/spaces',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer secret-google-access-token',
          }),
        }),
      );
    });

    it('báo lỗi khi thiếu Access Token khi gọi API', async () => {
      await expect(service.createSpace('')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('xử lý khi Google Meet API trả về lỗi HTTP 403 / 500', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            code: 403,
            message:
              'Google Meet API has not been used in project before or it is disabled.',
            status: 'PERMISSION_DENIED',
          },
        }),
      } as any);

      await expect(service.createSpace('valid-token')).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('xử lý khi Google Meet API bị quá thời gian chờ (Timeout 10s)', async () => {
      global.fetch = vi.fn().mockRejectedValue({
        name: 'TimeoutError',
        message: 'The operation was aborted due to timeout',
      });

      await expect(service.createSpace('valid-token')).rejects.toThrow(
        /quá thời gian chờ \(Timeout sau 10s\)/,
      );
    });

    it('xử lý khi Google Meet API trả về phản hồi không phải JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Unexpected token < in JSON at position 0');
        },
      } as any);

      await expect(service.createSpace('valid-token')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });
});
