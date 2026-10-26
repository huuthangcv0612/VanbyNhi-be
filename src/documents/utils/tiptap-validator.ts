import { BadRequestException } from '@nestjs/common';

export const MAX_TIPTAP_JSON_BYTES = 5 * 1024 * 1024; // 5MB max JSON
export const MAX_DOCX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB max DOCX

const ALLOWED_NODE_TYPES = new Set([
  'doc',
  'paragraph',
  'heading',
  'text',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'image',
]);

const ALLOWED_MARK_TYPES = new Set([
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'code',
  'highlight',
  'textStyle',
]);

/**
 * Validate cấu trúc Tiptap JSON schema nghiêm ngặt:
 * - Phải có type == 'doc'
 * - Chỉ chấp nhận các node/mark được whitelist
 * - Ngăn chặn XSS, javascript: URL trong links hoặc data URL độc hại
 * - Giới hạn kích thước payload
 */
export function validateAndSanitizeTiptapJson(
  content: any,
): Record<string, any> {
  if (!content || typeof content !== 'object') {
    throw new BadRequestException('Nội dung tài liệu phải là đối tượng JSON');
  }

  const jsonStr = JSON.stringify(content);
  if (Buffer.byteLength(jsonStr, 'utf8') > MAX_TIPTAP_JSON_BYTES) {
    throw new BadRequestException(
      `Dung lượng nội dung JSON vượt quá giới hạn tối đa (${MAX_TIPTAP_JSON_BYTES / (1024 * 1024)}MB)`,
    );
  }

  if (content.type !== 'doc') {
    throw new BadRequestException(
      "Gốc của tài liệu Tiptap JSON phải có type là 'doc'",
    );
  }

  validateNode(content, 0);

  return content;
}

function validateNode(node: any, depth: number): void {
  if (depth > 50) {
    throw new BadRequestException(
      'Cấu trúc tài liệu lồng nhau quá sâu (vượt quá 50 cấp)',
    );
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  const type = node.type;
  if (typeof type !== 'string' || !ALLOWED_NODE_TYPES.has(type)) {
    throw new BadRequestException(
      `Loại thẻ nội dung không được hỗ trợ: '${type}'`,
    );
  }

  // Validate attrs & links
  if (node.attrs && typeof node.attrs === 'object') {
    if (type === 'heading') {
      const level = node.attrs.level;
      if (typeof level !== 'number' || level < 1 || level > 6) {
        node.attrs.level = 1;
      }
    }

    if (type === 'image') {
      const src = node.attrs.src;
      if (typeof src === 'string') {
        if (src.startsWith('javascript:') || src.startsWith('vbscript:')) {
          throw new BadRequestException('URL hình ảnh không an toàn');
        }
      }
    }
  }

  // Validate marks
  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (!mark || typeof mark !== 'object') continue;
      const markType = mark.type;
      if (!ALLOWED_MARK_TYPES.has(markType)) {
        throw new BadRequestException(
          `Loại định dạng chữ không được hỗ trợ: '${markType}'`,
        );
      }

      if (markType === 'link' && mark.attrs?.href) {
        const href = String(mark.attrs.href).trim().toLowerCase();
        if (
          href.startsWith('javascript:') ||
          href.startsWith('vbscript:') ||
          href.startsWith('data:')
        ) {
          throw new BadRequestException('Đường dẫn liên kết không an toàn');
        }
      }
    }
  }

  // Đệ quy validate các node con
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      validateNode(child, depth + 1);
    }
  }
}
