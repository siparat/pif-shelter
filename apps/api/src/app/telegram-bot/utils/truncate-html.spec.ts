import { truncateHtmlPreservingTagsByTextLength } from './truncate-html';

describe('truncateHtmlPreservingTagsByTextLength', () => {
	it('closes tags when truncated inside <b>', () => {
		const input = '<b>Hello <i>World</i></b>';
		const { html } = truncateHtmlPreservingTagsByTextLength(input, 5);

		expect(html).toBe('<b>Hello...</b>');
	});

	it('closes nested tags when truncated inside <i>', () => {
		const input = '<b>Hello <i>World</i>!</b>';
		const { html } = truncateHtmlPreservingTagsByTextLength(input, 8);

		expect(html).toBe('<b>Hello <i>Wo...</i></b>');
	});
});
