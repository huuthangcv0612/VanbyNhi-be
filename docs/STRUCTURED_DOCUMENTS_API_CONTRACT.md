# API Contract & Hướng Dẫn Tích Hợp Frontend: Quản Lý Tài Liệu Cấu Trúc (Structured Documents)

Tài liệu này định nghĩa chính xác API contract, TypeScript interfaces, luồng hoạt động, mã lỗi và các giới hạn kỹ thuật của phân hệ **Tài Liệu Cấu Trúc (Structured Documents, Tiptap JSON, Autosave OCC, Import/Export DOCX/PDF)** tại backend VanbyNhi.

---

## 1. Nguyên Tắc Chung & Quy Ước
- **Base URL**: Không có tiền tố `/api`. Các endpoint gọi trực tiếp từ root (ví dụ: `/documents`, `/teacher/documents/upload-url`).
- **Xác thực**: Tất cả các routes đều yêu cầu header `Authorization: Bearer <accessToken>`.
- **Định dạng dữ liệu soạn thảo**: Tiptap JSON schema (`application/vnd.tiptap+json`). Khối gốc luôn có `type: "doc"`.
- **Cơ chế chống ghi đè (Optimistic Concurrency Control - OCC)**: FE phải gửi kèm `expectedRevision` khi lưu nội dung. Nếu xung đột, BE trả về `409 Conflict` cùng mã lỗi `REVISION_CONFLICT`.

---

## 2. Danh Sách Routes Chi Tiết

### 2.1. Lấy danh sách tài liệu
- **Endpoint**: `GET /documents`
- **Quyền**: `TEACHER`, `ADMIN`, `STUDENT`
- **Query Parameters**:
  ```ts
  interface QueryDocumentsDto {
    search?: string;
    categoryId?: string;
    unclassifiedOnly?: boolean;
    page?: number;  // Default: 1, Min: 1
    limit?: number; // Default: 10, Min: 1, Max: 100
  }
  ```
- **Hành vi theo Role**:
  - `TEACHER` / `ADMIN`: Trả về danh sách tài liệu trong thư viện cá nhân của user (kèm trường `usedInCount`).
  - `STUDENT`: Chỉ xem qua các endpoint tài liệu theo lớp (`/student/classes/:classId/materials`). Trả về `{ items: [], pagination: ... }`.
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "cuid_document_1",
        "title": "Giáo án Ngữ Văn 12 - Bài thơ Tây Tiến",
        "description": "Tài liệu phân tích chuyên sâu tác phẩm",
        "originalName": null,
        "storageKey": null,
        "mimeType": "application/vnd.tiptap+json",
        "sizeBytes": 15420,
        "checksum": null,
        "ownerId": "cuid_teacher_1",
        "categoryId": "cuid_cat_1",
        "type": "STRUCTURED_NOTE",
        "status": "PUBLISHED",
        "revision": 3,
        "content": { "type": "doc", "content": [...] },
        "deletedAt": null,
        "createdAt": "2026-10-26T08:00:00.000Z",
        "updatedAt": "2026-10-26T08:30:00.000Z",
        "category": { "id": "cuid_cat_1", "name": "Ngữ Văn 12" },
        "usedInCount": 2
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### 2.2. Tạo tài liệu cấu trúc mới
- **Endpoint**: `POST /documents`
- **Quyền**: `TEACHER`, `ADMIN`
- **Request Body**:
  ```ts
  interface CreateDocumentDto {
    title: string;                    // Bắt buộc, max 255 ký tự
    description?: string;             // Tùy chọn
    categoryId?: string | null;       // Tùy chọn, phải thuộc sở hữu của user
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; // Tùy chọn, default: DRAFT
    content?: Record<string, any>;    // Tùy chọn, Tiptap JSON doc
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "Tạo tài liệu thành công",
    "document": {
      "id": "cuid_document_new",
      "title": "Giáo án mới",
      "description": null,
      "originalName": null,
      "storageKey": null,
      "mimeType": "application/vnd.tiptap+json",
      "sizeBytes": 42,
      "ownerId": "cuid_teacher_1",
      "categoryId": null,
      "type": "STRUCTURED_NOTE",
      "status": "DRAFT",
      "revision": 1,
      "content": {
        "type": "doc",
        "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "" }] }]
      },
      "createdAt": "2026-10-26T09:00:00.000Z",
      "updatedAt": "2026-10-26T09:00:00.000Z"
    }
  }
  ```
