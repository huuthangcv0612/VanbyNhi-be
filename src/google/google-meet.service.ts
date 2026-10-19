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

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);

  constructor(private readonly configService: ConfigService) {}

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

    const accessType =
      this.configService.get<string>('GOOGLE_MEET_ACCESS_TYPE') || 'TRUSTED';

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
        this.logger.error('Google Meet API tạo phòng bị quá thời gian (Timeout 10s)');
        throw new BadGatewayException(
          'Yêu cầu tạo phòng Google Meet bị quá thời gian chờ (Timeout sau 10s). Vui lòng thử lại sau.',
        );
      }
      this.logger.error(`Lỗi mạng khi gọi Google Meet API: ${err.message}`);
      throw new BadGatewayException(
        `Không thể kết nối đến máy chủ Google Meet: ${err.message}`,
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      this.logger.error(
        `Google Meet API trả về định dạng không phải JSON (HTTP ${response.status})`,
      );
      throw new BadGatewayException(
        `Google Meet API trả về lỗi không xác định (HTTP ${response.status})`,
      );
    }

    if (!response.ok || !data.meetingUri || !data.name) {
      const errorMsg =
        data?.error?.message ||
        data?.message ||
        `Google Meet API trả về mã lỗi HTTP ${response.status}`;
      this.logger.warn(`Google Meet API thất bại: ${errorMsg}`);
      throw new BadGatewayException(
        `Không thể khởi tạo phòng Google Meet: ${errorMsg}`,
      );
    }

    // Xác minh định dạng meetingUri
    const meetingUri = data.meetingUri.trim();
    if (!meetingUri.startsWith('https://meet.google.com/')) {
      this.logger.error(
        `Google Meet API trả về meetingUri không đúng chuẩn: ${meetingUri}`,
      );
      throw new BadGatewayException(
        'meetingUri do Google Meet API trả về không hợp lệ',
      );
    }

    return {
      name: data.name,
      meetingUri,
      meetingCode: data.meetingCode || meetingUri.replace('https://meet.google.com/', ''),
    };
  }
}
