import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { R2StorageService } from '../storage/r2-storage.service.js';
import {
  UploadTargetType,
  UploadSessionStatus,
  DocumentType,
  DocumentStatus,
  DocumentExportStatus,
  DocumentExportFormat,
  UserRole,
  Prisma,
} from '../../generated/prisma/client.js';
import type { InitUploadDto } from './dto/init-upload.dto.js';
import type { CompleteUploadDto } from './dto/complete-upload.dto.js';
import type { QueryDocumentsDto } from './dto/query-documents.dto.js';
import type { UpdateDocumentDto } from './dto/update-document.dto.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import type { QueryCategoriesDto } from './dto/query-categories.dto.js';
import type { CreateDocumentDto } from './dto/create-document.dto.js';
import type { UpdateDocumentContentDto } from './dto/update-content.dto.js';
import type { QueryVersionsDto } from './dto/query-versions.dto.js';
import type { ImportDocumentDto } from './dto/import-document.dto.js';
import type { ExportDocumentDto } from './dto/export-document.dto.js';
import { validateAndSanitizeTiptapJson } from './utils/tiptap-validator.js';
import { convertDocxBufferToTiptap } from './utils/docx-importer.js';
import { convertTiptapToDocx } from './utils/docx-generator.js';
import { convertTiptapToPdf } from './utils/pdf-generator.js';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  /**
   * Helper chuyển BigInt trong document sang Number an toàn cho JSON serialize
   */
  formatDocument(doc: any) {
    if (!doc) return null;
    return {
      ...doc,
      sizeBytes: Number(doc.sizeBytes),
      fileSize: doc.fileSize !== undefined ? (doc.fileSize ? Number(doc.fileSize) : null) : undefined,
    };
  }

  // ==================== QUẢN LÝ DANH MỤC (CATEGORIES) ====================

  /**
   * Lấy danh sách danh mục của giáo viên kèm số lượng tài liệu (hỗ trợ dạng cây hoặc mảng phẳng)
   */
  async getCategories(teacherId: string, query?: QueryCategoriesDto) {
    const categories = await this.prisma.documentCategory.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            documents: {
              where: { deletedAt: null },
            },
            children: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    if (query?.asTree) {
      return this.buildCategoryTree(categories);
    }

    return categories;
  }

  /**
   * Xây dựng cấu trúc cây đệ quy từ danh sách phẳng
   */
  private buildCategoryTree(categories: any[]) {
    const categoryMap = new Map<string, any>();
    const roots: any[] = [];

    for (const cat of categories) {
      categoryMap.set(cat.id, {
        ...cat,
        documentCount: cat._count?.documents ?? 0,
        subCategoryCount: cat._count?.children ?? 0,
        children: [],
      });
    }

    for (const cat of categories) {
      const node = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Tạo danh mục tài liệu mới
   */
  async createCategory(teacherId: string, dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.documentCategory.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.teacherId !== teacherId) {
        throw new BadRequestException(
          'Danh mục cha không tồn tại hoặc không thuộc quyền quản lý của bạn',
        );
      }
    }

    // Kiểm tra trùng tên trong cùng cấp
    const existing = await this.prisma.documentCategory.findFirst({
      where: {
        teacherId,
        parentId: dto.parentId ?? null,
        name: dto.name.trim(),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Danh mục có tên "${dto.name}" đã tồn tại ở cấp này`,
      );
    }

    const category = await this.prisma.documentCategory.create({
      data: {
        name: dto.name.trim(),
        description: dto.description,
        parentId: dto.parentId ?? null,
        sortOrder: dto.sortOrder ?? 0,
        teacherId,
      },
    });

    return {
      message: 'Tạo danh mục tài liệu thành công',
      category,
    };
  }

  /**
   * Kiểm tra vòng lặp trong cây danh mục
   */
  private async checkCategoryCycle(
    teacherId: string,
    targetParentId: string,
    currentCategoryId: string,
  ): Promise<boolean> {
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === currentCategoryId) {
        return true; // Phát hiện vòng lặp
      }
      if (visited.has(currentId)) {
        return true;
      }
      visited.add(currentId);

      const parentNode: { parentId: string | null; teacherId: string } | null =
        await this.prisma.documentCategory.findUnique({
          where: { id: currentId },
          select: { parentId: true, teacherId: true },
        });

      if (!parentNode || parentNode.teacherId !== teacherId) {
        return false;
      }
      currentId = parentNode.parentId;
    }

    return false;
  }

  /**
   * Cập nhật danh mục
   */
  async updateCategory(
    teacherId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const category = await this.prisma.documentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.teacherId !== teacherId) {
      throw new NotFoundException(
        'Không tìm thấy danh mục hoặc bạn không có quyền sửa danh mục này',
      );
    }

    const data: Prisma.DocumentCategoryUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === categoryId) {
        throw new BadRequestException(
          'Không thể đặt danh mục làm cha của chính nó',
        );
      }

      if (dto.parentId !== null) {
        const parent = await this.prisma.documentCategory.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent || parent.teacherId !== teacherId) {
          throw new BadRequestException(
            'Danh mục cha được chỉ định không hợp lệ',
          );
        }

        const isCycle = await this.checkCategoryCycle(
          teacherId,
          dto.parentId,
          categoryId,
        );
        if (isCycle) {
          throw new BadRequestException(
            'Không thể chuyển danh mục: cấu trúc cây sẽ bị lặp vô tận',
          );
        }

        data.parent = { connect: { id: dto.parentId } };
      } else {
        data.parent = { disconnect: true };
      }
    }

    // Nếu đổi tên hoặc đổi parentId, kiểm tra trùng tên
    if (dto.name !== undefined || dto.parentId !== undefined) {
      const checkName = dto.name !== undefined ? dto.name.trim() : category.name;
      const checkParentId =
        dto.parentId !== undefined ? dto.parentId : category.parentId;

      const duplicate = await this.prisma.documentCategory.findFirst({
        where: {
          teacherId,
          parentId: checkParentId,
          name: checkName,
          id: { not: categoryId },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Danh mục có tên "${checkName}" đã tồn tại ở cấp này`,
        );
      }
    }

    const updated = await this.prisma.documentCategory.update({
      where: { id: categoryId },
      data,
    });

    return {
      message: 'Cập nhật danh mục thành công',
      category: updated,
    };
  }

  /**
   * Xóa danh mục an toàn
   * Chính sách:
   * 1. Các tài liệu trong danh mục này được chuyển về danh mục gốc (categoryId = null).
   * 2. Các danh mục con được đưa lên cấp cha của danh mục này (parentId = category.parentId).
   * 3. Không xóa file vật lý trên Cloudflare R2!
   */
  async deleteCategory(teacherId: string, categoryId: string) {
    const category = await this.prisma.documentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.teacherId !== teacherId) {
      throw new NotFoundException('Không tìm thấy danh mục cần xóa');
    }

    await this.prisma.$transaction(async (tx) => {
      // Chuyển tài liệu con về unclassified
      await tx.document.updateMany({
        where: { categoryId, ownerId: teacherId },
        data: { categoryId: null },
      });

      // Chuyển danh mục con lên cấp cha
      await tx.documentCategory.updateMany({
        where: { parentId: categoryId, teacherId },
        data: { parentId: category.parentId },
      });

      // Xóa danh mục
      await tx.documentCategory.delete({
        where: { id: categoryId },
      });
    });

    return {
      message:
        'Xóa danh mục thành công. Các tài liệu thuộc danh mục đã được chuyển về thư viện gốc.',
    };
  }

  // ==================== THƯ VIỆN TÀI LIỆU (TEACHER LIBRARY) ====================

  /**
   * Bước 1: Khởi tạo upload tài liệu vào thư viện cá nhân
   */
  async initLibraryUpload(teacherId: string, dto: InitUploadDto) {
    // Validate categoryId nếu giáo viên chọn
    if (dto.categoryId) {
      const category = await this.prisma.documentCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category || category.teacherId !== teacherId) {
        throw new BadRequestException(
          'Danh mục tài liệu không tồn tại hoặc không thuộc quyền quản lý của bạn',
        );
      }
    }

    const storageKey = this.r2StorageService.generateStorageKey('teachers');

    // Tạo presigned PUT URL
    const presigned = await this.r2StorageService.createPresignedPutUrl(
      storageKey,
      dto.mimeType,
      dto.sizeBytes,
    );

    // Lưu phiên upload vào database
    const expiresAt = new Date(Date.now() + presigned.expiresInSeconds * 1000);
    const session = await this.prisma.uploadSession.create({
      data: {
        userId: teacherId,
        targetType: UploadTargetType.LIBRARY,
        categoryId: dto.categoryId ?? null,
        storageKey,
        originalName: dto.originalName.trim(),
        mimeType: dto.mimeType,
        sizeBytes: BigInt(dto.sizeBytes),
        title: dto.title.trim(),
        description: dto.description,
        status: UploadSessionStatus.PENDING,
        expiresAt,
      },
    });

    return {
      uploadUrl: presigned.uploadUrl,
      storageKey: presigned.storageKey,
      uploadSessionId: session.id,
      expiresInSeconds: presigned.expiresInSeconds,
      requiredHeaders: presigned.requiredHeaders,
    };
  }

  /**
   * Bước 2: Xác nhận hoàn tất upload tài liệu vào thư viện cá nhân
   */
  async completeLibraryUpload(teacherId: string, dto: CompleteUploadDto) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { storageKey: dto.storageKey },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên upload tài liệu');
    }

    if (session.userId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền xác nhận phiên upload này',
      );
    }

    if (session.targetType !== UploadTargetType.LIBRARY) {
      throw new BadRequestException(
        'Phiên upload này không dành cho thư viện tài liệu',
      );
    }

    // Idempotency: nếu đã complete trước đó, trả lại Document
    if (session.status === UploadSessionStatus.COMPLETED) {
      const existingDoc = await this.prisma.document.findUnique({
        where: { storageKey: dto.storageKey },
      });
      if (existingDoc) {
        return {
          message: 'Tài liệu đã được tải lên thành công trước đó',
          document: this.formatDocument(existingDoc),
        };
      }
    }

    if (session.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException(
        `Phiên upload không hợp lệ (trạng thái: ${session.status})`,
      );
    }

    // Kiểm tra object tồn tại trên R2 và lấy metadata thực tế
    const metadata = await this.r2StorageService.getObjectMetadata(
      session.storageKey,
    );
    if (!metadata) {
      throw new BadRequestException(
        'File chưa được upload thành công lên hệ thống lưu trữ Cloudflare R2',
      );
    }

    const actualSizeBytes = metadata.sizeBytes || Number(session.sizeBytes);

    // Kiểm tra dung lượng thực tế không vượt quá giới hạn
    if (actualSizeBytes > this.r2StorageService.getMaxUploadSizeBytes()) {
      await this.r2StorageService.deleteObject(session.storageKey);
      throw new BadRequestException(
        `Dung lượng file thực tế (${Math.round(actualSizeBytes / (1024 * 1024))}MB) vượt quá giới hạn tối đa cho phép`,
      );
    }

    // Kiểm tra tính hợp lệ qua magic bytes (dọn dẹp file nếu sai định dạng)
    try {
      await this.r2StorageService.validateFileSignature(
        session.storageKey,
        session.mimeType,
      );
    } catch (err) {
      await this.r2StorageService.deleteObject(session.storageKey);
      throw err;
    }

    // Lưu vào database trong transaction, dọn dẹp object mồ côi nếu database thất bại
    let newDocument: any;
    try {
      newDocument = await this.prisma.$transaction(async (tx) => {
        await tx.uploadSession.update({
          where: { id: session.id },
          data: { status: UploadSessionStatus.COMPLETED },
        });

        return tx.document.create({
          data: {
            title: session.title,
            description: session.description,
            originalName: session.originalName,
            storageKey: session.storageKey,
            mimeType: session.mimeType,
            sizeBytes: BigInt(actualSizeBytes),
            ownerId: teacherId,
            categoryId: session.categoryId,
          },
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        });
      });
    } catch (dbErr) {
      this.logger.error(
        `Lỗi cơ sở dữ liệu khi hoàn tất upload cho session ${session.id}: ${(dbErr as Error).message}. Bắt đầu dọn dẹp object R2.`,
      );
      await this.r2StorageService.deleteObject(session.storageKey);
      throw dbErr;
    }

    return {
      message: 'Tải tài liệu lên thư viện thành công',
      document: this.formatDocument(newDocument),
    };
  }

  /**
   * Danh sách tài liệu trong thư viện cá nhân của giáo viên
   */
  async getLibraryDocuments(teacherId: string, query: QueryDocumentsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      ownerId: teacherId,
      deletedAt: null,
    };

    if (query.unclassifiedOnly) {
      where.categoryId = null;
    } else if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              materials: {
                where: { deletedAt: null },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    const formattedItems = items.map((doc) => ({
      ...this.formatDocument(doc),
      usedInCount: doc._count.materials,
    }));

    return {
      items: formattedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Chi tiết tài liệu trong thư viện
   */
  async getDocumentDetail(teacherId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        category: {
          select: { id: true, name: true, parentId: true },
        },
        materials: {
          where: { deletedAt: null },
          select: {
            id: true,
            classId: true,
            sessionId: true,
            title: true,
            isPublished: true,
            class: {
              select: { id: true, name: true },
            },
            session: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!doc || doc.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (doc.ownerId !== teacherId) {
      throw new NotFoundException('Không tìm thấy tài liệu'); // Chống tiết lộ tài liệu người khác
    }

    return this.formatDocument(doc);
  }

  /**
   * Giáo viên lấy URL tải/xem tài liệu từ thư viện
   */
  async getDocumentDownloadUrl(teacherId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.deletedAt !== null || doc.ownerId !== teacherId) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (!doc.storageKey) {
      throw new BadRequestException('Tài liệu cấu trúc trực tuyến không có tệp tĩnh tải trực tiếp');
    }

    const result = await this.r2StorageService.createPresignedGetUrl(
      doc.storageKey,
      doc.originalName ?? undefined,
    );

    return {
      downloadUrl: result.downloadUrl,
      expiresInSeconds: result.expiresInSeconds,
      title: doc.title,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      sizeBytes: Number(doc.sizeBytes),
    };
  }

  /**
   * Cập nhật thông tin tài liệu trong thư viện
   */
  async updateDocument(
    teacherId: string,
    documentId: string,
    dto: UpdateDocumentDto,
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.deletedAt !== null || doc.ownerId !== teacherId) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    const data: Prisma.DocumentUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId !== null) {
        const category = await this.prisma.documentCategory.findUnique({
          where: { id: dto.categoryId },
        });

        if (!category || category.teacherId !== teacherId) {
          throw new BadRequestException(
            'Danh mục tài liệu không hợp lệ hoặc không thuộc quyền của bạn',
          );
        }
        data.category = { connect: { id: dto.categoryId } };
      } else {
        data.category = { disconnect: true };
      }
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      message: 'Cập nhật tài liệu thành công',
      document: this.formatDocument(updated),
    };
  }

  /**
   * Xóa tài liệu khỏi thư viện
   * Quy tắc an toàn:
   * - Nếu tài liệu đang được sử dụng ở bất kỳ lớp hoặc buổi học nào (ClassMaterial):
   *   Thực hiện xóa mềm (đặt deletedAt = new Date()), KHÔNG XÓA object R2 để bảo vệ lớp/buổi học đang dùng.
   * - Nếu tài liệu không còn liên kết ở đâu:
   *   Đánh dấu xóa mềm và xóa object trên R2.
   */
  async deleteDocument(teacherId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        _count: {
          select: {
            materials: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!doc || doc.deletedAt !== null || doc.ownerId !== teacherId) {
      throw new NotFoundException('Không tìm thấy tài liệu cần xóa');
    }

    const activeLinksCount = doc._count.materials;

    if (activeLinksCount > 0) {
      // Đang được dùng trong các lớp -> Chỉ xóa mềm khỏi thư viện giáo viên
      await this.prisma.document.update({
        where: { id: documentId },
        data: { deletedAt: new Date() },
      });

      return {
        message: `Đã xóa tài liệu khỏi thư viện cá nhân. Do tài liệu đang được chia sẻ ở ${activeLinksCount} vị trí lớp/buổi học, file gốc vẫn được lưu trữ an toàn.`,
      };
    } else {
      // Không còn nơi nào dùng -> Xóa mềm và xóa file trên R2
      await this.prisma.document.update({
        where: { id: documentId },
        data: { deletedAt: new Date() },
      });

      try {
        if (doc.storageKey) {
          await this.r2StorageService.deleteObject(doc.storageKey);
        }
      } catch (err) {
        this.logger.error(
          `Không thể xóa object R2 ${doc.storageKey}: ${(err as Error).message}`,
        );
      }

      return {
        message: 'Đã xóa hoàn toàn tài liệu và tệp lưu trữ trên R2 thành công',
      };
    }
  }

  // ==================== TÀI LIỆU CẤU TRÚC, AUTOSAVE, VERSIONING, IMPORT/EXPORT ====================

  /**
   * Kiểm tra quyền xem tài liệu:
   * 1. ADMIN luôn có quyền
   * 2. Chủ sở hữu (Owner/Teacher) luôn có quyền
   * 3. Học sinh (Student): Chỉ có quyền nếu tài liệu được chia sẻ vào lớp học mà học sinh là thành viên ACTIVE
   *    và thỏa mãn accessStartTime/accessEndTime/isPublished.
   */
  async verifyUserCanViewDocument(user: { sub: string; role: UserRole }, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        category: {
          select: { id: true, name: true },
        },
        materials: {
          where: { deletedAt: null },
          select: {
            id: true,
            classId: true,
            sessionId: true,
            isPublished: true,
            accessStartTime: true,
            accessEndTime: true,
            class: {
              select: { id: true, name: true, teacherId: true },
            },
          },
        },
      },
    });

    if (!doc || doc.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (user.role === UserRole.ADMIN || doc.ownerId === user.sub) {
      return doc;
    }

    if (user.role === UserRole.STUDENT) {
      const now = new Date();
      // Lấy danh sách lớp mà tài liệu đang được gắn vào hợp lệ
      const eligibleClassIds = doc.materials
        .filter((mat) => {
          if (!mat.isPublished) return false;
          if (mat.accessStartTime && mat.accessStartTime > now) return false;
          if (mat.accessEndTime && mat.accessEndTime < now) return false;
          return true;
        })
        .map((mat) => mat.classId);

      if (eligibleClassIds.length > 0) {
        const activeEnrollment = await this.prisma.enrollment.findFirst({
          where: {
            studentId: user.sub,
            classId: { in: eligibleClassIds },
            status: 'ACTIVE',
          },
        });

        if (activeEnrollment) {
          return doc;
        }
      }
    }

    // Nếu là giáo viên khác không phải owner hoặc học sinh không thuộc lớp
    throw new NotFoundException('Không tìm thấy tài liệu');
  }

  /**
   * Kiểm tra quyền chỉnh sửa tài liệu:
   * Chỉ Owner hoặc ADMIN mới có quyền chỉnh sửa.
   */
  async verifyUserCanEditDocument(user: { sub: string; role: UserRole }, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (user.role !== UserRole.ADMIN && doc.ownerId !== user.sub) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài liệu này');
    }

    return doc;
  }

  /**
   * POST /documents: Tạo tài liệu cấu trúc mới
   */
  async createStructuredDocument(
    userId: string,
    dto: CreateDocumentDto,
  ) {
    let categoryId: string | null = null;
    if (dto.categoryId) {
      const cat = await this.prisma.documentCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!cat || cat.teacherId !== userId) {
        throw new BadRequestException('Danh mục tài liệu không hợp lệ');
      }
      categoryId = dto.categoryId;
    }

    const initialContent = dto.content
      ? validateAndSanitizeTiptapJson(dto.content)
      : {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '' }],
            },
          ],
        };

    const doc = await this.prisma.$transaction(async (tx) => {
      const newDoc = await tx.document.create({
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim(),
          categoryId,
          ownerId: userId,
          type: DocumentType.STRUCTURED_NOTE,
          status: dto.status ?? DocumentStatus.DRAFT,
          mimeType: 'application/vnd.tiptap+json',
          revision: 1,
          content: initialContent as Prisma.InputJsonValue,
          sizeBytes: BigInt(Buffer.byteLength(JSON.stringify(initialContent), 'utf8')),
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      });

      // Tạo snapshot version 1 khởi tạo
      await tx.documentVersion.create({
        data: {
          documentId: newDoc.id,
          revision: 1,
          title: newDoc.title,
          content: initialContent as Prisma.InputJsonValue,
          actorId: userId,
          reason: 'Khởi tạo tài liệu',
        },
      });

      return newDoc;
    });

    return {
      message: 'Tạo tài liệu thành công',
      document: this.formatDocument(doc),
    };
  }

  /**
   * GET /documents/:id: Lấy chi tiết tài liệu kèm nội dung theo quyền
   */
  async getDocumentByIdWithContent(user: { sub: string; role: UserRole }, id: string) {
    const doc = await this.verifyUserCanViewDocument(user, id);
    return this.formatDocument(doc);
  }

  /**
   * PUT /documents/:id/content: Cập nhật nội dung có kiểm tra expectedRevision chống lost update (Optimistic Concurrency Control)
   */
  async updateDocumentContent(
    user: { sub: string; role: UserRole },
    id: string,
    dto: UpdateDocumentContentDto,
  ) {
    await this.verifyUserCanEditDocument(user, id);

    // Validate và sanitize JSON payload
    const sanitizedContent = validateAndSanitizeTiptapJson(dto.content);
    const contentSizeBytes = BigInt(
      Buffer.byteLength(JSON.stringify(sanitizedContent), 'utf8'),
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Cập nhật có điều kiện: chỉ update khi revision == expectedRevision
        const updateResult = await tx.document.updateMany({
          where: {
            id,
            revision: dto.expectedRevision,
            deletedAt: null,
          },
          data: {
            content: sanitizedContent as Prisma.InputJsonValue,
            revision: { increment: 1 },
            sizeBytes: contentSizeBytes,
          },
        });

        if (updateResult.count === 0) {
          // Bị xung đột revision hoặc tài liệu đã bị xóa
          const currentDoc = await tx.document.findUnique({
            where: { id },
            select: { revision: true, updatedAt: true },
          });

          throw new ConflictException({
            statusCode: 409,
            error: 'Conflict',
            errorCode: 'REVISION_CONFLICT',
            message:
              'Xung đột phiên bản: Tài liệu đã được cập nhật bởi một phiên làm việc khác',
            currentRevision: currentDoc?.revision ?? null,
            expectedRevision: dto.expectedRevision,
          });
        }

        const updatedDoc = await tx.document.findUniqueOrThrow({
          where: { id },
          select: { id: true, title: true, revision: true, updatedAt: true },
        });

        // Tạo snapshot version nếu có lý do hoặc theo mốc revision (mỗi 5 revisions hoặc có lý do cụ thể)
        const shouldCreateSnapshot =
          Boolean(dto.versionReason) || updatedDoc.revision % 5 === 0;

        if (shouldCreateSnapshot) {
          await tx.documentVersion.create({
            data: {
              documentId: id,
              revision: updatedDoc.revision,
              title: updatedDoc.title,
              content: sanitizedContent as Prisma.InputJsonValue,
              actorId: user.sub,
              reason: dto.versionReason || `Lưu mốc phiên bản revision ${updatedDoc.revision}`,
            },
          });
        }

        return {
          message: 'Lưu nội dung tài liệu thành công',
          revision: updatedDoc.revision,
          updatedAt: updatedDoc.updatedAt,
        };
      });
    } catch (err: any) {
      if (err instanceof ConflictException) {
        throw err;
      }
      this.logger.error(`Lỗi khi lưu nội dung tài liệu ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * GET /documents/:id/versions: Danh sách lịch sử các phiên bản
   */
  async getDocumentVersions(
    user: { sub: string; role: UserRole },
    documentId: string,
    query: QueryVersionsDto,
  ) {
    await this.verifyUserCanViewDocument(user, documentId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.documentVersion.findMany({
        where: { documentId },
        select: {
          id: true,
          revision: true,
          title: true,
          reason: true,
          createdAt: true,
          actor: {
            select: { id: true, fullName: true, role: true },
          },
        },
        orderBy: { revision: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.documentVersion.count({ where: { documentId } }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * POST /documents/:id/restore/:versionId: Khôi phục phiên bản snapshot tạo revision mới
   */
  async restoreDocumentVersion(
    user: { sub: string; role: UserRole },
    documentId: string,
    versionId: string,
  ) {
    await this.verifyUserCanEditDocument(user, documentId);

    const version = await this.prisma.documentVersion.findFirst({
      where: { id: versionId, documentId },
    });

    if (!version) {
      throw new NotFoundException('Không tìm thấy phiên bản lịch sử để khôi phục');
    }

    return await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.findUniqueOrThrow({
        where: { id: documentId },
      });

      const nextRevision = doc.revision + 1;
      const contentSizeBytes = BigInt(
        Buffer.byteLength(JSON.stringify(version.content), 'utf8'),
      );

      const updatedDoc = await tx.document.update({
        where: { id: documentId },
        data: {
          content: version.content as Prisma.InputJsonValue,
          revision: nextRevision,
          sizeBytes: contentSizeBytes,
        },
      });

      // Tạo snapshot mới cho hành động restore
      await tx.documentVersion.create({
        data: {
          documentId,
          revision: nextRevision,
          title: updatedDoc.title,
          content: version.content as Prisma.InputJsonValue,
          actorId: user.sub,
          reason: `Khôi phục từ phiên bản rev ${version.revision}`,
        },
      });

      return {
        message: `Đã khôi phục thành công từ phiên bản revision ${version.revision}`,
        revision: nextRevision,
        document: this.formatDocument(updatedDoc),
      };
    });
  }

  /**
   * POST /documents/import: Nhập tài liệu DOCX từ file đã upload lên R2 qua presigned URL
   */
  async importDocxDocument(teacherId: string, dto: ImportDocumentDto) {
    // 1. Kiểm tra session upload
    const session = await this.prisma.uploadSession.findUnique({
      where: { storageKey: dto.storageKey },
    });

    if (!session || session.userId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền nhập tài liệu từ phiên upload này',
      );
    }

    if (session.status === UploadSessionStatus.COMPLETED) {
      // Idempotency: nếu đã import rồi, tìm document theo storageKey
      const existing = await this.prisma.document.findFirst({
        where: { storageKey: dto.storageKey },
      });
      if (existing) {
        return {
          message: 'Tài liệu đã được nhập trước đó',
          document: this.formatDocument(existing),
          warnings: [],
        };
      }
    }

    // 2. Tải buffer file DOCX từ R2
    const docxBuffer = await this.r2StorageService.downloadObjectBuffer(
      dto.storageKey,
    );

    // 3. Chuyển đổi DOCX -> Tiptap JSON
    const { tiptapJson, warnings } = await convertDocxBufferToTiptap(docxBuffer);
    const jsonSizeBytes = BigInt(
      Buffer.byteLength(JSON.stringify(tiptapJson), 'utf8'),
    );

    const docTitle =
      dto.title?.trim() || session.title?.trim() || session.originalName || 'Tài liệu nhập DOCX';

    // 4. Lưu vào database trong transaction
    const newDoc = await this.prisma.$transaction(async (tx) => {
      await tx.uploadSession.update({
        where: { id: session.id },
        data: { status: UploadSessionStatus.COMPLETED },
      });

      const doc = await tx.document.create({
        data: {
          title: docTitle,
          originalName: session.originalName,
          storageKey: session.storageKey,
          categoryId: dto.categoryId ?? session.categoryId,
          ownerId: teacherId,
          type: DocumentType.STRUCTURED_NOTE,
          status: DocumentStatus.DRAFT,
          mimeType: 'application/vnd.tiptap+json',
          revision: 1,
          content: tiptapJson as Prisma.InputJsonValue,
          sizeBytes: jsonSizeBytes,
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      });

      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          revision: 1,
          title: doc.title,
          content: tiptapJson as Prisma.InputJsonValue,
          actorId: teacherId,
          reason: 'Nhập nội dung từ file DOCX',
        },
      });

      return doc;
    });

    return {
      message: 'Nhập tài liệu từ DOCX thành công',
      document: this.formatDocument(newDoc),
      warnings,
    };
  }

  /**
   * POST /documents/:id/export: Tạo file xuất DOCX hoặc PDF từ revision đã lưu
   */
  async exportDocument(
    user: { sub: string; role: UserRole },
    documentId: string,
    dto: ExportDocumentDto,
  ) {
    const doc = await this.verifyUserCanViewDocument(user, documentId);

    const content = (doc.content as Record<string, any>) ?? {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
    };

    const currentRevision = doc.revision;

    // Kiểm tra xem đã có export job hoàn tất cùng revision và format chưa
    const existingJob = await this.prisma.documentExportJob.findFirst({
      where: {
        documentId,
        revision: currentRevision,
        format: dto.format,
        status: DocumentExportStatus.COMPLETED,
        storageKey: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingJob && existingJob.storageKey) {
      const presigned = await this.r2StorageService.createPresignedGetUrl(
        existingJob.storageKey,
        `${doc.title}.${dto.format.toLowerCase()}`,
      );

      return {
        jobId: existingJob.id,
        status: existingJob.status,
        format: existingJob.format,
        revision: existingJob.revision,
        downloadUrl: presigned.downloadUrl,
        expiresInSeconds: presigned.expiresInSeconds,
      };
    }

    // Tạo job mới
    const job = await this.prisma.documentExportJob.create({
      data: {
        documentId,
        revision: currentRevision,
        format: dto.format,
        status: DocumentExportStatus.PROCESSING,
        createdById: user.sub,
      },
    });

    try {
      let exportResult: { buffer: Buffer; mimeType: string };
      if (dto.format === DocumentExportFormat.DOCX) {
        exportResult = await convertTiptapToDocx(content, doc.title);
      } else {
        exportResult = await convertTiptapToPdf(content, doc.title);
      }

      const storageKey = `exports/${doc.id}/rev-${currentRevision}-${job.id}.${dto.format.toLowerCase()}`;
      await this.r2StorageService.uploadObjectBuffer(
        storageKey,
        exportResult.buffer,
        exportResult.mimeType,
      );

      const updatedJob = await this.prisma.documentExportJob.update({
        where: { id: job.id },
        data: {
          status: DocumentExportStatus.COMPLETED,
          storageKey,
          fileSize: BigInt(exportResult.buffer.length),
        },
      });

      const presigned = await this.r2StorageService.createPresignedGetUrl(
        storageKey,
        `${doc.title}.${dto.format.toLowerCase()}`,
      );

      return {
        jobId: updatedJob.id,
        status: updatedJob.status,
        format: updatedJob.format,
        revision: updatedJob.revision,
        downloadUrl: presigned.downloadUrl,
        expiresInSeconds: presigned.expiresInSeconds,
      };
    } catch (err: any) {
      this.logger.error(`Lỗi khi tạo file xuất tài liệu ${doc.id}: ${err.message}`);
      await this.prisma.documentExportJob.update({
        where: { id: job.id },
        data: {
          status: DocumentExportStatus.FAILED,
          errorMessage: err.message,
        },
      });
      throw new BadRequestException(`Không thể tạo file xuất: ${err.message}`);
    }
  }

  /**
   * GET /documents/:id/export/:exportId: Lấy trạng thái và URL tải xuất
   */
  async getExportJobStatus(
    user: { sub: string; role: UserRole },
    documentId: string,
    exportId: string,
  ) {
    const doc = await this.verifyUserCanViewDocument(user, documentId);

    const job = await this.prisma.documentExportJob.findFirst({
      where: { id: exportId, documentId },
    });

    if (!job) {
      throw new NotFoundException('Không tìm thấy tác vụ xuất tài liệu');
    }

    let downloadUrl: string | null = null;
    let expiresInSeconds: number | null = null;

    if (job.status === DocumentExportStatus.COMPLETED && job.storageKey) {
      const presigned = await this.r2StorageService.createPresignedGetUrl(
        job.storageKey,
        `${doc.title}.${job.format.toLowerCase()}`,
      );
      downloadUrl = presigned.downloadUrl;
      expiresInSeconds = presigned.expiresInSeconds;
    }

    return {
      jobId: job.id,
      status: job.status,
      format: job.format,
      revision: job.revision,
      errorMessage: job.errorMessage,
      downloadUrl,
      expiresInSeconds,
      createdAt: job.createdAt,
    };
  }
}