- **Snapshot khởi tạo**: Hệ thống tự động tạo bản ghi `DocumentVersion` đầu tiên với `revision = 1` và `reason = "Khởi tạo tài liệu"`.

---

### 2.3. Lấy chi tiết tài liệu (Metadata + Nội dung)
- **Endpoint**: `GET /documents/:id`
- **Quyền**: `TEACHER`, `ADMIN`, `STUDENT`
- **Phân quyền truy cập**:
  - `ADMIN` & `Owner`: Luôn được phép xem.
  - `STUDENT`: Chỉ được xem nếu tài liệu được chia sẻ vào lớp học mà học sinh đang là thành viên `ACTIVE`, lớp đang hoạt động và nằm trong khoảng thời gian cho phép (`accessStartTime` / `accessEndTime`).
  - Người dùng không có quyền: Trả về `404 Not Found` (ngăn lộ sự tồn tại của tài liệu).
- **Response `200 OK`**: Trả về chi tiết `Document` kèm toàn bộ `content` Tiptap JSON.

---

### 2.4. Cập nhật Metadata tài liệu
- **Endpoint**: `PATCH /documents/:id`
- **Quyền**: `TEACHER`, `ADMIN` (phải là Owner hoặc ADMIN)
- **Request Body**:
  ```ts
  interface UpdateDocumentDto {
    title?: string;
    description?: string;
    categoryId?: string | null;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Cập nhật tài liệu thành công",
    "document": { ... }
  }
  ```

---

### 2.5. Autosave & Cập nhật nội dung (Optimistic Concurrency Control)
- **Endpoint**: `PUT /documents/:id/content`
- **Quyền**: `TEACHER`, `ADMIN` (phải là Owner hoặc ADMIN)
- **Request Body**:
  ```ts
  interface UpdateDocumentContentDto {
    expectedRevision: number;      // Bắt buộc, số nguyên >= 1
    content: Record<string, any>;  // Bắt buộc, Tiptap JSON schema (type: "doc")
    versionReason?: string;        // Tùy chọn, lý do lưu mốc phiên bản
  }
  ```
- **Hành vi xử lý**:
  - Thực hiện câu lệnh cập nhật nguyên tử có điều kiện: `WHERE id = :id AND revision = :expectedRevision`.
  - Nếu thành công: `revision` tăng lên 1 (`revision: { increment: 1 }`).
  - **Tạo snapshot version**: Tự động tạo snapshot `DocumentVersion` khi:
    - Có truyền `versionReason` (người dùng chủ động đặt mốc phiên bản).
    - HOẶC sau mỗi 5 revision (`newRevision % 5 === 0`).
- **Response `200 OK` (Thành công)**:
  ```json
  {
    "message": "Lưu nội dung tài liệu thành công",
    "revision": 4,
    "updatedAt": "2026-10-26T09:15:00.000Z"
  }
  ```
- **Response `409 Conflict` (Xung đột Revision)**:
  Xảy ra khi có 2 request đồng thời hoặc FE gửi `expectedRevision` cũ hơn revision hiện tại trong DB:
  ```json
  {
    "statusCode": 409,
    "error": "Conflict",
    "errorCode": "REVISION_CONFLICT",
    "message": "Xung đột phiên bản: Tài liệu đã được cập nhật bởi một phiên làm việc khác",
    "currentRevision": 4,
    "expectedRevision": 3
  }
  ```
  **Hướng dẫn xử lý cho FE khi nhận lỗi 409**:
  1. Hiển thị thông báo xung đột phiên bản cho người dùng (hoặc modal so sánh).
  2. Gọi `GET /documents/:id` để lấy nội dung mới nhất tại `currentRevision`.
  3. Cập nhật lại state của Editor với revision mới trước khi cho phép lưu tiếp.

