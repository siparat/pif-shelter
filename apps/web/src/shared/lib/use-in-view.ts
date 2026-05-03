import { RefObject, useEffect, useRef, useState } from 'react';

export const useInView = (
	options?: IntersectionObserverInit
): { ref: RefObject<HTMLElement | null>; inView: boolean } => {
	const ref = useRef<HTMLElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15, ...options }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return { ref, inView };
};
