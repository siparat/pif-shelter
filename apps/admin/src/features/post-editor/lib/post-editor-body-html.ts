import type { Editor } from '@tiptap/core';
import { DOMSerializer } from '@tiptap/pm/model';

const SERIAL_BR = /<br\s*\/?>/gi;

const fragmentHtmlToStoredInline = (html: string): string => html.replace(SERIAL_BR, '\n');

const storedTextToParagraphInner = (text: string): string => {
	const normalized = text.replace(/\r\n/g, '\n').replace(SERIAL_BR, '\n');
	return normalized.replace(/\n/g, '<br>');
};

export const parseStoredPostHtmlToEditorHtml = (html: string): string => {
	const trimmed = (html ?? '').trim();
	if (!trimmed) {
		return '';
	}
	if (/<\/p\s*>/i.test(trimmed)) {
		return trimmed;
	}
	let result = '';
	let lastIndex = 0;
	const re = /<pre\b[\s\S]*?<\/pre>/gi;
	let match: RegExpExecArray | null;
	while ((match = re.exec(trimmed)) !== null) {
		const before = trimmed.slice(lastIndex, match.index);
		if (before) {
			result += `<p>${storedTextToParagraphInner(before)}</p>`;
		}
		result += match[0];
		lastIndex = match.index + match[0].length;
	}
	const tail = trimmed.slice(lastIndex);
	if (tail) {
		result += `<p>${storedTextToParagraphInner(tail)}</p>`;
	}
	return result;
};

export const serializePostEditorBodyHtml = (editor: Editor): string => {
	if (typeof document === 'undefined') {
		return editor.getHTML();
	}
	if (editor.isEmpty) {
		return '';
	}
	const { doc, schema } = editor.state;
	const serializer = DOMSerializer.fromSchema(schema);
	const chunks: string[] = [];

	doc.forEach((node) => {
		if (node.type.name === 'paragraph') {
			const container = document.createElement('div');
			container.appendChild(serializer.serializeFragment(node.content));
			const inner = container.innerHTML.trim();
			chunks.push(inner.length === 0 ? '' : fragmentHtmlToStoredInline(inner));
		} else if (node.type.name === 'codeBlock') {
			const container = document.createElement('div');
			container.appendChild(serializer.serializeNode(node));
			chunks.push(container.innerHTML.trim());
		}
	});

	const joined = chunks.join('\n');
	const textOnly = joined.replace(/<[^>]+>/g, '').trim();
	const hasPre = joined.includes('<pre');
	if (!textOnly && !hasPre) {
		return '';
	}
	return joined;
};
