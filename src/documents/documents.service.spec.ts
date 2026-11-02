import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import {
  UploadTargetType,
  UploadSessionStatus,
  DocumentType,
  DocumentStatus,
  UserRole,
} from '../../generated/prisma/client.js';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaMock: any;
  let r2Mock: any;

  beforeEach(() => {
    prismaMock = {
      documentCategory: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      document: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      classMaterial: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      uploadSession: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
      $queryRawUnsafe: vi.fn(),
      $executeRawUnsafe: vi.fn(),
    };

    r2Mock = {
      generateStorageKey: vi.fn((prefix) => `${prefix}/2026/10/15/mock-uuid`),
      createPresignedPutUrl: vi.fn().mockResolvedValue({
        uploadUrl: 'https://r2.mock/upload',
        storageKey: 'teachers/2026/10/15/mock-uuid',
        expiresInSeconds: 300,
        requiredHeaders: { 'Content-Type': 'application/pdf' },
      }),
      createPresignedGetUrl: vi.fn().mockResolvedValue({
        downloadUrl: 'https://r2.mock/download',
        expiresInSeconds: 300,
      }),
      getObjectMetadata: vi.fn().mockResolvedValue({
        sizeBytes: 1048576,
        contentType: 'application/pdf',
      }),
      validateFileSignature: vi.fn().mockResolvedValue(true),
      deleteObject: vi.fn().mockResolvedValue(true),
      getMaxUploadSizeBytes: vi.fn().mockReturnValue(52428800),
      downloadObjectBuffer: vi.fn(),
      uploadObjectBuffer: vi.fn(),
    };

    service = new DocumentsService(prismaMock, r2Mock);
  });

  // ==================== 1. QUẢN LÝ DANH MỤC & VÒNG LẶP ====================
  describe('Document Categories', () => {
    it('tạo danh mục thành công khi parentId hợp lệ và thuộc giáo viên', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-parent',
        teacherId: 'teacher-A',
      });
      prismaMock.documentCategory.findFirst.mockResolvedValue(null);
      prismaMock.documentCategory.create.mockResolvedValue({
        id: 'cat-child',
        name: 'Văn học trung đại',
        parentId: 'cat-parent',
        teacherId: 'teacher-A',
      });

      const res = await service.createCategory('teacher-A', {
        name: 'Văn học trung đại',
        parentId: 'cat-parent',
      });

      expect(res.category.id).toBe('cat-child');
      expect(prismaMock.documentCategory.create).toHaveBeenCalled();
    });

    it('từ chối tạo danh mục nếu parentId thuộc giáo viên khác (tình huống 17)', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-parent-B',
        teacherId: 'teacher-B', // Thuộc giáo viên B!
      });

      await expect(
        service.createCategory('teacher-A', {
          name: 'Văn học hiện đại',
          parentId: 'cat-parent-B',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối cập nhật nếu đặt parentId là chính nó (tình huống 17)', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-1',
        teacherId: 'teacher-A',
      });

      await expect(
        service.updateCategory('teacher-A', 'cat-1', {
          parentId: 'cat-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ngăn chặn tạo vòng lặp trong cây danh mục A -> B -> A (tình huống 17)', async () => {
      prismaMock.documentCategory.findUnique
        .mockResolvedValueOnce({ id: 'cat-A', teacherId: 'teacher-A' }) // category to update
        .mockResolvedValueOnce({ id: 'cat-B', teacherId: 'teacher-A' }) // target parent
        .mockResolvedValueOnce({ parentId: 'cat-A', teacherId: 'teacher-A' }); // cat-B trỏ về cat-A!

      await expect(
        service.updateCategory('teacher-A', 'cat-A', {
          parentId: 'cat-B',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('xóa danh mục an toàn: chuyển tài liệu về unclassified và đưa danh mục con lên cấp cha', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-to-delete',
        teacherId: 'teacher-A',
        parentId: 'cat-root',
      });

      const res = await service.deleteCategory('teacher-A', 'cat-to-delete');

      expect(prismaMock.document.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-to-delete', ownerId: 'teacher-A' },
        data: { categoryId: null },
      });
      expect(prismaMock.documentCategory.updateMany).toHaveBeenCalledWith({
        where: { parentId: 'cat-to-delete', teacherId: 'teacher-A' },
        data: { parentId: 'cat-root' },
      });
      expect(prismaMock.documentCategory.delete).toHaveBeenCalledWith({
        where: { id: 'cat-to-delete' },
      });
      expect(res.message).toBeDefined();
    });

    it('lấy danh mục phẳng mặc định hoặc dạng cây lồng nhau khi asTree=true', async () => {
      const mockFlatList = [
        {
          id: 'cat-root',
          name: 'Giáo án',
          parentId: null,
          sortOrder: 0,
          _count: { documents: 3, children: 1 },
        },
        {
          id: 'cat-child',
          name: 'THCS',
          parentId: 'cat-root',
          sortOrder: 0,
          _count: { documents: 5, children: 0 },
        },
      ];
      prismaMock.documentCategory.findMany.mockResolvedValue(mockFlatList);

      // 1. Flat query
      const flat = await service.getCategories('teacher-A');
      expect(flat).toHaveLength(2);

      // 2. Tree query
      const tree = await service.getCategories('teacher-A', { asTree: true });
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('cat-root');
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe('cat-child');
      expect(tree[0].documentCount).toBe(3);
      expect(tree[0].children[0].documentCount).toBe(5);
    });
  });

  // ==================== 2. THƯ VIỆN GIÁO VIÊN & UPLOAD ====================
  describe('Document Library & Upload Flow', () => {
    it('khởi tạo upload thư viện thành công và lưu UploadSession (tình huống 6)', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-1',
        teacherId: 'teacher-A',
      });
      prismaMock.uploadSession.create.mockResolvedValue({
        id: 'session-1',
        storageKey: 'teachers/2026/10/15/mock-uuid',
      });

      const res = await service.initLibraryUpload('teacher-A', {
        title: 'Chí Phèo - Phân tích',
        originalName: 'chi-pheo.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1048576,
        categoryId: 'cat-1',
      });

      expect(res.uploadUrl).toBe('https://r2.mock/upload');
      expect(res.storageKey).toBe('teachers/2026/10/15/mock-uuid');
      expect(prismaMock.uploadSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'teacher-A',
            targetType: UploadTargetType.LIBRARY,
            categoryId: 'cat-1',
          }),
        }),
      );
    });

    it('từ chối xác nhận upload nếu object không tồn tại trên R2 (tình huống 13)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/missing-key',
      });
      r2Mock.getObjectMetadata.mockResolvedValue(null); // Không có trên R2!

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/missing-key',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('hoàn tất upload tạo Document mới thành công và chuyển session sang COMPLETED (tình huống 6 & 10)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/new-cut-file-key',
        title: 'Đề kiểm tra cắt trang 1-3.pdf',
        originalName: 'de-kiem-tra-cut.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(512000),
        categoryId: 'cat-1',
      });

      prismaMock.document.create.mockResolvedValue({
        id: 'doc-new',
        title: 'Đề kiểm tra cắt trang 1-3.pdf',
        storageKey: 'teachers/new-cut-file-key',
        sizeBytes: BigInt(512000),
        ownerId: 'teacher-A',
        categoryId: 'cat-1',
      });

      const res = await service.completeLibraryUpload('teacher-A', {
        storageKey: 'teachers/new-cut-file-key',
      });

      expect(res.document.id).toBe('doc-new');
      expect(res.document.sizeBytes).toBe(512000); // Đã format sang Number
      expect(prismaMock.uploadSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { status: UploadSessionStatus.COMPLETED },
      });
    });

    it('xóa object R2 và từ chối nếu dung lượng thực tế vượt quá giới hạn tối đa', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/oversized-key',
        title: 'Tài liệu quá lớn',
        mimeType: 'application/pdf',
      });
      r2Mock.getObjectMetadata.mockResolvedValue({
        sizeBytes: 100 * 1024 * 1024, // 100MB > 50MB
      });

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/oversized-key',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(r2Mock.deleteObject).toHaveBeenCalledWith('teachers/oversized-key');
    });

    it('xóa object R2 nếu chữ ký file (magic bytes) không hợp lệ', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/fake-signature-key',
        title: 'File giả mạo',
        mimeType: 'application/pdf',
      });
      r2Mock.getObjectMetadata.mockResolvedValue({ sizeBytes: 1024 });
      r2Mock.validateFileSignature.mockRejectedValueOnce(
        new BadRequestException('Nội dung file không khớp với định dạng PDF'),
      );

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/fake-signature-key',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(r2Mock.deleteObject).toHaveBeenCalledWith('teachers/fake-signature-key');
    });

    it('xóa object R2 khi cơ sở dữ liệu gặp lỗi giao dịch', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/db-fail-key',
        title: 'Tài liệu lỗi DB',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(1024),
      });
      r2Mock.getObjectMetadata.mockResolvedValue({ sizeBytes: 1024 });
      prismaMock.$transaction.mockRejectedValueOnce(new Error('DB Connection Timeout'));

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/db-fail-key',
        }),
      ).rejects.toThrow('DB Connection Timeout');

      expect(r2Mock.deleteObject).toHaveBeenCalledWith('teachers/db-fail-key');
    });

    it('xử lý idempotency: request complete upload lặp lại không tạo duplicate (tình huống 14)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.COMPLETED, // Đã hoàn thành trước đó
        storageKey: 'teachers/already-done-key',
      });

      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-existing',
        title: 'Tài liệu đã tạo',
        storageKey: 'teachers/already-done-key',
        sizeBytes: BigInt(1024),
      });

      const res = await service.completeLibraryUpload('teacher-A', {
        storageKey: 'teachers/already-done-key',
      });

      expect(res.document.id).toBe('doc-existing');
      expect(prismaMock.document.create).not.toHaveBeenCalled();
    });

    it('từ chối khi người dùng khác xác nhận storageKey của giáo viên khác (tình huống 16)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-B', // Thuộc giáo viên B!
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/key-of-B',
      });

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/key-of-B',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('giáo viên A không xem được chi tiết tài liệu riêng của giáo viên B (tình huống 1)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        title: 'Tài liệu bí mật của B',
        ownerId: 'teacher-B',
        deletedAt: null,
      });

      await expect(
        service.getDocumentDetail('teacher-A', 'doc-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('giáo viên A không lấy được link tải tài liệu riêng của giáo viên B (tình huống 1)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        title: 'Tài liệu của B',
        ownerId: 'teacher-B',
        deletedAt: null,
      });

      await expect(
        service.getDocumentDownloadUrl('teacher-A', 'doc-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('giáo viên A không sửa được tài liệu riêng của giáo viên B (tình huống 1)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        title: 'Tài liệu của B',
        ownerId: 'teacher-B',
        deletedAt: null,
      });

      await expect(
        service.updateDocument('teacher-A', 'doc-B', { title: 'Hack title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('xóa tài liệu: nếu đang liên kết ở lớp thì chỉ xóa mềm khỏi thư viện, không xóa R2 (tình huống 11)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-linked',
        ownerId: 'teacher-A',
        storageKey: 'teachers/linked-key',
        deletedAt: null,
        _count: { materials: 2 }, // Đang được 2 lớp/buổi học sử dụng!
      });

      const res = await service.deleteDocument('teacher-A', 'doc-linked');

      expect(prismaMock.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-linked' },
        data: { deletedAt: expect.any(Date) },
      });
      // Không gọi deleteObject trên R2!
      expect(r2Mock.deleteObject).not.toHaveBeenCalled();
      expect(res.message).toContain('file gốc vẫn được lưu trữ an toàn');
    });

    it('xóa tài liệu: nếu không còn nơi nào dùng thì xóa file trên R2 (tình huống 11)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-standalone',
        ownerId: 'teacher-A',
        storageKey: 'teachers/standalone-key',
        deletedAt: null,
        _count: { materials: 0 }, // Không còn liên kết nào
      });

      await service.deleteDocument('teacher-A', 'doc-standalone');

      expect(prismaMock.document.update).toHaveBeenCalled();
      expect(r2Mock.deleteObject).toHaveBeenCalledWith('teachers/standalone-key');
    });
  });

  // ==================== 5. DANH SÁCH TÀI LIỆU (GET /teacher/documents) ====================
  describe('getLibraryDocuments', () => {
    it('lấy danh sách tài liệu thành công khi DB bình thường (page 1, limit 10)', async () => {
      const mockDocs = [
        {
          id: 'doc-1',
          title: 'Tài liệu 1',
          sizeBytes: BigInt(1024),
          ownerId: 'teacher-A',
          category: { id: 'cat-1', name: 'Ngữ văn' },
          _count: { materials: 3 },
        },
      ];
      prismaMock.document.findMany.mockResolvedValue(mockDocs);
      prismaMock.document.count.mockResolvedValue(1);

      const res = await service.getLibraryDocuments('teacher-A', {
        page: 1,
        limit: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].id).toBe('doc-1');
      expect(res.items[0].sizeBytes).toBe(1024);
      expect(res.items[0].usedInCount).toBe(3);
      expect(res.items[0]).not.toHaveProperty('_count');
      expect(res.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'teacher-A', deletedAt: null },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('hỗ trợ pagination page 2, limit 10 (skip = 10)', async () => {
      prismaMock.document.findMany.mockResolvedValue([]);
      prismaMock.document.count.mockResolvedValue(15);

      const res = await service.getLibraryDocuments('teacher-A', {
        page: 2,
        limit: 10,
      });

      expect(res.items).toHaveLength(0);
      expect(res.pagination).toEqual({
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      });
      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('trả về danh sách rỗng khi giáo viên không có tài liệu', async () => {
      prismaMock.document.findMany.mockResolvedValue([]);
      prismaMock.document.count.mockResolvedValue(0);

      const res = await service.getLibraryDocuments('teacher-empty', {
        page: 1,
        limit: 10,
      });

      expect(res.items).toEqual([]);
      expect(res.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('giáo viên có nhiều tài liệu được phân trang và map sizeBytes an toàn', async () => {
      const mockDocs = Array.from({ length: 5 }, (_, i) => ({
        id: `doc-${i + 1}`,
        title: `Tài liệu ${i + 1}`,
        sizeBytes: BigInt((i + 1) * 2048),
        ownerId: 'teacher-A',
        category: null,
        _count: { materials: i },
      }));
      prismaMock.document.findMany.mockResolvedValue(mockDocs);
      prismaMock.document.count.mockResolvedValue(25);

      const res = await service.getLibraryDocuments('teacher-A', {
        page: 1,
        limit: 5,
      });

      expect(res.items).toHaveLength(5);
      expect(res.items[4].sizeBytes).toBe(10240);
      expect(res.pagination.totalPages).toBe(5);
    });

    it('chỉ lọc tài liệu thuộc sở hữu của giáo viên hiện tại (không lộ tài liệu giáo viên khác)', async () => {
      prismaMock.document.findMany.mockResolvedValue([]);
      prismaMock.document.count.mockResolvedValue(0);

      await service.getLibraryDocuments('teacher-X', {
        search: 'Toán',
        categoryId: 'cat-X',
      });

      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerId: 'teacher-X',
            deletedAt: null,
            categoryId: 'cat-X',
          }),
        }),
      );
    });

    it('graceful fallback an toàn khi cơ sở dữ liệu gặp lỗi P2022 (chưa chạy migration)', async () => {
      // Giả lập lỗi P2022 từ Prisma Client khi cột Document.type chưa tồn tại trong database
      const p2022Error: any = new Error(
        'The column `Document.type` does not exist in the current database.',
      );
      p2022Error.code = 'P2022';
      prismaMock.document.findMany.mockRejectedValue(p2022Error);

      // Mock $queryRawUnsafe cho count và rows fallback
      prismaMock.$queryRawUnsafe
        .mockResolvedValueOnce([{ total: 2 }]) // count
        .mockResolvedValueOnce([
          {
            id: 'doc-fallback-1',
            title: 'DH Đài Loan 2025',
            description: null,
            originalName: '8. DH Đài Loan 2025.pdf',
            storageKey: 'teachers/key-1',
            mimeType: 'application/pdf',
            sizeBytes: 491464n,
            checksum: null,
            ownerId: 'teacher-A',
            categoryId: 'cat-1',
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            cat_id: 'cat-1',
            cat_name: 'Tài liệu học sinh',
            usedInCount: 1,
          },
        ]); // items

      const res = await service.getLibraryDocuments('teacher-A', {
        page: 1,
        limit: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].id).toBe('doc-fallback-1');
      expect(res.items[0].sizeBytes).toBe(491464);
      expect(res.items[0].type).toBe('STATIC_FILE');
      expect(res.items[0].status).toBe('PUBLISHED');
      expect(res.items[0].category).toEqual({
        id: 'cat-1',
        name: 'Tài liệu học sinh',
      });
      expect(res.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  // ==================== 6. REGRESSION TESTS: UPDATE, GET DETAIL & DELETE ====================
  describe('Regression: updateDocument, getDocumentDetail & deleteDocument dual-mode', () => {
    describe('updateDocument (PATCH /teacher/documents/:id)', () => {
      it('cập nhật categoryId hợp lệ khi DB chưa migrate (fallback parameterized raw SQL)', async () => {
        // information_schema trả về rỗng -> DB chưa có cột content/type
        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([]) // checkStructuredSchemaReady
          .mockResolvedValueOnce([   // SELECT doc in updateDocument
            {
              id: 'doc-1',
              ownerId: 'teacher-A',
              deletedAt: null,
              title: 'Tài liệu cũ',
              description: 'Mô tả cũ',
              categoryId: null,
            },
          ])
          .mockResolvedValueOnce([   // SELECT doc sau khi UPDATE
            {
              id: 'doc-1',
              title: 'Tài liệu cũ',
              description: 'Mô tả cũ',
              originalName: 'tailieu.json',
              storageKey: 'notes/teacher-A/doc-1.json',
              mimeType: 'application/vnd.tiptap+json',
              sizeBytes: 100n,
              checksum: null,
              ownerId: 'teacher-A',
              categoryId: 'cat-new',
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              cat_id: 'cat-new',
              cat_name: 'Danh mục mới',
            },
          ]);

        prismaMock.documentCategory.findUnique.mockResolvedValue({
          id: 'cat-new',
          teacherId: 'teacher-A',
        });
        prismaMock.$executeRawUnsafe.mockResolvedValue(1);

        const res = await service.updateDocument('teacher-A', 'doc-1', {
          categoryId: 'cat-new',
        });

        expect(res.document.categoryId).toBe('cat-new');
        expect(res.document.category).toEqual({ id: 'cat-new', name: 'Danh mục mới' });
        expect(res.document.type).toBe('STRUCTURED_NOTE');
        expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE "Document" SET "categoryId" = $1, "updatedAt" = NOW()'),
          'cat-new',
          'doc-1',
        );
      });

      it('ngắt liên kết categoryId khi truyền null (categoryId = null) trong schema cũ', async () => {
        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([]) // checkStructuredSchemaReady
          .mockResolvedValueOnce([
            {
              id: 'doc-1',
              ownerId: 'teacher-A',
              deletedAt: null,
              title: 'Tài liệu',
              categoryId: 'cat-old',
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'doc-1',
              title: 'Tài liệu',
              description: null,
              originalName: 'tailieu.json',
              storageKey: 'notes/teacher-A/doc-1.json',
              mimeType: 'application/vnd.tiptap+json',
              sizeBytes: 100n,
              ownerId: 'teacher-A',
              categoryId: null,
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              cat_id: null,
              cat_name: null,
            },
          ]);

        prismaMock.$executeRawUnsafe.mockResolvedValue(1);

        const res = await service.updateDocument('teacher-A', 'doc-1', {
          categoryId: null,
        });

        expect(res.document.categoryId).toBeNull();
        expect(res.document.category).toBeNull();
        expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE "Document" SET "categoryId" = $1, "updatedAt" = NOW()'),
          null,
          'doc-1',
        );
      });

      it('chỉ cập nhật title mà không ghi đè description khi description không gửi trong DTO', async () => {
        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              id: 'doc-1',
              ownerId: 'teacher-A',
              deletedAt: null,
              title: 'Tên cũ',
              description: 'Mô tả quan trọng cần giữ',
              categoryId: null,
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'doc-1',
              title: 'Tên mới',
              description: 'Mô tả quan trọng cần giữ',
              originalName: 'tailieu.pdf',
              storageKey: 'teachers/key-1',
              mimeType: 'application/pdf',
              sizeBytes: 100n,
              ownerId: 'teacher-A',
              categoryId: null,
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);

        prismaMock.$executeRawUnsafe.mockResolvedValue(1);

        const res = await service.updateDocument('teacher-A', 'doc-1', {
          title: 'Tên mới',
        });

        expect(res.document.title).toBe('Tên mới');
        expect(res.document.description).toBe('Mô tả quan trọng cần giữ');
        // SQL update chỉ chứa "title" và "updatedAt", không có "description"
        const updateCall = prismaMock.$executeRawUnsafe.mock.calls[0];
        expect(updateCall[0]).toContain('"title" = $1');
        expect(updateCall[0]).not.toContain('"description" =');
      });

      it('từ chối cập nhật categoryId nếu category thuộc giáo viên khác (400 BadRequestException)', async () => {
        prismaMock.document.findUnique.mockResolvedValue({
          id: 'doc-1',
          ownerId: 'teacher-A',
          deletedAt: null,
        });

        prismaMock.documentCategory.findUnique.mockResolvedValue({
          id: 'cat-of-B',
          teacherId: 'teacher-B', // Không phải của teacher-A
        });

        await expect(
          service.updateDocument('teacher-A', 'doc-1', {
            categoryId: 'cat-of-B',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('hoạt động bình thường với Prisma update khi DB đã có schema mới', async () => {
        // Schema ready (mock findUnique resolve)
        prismaMock.document.findUnique.mockResolvedValue({
          id: 'doc-1',
          ownerId: 'teacher-A',
          deletedAt: null,
        });

        prismaMock.document.update.mockResolvedValue({
          id: 'doc-1',
          title: 'Tên cập nhật',
          ownerId: 'teacher-A',
          sizeBytes: 100n,
          type: DocumentType.STRUCTURED_NOTE,
          status: DocumentStatus.PUBLISHED,
          category: { id: 'cat-1', name: 'Toán' },
        });

        const res = await service.updateDocument('teacher-A', 'doc-1', {
          title: 'Tên cập nhật',
        });

        expect(res.document.title).toBe('Tên cập nhật');
        expect(prismaMock.document.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'doc-1' },
            data: expect.objectContaining({ title: 'Tên cập nhật' }),
          }),
        );
      });
    });

    describe('getLibraryDocuments & getDocumentDetail: nhận diện STRUCTURED_NOTE vs STATIC_FILE', () => {
      it('nhận diện đúng STRUCTURED_NOTE khi mimeType là application/vnd.tiptap+json', async () => {
        const p2022Err: any = new Error('P2022');
        p2022Err.code = 'P2022';
        prismaMock.document.findMany.mockRejectedValue(p2022Err);

        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([{ total: 1 }])
          .mockResolvedValueOnce([
            {
              id: 'doc-tiptap-1',
              title: 'Bài giảng Văn',
              storageKey: 'notes/teacher-A/doc-tiptap-1.json',
              mimeType: 'application/vnd.tiptap+json',
              sizeBytes: 250n,
              ownerId: 'teacher-A',
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);

        const res = await service.getLibraryDocuments('teacher-A', { page: 1, limit: 10 });

        expect(res.items[0].type).toBe('STRUCTURED_NOTE');
      });

      it('nhận diện đúng STATIC_FILE khi tài liệu là file PDF hoặc Word', async () => {
        const p2022Err: any = new Error('P2022');
        p2022Err.code = 'P2022';
        prismaMock.document.findMany.mockRejectedValue(p2022Err);

        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([{ total: 1 }])
          .mockResolvedValueOnce([
            {
              id: 'doc-pdf-1',
              title: 'Đề thi.pdf',
              storageKey: 'teachers/teacher-A/doc-pdf-1.pdf',
              mimeType: 'application/pdf',
              sizeBytes: 50000n,
              ownerId: 'teacher-A',
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);

        const res = await service.getLibraryDocuments('teacher-A', { page: 1, limit: 10 });

        expect(res.items[0].type).toBe('STATIC_FILE');
      });

      it('getDocumentDetail tải nội dung từ R2 và parse Tiptap JSON khi DB content là null', async () => {
        const p2022Err: any = new Error('P2022');
        p2022Err.code = 'P2022';
        prismaMock.document.findUnique.mockRejectedValue(p2022Err);

        prismaMock.$queryRawUnsafe.mockResolvedValueOnce([
          {
            id: 'doc-detail-1',
            title: 'Chi tiết giáo án',
            storageKey: 'notes/teacher-A/doc-detail-1.json',
            mimeType: 'application/vnd.tiptap+json',
            sizeBytes: 150n,
            ownerId: 'teacher-A',
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        prismaMock.classMaterial.findMany.mockResolvedValue([]);

        const tiptapJson = {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nội dung từ R2' }] }],
        };
        r2Mock.downloadObjectBuffer.mockResolvedValue(Buffer.from(JSON.stringify(tiptapJson), 'utf8'));

        const res = await service.getDocumentDetail('teacher-A', 'doc-detail-1');

        expect(res.type).toBe('STRUCTURED_NOTE');
        expect(res.content).toEqual(tiptapJson);
        expect(r2Mock.downloadObjectBuffer).toHaveBeenCalledWith('notes/teacher-A/doc-detail-1.json');
      });

      it('getDocumentDetail ném InternalServerErrorException khi R2 thiếu file hoặc JSON lỗi (không âm thầm trả tài liệu rỗng)', async () => {
        const p2022Err: any = new Error('P2022');
        p2022Err.code = 'P2022';
        prismaMock.document.findUnique.mockRejectedValue(p2022Err);

        prismaMock.$queryRawUnsafe.mockResolvedValueOnce([
          {
            id: 'doc-corrupt-1',
            title: 'Tài liệu lỗi R2',
            storageKey: 'notes/teacher-A/doc-corrupt-1.json',
            mimeType: 'application/vnd.tiptap+json',
            sizeBytes: 150n,
            ownerId: 'teacher-A',
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        prismaMock.classMaterial.findMany.mockResolvedValue([]);

        r2Mock.downloadObjectBuffer.mockRejectedValue(new Error('NoSuchKey: Object not found'));

        await expect(
          service.getDocumentDetail('teacher-A', 'doc-corrupt-1'),
        ).rejects.toThrow(InternalServerErrorException);
      });

      it('getDocumentByIdWithContent đọc được Tiptap JSON từ R2 khi DB content là null và mimeType bị null nhưng storageKey notes/...json', async () => {
        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([]) // checkStructuredSchemaReady
          .mockResolvedValueOnce([   // raw SELECT
            {
              id: 'doc-legacy-1',
              title: 'Tài liệu Legacy mimeType null',
              storageKey: 'notes/teacher-A/doc-legacy-1.json',
              mimeType: null, // mimeType bị null trong DB cũ
              sizeBytes: 150n,
              ownerId: 'teacher-A',
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        prismaMock.classMaterial.findMany.mockResolvedValue([]);

        const validTiptap = {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nội dung đọc từ R2' }] }],
        };
        r2Mock.downloadObjectBuffer.mockResolvedValue(Buffer.from(JSON.stringify(validTiptap)));

        const res = await service.getDocumentByIdWithContent(
          { sub: 'teacher-A', role: UserRole.TEACHER },
          'doc-legacy-1',
        );

        expect(res.type).toBe('STRUCTURED_NOTE');
        expect(res.content).toEqual(validTiptap);
        expect(r2Mock.downloadObjectBuffer).toHaveBeenCalledWith('notes/teacher-A/doc-legacy-1.json');
      });

      it('getDocumentByIdWithContent ném InternalServerErrorException khi R2 đọc thất bại (không trả rỗng để tránh ghi đè)', async () => {
        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([]) // checkStructuredSchemaReady
          .mockResolvedValueOnce([   // raw SELECT
            {
              id: 'doc-legacy-err',
              title: 'Tài liệu Legacy lỗi R2',
              storageKey: 'notes/teacher-A/doc-legacy-err.json',
              mimeType: 'application/vnd.tiptap+json',
              sizeBytes: 150n,
              ownerId: 'teacher-A',
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        prismaMock.classMaterial.findMany.mockResolvedValue([]);

        r2Mock.downloadObjectBuffer.mockRejectedValue(new Error('R2 Timeout / 404'));

        await expect(
          service.getDocumentByIdWithContent(
            { sub: 'teacher-A', role: UserRole.TEACHER },
            'doc-legacy-err',
          ),
        ).rejects.toThrow(InternalServerErrorException);
      });
    });

    describe('deleteDocument (DELETE /teacher/documents/:id)', () => {
      it('xóa mềm bằng parameterized raw SQL khi DB chưa migrate (không văng lỗi P2022)', async () => {
        prismaMock.document.findUnique.mockRejectedValueOnce({ code: 'P2022' });

        prismaMock.$queryRawUnsafe
          .mockResolvedValueOnce([   // doc fallback
            {
              id: 'doc-del-1',
              ownerId: 'teacher-A',
              storageKey: 'teachers/key-del-1',
              deletedAt: null,
              materialCount: 0,
            },
          ])
          .mockResolvedValueOnce([]); // checkStructuredSchemaReady

        prismaMock.$executeRawUnsafe.mockResolvedValue(1);

        const res = await service.deleteDocument('teacher-A', 'doc-del-1');

        expect(res.message).toContain('thành công');
        expect(prismaMock.$executeRawUnsafe).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE "Document" SET "deletedAt" = NOW()'),
          'doc-del-1',
        );
        expect(r2Mock.deleteObject).toHaveBeenCalledWith('teachers/key-del-1');
      });
    });
  });
});
