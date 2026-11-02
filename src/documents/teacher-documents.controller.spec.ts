import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherDocumentsController } from './teacher-documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../../generated/prisma/client.js';

describe('TeacherDocumentsController', () => {
  let controller: TeacherDocumentsController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getLibraryDocuments: vi.fn(),
      getDocumentDetail: vi.fn(),
      getDocumentDownloadUrl: vi.fn(),
      initLibraryUpload: vi.fn(),
      completeLibraryUpload: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
    };

    controller = new TeacherDocumentsController(serviceMock as DocumentsService);
  });

  it('kiểm tra metadata Guards và Roles được cấu hình chính xác cho controller', () => {
    const guards = Reflect.getMetadata('__guards__', TeacherDocumentsController);
    expect(guards).toBeDefined();
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(RolesGuard);

    const roles = Reflect.getMetadata('roles', TeacherDocumentsController);
    expect(roles).toEqual([UserRole.TEACHER]);
  });

  describe('getLibraryDocuments', () => {
    it('gọi documentsService.getLibraryDocuments với đúng teacherId và query params', async () => {
      const mockResult = {
        items: [
          {
            id: 'doc-1',
            title: 'Bài giảng 1',
            sizeBytes: 1024,
            usedInCount: 0,
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      serviceMock.getLibraryDocuments.mockResolvedValue(mockResult);

      const queryDto = { page: 1, limit: 10, search: 'Bài giảng' };
      const res = await controller.getLibraryDocuments('teacher-uuid-1', queryDto);

      expect(serviceMock.getLibraryDocuments).toHaveBeenCalledWith(
        'teacher-uuid-1',
        queryDto,
      );
      expect(res).toEqual(mockResult);
    });
  });

  describe('getDocumentDetail', () => {
    it('gọi documentsService.getDocumentDetail với đúng teacherId và id', async () => {
      const mockDoc = { id: 'doc-1', title: 'Bài giảng 1' };
      serviceMock.getDocumentDetail.mockResolvedValue(mockDoc);

      const res = await controller.getDocumentDetail('teacher-uuid-1', 'doc-1');
      expect(serviceMock.getDocumentDetail).toHaveBeenCalledWith('teacher-uuid-1', 'doc-1');
      expect(res).toEqual(mockDoc);
    });
  });

  describe('getDocumentDownloadUrl', () => {
    it('gọi documentsService.getDocumentDownloadUrl với đúng teacherId và id', async () => {
      const mockUrl = { downloadUrl: 'https://r2/download', expiresInSeconds: 300 };
      serviceMock.getDocumentDownloadUrl.mockResolvedValue(mockUrl);

      const res = await controller.getDownloadUrl('teacher-uuid-1', 'doc-1');
      expect(serviceMock.getDocumentDownloadUrl).toHaveBeenCalledWith('teacher-uuid-1', 'doc-1');
      expect(res).toEqual(mockUrl);
    });
  });
});