---

### 2.6. Lịch sử phiên bản (Version History)
- **Endpoint**: `GET /documents/:id/versions`
- **Quyền**: `TEACHER`, `ADMIN`, `STUDENT` (chỉ người có quyền xem tài liệu)
- **Query Parameters**:
  ```ts
  interface QueryVersionsDto {
    page?: number;  // Default: 1
    limit?: number; // Default: 10, Max: 100
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "cuid_version_3",
        "revision": 3,
        "title": "Giáo án Tây Tiến",
        "reason": "Lưu mốc sửa đổi sau tiết giảng",
        "createdAt": "2026-10-26T08:30:00.000Z",
        "actor": {
          "id": "cuid_teacher_1",
          "fullName": "Nguyễn Thị Nhị",
          "role": "TEACHER"
        }
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### 2.7. Khôi phục phiên bản lịch sử (Restore Version)
- **Endpoint**: `POST /documents/:id/restore/:versionId`
- **Quyền**: `TEACHER`, `ADMIN` (phải là Owner hoặc ADMIN)
- **Hành vi**:
  - Không sửa/xóa các bản ghi `DocumentVersion` cũ.
  - Lấy `content` từ version snapshot được chỉ định.
  - Tạo một revision mới đơn điệu (`nextRevision = currentRevision + 1`).
  - Ghi nhận một snapshot mới vào `DocumentVersion` với `revision = nextRevision` và `reason = "Khôi phục từ phiên bản rev <oldRevision>"`.
- **Response `201 Created`**:
  ```json
  {
    "message": "Đã khôi phục thành công từ phiên bản revision 1",
    "revision": 5,
    "document": { ... }
  }
  ```

---

### 2.8. Luồng Nhập Tài Liệu DOCX (Import DOCX Flow)

Quy trình nhập DOCX tuân thủ chuẩn Presigned Upload an toàn:

```
[ Frontend ]               [ Backend API ]                  [ Cloudflare R2 ]
     |                            |                                 |
     | 1. POST /teacher/documents/upload-url                        |
     |--------------------------->|                                 |
     |   (title, originalName,    |                                 |
     |    mimeType, sizeBytes)    |-- Tạo Presigned PUT URL ------->|
     |                            |<--------------------------------|
     |<-- Trả về uploadUrl & -----|                                 |
     |    storageKey              |                                 |
     |                            |                                 |
     | 2. PUT tệp binary lên R2 ----------------------------------->|
     |    (Content-Type: docx)    |                                 |
     |------------------------------------------------------------->|
     |                                                              |
     | 3. POST /documents/import                                    |
     |    (storageKey, title)     |                                 |
     |--------------------------->|-- Tải file Buffer từ R2 ------->|
     |                            |<--------------------------------|
     |                            |-- Chuyển DOCX -> HTML -> Tiptap |
     |                            |-- Sanitize mã độc & XSS         |
     |                            |-- Lưu Document & Version 1      |
     |<-- Trả về document & ------|                                 |
     |    warnings                |                                 |
