import { Format } from 'telegraf';

export const buildTelegrafMessage = (
	parts: TemplateStringsArray,
	...args: (Format.FmtString | string)[]
): Format.FmtString => {
	const fmt: (string | Format.FmtString)[] = [];
	for (const part of parts) {
		fmt.push(part);
		fmt.push(args.shift() || '');
	}
	return Format.join(fmt);
};
