import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BadGatewayException } from '@nestjs/common';
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

  it('khởi tạo thành công phòng Meet và trả về meetingUri thực tế', async () => {
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

    const space = await service.createSpace('valid-google-access-token');

    expect(space).toEqual({
      name: 'spaces/jQCFfuBOdN5z',
      meetingUri: 'https://meet.google.com/abc-mnop-xyz',
      meetingCode: 'abc-mnop-xyz',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://meet.googleapis.com/v2/spaces',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-google-access-token',
        }),
      }),
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

  it('xử lý khi Google Meet API bị quá thời gian chờ (Timeout)', async () => {
    global.fetch = vi.fn().mockRejectedValue({
      name: 'TimeoutError',
      message: 'The operation was aborted due to timeout',
    });

    await expect(service.createSpace('valid-token')).rejects.toThrow(
      /quá thời gian chờ \(Timeout sau 10s\)/,
    );
  });

  it('báo lỗi nếu Google Meet API trả về meetingUri không đúng chuẩn', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'spaces/12345',
        meetingUri: 'http://fake-site.com/abc',
      }),
    } as any);

    await expect(service.createSpace('valid-token')).rejects.toThrow(
      /meetingUri do Google Meet API trả về không hợp lệ/,
    );
  });
});
