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
  MemberStatus,
  MaterialType,
  Prisma,
} from '../../generated/prisma/client.js';
import type { InitUploadDto } from './dto/init-upload.dto.js';
import type { CompleteUploadDto } from './dto/complete-upload.dto.js';
import type { ShareMaterialDto } from './dto/share-material.dto.js';
import type { UpdateMaterialDto } from './dto/update-material.dto.js';
import type { QueryMaterialsDto } from './dto/query-materials.dto.js';

@Injectable()
export class ClassMaterialsService {
  private readonly logger = new Logger(ClassMaterialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  /**
   * Format material trả về kèm BigInt -> Number
   */
  private formatMaterial(material: any) {
    if (!material) return null;
    return {
      ...material,
      fileSize: material.fileSize ? Number(material.fileSize) : null,
      document: material.document
        ? {
            ...material.document,
            sizeBytes: Number(material.document.sizeBytes),
          }
        : undefined,
    };
  }

  /**
   * Xác minh giáo viên phụ trách lớp học
   */
  async verifyClassTeacher(teacherId: string, classId: string) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true, teacherId: true, status: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý tài liệu của lớp học này',
      );
    }

    return classEntity;
  }

  /**
   * Xác minh giáo viên phụ trách buổi học
   */
  async verifySessionTeacher(teacherId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: { id: true, name: true, teacherId: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý tài liệu của buổi học này',
      );
    }

    return session;
  }

  /**
   * Xác minh học sinh là thành viên ACTIVE của lớp học
   */
  async verifyStudentMembership(studentId: string, classId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên đang hoạt động của lớp học này',
      );
    }

    return enrollment;
  }

  // ==================== TÀI LIỆU LỚP HỌC (CLASS MATERIALS) ====================

  /**
   * Bước 1: Khởi tạo upload trực tiếp tài liệu vào Lớp
   */
  async initClassDirectUpload(
    teacherId: string,
    classId: string,
    dto: InitUploadDto,
  ) {
    await this.verifyClassTeacher(teacherId, classId);

    const storageKey = this.r2StorageService.generateStorageKey(
      `classes/${classId}`,
    );

    const presigned = await this.r2StorageService.createPresignedPutUrl(
      storageKey,
      dto.mimeType,
      dto.sizeBytes,
    );

    const expiresAt = new Date(Date.now() + presigned.expiresInSeconds * 1000);
    const session = await this.prisma.uploadSession.create({
      data: {
        userId: teacherId,
        targetType: UploadTargetType.CLASS,
        targetId: classId,
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
   * Bước 2: Xác nhận hoàn tất upload trực tiếp tài liệu vào Lớp
   */
  async completeClassDirectUpload(
    teacherId: string,
    classId: string,
    dto: CompleteUploadDto,
  ) {
    await this.verifyClassTeacher(teacherId, classId);

    const session = await this.prisma.uploadSession.findUnique({
      where: { storageKey: dto.storageKey },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên upload tài liệu');
    }

    if (session.userId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xác nhận phiên upload này');
    }

    if (
      session.targetType !== UploadTargetType.CLASS ||
      session.targetId !== classId
    ) {
      throw new BadRequestException(
        'Phiên upload này không khớp với lớp học được chỉ định',
      );
    }

    // Idempotent: nếu đã hoàn tất
    if (session.status === UploadSessionStatus.COMPLETED) {
      const existingMaterial = await this.prisma.classMaterial.findFirst({
        where: {
          classId,
          sessionId: null,
          document: { storageKey: dto.storageKey },
        },
        include: { document: true },
      });
      if (existingMaterial) {
        return {
          message: 'Tài liệu đã được tải lên lớp thành công trước đó',
          material: this.formatMaterial(existingMaterial),
        };
      }
    }

    if (session.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException(
        `Phiên upload không hợp lệ (trạng thái: ${session.status})`,
      );
    }

    // Kiểm tra object trên R2
    const metadata = await this.r2StorageService.getObjectMetadata(
      session.storageKey,
    );
    if (!metadata) {
      throw new BadRequestException(
        'File chưa được upload thành công lên hệ thống lưu trữ Cloudflare R2',
      );
    }

    await this.r2StorageService.validateFileSignature(
      session.storageKey,
      session.mimeType,
    );

    const actualSizeBytes = metadata.sizeBytes || Number(session.sizeBytes);

    // Transaction DB: Tạo Document và liên kết ClassMaterial (sessionId = null)
    const material = await this.prisma.$transaction(async (tx) => {
      await tx.uploadSession.update({
        where: { id: session.id },
        data: { status: UploadSessionStatus.COMPLETED },
      });

      const newDoc = await tx.document.create({
        data: {
          title: session.title,
          description: session.description,
          originalName: session.originalName,
          storageKey: session.storageKey,
          mimeType: session.mimeType,
          sizeBytes: BigInt(actualSizeBytes),
          ownerId: teacherId,
          categoryId: null, // Upload trực tiếp vào lớp không tự đưa vào thư viện
        },
      });

      return tx.classMaterial.create({
        data: {
          classId,
          sessionId: null,
          documentId: newDoc.id,
          uploadedById: teacherId,
          title: session.title,
          description: session.description,
          type: MaterialType.DOCUMENT,
          originalName: session.originalName,
          mimeType: session.mimeType,
          fileSize: BigInt(actualSizeBytes),
          isPublished: true,
          publishedAt: new Date(),
          order: 0,
        },
        include: {
          document: {
            select: { id: true, title: true, storageKey: true, sizeBytes: true },
          },
        },
      });
    });

    return {
      message: 'Tải tài liệu lên lớp học thành công',
      material: this.formatMaterial(material),
    };
  }

  /**
   * Chia sẻ Document có sẵn từ thư viện vào Lớp học (Không upload lại file)
   */
  async shareDocumentToClass(
    teacherId: string,
    classId: string,
    dto: ShareMaterialDto,
  ) {
    await this.verifyClassTeacher(teacherId, classId);

    // Xác minh document thuộc quyền của giáo viên
    const doc = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
    });

    if (!doc || doc.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu nguồn');
    }

    if (doc.ownerId !== teacherId) {
      throw new ForbiddenException(
        'Bạn chỉ được chia sẻ tài liệu thuộc quyền sở hữu của mình',
      );
    }

    // Kiểm tra xem đã chia sẻ vào lớp chưa
    const existing = await this.prisma.classMaterial.findFirst({
      where: {
        classId,
        sessionId: null,
        documentId: dto.documentId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Tài liệu này đã được chia sẻ cho lớp học trước đó',
      );
    }

    const title = dto.title?.trim() || doc.title;

    const material = await this.prisma.classMaterial.create({
      data: {
        classId,
        sessionId: null,
        documentId: doc.id,
        uploadedById: teacherId,
        title,
        description: dto.description ?? doc.description,
        type: MaterialType.DOCUMENT,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.sizeBytes,
        isPublished: dto.isPublished ?? true,
        publishedAt: dto.isPublished ? new Date() : null,
        order: dto.order ?? 0,
        accessStartTime: dto.accessStartTime
          ? new Date(dto.accessStartTime)
          : null,
        accessEndTime: dto.accessEndTime ? new Date(dto.accessEndTime) : null,
      },
      include: {
        document: {
          select: { id: true, title: true, storageKey: true, sizeBytes: true },
        },
      },
    });

    return {
      message: 'Chia sẻ tài liệu vào lớp học thành công',
      material: this.formatMaterial(material),
    };
  }

  /**
   * Giáo viên lấy danh sách tài liệu của một lớp học
   */
  async getTeacherClassMaterials(
    teacherId: string,
    classId: string,
    query: QueryMaterialsDto,
  ) {
    await this.verifyClassTeacher(teacherId, classId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ClassMaterialWhereInput = {
      classId,
      sessionId: null, // Chỉ tài liệu chung của lớp
      deletedAt: null,
    };

    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.classMaterial.findMany({
        where,
        include: {
          document: {
            select: {
              id: true,
              title: true,
              storageKey: true,
              sizeBytes: true,
              mimeType: true,
              originalName: true,
            },
          },
          uploadedBy: {
            select: { id: true, fullName: true },
          },
        },
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.classMaterial.count({ where }),
    ]);

    return {
      items: items.map((m) => this.formatMaterial(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ==================== TÀI LIỆU BUỔI HỌC (SESSION MATERIALS) ====================

  /**
   * Bước 1: Khởi tạo upload trực tiếp tài liệu vào Buổi học
   */
  async initSessionDirectUpload(
    teacherId: string,
    sessionId: string,
    dto: InitUploadDto,
  ) {
    const session = await this.verifySessionTeacher(teacherId, sessionId);

    const storageKey = this.r2StorageService.generateStorageKey(
      `sessions/${sessionId}`,
    );

    const presigned = await this.r2StorageService.createPresignedPutUrl(
      storageKey,
      dto.mimeType,
      dto.sizeBytes,
    );

    const expiresAt = new Date(Date.now() + presigned.expiresInSeconds * 1000);
    const uploadSession = await this.prisma.uploadSession.create({
      data: {
        userId: teacherId,
        targetType: UploadTargetType.SESSION,
        targetId: sessionId,
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
      uploadSessionId: uploadSession.id,
      expiresInSeconds: presigned.expiresInSeconds,
      requiredHeaders: presigned.requiredHeaders,
      sessionId: session.id,
      classId: session.classId,
    };
  }

  /**
   * Bước 2: Xác nhận hoàn tất upload trực tiếp tài liệu vào Buổi học
   */
  async completeSessionDirectUpload(
    teacherId: string,
    sessionId: string,
    dto: CompleteUploadDto,
  ) {
    const classSession = await this.verifySessionTeacher(teacherId, sessionId);

    const session = await this.prisma.uploadSession.findUnique({
      where: { storageKey: dto.storageKey },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên upload tài liệu');
    }

    if (session.userId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xác nhận phiên upload này');
    }

    if (
      session.targetType !== UploadTargetType.SESSION ||
      session.targetId !== sessionId
    ) {
      throw new BadRequestException(
        'Phiên upload này không khớp với buổi học được chỉ định',
      );
    }

    if (session.status === UploadSessionStatus.COMPLETED) {
      const existingMaterial = await this.prisma.classMaterial.findFirst({
        where: {
          sessionId,
          document: { storageKey: dto.storageKey },
        },
        include: { document: true },
      });
      if (existingMaterial) {
        return {
          message: 'Tài liệu đã được tải lên buổi học thành công trước đó',
          material: this.formatMaterial(existingMaterial),
        };
      }
    }

    if (session.status !== UploadSessionStatus.PENDING) {
      throw new BadRequestException(
        `Phiên upload không hợp lệ (trạng thái: ${session.status})`,
      );
    }

    const metadata = await this.r2StorageService.getObjectMetadata(
      session.storageKey,
    );
    if (!metadata) {
      throw new BadRequestException(
        'File chưa được upload thành công lên hệ thống lưu trữ Cloudflare R2',
      );
    }

    await this.r2StorageService.validateFileSignature(
      session.storageKey,
      session.mimeType,
    );

    const actualSizeBytes = metadata.sizeBytes || Number(session.sizeBytes);

    // Transaction DB: tạo Document và liên kết ClassMaterial với sessionId
    const material = await this.prisma.$transaction(async (tx) => {
      await tx.uploadSession.update({
        where: { id: session.id },
        data: { status: UploadSessionStatus.COMPLETED },
      });

      const newDoc = await tx.document.create({
        data: {
          title: session.title,
          description: session.description,
          originalName: session.originalName,
          storageKey: session.storageKey,
          mimeType: session.mimeType,
          sizeBytes: BigInt(actualSizeBytes),
          ownerId: teacherId,
          categoryId: null, // Upload trực tiếp buổi học không tự đưa vào thư viện
        },
      });

      return tx.classMaterial.create({
        data: {
          classId: classSession.classId,
          sessionId: sessionId,
          documentId: newDoc.id,
          uploadedById: teacherId,
          title: session.title,
          description: session.description,
          type: MaterialType.DOCUMENT,
          originalName: session.originalName,
          mimeType: session.mimeType,
          fileSize: BigInt(actualSizeBytes),
          isPublished: true,
          publishedAt: new Date(),
          order: 0,
        },
        include: {
          document: {
            select: { id: true, title: true, storageKey: true, sizeBytes: true },
          },
        },
      });
    });

    return {
      message: 'Tải tài liệu lên buổi học thành công',
      material: this.formatMaterial(material),
    };
  }

  /**
   * Chia sẻ Document có sẵn từ thư viện vào Buổi học (Không upload lại file)
   */
  async shareDocumentToSession(
    teacherId: string,
    sessionId: string,
    dto: ShareMaterialDto,
  ) {
    const classSession = await this.verifySessionTeacher(teacherId, sessionId);

    const doc = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
    });

    if (!doc || doc.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu nguồn');
    }

    if (doc.ownerId !== teacherId) {
      throw new ForbiddenException(
        'Bạn chỉ được chia sẻ tài liệu thuộc quyền sở hữu của mình',
      );
    }

    // Kiểm tra xem đã chia sẻ vào buổi học này chưa
    const existing = await this.prisma.classMaterial.findFirst({
      where: {
        sessionId,
        documentId: dto.documentId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Tài liệu này đã được chia sẻ cho buổi học trước đó',
      );
    }

    const title = dto.title?.trim() || doc.title;

    const material = await this.prisma.classMaterial.create({
      data: {
        classId: classSession.classId,
        sessionId,
        documentId: doc.id,
        uploadedById: teacherId,
        title,
        description: dto.description ?? doc.description,
        type: MaterialType.DOCUMENT,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.sizeBytes,
        isPublished: dto.isPublished ?? true,
        publishedAt: dto.isPublished ? new Date() : null,
        order: dto.order ?? 0,
        accessStartTime: dto.accessStartTime
          ? new Date(dto.accessStartTime)
          : null,
        accessEndTime: dto.accessEndTime ? new Date(dto.accessEndTime) : null,
      },
      include: {
        document: {
          select: { id: true, title: true, storageKey: true, sizeBytes: true },
        },
      },
    });

    return {
      message: 'Chia sẻ tài liệu vào buổi học thành công',
      material: this.formatMaterial(material),
    };
  }

  /**
   * Giáo viên lấy danh sách tài liệu của một Buổi học
   */
  async getTeacherSessionMaterials(
    teacherId: string,
    sessionId: string,
    query: QueryMaterialsDto,
  ) {
    await this.verifySessionTeacher(teacherId, sessionId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ClassMaterialWhereInput = {
      sessionId,
      deletedAt: null,
    };

    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.classMaterial.findMany({
        where,
        include: {
          document: {
            select: {
              id: true,
              title: true,
              storageKey: true,
              sizeBytes: true,
              mimeType: true,
              originalName: true,
            },
          },
          uploadedBy: {
            select: { id: true, fullName: true },
          },
        },
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.classMaterial.count({ where }),
    ]);

    return {
      items: items.map((m) => this.formatMaterial(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ==================== CẬP NHẬT / GỠ LIÊN KẾT TÀI LIỆU ====================

  /**
   * Cập nhật thông tin hiển thị / xuất bản của ClassMaterial
   */
  async updateMaterial(
    teacherId: string,
    materialId: string,
    dto: UpdateMaterialDto,
  ) {
    const material = await this.prisma.classMaterial.findUnique({
      where: { id: materialId },
      include: { class: { select: { teacherId: true } } },
    });

    if (!material || material.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (material.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa tài liệu này',
      );
    }

    const data: Prisma.ClassMaterialUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.order !== undefined) {
      data.order = dto.order;
    }
    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
      if (dto.isPublished && !material.publishedAt) {
        data.publishedAt = new Date();
      }
    }
    if (dto.accessStartTime !== undefined) {
      data.accessStartTime = dto.accessStartTime
        ? new Date(dto.accessStartTime)
        : null;
    }
    if (dto.accessEndTime !== undefined) {
      data.accessEndTime = dto.accessEndTime
        ? new Date(dto.accessEndTime)
        : null;
    }

    const updated = await this.prisma.classMaterial.update({
      where: { id: materialId },
      data,
      include: {
        document: {
          select: { id: true, title: true, storageKey: true, sizeBytes: true },
        },
      },
    });

    return {
      message: 'Cập nhật tài liệu thành công',
      material: this.formatMaterial(updated),
    };
  }

  /**
   * Gỡ liên kết tài liệu khỏi Lớp hoặc Buổi học
   * QUY TẮC CỐT LÕI: Gỡ liên kết KHÔNG XÓA Document hoặc object R2!
   */
  async removeMaterial(teacherId: string, materialId: string) {
    const material = await this.prisma.classMaterial.findUnique({
      where: { id: materialId },
      include: { class: { select: { teacherId: true } } },
    });

    if (!material || material.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu cần gỡ');
    }

    if (material.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền gỡ tài liệu này',
      );
    }

    // Đánh dấu xóa mềm liên kết ClassMaterial
    await this.prisma.classMaterial.update({
      where: { id: materialId },
      data: { deletedAt: new Date() },
    });

    return {
      message:
        'Đã gỡ tài liệu thành công. Tệp gốc trên hệ thống lưu trữ vẫn được bảo toàn nguyên vẹn.',
    };
  }

  /**
   * Giáo viên lấy presigned GET URL tải tài liệu lớp hoặc buổi học
   */
  async getTeacherMaterialDownloadUrl(teacherId: string, materialId: string) {
    const material = await this.prisma.classMaterial.findUnique({
      where: { id: materialId },
      include: {
        class: { select: { teacherId: true } },
        document: true,
      },
    });

    if (!material || material.deletedAt !== null) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (material.class.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài liệu này');
    }

    if (material.document) {
      const result = await this.r2StorageService.createPresignedGetUrl(
        material.document.storageKey,
        material.document.originalName,
      );

      return {
        downloadUrl: result.downloadUrl,
        expiresInSeconds: result.expiresInSeconds,
        title: material.title,
        originalName: material.document.originalName,
        mimeType: material.document.mimeType,
        sizeBytes: Number(material.document.sizeBytes),
      };
    }

    // Tương thích ngược với fileUrl cũ
    return {
      downloadUrl: material.fileUrl,
      expiresInSeconds: null,
      title: material.title,
      originalName: material.originalName,
      mimeType: material.mimeType,
      sizeBytes: material.fileSize ? Number(material.fileSize) : null,
    };
  }

  // ==================== DÀNH CHO HỌC SINH (STUDENT) ====================

  /**
   * Học sinh xem danh sách tài liệu của lớp mình tham gia
   */
  async getStudentClassMaterials(
    studentId: string,
    classId: string,
    query: QueryMaterialsDto,
  ) {
    // 1. Xác minh học sinh là thành viên ACTIVE của lớp
    await this.verifyStudentMembership(studentId, classId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const now = new Date();

    const where: Prisma.ClassMaterialWhereInput = {
      classId,
      sessionId: null,
      isPublished: true,
      deletedAt: null,
      // Cửa sổ thời gian truy cập (nếu có cấu hình)
      AND: [
        {
          OR: [{ accessStartTime: null }, { accessStartTime: { lte: now } }],
        },
        {
          OR: [{ accessEndTime: null }, { accessEndTime: { gte: now } }],
        },
      ],
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.classMaterial.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          originalName: true,
          mimeType: true,
          fileSize: true,
          publishedAt: true,
          order: true,
          accessStartTime: true,
          accessEndTime: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.classMaterial.count({ where }),
    ]);

    return {
      items: items.map((m) => this.formatMaterial(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Học sinh xem danh sách tài liệu của buổi học
   */
  async getStudentSessionMaterials(
    studentId: string,
    sessionId: string,
    query: QueryMaterialsDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, classId: true, title: true },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    // Xác minh học sinh là thành viên ACTIVE của lớp chứa buổi học
    await this.verifyStudentMembership(studentId, session.classId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const now = new Date();

    const where: Prisma.ClassMaterialWhereInput = {
      sessionId,
      isPublished: true,
      deletedAt: null,
      AND: [
        {
          OR: [{ accessStartTime: null }, { accessStartTime: { lte: now } }],
        },
        {
          OR: [{ accessEndTime: null }, { accessEndTime: { gte: now } }],
        },
      ],
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.classMaterial.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          originalName: true,
          mimeType: true,
          fileSize: true,
          publishedAt: true,
          order: true,
          accessStartTime: true,
          accessEndTime: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.classMaterial.count({ where }),
    ]);

    return {
      items: items.map((m) => this.formatMaterial(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * HỌC SINH yêu cầu cấp URL tải/xem tài liệu
   * Kiểm tra quyền nghiêm ngặt:
   * 1. Học sinh phải là thành viên ACTIVE của lớp học tương ứng.
   * 2. Tài liệu phải ở trạng thái isPublished == true.
   * 3. Phải nằm trong khoảng thời gian cho phép truy cập (nếu có accessStartTime/accessEndTime).
   * 4. Chỉ cấp presigned URL thời hạn ngắn.
   */
  async getStudentMaterialDownloadUrl(studentId: string, materialId: string) {
    const material = await this.prisma.classMaterial.findUnique({
      where: { id: materialId },
      include: {
        document: true,
        class: { select: { id: true, name: true } },
      },
    });

    if (!material || material.deletedAt !== null || !material.isPublished) {
      throw new NotFoundException('Không tìm thấy tài liệu hoặc tài liệu chưa được xuất bản');
    }

    // 1. Kiểm tra tư cách thành viên ACTIVE của học sinh
    await this.verifyStudentMembership(studentId, material.classId);

    // 2. Kiểm tra cửa sổ thời gian truy cập
    const now = new Date();
    if (material.accessStartTime && now < material.accessStartTime) {
      throw new ForbiddenException(
        'Tài liệu chưa đến thời gian cho phép học sinh truy cập',
      );
    }

    if (material.accessEndTime && now > material.accessEndTime) {
      throw new ForbiddenException(
        'Tài liệu đã hết thời gian cho phép học sinh truy cập',
      );
    }

    // 3. Cấp presigned URL
    if (material.document) {
      const result = await this.r2StorageService.createPresignedGetUrl(
        material.document.storageKey,
        material.document.originalName,
      );

      return {
        downloadUrl: result.downloadUrl,
        expiresInSeconds: result.expiresInSeconds,
        title: material.title,
        originalName: material.document.originalName,
        mimeType: material.document.mimeType,
        sizeBytes: Number(material.document.sizeBytes),
      };
    }

    return {
      downloadUrl: material.fileUrl,
      expiresInSeconds: null,
      title: material.title,
      originalName: material.originalName,
      mimeType: material.mimeType,
      sizeBytes: material.fileSize ? Number(material.fileSize) : null,
    };
  }
}
