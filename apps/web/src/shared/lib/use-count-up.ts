import { useEffect, useRef, useState } from 'react';

const parseNumber = (value: string): { prefix: string; num: number; suffix: string } => {
	const match = value.match(/^([^0-9]*)(\d[\d\s]*)(.*)$/);
	if (!match) return { prefix: '', num: 0, suffix: value };
	return {
		prefix: match[1],
		num: parseInt(match[2].replace(/\s/g, ''), 10),
		suffix: match[3]
	};
};

const formatNumber = (n: number): string => {
	return n.toLocaleString('ru-RU').replace(/,/g, ' ');
};

export const useCountUp = (value: string, active: boolean, duration = 1800): string => {
	const { prefix, num, suffix } = parseNumber(value);
	const [display, setDisplay] = useState(prefix + '0' + suffix);
	const frameRef = useRef<number>(0);

	useEffect(() => {
		if (!active || num === 0) {
			setDisplay(value);
			return;
		}

		const start = performance.now();

		const tick = (now: number): void => {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);

			const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
			const current = Math.round(eased * num);
			setDisplay(prefix + formatNumber(current) + suffix);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(tick);
			}
		};

		frameRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frameRef.current);
	}, [active]);

	return display;
};
