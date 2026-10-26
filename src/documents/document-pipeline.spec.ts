import { describe, it, expect } from 'vitest';
import { validateAndSanitizeTiptapJson } from './utils/tiptap-validator.js';
import { convertDocxBufferToTiptap } from './utils/docx-importer.js';
import { convertTiptapToDocx } from './utils/docx-generator.js';
import { convertTiptapToPdf } from './utils/pdf-generator.js';
import { BadRequestException } from '@nestjs/common';
import { Document, Packer, Paragraph, TextRun } from 'docx';

describe('Document Processing Pipeline - Import, Export & Sanitization', () => {
  describe('Tiptap JSON Validator & Sanitizer', () => {
    it('chấp nhận Tiptap JSON hợp lệ với heading, paragraph, marks và lists', () => {
      const validDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Tiêu đề bài học' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Đoạn văn có ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'chữ đậm' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Mục 1' }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validateAndSanitizeTiptapJson(validDoc);
      expect(result.type).toBe('doc');
      expect(result.content).toHaveLength(3);
    });

    it('từ chối tài liệu nếu type không phải là doc', () => {
      expect(() =>
        validateAndSanitizeTiptapJson({ type: 'paragraph', content: [] }),
      ).toThrow(BadRequestException);
    });

    it('từ chối node không nằm trong whitelist', () => {
      const invalidDoc = {
        type: 'doc',
        content: [
          {
            type: 'script',
            content: [{ type: 'text', text: 'alert(1)' }],
          },
        ],
      };
      expect(() => validateAndSanitizeTiptapJson(invalidDoc)).toThrow(
        BadRequestException,
      );
    });

    it('từ chối link chứa scheme javascript: hoặc data: nguy hiểm', () => {
      const xssDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Nhấp vào đây',
                marks: [
                  {
                    type: 'link',
                    attrs: { href: 'javascript:alert(document.cookie)' },
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(() => validateAndSanitizeTiptapJson(xssDoc)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('DOCX Import Pipeline (convertDocxBufferToTiptap)', () => {
    it('nhập buffer DOCX hợp lệ thành Tiptap JSON cấu trúc và loại bỏ mã HTML nguy hiểm', async () => {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Chuyên đề ôn tập Văn học Hiện đại Việt Nam',
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun('Tác giả Nam Cao và tác phẩm Chí Phèo.'),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      const res = await convertDocxBufferToTiptap(buffer);

      expect(res.tiptapJson.type).toBe('doc');
      expect(res.tiptapJson.content.length).toBeGreaterThan(0);
      expect(Array.isArray(res.warnings)).toBe(true);
    });

    it('từ chối file không phải chữ ký ZIP/DOCX', async () => {
      const fakeBuffer = Buffer.from('This is not a docx file');
      await expect(convertDocxBufferToTiptap(fakeBuffer)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('DOCX Export Pipeline (convertTiptapToDocx)', () => {
    it('chuyển đổi Tiptap JSON thành file Word DOCX nhị phân hợp lệ', async () => {
      const sampleDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Tài liệu ôn tập môn Văn 12' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'bold' }],
                text: 'Phần I: Đọc hiểu',
              },
            ],
          },
        ],
      };

      const res = await convertTiptapToDocx(sampleDoc, 'Tài liệu ôn tập');
      expect(res.buffer).toBeInstanceOf(Buffer);
      expect(res.buffer.length).toBeGreaterThan(1000);
      expect(res.mimeType).toContain('wordprocessingml.document');
    });
  });

  describe('PDF Export Pipeline (convertTiptapToPdf)', () => {
    it('chuyển đổi Tiptap JSON thành file PDF nhị phân hợp lệ chuẩn A4 và hỗ trợ tiếng Việt Unicode', async () => {
      const sampleDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [
              {
                type: 'text',
                text: 'Phân tích nhân vật Huấn Cao trong Chữ người tử tù',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Nguyễn Tuân là một định nghĩa về người nghệ sĩ tài hoa, uyên bác.',
              },
            ],
          },
        ],
      };

      const res = await convertTiptapToPdf(sampleDoc, 'Phân tích tác phẩm');
      expect(res.buffer).toBeInstanceOf(Buffer);
      expect(res.buffer.length).toBeGreaterThan(1000);
      expect(res.mimeType).toBe('application/pdf');
    });
  });
});
