import { IsEnum } from 'class-validator';
import { DocumentExportFormat } from '../../../generated/prisma/client.js';

export class ExportDocumentDto {
  @IsEnum(DocumentExportFormat, {
    message: 'Định dạng xuất phải là DOCX hoặc PDF',
  })
  format: DocumentExportFormat;
}
