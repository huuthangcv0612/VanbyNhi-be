import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { R2StorageService } from './r2-storage.service.js';

// Mock @aws-sdk/s3-request-presigner
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://r2.mock.cloudflarestorage.com/signed-url'),
}));

describe('R2StorageService', () => {
  let service: R2StorageService;
  let configMock: any;

  beforeEach(() => {
    configMock = {
      get: vi.fn((key: string) => {
        const configs: Record<string, string> = {
          R2_ACCOUNT_ID: 'test-account-id',
          R2_ACCESS_KEY_ID: 'test-access-key',
          R2_SECRET_ACCESS_KEY: 'test-secret-key',
          R2_BUCKET_NAME: 'test-bucket',
          R2_PRESIGNED_URL_TTL_SECONDS: '300',
          MAX_UPLOAD_SIZE_BYTES: '52428800', // 50MB
        };
        return configs[key];
      }),
    };

    service = new R2StorageService(configMock);
  });

  describe('isMimeTypeAllowed', () => {
    it('cho phép các định dạng tài liệu phổ biến (PDF, DOCX, PNG)', () => {
      expect(service.isMimeTypeAllowed('application/pdf')).toBe(true);
      expect(
        service.isMimeTypeAllowed(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).toBe(true);
      expect(service.isMimeTypeAllowed('image/png')).toBe(true);
    });

    it('từ chối các định dạng không an toàn hoặc không được hỗ trợ (.exe, .sh)', () => {
      expect(service.isMimeTypeAllowed('application/x-msdownload')).toBe(false);
      expect(service.isMimeTypeAllowed('application/x-sh')).toBe(false);
      expect(service.isMimeTypeAllowed('')).toBe(false);
    });
  });

  describe('createPresignedPutUrl', () => {
    it('tạo presigned PUT URL thành công cho file hợp lệ', async () => {
      const res = await service.createPresignedPutUrl(
        'docs/test-key',
        'application/pdf',
        1024 * 1024,
      );

      expect(res.uploadUrl).toBe('https://r2.mock.cloudflarestorage.com/signed-url');
      expect(res.storageKey).toBe('docs/test-key');
      expect(res.expiresInSeconds).toBe(300);
      expect(res.requiredHeaders['Content-Type']).toBe('application/pdf');
      expect((res.requiredHeaders as any)['Content-Length']).toBeUndefined();
    });

    it('từ chối khi MIME type không được phép (tình huống 12)', async () => {
      await expect(
        service.createPresignedPutUrl(
          'docs/malicious-file',
          'application/x-dosexec',
          1024,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi dung lượng vượt quá giới hạn cấu hình (tình huống 12)', async () => {
      const oversized = 60 * 1024 * 1024; // 60MB > 50MB limit
      await expect(
        service.createPresignedPutUrl(
          'docs/large-file',
          'application/pdf',
          oversized,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPresignedGetUrl', () => {
    it('tạo presigned GET URL thành công có encode tên file gốc UTF-8', async () => {
      const res = await service.createPresignedGetUrl(
        'docs/test-key',
        'Đề thi Ngữ Văn 10.pdf',
      );

      expect(res.downloadUrl).toBe('https://r2.mock.cloudflarestorage.com/signed-url');
      expect(res.expiresInSeconds).toBe(300);
    });
  });

  describe('getObjectMetadata', () => {
    it('trả về metadata khi object tồn tại trên R2', async () => {
      const s3SendMock = vi.fn().mockResolvedValue({
        ContentLength: 2048,
        ContentType: 'application/pdf',
        ETag: '"etag-123"',
        LastModified: new Date(),
      });
      (service as any).s3Client.send = s3SendMock;

      const metadata = await service.getObjectMetadata('docs/existing-key');
      expect(metadata).not.toBeNull();
      expect(metadata?.sizeBytes).toBe(2048);
      expect(metadata?.contentType).toBe('application/pdf');
    });

    it('trả về null khi object không tồn tại (404) (tình huống 13)', async () => {
      const notFoundError = new Error('NotFound');
      (notFoundError as any).name = 'NotFound';
      (notFoundError as any).$metadata = { httpStatusCode: 404 };

      const s3SendMock = vi.fn().mockRejectedValue(notFoundError);
      (service as any).s3Client.send = s3SendMock;

      const metadata = await service.getObjectMetadata('docs/non-existing-key');
      expect(metadata).toBeNull();
    });
  });

  describe('validateFileSignature', () => {
    it('cho phép PDF có magic bytes %PDF', async () => {
      const pdfHeader = Buffer.from('%PDF-1.7\n%abc');
      const asyncIterable = {
        async *[Symbol.asyncIterator]() {
          yield pdfHeader;
        },
      };

      (service as any).s3Client.send = vi.fn().mockResolvedValue({
        Body: asyncIterable,
      });

      const isValid = await service.validateFileSignature(
        'docs/valid.pdf',
        'application/pdf',
      );
      expect(isValid).toBe(true);
    });

    it('từ chối khi file khai báo PDF nhưng header không phải %PDF (tình huống 12)', async () => {
      const fakeHeader = Buffer.from('MZ\x90\x00\x03\x00\x00\x00'); // DOS/EXE header
      const asyncIterable = {
        async *[Symbol.asyncIterator]() {
          yield fakeHeader;
        },
      };

      (service as any).s3Client.send = vi.fn().mockResolvedValue({
        Body: asyncIterable,
      });

      await expect(
        service.validateFileSignature('docs/fake.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteObject & deleteObjects', () => {
    it('xóa một object thành công', async () => {
      (service as any).s3Client.send = vi.fn().mockResolvedValue({});
      const res = await service.deleteObject('docs/to-delete');
      expect(res).toBe(true);
    });

    it('xóa danh sách nhiều object phục vụ cleanup mồ côi (tình huống 15)', async () => {
      (service as any).s3Client.send = vi.fn().mockResolvedValue({
        Deleted: [{ Key: 'k1' }, { Key: 'k2' }],
        Errors: [],
      });
      const count = await service.deleteObjects(['k1', 'k2']);
      expect(count).toBe(2);
    });
  });
});
