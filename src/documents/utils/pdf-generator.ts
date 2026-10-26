import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export interface PdfExportResult {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Render Tiptap JSON thành file PDF hỗ trợ chuẩn A4, lề, số trang và font tiếng Việt Unicode
 */
export async function convertTiptapToPdf(
  docNode: Record<string, any>,
  title: string,
): Promise<PdfExportResult> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
        info: {
          Title: title || 'Tài liệu học tập',
          Author: 'Lớp học Văn cô Nhị - VanbyNhi',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          mimeType: 'application/pdf',
        });
      });
      doc.on('error', (err) => reject(err));

      // Đăng ký font Roboto hỗ trợ tiếng Việt Unicode
      const fontRegular = resolveFontPath('Roboto-Regular.woff');
      const fontBold = resolveFontPath('Roboto-Bold.woff');
      const fontItalic = resolveFontPath('Roboto-Italic.woff');

      doc.font(fontRegular);

      // Tiêu đề đầu tài liệu
      if (title) {
        doc.font(fontBold).fontSize(18).fillColor('#0f172a').text(title, {
          align: 'center',
        });
        doc.moveDown(0.8);
      }

      const content = docNode?.content || [];
      for (const node of content) {
        renderNode(doc, node, fontRegular, fontBold, fontItalic);
      }

      // Đánh số trang & Header/Footer trên toàn bộ các trang đã buffer
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Header nhỏ
        doc
          .font(fontRegular)
          .fontSize(8)
          .fillColor('#94a3b8')
          .text('LỚP VĂN CÔ NHỊ — HỆ THỐNG TÀI LIỆU HỌC TẬP', 50, 30, {
            align: 'left',
          });
        doc
          .strokeColor('#e2e8f0')
          .lineWidth(0.5)
          .moveTo(50, 42)
          .lineTo(545, 42)
          .stroke();

        // Footer & Số trang
        const pageText = `Trang ${i + 1} / ${range.count}`;
        doc
          .strokeColor('#e2e8f0')
          .lineWidth(0.5)
          .moveTo(50, 792)
          .lineTo(545, 792)
          .stroke();
        doc
          .font(fontRegular)
          .fontSize(8)
          .fillColor('#94a3b8')
          .text(pageText, 50, 800, { align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function resolveFontPath(fontFileName: string): string {
  // Thử path src/assets hoặc dist/src/assets
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'assets', 'fonts', fontFileName),
    path.join(process.cwd(), 'dist', 'src', 'assets', 'fonts', fontFileName),
    path.join(process.cwd(), 'dist', 'assets', 'fonts', fontFileName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback sang Helvetica nếu không tìm thấy font file
  return 'Helvetica';
}

function renderNode(
  doc: PDFKit.PDFDocument,
  node: any,
  fontRegular: string,
  fontBold: string,
  fontItalic: string,
): void {
  if (!node || typeof node !== 'object') return;

  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1;
      const fontSize = level === 1 ? 16 : level === 2 ? 14 : 12;
      const text = (node.content || []).map((c: any) => c.text || '').join('');
      doc.moveDown(0.4);
      doc.font(fontBold).fontSize(fontSize).fillColor('#1e293b').text(text);
      doc.moveDown(0.2);
      break;
    }

    case 'paragraph': {
      doc.fontSize(11).fillColor('#334155');
      const parts = node.content || [];
      if (parts.length === 0) {
        doc.moveDown(0.3);
        return;
      }

      parts.forEach((part: any, idx: number) => {
        const isBold = part.marks?.some((m: any) => m.type === 'bold');
        const isItalic = part.marks?.some((m: any) => m.type === 'italic');
        const font = isBold ? fontBold : isItalic ? fontItalic : fontRegular;
        doc.font(font);
        const isLast = idx === parts.length - 1;
        doc.text(part.text || '', { continued: !isLast });
      });
      doc.moveDown(0.3);
      break;
    }

    case 'blockquote': {
      doc.moveDown(0.2);
      const text = (node.content || [])
        .map((p: any) => (p.content || []).map((c: any) => c.text || '').join(''))
        .join(' ');
      doc
        .font(fontItalic)
        .fontSize(10.5)
        .fillColor('#64748b')
        .text(`" ${text} "`, { indent: 20 });
      doc.moveDown(0.3);
      break;
    }

    case 'bulletList':
    case 'orderedList': {
      const isBullet = node.type === 'bulletList';
      (node.content || []).forEach((li: any, idx: number) => {
        const prefix = isBullet ? '• ' : `${idx + 1}. `;
        const text = (li.content || [])
          .map((p: any) =>
            (p.content || []).map((c: any) => c.text || '').join(''),
          )
          .join(' ');
        doc
          .font(fontRegular)
          .fontSize(10.5)
          .fillColor('#334155')
          .text(prefix + text, { indent: 15 });
      });
      doc.moveDown(0.3);
      break;
    }

    case 'table': {
      // Đơn giản hóa table render cho pdfkit
      doc.moveDown(0.3);
      for (const row of node.content || []) {
        const rowText = (row.content || [])
          .map((cell: any) =>
            (cell.content || [])
              .map((p: any) =>
                (p.content || []).map((c: any) => c.text || '').join(''),
              )
              .join(' '),
          )
          .join('  |  ');
        doc
          .font(fontRegular)
          .fontSize(10)
          .fillColor('#334155')
          .text(`| ${rowText} |`);
      }
      doc.moveDown(0.3);
      break;
    }

    default:
      break;
  }
}
