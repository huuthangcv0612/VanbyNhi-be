import {
  Injectable,
  InternalServerErrorException,
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateMeetSpaceResult {
  name: string; // "spaces/xxxx"
  meetingUri: string; // "https://meet.google.com/xxx-xxxx-xxx"
  meetingCode?: string; // "xxx-xxxx-xxx"
}

export const VALID_MEET_ACCESS_TYPES = ['OPEN', 'TRUSTED', 'RESTRICTED'] as const;
export type GoogleMeetAccessType = (typeof VALID_MEET_ACCESS_TYPES)[number];

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Xác thực và chuẩn hóa GOOGLE_MEET_ACCESS_TYPE
   */
  getValidatedAccessType(): GoogleMeetAccessType {
    const rawAccessType = this.configService.get<string>('GOOGLE_MEET_ACCESS_TYPE');
    if (!rawAccessType || typeof rawAccessType !== 'string' || rawAccessType.trim() === '') {
      return 'TRUSTED';
    }

    const normalized = rawAccessType.trim().toUpperCase() as GoogleMeetAccessType;
    if (VALID_MEET_ACCESS_TYPES.includes(normalized)) {
      return normalized;
    }

    this.logger.warn(
      `GOOGLE_MEET_ACCESS_TYPE "${rawAccessType}" không hợp lệ (hỗ trợ OPEN, TRUSTED, RESTRICTED). Mặc định sử dụng TRUSTED.`,
    );
    return 'TRUSTED';
  }

  /**
   * Xác thực cấu trúc meetingUri do Google Meet API trả về:
   * - Phải là URL hợp lệ.
   * - Giao thức bắt buộc là https:.
   * - Hostname chính xác là meet.google.com.
   * - Pathname chứa mã phòng họp hợp lệ (không chứa ký tự điều hướng hoặc query script).
   */
  validateMeetingUri(rawUri?: string | null): { meetingUri: string; meetingCode: string } {
    if (!rawUri || typeof rawUri !== 'string' || rawUri.trim() === '') {
      throw new BadGatewayException('Google Meet API không trả về meetingUri');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUri.trim());
    } catch {
      this.logger.error('meetingUri do Google Meet API trả về không phải là URL hợp lệ');
      throw new BadGatewayException('meetingUri do Google Meet API trả về không hợp lệ');
    }

    if (parsedUrl.protocol !== 'https:') {
      this.logger.error(`meetingUri có giao thức không an toàn: ${parsedUrl.protocol}`);
      throw new BadGatewayException('meetingUri do Google Meet API trả về không sử dụng giao thức HTTPS');
    }

    if (parsedUrl.hostname.toLowerCase() !== 'meet.google.com') {
      this.logger.error(`meetingUri có hostname không hợp lệ: ${parsedUrl.hostname}`);
      throw new BadGatewayException('meetingUri do Google Meet API trả về không thuộc tên miền meet.google.com');
    }

    const meetingCode = parsedUrl.pathname.replace(/^\/+/, '');
    if (!meetingCode || !/^[a-zA-Z0-9_-]+$/.test(meetingCode)) {
      this.logger.error(`meetingUri có pathname mã phòng họp không đúng chuẩn: ${parsedUrl.pathname}`);
      throw new BadGatewayException('meetingUri do Google Meet API trả về không chứa mã cuộc họp hợp lệ');
    }

    return {
      meetingUri: `https://meet.google.com/${meetingCode}`,
      meetingCode,
    };
  }

  /**
   * Tạo Google Meet Space riêng biệt thông qua Google Meet REST API v2
   * Endpoint: POST https://meet.googleapis.com/v2/spaces
   */
  async createSpace(accessToken: string): Promise<CreateMeetSpaceResult> {
    if (!accessToken) {
      throw new InternalServerErrorException(
        'Thiếu Access Token để gọi Google Meet API',
      );
    }

    const accessType = this.getValidatedAccessType();
    const url = 'https://meet.googleapis.com/v2/spaces';
    const requestBody = {
      config: {
        accessType,
      },
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000), // Timeout 10s
      });
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.code === 23) {
        this.logger.error('Google Meet API tạo phòng bị quá thời gian (Timeout 10s) [network_error]');
        throw new BadGatewayException(
          'Yêu cầu tạo phòng Google Meet bị quá thời gian chờ (Timeout sau 10s). Vui lòng thử lại sau.',
        );
      }
      this.logger.error('Lỗi mạng khi kết nối đến Google Meet API [network_error]');
      throw new BadGatewayException(
        'Không thể kết nối đến máy chủ Google Meet. Vui lòng thử lại sau.',
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      this.logger.error(
        `Google Meet API trả về định dạng không phải JSON (HTTP ${response.status}) [invalid_response]`,
      );
      throw new BadGatewayException(
        'Phản hồi từ máy chủ Google Meet không đúng định dạng',
      );
    }

    if (!response.ok || !data.meetingUri || !data.name) {
      this.logger.warn(`Google Meet API tạo phòng thất bại (HTTP ${response.status}) [provider_error]`);
      throw new BadGatewayException(
        'Không thể khởi tạo phòng Google Meet. Vui lòng thử lại sau.',
      );
    }

    // Xác minh chặt chẽ định dạng và hostname meetingUri
    const { meetingUri, meetingCode } = this.validateMeetingUri(data.meetingUri);

    // Tuyệt đối không trả về token hay thông tin nhạy cảm trong response
    return {
      name: data.name,
      meetingUri,
      meetingCode: data.meetingCode || meetingCode,
    };
  }
}
