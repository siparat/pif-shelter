import { Share2 } from 'lucide-react';
import { JSX, useMemo } from 'react';
import {
	getDonationShareSocialLinks,
	SOCIAL_SHARE_HELP_TEXT,
	type FooterSocialLink
} from '../../../../../shared/config/footer';

const socialInner = (key: FooterSocialLink['key']): JSX.Element => {
	if (key === 'telegram') {
		return (
			<svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
				<path d="M22 3.9c-.2-.2-.6-.3-1-.2L2.6 10.3c-.8.3-.8 1.3 0 1.6l4.8 1.5 1.8 5.7c.2.7 1.1.8 1.5.2l2.7-3.6 4.8 3.5c.6.4 1.4.1 1.5-.6l2.4-13.9c.1-.3 0-.6-.1-.8zm-12 10.8-.4 2.7-.9-3 8.6-6.8-7.3 7.1z" />
			</svg>
		);
	}
	if (key === 'vk') {
		return (
			<svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
				<path d="M3.4 7.2c.1-.3.4-.5.7-.5H7c.3 0 .6.2.7.5 1 2.4 1.7 3.8 2.2 4.5.2.3.4.5.6.5.1 0 .2-.1.3-.2.1-.2.2-.5.2-.9V7.4c0-.4.3-.7.7-.7h2.7c.4 0 .7.3.7.7v3c0 .6.1 1 .3 1.2.1.1.1.1.2.1.2 0 .5-.2.9-.6.7-.8 1.4-2 2.1-3.7.1-.3.4-.5.7-.5h2.9c.5 0 .9.5.7 1-.5 1.4-1.5 3.1-3 5 .1.1.2.2.3.2 1 .9 2.1 2.1 3.2 3.8.3.5 0 1.1-.6 1.1h-3.2c-.2 0-.5-.1-.6-.3-.6-.8-1.1-1.4-1.6-1.9-.5-.5-.8-.7-1.1-.7-.1 0-.2 0-.3.1-.1.1-.1.3-.1.5v1.5c0 .4-.3.7-.7.7h-1.6c-1.7 0-3.4-.8-4.9-2.3C6.7 14.9 5 12.3 3.2 8.4c-.1-.4-.1-.8.2-1.2z" />
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
			<path
				fillRule="evenodd"
				d="M7.5 2C4.5 2 2 4.5 2 7.5v9C2 19.5 4.5 22 7.5 22h9c3 0 5.5-2.5 5.5-5.5v-9C22 4.5 19.5 2 16.5 2h-9zM12 7a5 5 0 100 10 5 5 0 000-10zm0 1.8a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4zm5.4-2.3a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
				clipRule="evenodd"
			/>
		</svg>
	);
};

export const TrustAndShareSection = (): JSX.Element => {
	const shareLinks = useMemo(() => getDonationShareSocialLinks(), []);

	return (
		<section
			className="relative overflow-hidden rounded-3xl bg-(--color-brand-brown) px-4 py-7 text-(--color-text-on-dark) shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-6 sm:py-8 md:px-10 md:py-10"
			aria-labelledby="share-block-title">
			<div
				className="pointer-events-none absolute inset-0 opacity-15"
				style={{
					backgroundImage: "url('/paw-pattern.svg')",
					backgroundSize: '180px',
					backgroundRepeat: 'repeat'
				}}
			/>
			<div className="relative flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
				<div className="mx-auto max-w-3xl space-y-3 md:mx-0">
					<p className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-(--color-text-inverse-soft) md:justify-start">
						<Share2 className="h-4 w-4" aria-hidden />
						Расскажите о нас
					</p>
					<h2 id="share-block-title" className="text-2xl font-bold leading-tight md:text-3xl">
						Не готовы перевести деньги? Поделитесь страницей — это тоже сильная помощь.
					</h2>
					<p className="text-sm leading-relaxed text-(--color-text-inverse-soft)">{SOCIAL_SHARE_HELP_TEXT}</p>
				</div>
				<div className="flex flex-wrap justify-center gap-3 md:justify-end">
					{shareLinks.map((item) => (
						<a
							key={item.key}
							href={item.href}
							className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-(--color-text-on-dark) shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/15"
							aria-label={item.label}>
							{socialInner(item.key)}
						</a>
					))}
				</div>
			</div>
		</section>
	);
};
