type TruncateResult = {
	html: string;
	isTruncated: boolean;
};

const TAG_NAME_REGEX = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/;

function getTagName(tag: string): string | null {
	const match = TAG_NAME_REGEX.exec(tag);
	return match?.[1] ? match[1].toLowerCase() : null;
}

function tokenizeTextForLength(text: string): Array<{ value: string; length: number }> {
	const entityRegex = /&[a-zA-Z0-9#]+;/g;
	const tokens: Array<{ value: string; length: number }> = [];

	let lastIndex = 0;
	for (const match of text.matchAll(entityRegex)) {
		const start = match.index ?? 0;
		if (start > lastIndex) {
			const plain = text.slice(lastIndex, start);
			tokens.push({ value: plain, length: plain.length });
		}
		const entityValue = match[0];
		tokens.push({ value: entityValue, length: 1 });
		lastIndex = start + entityValue.length;
	}

	if (lastIndex < text.length) {
		const plain = text.slice(lastIndex);
		tokens.push({ value: plain, length: plain.length });
	}

	return tokens;
}

export function truncateHtmlPreservingTagsByTextLength(
	html: string,
	maxTextLength: number,
	suffix = '...'
): TruncateResult {
	if (maxTextLength <= 0) {
		return { html: suffix, isTruncated: html.length > 0 };
	}

	const stack: string[] = [];
	let textLength = 0;
	let result = '';
	let isTruncated = false;

	let i = 0;
	while (i < html.length && !isTruncated) {
		const char = html[i];

		if (char === '<') {
			const closeIndex = html.indexOf('>', i);
			if (closeIndex === -1) {
				result += html.slice(i);
				break;
			}

			const tag = html.slice(i, closeIndex + 1);
			result += tag;

			const tagName = getTagName(tag);
			const isClosing = tag.startsWith('</');
			const isSelfClosing = tag.endsWith('/>') || tagName == null;

			if (tagName != null) {
				if (isClosing) {
					if (stack.length > 0 && stack[stack.length - 1] === tagName) stack.pop();
				} else if (!isSelfClosing) {
					stack.push(tagName);
				}
			}

			i = closeIndex + 1;
			continue;
		}

		const nextTagIndex = html.indexOf('<', i);
		const endIndex = nextTagIndex === -1 ? html.length : nextTagIndex;
		const chunk = html.slice(i, endIndex);

		const tokens = tokenizeTextForLength(chunk);
		for (const token of tokens) {
			if (textLength + token.length <= maxTextLength) {
				result += token.value;
				textLength += token.length;
				continue;
			}

			isTruncated = true;
			const remaining = maxTextLength - textLength;

			if (remaining > 0) {
				if (token.length === 1 && token.value.startsWith('&')) {
					if (remaining >= 1) result += token.value;
				} else {
					result += token.value.slice(0, remaining);
				}
			}

			result += suffix;
			break;
		}

		i = endIndex;
	}

	if (isTruncated) {
		for (let idx = stack.length - 1; idx >= 0; idx -= 1) {
			const tagName = stack[idx];
			result += `</${tagName}>`;
		}
	}

	return { html: result, isTruncated };
}
