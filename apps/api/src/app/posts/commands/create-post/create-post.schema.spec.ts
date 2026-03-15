import { createPostRequestSchema } from '@pif/contracts';
import { PostMediaTypeEnum, PostVisibilityEnum } from '@pif/shared';

const validPayload = {
	animalId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
	title: 'Заголовок',
	body: 'Текст',
	visibility: PostVisibilityEnum.PUBLIC,
	media: [{ storageKey: 'posts/img.webp', type: PostMediaTypeEnum.IMAGE, order: 0 }]
};

describe('createPostRequestSchema (sanitization)', () => {
	it('removes script tags from body', () => {
		const result = createPostRequestSchema.parse({
			...validPayload,
			body: 'Hello <script>alert("xss")</script> world'
		});
		expect(result.body).not.toContain('<script>');
		expect(result.body).not.toContain('alert');
		expect(result.body).toBe('Hello  world');
	});

	it('removes event handlers (onerror, onclick)', () => {
		const result = createPostRequestSchema.parse({
			...validPayload,
			body: '<img src=x onerror="alert(1)">'
		});
		expect(result.body).not.toContain('onerror');
		expect(result.body).not.toContain('onclick');
	});

	it('removes javascript: in href', () => {
		const result = createPostRequestSchema.parse({
			...validPayload,
			body: '<a href="javascript:alert(1)">link</a>'
		});
		expect(result.body).not.toContain('javascript:');
	});

	it('keeps allowed tags (b, i, u, s, code, pre)', () => {
		const result = createPostRequestSchema.parse({
			...validPayload,
			body: '<b>bold</b> <i>italic</i> <u>underline</u> <s>strike</s> <code>code</code> <pre>pre</pre>'
		});
		expect(result.body).toContain('<b>bold</b>');
		expect(result.body).toContain('<i>italic</i>');
		expect(result.body).toContain('<u>underline</u>');
		expect(result.body).toContain('<s>strike</s>');
		expect(result.body).toContain('<code>code</code>');
		expect(result.body).toContain('<pre>pre</pre>');
	});

	it('strips disallowed tags but keeps their text', () => {
		const result = createPostRequestSchema.parse({
			...validPayload,
			body: '<div>div</div><span>span</span><p>p</p>'
		});
		expect(result.body).not.toContain('<div>');
		expect(result.body).not.toContain('<span>');
		expect(result.body).not.toContain('<p>');
		expect(result.body).toContain('div');
		expect(result.body).toContain('span');
		expect(result.body).toContain('p');
	});
});
