import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import { BadRequestException } from '@nestjs/common';
import { validateAndSanitizeTiptapJson } from './tiptap-validator.js';

export interface DocxImportResult {
  tiptapJson: Record<string, any>;
  warnings: string[];
}

/**
 * Xử lý nhập file DOCX thành Tiptap JSON:
 * 1. Chuyển đổi DOCX -> HTML qua mammoth
 * 2. Sanitize HTML triệt để bằng sanitize-html (xóa script, iframe, onload, external URL lạ)
 * 3. Chuyển HTML đã sanitize thành Tiptap JSON schema hợp lệ
 * 4. Validate và sanitize Tiptap JSON lần cuối
 */
export async function convertDocxBufferToTiptap(
  buffer: Buffer,
): Promise<DocxImportResult> {
  // 1. Kiểm tra signature ZIP (PK.. 0x50 0x4B)
  if (
    buffer.length < 4 ||
    buffer[0] !== 0x50 ||
    buffer[1] !== 0x4b ||
    buffer[2] !== 0x03 ||
    buffer[3] !== 0x04
  ) {
    throw new BadRequestException(
      'Tệp tải lên không phải là định dạng DOCX hợp lệ (lỗi chữ ký ZIP)',
    );
  }

  const warnings: string[] = [];

  let htmlResult: { value: string; messages: any[] };
  try {
    htmlResult = await mammoth.convertToHtml({ buffer });
  } catch (err) {
    throw new BadRequestException(
      `Không thể đọc cấu trúc tệp DOCX: ${(err as Error).message}`,
    );
  }

  if (htmlResult.messages && htmlResult.messages.length > 0) {
    for (const msg of htmlResult.messages) {
      if (msg.type === 'warning') {
        warnings.push(msg.message);
      }
    }
  }

  // 2. Sanitize HTML
  const cleanedHtml = sanitizeHtml(htmlResult.value, {
    allowedTags: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'blockquote',
      'ul',
      'ol',
      'li',
      'table',
      'tbody',
      'thead',
      'tr',
      'td',
      'th',
      'br',
      'hr',
      'a',
    ],
    allowedAttributes: {
      a: ['href', 'target'],
    },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',
  });

  // 3. Convert HTML -> Tiptap
  const rawTiptap = htmlToTiptap(cleanedHtml);

  // 4. Validate & Sanitize
  const validatedTiptap = validateAndSanitizeTiptapJson(rawTiptap);

  return {
    tiptapJson: validatedTiptap,
    warnings,
  };
}

function htmlToTiptap(html: string): Record<string, any> {
  const content: any[] = [];
  const blockRegex =
    /<(p|h1|h2|h3|h4|h5|h6|blockquote|ul|ol|table)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const innerHtml = match[2];

    if (tag === 'p') {
      const inline = parseInlineRuns(innerHtml);
      content.push({ type: 'paragraph', content: inline });
    } else if (tag.startsWith('h')) {
      const level = Math.min(6, Math.max(1, parseInt(tag.charAt(1), 10)));
      const inline = parseInlineRuns(innerHtml);
      content.push({ type: 'heading', attrs: { level }, content: inline });
    } else if (tag === 'blockquote') {
      const inline = parseInlineRuns(innerHtml);
      content.push({
        type: 'blockquote',
        content: [{ type: 'paragraph', content: inline }],
      });
    } else if (tag === 'ul' || tag === 'ol') {
      const listType = tag === 'ul' ? 'bulletList' : 'orderedList';
      const items: any[] = [];
      const liRegex = /<li>([\s\S]*?)<\/li>/gi;
      let liMatch: RegExpExecArray | null;
      while ((liMatch = liRegex.exec(innerHtml)) !== null) {
        items.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: parseInlineRuns(liMatch[1]),
            },
          ],
        });
      }
      if (items.length > 0) {
        content.push({ type: listType, content: items });
      }
    } else if (tag === 'table') {
      const rows: any[] = [];
      const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
      let trMatch: RegExpExecArray | null;
      while ((trMatch = trRegex.exec(innerHtml)) !== null) {
        const cells: any[] = [];
        const tdRegex = /<(td|th)>([\s\S]*?)<\/\1>/gi;
        let tdMatch: RegExpExecArray | null;
        while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
          const isHeader = tdMatch[1].toLowerCase() === 'th';
          cells.push({
            type: isHeader ? 'tableHeader' : 'tableCell',
            content: [
              {
                type: 'paragraph',
                content: parseInlineRuns(tdMatch[2]),
              },
            ],
          });
        }
        if (cells.length > 0) {
          rows.push({ type: 'tableRow', content: cells });
        }
      }
      if (rows.length > 0) {
        content.push({ type: 'table', content: rows });
      }
    }
  }

  // Fallback nếu không có thẻ block nào
  if (content.length === 0) {
    const fallbackText = html.replace(/<[^>]+>/g, '').trim();
    if (fallbackText.length > 0) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: fallbackText }],
      });
    } else {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      });
    }
  }

  return {
    type: 'doc',
    content,
  };
}

function parseInlineRuns(html: string): any[] {
  const inlineList: any[] = [];
  const tagOrTextRegex =
    /(<strong>|<b>|<\/strong>|<\/b>|<em>|<i>|<\/em>|<\/i>|<u>|<\/u>|<s>|<strike>|<\/s>|<\/strike>|<a\s+href="([^"]*)"[^>]*>|<\/a>|[^<]+)/gi;
  let match: RegExpExecArray | null;
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isStrike = false;
  let linkHref: string | null = null;

  while ((match = tagOrTextRegex.exec(html)) !== null) {
    const chunk = match[1];
    const lower = chunk.toLowerCase();

    if (lower === '<strong>' || lower === '<b>') {
      isBold = true;
    } else if (lower === '</strong>' || lower === '</b>') {
      isBold = false;
    } else if (lower === '<em>' || lower === '<i>') {
      isItalic = true;
    } else if (lower === '</em>' || lower === '</i>') {
      isItalic = false;
    } else if (lower === '<u>') {
      isUnderline = true;
    } else if (lower === '</u>') {
      isUnderline = false;
    } else if (lower === '<s>' || lower === '<strike>') {
      isStrike = true;
    } else if (lower === '</s>' || lower === '</strike>') {
      isStrike = false;
    } else if (lower.startsWith('<a ')) {
      linkHref = match[2] || null;
    } else if (lower === '</a>') {
      linkHref = null;
    } else if (!lower.startsWith('<')) {
      const marks: any[] = [];
      if (isBold) marks.push({ type: 'bold' });
      if (isItalic) marks.push({ type: 'italic' });
      if (isUnderline) marks.push({ type: 'underline' });
      if (isStrike) marks.push({ type: 'strike' });
      if (linkHref) marks.push({ type: 'link', attrs: { href: linkHref } });

      const text = chunk
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      if (text.length > 0) {
        inlineList.push({
          type: 'text',
          text,
          ...(marks.length > 0 ? { marks } : {}),
        });
      }
    }
  }

  return inlineList.length > 0 ? inlineList : [{ type: 'text', text: '' }];
}
