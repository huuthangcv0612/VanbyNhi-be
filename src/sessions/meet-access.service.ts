import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  MemberStatus,
  SessionStatus,
} from '../../generated/prisma/client.js';

export interface MeetAccessResult {
  canJoin: boolean;
  reason?: string;
  meetUrl?: string | null;
  opensAt: Date;
  closesAt: Date;
  isLive: boolean;
  status: SessionStatus;
}

@Injectable()
export class MeetAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kiểm tra tính hợp lệ của format URL Google Meet / Web meeting
   */
  isValidMeetUrl(url?: string | null): boolean {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    const trimmed = url.trim();
    try {
      const parsed = new URL(trimmed);
      const isHttpOrHttps =
        parsed.protocol === 'https:' || parsed.protocol === 'http:';
      const isGoogleMeetHost =
        parsed.hostname.toLowerCase() === 'meet.google.com';
      return isHttpOrHttps && isGoogleMeetHost;
    } catch {
      return false;
    }
  }

  /**
   * Tính toán và kiểm tra trạng thái cửa sổ tham gia phòng học Google Meet
   * Cửa sổ tham gia mặc định mở từ 15 phút trước startTime cho đến endTime.
   * Nếu buổi học đang IN_PROGRESS (LIVE), luôn cho phép tham gia.
   * Nếu buổi học đã COMPLETED hoặc CANCELLED, tuyệt đối không cấp link.
   */
  checkJoinWindow(
    session: {
      startTime: Date;
      endTime: Date;
      status: SessionStatus;
      meetUrl?: string | null;
      class?: { defaultMeetUrl?: string | null } | null;
    },
    now: Date = new Date(),
  ): MeetAccessResult {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const opensAt = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 phút trước startTime
    const closesAt = endTime;
    const isLive = session.status === SessionStatus.IN_PROGRESS;

    const effectiveMeetUrl =
      session.meetUrl?.trim() || session.class?.defaultMeetUrl?.trim() || null;

    // 1. Kiểm tra trạng thái đã hoàn thành hoặc hủy
    if (session.status === SessionStatus.CANCELLED) {
      return {
        canJoin: false,
        reason: 'Buổi học đã bị hủy (CANCELLED)',
        meetUrl: null,
        opensAt,
        closesAt,
        isLive,
        status: session.status,
      };
    }

    if (session.status === SessionStatus.COMPLETED) {
      return {
        canJoin: false,
        reason: 'Buổi học đã kết thúc (COMPLETED)',
        meetUrl: null,
        opensAt,
        closesAt,
        isLive,
        status: session.status,
      };
    }

    // 2. Kiểm tra link Meet có tồn tại và hợp lệ không
    if (!this.isValidMeetUrl(effectiveMeetUrl)) {
      return {
        canJoin: false,
        reason: 'Buổi học chưa có đường dẫn Google Meet hợp lệ',
        meetUrl: null,
        opensAt,
        closesAt,
        isLive,
        status: session.status,
      };
    }

    // 3. Nếu buổi học đang diễn ra (LIVE / IN_PROGRESS)
    if (isLive) {
      return {
        canJoin: true,
        meetUrl: effectiveMeetUrl,
        opensAt,
        closesAt,
        isLive: true,
        status: session.status,
      };
    }

    // 4. Nếu trạng thái là SCHEDULED -> Kiểm tra thời gian hệ thống với cửa sổ 15 phút
    const currentTimeMs = now.getTime();
    if (currentTimeMs < opensAt.getTime()) {
      return {
        canJoin: false,
        reason:
          'Chưa đến thời gian mở phòng học. Cửa sổ tham gia mở trước giờ học 15 phút.',
        meetUrl: null,
        opensAt,
        closesAt,
        isLive: false,
        status: session.status,
      };
    }

    if (currentTimeMs > closesAt.getTime()) {
      return {
        canJoin: false,
        reason: 'Đã quá thời gian kết thúc buổi học',
        meetUrl: null,
        opensAt,
        closesAt,
        isLive: false,
        status: session.status,
      };
    }

    // Nằm trong khoảng [startTime - 15m, endTime]
    return {
      canJoin: true,
      meetUrl: effectiveMeetUrl,
      opensAt,
      closesAt,
      isLive: false,
      status: session.status,
    };
  }

  /**
   * Xác thực quyền học sinh và lấy thông tin tham gia phòng Meet cho một buổi học
   */
  async getStudentMeetAccess(
    sessionId: string,
    studentId: string,
    now: Date = new Date(),
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            status: true,
            defaultMeetUrl: true,
            teacherId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    // Kiểm tra học sinh có phải là thành viên ACTIVE của lớp không
    const membership = await this.prisma.enrollment.findFirst({
      where: {
        classId: session.classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên đang hoạt động của lớp học này',
      );
    }

    const access = this.checkJoinWindow(session, now);

    return {
      sessionId: session.id,
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      classId: session.classId,
      className: session.class.name,
      ...access,
    };
  }

  /**
   * Kiểm tra quyền của giáo viên đối với buổi học
   */
  async validateTeacherSession(sessionId: string, teacherId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của lớp học này',
      );
    }

    return session;
  }
}
