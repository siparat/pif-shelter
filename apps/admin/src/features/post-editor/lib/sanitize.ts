import { POST_ALLOWED_TAGS } from '@pif/shared';
import DOMPurify from 'dompurify';

export const sanitizeEditorHtml = (html: string): string =>
	DOMPurify.sanitize(html, {
		ALLOWED_TAGS: POST_ALLOWED_TAGS,
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true,
		USE_PROFILES: { html: true }
	});

export const isEditorHtmlEmpty = (html: string): boolean => {
	const withoutTags = html.replace(/<[^>]+>/g, '').trim();
	if (withoutTags.length > 0) {
		return false;
	}
	return !/<pre\b/i.test(html);
};