```

- **Bước 1**: Khởi tạo phiên tải lên:
  - `POST /teacher/documents/upload-url`
  - Body:
    ```json
    {
      "title": "Tài liệu chuyên đề",
      "originalName": "chuyen-de-van.docx",
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "sizeBytes": 2048500
    }
    ```
  - Response nhận `uploadUrl` và `storageKey`.
- **Bước 2**: Client tải trực tiếp file lên Cloudflare R2 qua `uploadUrl` (method: `PUT`).
- **Bước 3**: Gọi nhập tài liệu:
  - `POST /documents/import`
  - Body:
    ```ts
    interface ImportDocumentDto {
      storageKey: string;         // Bắt buộc, key nhận được từ bước 1
      title?: string;             // Tùy chọn, ghi đè tiêu đề
      categoryId?: string | null; // Tùy chọn
    }
    ```
  - Response `201 Created`:
    ```json
    {
      "message": "Nhập tài liệu từ DOCX thành công",
      "document": {
        "id": "cuid_doc_imported",
        "title": "Tài liệu chuyên đề",
        "revision": 1,
        "content": { "type": "doc", "content": [...] }
      },
      "warnings": [
        "Định dạng SmartArt không được hỗ trợ và đã được giản lược thành văn bản thuần"
      ]
    }
    ```

---

### 2.9. Luồng Xuất Tài Liệu DOCX / PDF (Export Flow)

- **Bước 1: Yêu cầu xuất tài liệu**:
  - `POST /documents/:id/export`
  - Body:
    ```ts
    interface ExportDocumentDto {
      format: "DOCX" | "PDF";
    }
    ```
  - Xử lý: Backend xử lý in-memory từ revision đã lưu trong DB (không nhận content tùy ý từ request client), upload kết quả lên R2 private và tạo `DocumentExportJob`. Nếu cùng một revision đã có file xuất trước đó, BE tái sử dụng ngay lập tức (Idempotent Cache).
  - Response `201 Created`:
    ```json
    {
      "jobId": "cuid_export_job_1",
      "status": "COMPLETED",
      "format": "PDF",
      "revision": 3,
      "downloadUrl": "https://r2.cloudflarestorage.com/vanbynhi-documents/exports/doc-1/rev-3-job-1.pdf?X-Amz-Signature=...",
      "expiresInSeconds": 300
    }
    ```
- **Bước 2: Polling trạng thái (nếu cần cho file lớn)**:
  - `GET /documents/:id/export/:exportId`
  - Response:
    ```json
    {
      "jobId": "cuid_export_job_1",
      "status": "COMPLETED",
      "format": "PDF",
      "revision": 3,
      "errorMessage": null,
      "downloadUrl": "https://...",
      "expiresInSeconds": 300,
      "createdAt": "2026-10-26T09:20:00.000Z"
    }
    ```
  - Các trạng thái job: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.

---

## 3. Bảng Mã Lỗi Có Cấu Trúc (Structured Errors)

| HTTP Status | Error Code | Ý nghĩa & Hướng xử lý |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Payload sai định dạng hoặc vượt quá kích thước (JSON > 5MB, DOCX > 25MB). |
| `400 Bad Request` | `INVALID_TIPTAP_SCHEMA` | Thẻ node/mark hoặc scheme liên kết không an toàn (`javascript:`). |
| `401 Unauthorized` | `UNAUTHORIZED` | Token JWT không được cung cấp, sai chữ ký hoặc đã hết hạn. |
| `403 Forbidden` | `FORBIDDEN` | Người dùng không phải Owner của tài liệu hoặc session upload. |
| `404 Not Found` | `NOT_FOUND` | Tài liệu không tồn tại hoặc người dùng không có quyền xem. |
| `409 Conflict` | `REVISION_CONFLICT` | Phiên bản `expectedRevision` không khớp revision hiện tại (Lost Update). |

---

## 4. TypeScript Interfaces Chuẩn Cho Frontend

```ts
export type DocumentType = 'STATIC_FILE' | 'STRUCTURED_NOTE';
export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DocumentExportFormat = 'DOCX' | 'PDF';
export type DocumentExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface DocumentEntity {
  id: string;
  title: string;
  description: string | null;
  originalName: string | null;
  storageKey: string | null;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  categoryId: string | null;
  type: DocumentType;
  status: DocumentStatus;
  revision: number;
  content: Record<string, any> | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  usedInCount?: number;
}

export interface DocumentVersionEntity {
  id: string;
  documentId: string;
  revision: number;
  title: string;
  reason: string | null;
  createdAt: string;
  actor: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface RevisionConflictError {
  statusCode: 409;
  error: 'Conflict';
  errorCode: 'REVISION_CONFLICT';
  message: string;
  currentRevision: number | null;
  expectedRevision: number;
}

export interface ExportResponse {
  jobId: string;
  status: DocumentExportStatus;
  format: DocumentExportFormat;
  revision: number;
  downloadUrl?: string | null;
  expiresInSeconds?: number | null;
  errorMessage?: string | null;
}
```
