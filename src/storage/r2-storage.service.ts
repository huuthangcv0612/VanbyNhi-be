import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type {
  PresignedPutUrlResult,
  PresignedGetUrlResult,
  ObjectMetadataResult,
} from './storage.interface.js';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly defaultTtlSeconds: number;
  private readonly maxUploadSizeBytes: number;
  private readonly allowedMimeTypes: Set<string>;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID') ?? '';
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID') ?? '';
    const secretAccessKey =
      this.configService.get<string>('R2_SECRET_ACCESS_KEY') ?? '';
    this.bucketName =
      this.configService.get<string>('R2_BUCKET_NAME') ?? 'vanbynhi-documents';

    const customEndpoint = this.configService.get<string>('R2_ENDPOINT');
    const endpoint =
      customEndpoint && customEndpoint.trim() !== ''
        ? customEndpoint
        : accountId
          ? `https://${accountId}.r2.cloudflarestorage.com`
          : 'http://localhost:9000'; // Fallback nếu dev / test

    const region = this.configService.get<string>('R2_REGION') ?? 'auto';

    this.defaultTtlSeconds = Number(
      this.configService.get<string>('R2_PRESIGNED_URL_TTL_SECONDS') ?? 300,
    );

    this.maxUploadSizeBytes = Number(
      this.configService.get<string>('MAX_UPLOAD_SIZE_BYTES') ?? 104857600, // 100MB
    );

    const configuredMimes = this.configService.get<string>(
      'ALLOWED_DOCUMENT_MIME_TYPES',
    );
    const defaultMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed',
    ];

    const mimeList = configuredMimes
      ? configuredMimes.split(',').map((m) => m.trim().toLowerCase())
      : defaultMimes;
    this.allowedMimeTypes = new Set(mimeList);

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    if (!accountId && !customEndpoint) {
      this.logger.warn(
        'Cloudflare R2 chưa được cấu hình đầy đủ (R2_ACCOUNT_ID / R2_ENDPOINT trống). Các yêu cầu tới R2 có thể thất bại.',
      );
    }
  }

  /**
   * Sinh key lưu trữ an toàn duy nhất trên R2
   */
  generateStorageKey(prefix = 'docs'): string {
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const uniqueId = randomUUID();
    return `${prefix}/${datePrefix}/${uniqueId}`;
  }

  /**
   * Kiểm tra loại MIME có được cho phép không
   */
  isMimeTypeAllowed(mimeType: string): boolean {
    if (!mimeType) return false;
    return this.allowedMimeTypes.has(mimeType.toLowerCase());
  }

  /**
   * Lấy giới hạn dung lượng tối đa (bytes)
   */
  getMaxUploadSizeBytes(): number {
    return this.maxUploadSizeBytes;
  }

  /**
   * Tạo presigned URL cho client tải trực tiếp lên Cloudflare R2 qua method PUT
   */
  async createPresignedPutUrl(
    storageKey: string,
    mimeType: string,
    sizeBytes: number,
    ttlSeconds?: number,
  ): Promise<PresignedPutUrlResult> {
    if (!this.isMimeTypeAllowed(mimeType)) {
      throw new BadRequestException(
        `Loại file '${mimeType}' không được hỗ trợ. Các định dạng được phép: PDF, Word, PowerPoint, Excel, văn bản, ảnh, zip`,
      );
    }

    if (sizeBytes > this.maxUploadSizeBytes) {
      const maxMb = Math.round(this.maxUploadSizeBytes / (1024 * 1024));
      throw new BadRequestException(
        `Dung lượng file (${Math.round(sizeBytes / (1024 * 1024))}MB) vượt quá giới hạn tối đa cho phép (${maxMb}MB)`,
      );
    }

    const expiresIn = ttlSeconds ?? this.defaultTtlSeconds;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        uploadUrl,
        storageKey,
        expiresInSeconds: expiresIn,
        requiredHeaders: {
          'Content-Type': mimeType,
        },
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi tạo presigned PUT URL cho key ${storageKey}: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException(
        'Không thể khởi tạo phiên upload tài liệu. Vui lòng thử lại sau.',
      );
    }
  }

  /**
   * Tạo presigned URL cho client tải/xem tài liệu qua method GET
   */
  async createPresignedGetUrl(
    storageKey: string,
    originalName?: string,
    ttlSeconds?: number,
  ): Promise<PresignedGetUrlResult> {
    const expiresIn = ttlSeconds ?? this.defaultTtlSeconds;

    try {
      let contentDisposition: string | undefined;
      if (originalName) {
        // Hỗ trợ tên file UTF-8 chuẩn RFC 5987
        const encodedName = encodeURIComponent(originalName);
        contentDisposition = `inline; filename="${encodedName}"; filename*=UTF-8''${encodedName}`;
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        ResponseContentDisposition: contentDisposition,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        downloadUrl,
        expiresInSeconds: expiresIn,
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi tạo presigned GET URL cho key ${storageKey}: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException(
        'Không thể tạo liên kết tải tài liệu. Vui lòng thử lại sau.',
      );
    }
  }

  /**
   * Kiểm tra object có tồn tại trên R2 hay không và lấy metadata
   */
  async getObjectMetadata(
    storageKey: string,
  ): Promise<ObjectMetadataResult | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      const response = await this.s3Client.send(command);

      return {
        sizeBytes: response.ContentLength ?? 0,
        contentType: response.ContentType,
        etag: response.ETag,
        lastModified: response.LastModified,
      };
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      this.logger.error(
        `Lỗi khi kiểm tra object ${storageKey}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Không thể xác thực file trên hệ thống lưu trữ.',
      );
    }
  }

  /**
   * Kiểm tra tính hợp lệ của file thông qua signature / magic bytes (chống giả mạo MIME type)
   */
  async validateFileSignature(
    storageKey: string,
    expectedMimeType: string,
  ): Promise<boolean> {
    try {
      // Đọc 16 bytes đầu để kiểm tra header magic bytes
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Range: 'bytes=0-15',
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        return false;
      }

      const stream = response.Body as any;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const header = Buffer.concat(chunks);

      const mime = expectedMimeType.toLowerCase();

      // Kiểm tra PDF: bắt đầu bằng %PDF (0x25 0x50 0x44 0x46)
      if (mime === 'application/pdf') {
        const isPdf = header.toString('ascii', 0, 4) === '%PDF';
        if (!isPdf) {
          throw new BadRequestException(
            'Nội dung file không đúng định dạng PDF hợp lệ',
          );
        }
      }

      // Kiểm tra PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      if (mime === 'image/png') {
        const isPng =
          header[0] === 0x89 &&
          header[1] === 0x50 &&
          header[2] === 0x4e &&
          header[3] === 0x47;
        if (!isPng) {
          throw new BadRequestException(
            'Nội dung file không đúng định dạng PNG hợp lệ',
          );
        }
      }

      // Kiểm tra JPEG: 0xFF 0xD8 0xFF
      if (mime === 'image/jpeg') {
        const isJpg =
          header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
        if (!isJpg) {
          throw new BadRequestException(
            'Nội dung file không đúng định dạng JPEG hợp lệ',
          );
        }
      }

      // Kiểm tra ZIP / Office Open XML (DOCX, PPTX, XLSX): 0x50 0x4B 0x03 0x04 (PK..)
      const isOfficeOrZip =
        mime.includes('openxmlformats') ||
        mime.includes('msword') ||
        mime === 'application/zip';
      if (isOfficeOrZip && header.length >= 4) {
        const isZipHeader = header[0] === 0x50 && header[1] === 0x4b;
        const isDocLegacy =
          header[0] === 0xd0 && header[1] === 0xcf && header[2] === 0x11; // OLE Compound File
        if (!isZipHeader && !isDocLegacy) {
          throw new BadRequestException(
            'Nội dung file không đúng định dạng tài liệu hợp lệ',
          );
        }
      }

      return true;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(
        `Không thể đọc header signature cho object ${storageKey}: ${error.message}. Bỏ qua kiểm tra magic bytes.`,
      );
      return true;
    }
  }

  /**
   * Xóa một object trên R2
   */
  async deleteObject(storageKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      this.logger.error(
        `Lỗi khi xóa object ${storageKey}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * Xóa danh sách nhiều object trên R2 (dùng cho cleanup mồ côi)
   */
  async deleteObjects(storageKeys: string[]): Promise<number> {
    if (!storageKeys || storageKeys.length === 0) return 0;

    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: storageKeys.map((Key) => ({ Key })),
          Quiet: true,
        },
      });

      const res = await this.s3Client.send(command);
      return storageKeys.length - (res.Errors?.length ?? 0);
    } catch (error) {
      this.logger.error(
        `Lỗi khi xóa nhiều object: ${(error as Error).message}`,
      );
      return 0;
    }
  }

  /**
   * Tải trực tiếp Buffer lên R2 (dùng cho xuất file DOCX/PDF hoặc trích xuất asset)
   */
  async uploadObjectBuffer(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(
        `Lỗi khi upload buffer lên R2 key ${storageKey}: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException(
        'Không thể lưu tệp vào hệ thống lưu trữ R2.',
      );
    }
  }

  /**
   * Đọc trực tiếp Buffer của một object từ R2 (dùng cho import DOCX từ session)
   */
  async downloadObjectBuffer(storageKey: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new NotFoundException(`Không tìm thấy dữ liệu object ${storageKey}`);
      }

      const stream = response.Body as any;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Lỗi khi tải buffer từ R2 key ${storageKey}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Không thể đọc tệp từ hệ thống lưu trữ R2.',
      );
    }
  }
}

