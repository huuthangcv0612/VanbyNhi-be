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
  Prisma,
} from '../../generated/prisma/client.js';
import type { InitUploadDto } from './dto/init-upload.dto.js';
import type { CompleteUploadDto } from './dto/complete-upload.dto.js';
import type { QueryDocumentsDto } from './dto/query-documents.dto.js';
import type { UpdateDocumentDto } from './dto/update-document.dto.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import type { QueryCategoriesDto } from './dto/query-categories.dto.js';

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

    const result = await this.r2StorageService.createPresignedGetUrl(
      doc.storageKey,
      doc.originalName,
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
        await this.r2StorageService.deleteObject(doc.storageKey);
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
}
