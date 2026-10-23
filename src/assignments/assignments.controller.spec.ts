import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignmentsController } from './assignments.controller.js';
import { UserRole, ReviewStatus, UploadTargetType } from '../../generated/prisma/client.js';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      create: vi.fn().mockResolvedValue({ message: 'Tạo thành công' }),
      findAll: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
      findOne: vi.fn().mockResolvedValue({ id: 'a1' }),
      update: vi.fn().mockResolvedValue({ message: 'Cập nhật thành công' }),
      remove: vi.fn().mockResolvedValue({ message: 'Xóa thành công' }),
      getEligibleStudents: vi.fn().mockResolvedValue({ students: [] }),
      getAssignmentStats: vi.fn().mockResolvedValue({ totalEligible: 10 }),
      submitAssignment: vi.fn().mockResolvedValue({ message: 'Nộp thành công' }),
      getSubmissionsByAssignment: vi.fn().mockResolvedValue([]),
      getSubmission: vi.fn().mockResolvedValue({ id: 'sub1' }),
      reviewSubmission: vi.fn().mockResolvedValue({ message: 'Đã lưu review' }),
      returnSubmissionReview: vi.fn().mockResolvedValue({ message: 'Đã trả bài' }),
      gradeSubmission: vi.fn().mockResolvedValue({ message: 'Chấm thành công' }),
      initUpload: vi.fn().mockResolvedValue({ uploadUrl: 'https://r2.test/upload' }),
      getAttachmentDownloadUrl: vi.fn().mockResolvedValue({ downloadUrl: 'https://r2.test/download' }),
    };

    controller = new AssignmentsController(serviceMock);
  });

  it('gọi create() với đúng tham số userId, role, dto', async () => {
    const dto = { classId: 'c1', title: 'Bài tập 1' };
    await controller.create('teacher-1', UserRole.TEACHER, dto as any);
    expect(serviceMock.create).toHaveBeenCalledWith('teacher-1', UserRole.TEACHER, dto);
  });

  it('gọi findAll() với user context và query', async () => {
    const query = { page: 1, limit: 10, classId: 'c1' };
    await controller.findAll({ sub: 'user-1', role: UserRole.STUDENT }, query);
    expect(serviceMock.findAll).toHaveBeenCalledWith({ id: 'user-1', role: UserRole.STUDENT }, query);
  });

  it('gọi getEligibleStudents() và getStats()', async () => {
    await controller.getEligibleStudents('a1', { sub: 't1', role: UserRole.TEACHER });
    expect(serviceMock.getEligibleStudents).toHaveBeenCalledWith('a1', { id: 't1', role: UserRole.TEACHER });

    await controller.getStats('a1', { sub: 't1', role: UserRole.TEACHER });
    expect(serviceMock.getAssignmentStats).toHaveBeenCalledWith('a1', { id: 't1', role: UserRole.TEACHER });
  });

  it('gọi submit()', async () => {
    const dto = { content: 'Bài làm' };
    await controller.submit('a1', 'stu-1', dto);
    expect(serviceMock.submitAssignment).toHaveBeenCalledWith('a1', 'stu-1', dto);
  });

  it('gọi reviewSubmission() và returnSubmission()', async () => {
    const reviewDto = { score: 9, status: ReviewStatus.DRAFT };
    await controller.reviewSubmission('sub1', 't1', UserRole.TEACHER, reviewDto);
    expect(serviceMock.reviewSubmission).toHaveBeenCalledWith('sub1', 't1', UserRole.TEACHER, reviewDto);

    await controller.returnSubmission('sub1', 't1', UserRole.TEACHER);
    expect(serviceMock.returnSubmissionReview).toHaveBeenCalledWith('sub1', 't1', UserRole.TEACHER);
  });

  it('gọi initUpload() và getAttachmentDownloadUrl()', async () => {
    const uploadDto = {
      targetType: UploadTargetType.ASSIGNMENT,
      originalName: 'de_bai.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    };
    await controller.initUpload('t1', UserRole.TEACHER, uploadDto);
    expect(serviceMock.initUpload).toHaveBeenCalledWith('t1', UserRole.TEACHER, uploadDto);

    await controller.getAttachmentDownloadUrl('att1', { sub: 's1', role: UserRole.STUDENT });
    expect(serviceMock.getAttachmentDownloadUrl).toHaveBeenCalledWith('att1', { id: 's1', role: UserRole.STUDENT });
  });
});
