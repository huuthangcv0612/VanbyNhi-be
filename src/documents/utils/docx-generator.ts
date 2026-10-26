import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';

export interface DocxExportResult {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Chuyển đổi Tiptap JSON thành file Word (.docx)
 */
export async function convertTiptapToDocx(
  docNode: Record<string, any>,
  title: string,
): Promise<DocxExportResult> {
  const children: any[] = [];

  // Thêm tiêu đề tài liệu nếu chưa có
  if (title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 32, // 16pt
            font: 'Times New Roman',
          }),
        ],
      }),
    );
  }

  const content = docNode?.content || [];
  for (const node of content) {
    const converted = processNode(node);
    if (Array.isArray(converted)) {
      children.push(...converted);
    } else if (converted) {
      children.push(converted);
    }
  }

  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '', font: 'Times New Roman' })],
      }),
    );
  }

  const doc = new DocxDocument({
    creator: 'VanbyNhi Education Platform',
    title: title || 'Tài liệu học tập',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return {
    buffer,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
}

function processNode(node: any): any {
  if (!node || typeof node !== 'object') return null;

  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1;
      const headingLevel =
        level === 1
          ? HeadingLevel.HEADING_1
          : level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;
      const runs = parseInlineRuns(node.content);
      return new Paragraph({
        heading: headingLevel,
        spacing: { before: 240, after: 120 },
        children: runs,
      });
    }

    case 'paragraph': {
      const runs = parseInlineRuns(node.content);
      return new Paragraph({
        spacing: { after: 160, line: 276 },
        children: runs,
      });
    }

    case 'blockquote': {
      const runs = (node.content || []).flatMap((c: any) =>
        parseInlineRuns(c.content),
      );
      return new Paragraph({
        indent: { left: 720 },
        spacing: { after: 160 },
        children: runs.map((r: any) => {
          return new TextRun({
            text: r.text || '',
            italics: true,
            font: 'Times New Roman',
          });
        }),
      });
    }

    case 'bulletList': {
      const items: any[] = [];
      for (const item of node.content || []) {
        for (const sub of item.content || []) {
          const runs = parseInlineRuns(sub.content);
          items.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 80 },
              children: runs,
            }),
          );
        }
      }
      return items;
    }

    case 'orderedList': {
      const items: any[] = [];
      let idx = 1;
      for (const item of node.content || []) {
        for (const sub of item.content || []) {
          const runs = parseInlineRuns(sub.content);
          items.push(
            new Paragraph({
              bullet: { level: 0 }, // docx numbered fallback
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: `${idx++}. `,
                  bold: true,
                  font: 'Times New Roman',
                }),
                ...runs,
              ],
            }),
          );
        }
      }
      return items;
    }

    case 'table': {
      const rows: TableRow[] = [];
      for (const rowNode of node.content || []) {
        const cells: TableCell[] = [];
        for (const cellNode of rowNode.content || []) {
          const cellParagraphs: Paragraph[] = [];
          for (const p of cellNode.content || []) {
            cellParagraphs.push(
              new Paragraph({
                children: parseInlineRuns(p.content),
              }),
            );
          }
          if (cellParagraphs.length === 0) {
            cellParagraphs.push(new Paragraph({ children: [] }));
          }

          cells.push(
            new TableCell({
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              },
              children: cellParagraphs,
            }),
          );
        }
        rows.push(new TableRow({ children: cells }));
      }

      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows,
      });
    }

    default:
      return null;
  }
}

function parseInlineRuns(content: any[]): TextRun[] {
  if (!Array.isArray(content) || content.length === 0) {
    return [new TextRun({ text: '', font: 'Times New Roman' })];
  }

  return content.map((item) => {
    const text = item.text || '';
    let bold = false;
    let italics = false;
    let underline = false;

    if (Array.isArray(item.marks)) {
      bold = item.marks.some((m: any) => m.type === 'bold');
      italics = item.marks.some((m: any) => m.type === 'italic');
      underline = item.marks.some((m: any) => m.type === 'underline');
    }

    return new TextRun({
      text,
      bold,
      italics,
      underline: underline ? {} : undefined,
      font: 'Times New Roman',
    });
  });
}
