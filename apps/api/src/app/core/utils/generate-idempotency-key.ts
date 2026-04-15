import { createHash } from 'crypto';

export const generateIdempotencyKey = (
	version: `v${number}`,
	params: (string | number | null | undefined)[]
): string => {
	const payload = JSON.stringify({
		version,
		params: params.map((value) => (typeof value === 'string' ? value.trim() : value))
	});
	return createHash('sha256').update(payload).digest('hex');
};
