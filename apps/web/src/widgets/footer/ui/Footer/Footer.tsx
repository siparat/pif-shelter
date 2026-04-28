import { AtSign, Mail, MapPin, Phone, Send } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import LogoLight from '/public/logo-light.svg?react';
import {
	footerAuthor,
	footerBrand,
	footerContacts,
	footerContactsTitle,
	footerSocialLinks
} from '../../../../shared/config/footer';
import { ROUTES } from '../../../../shared/config/routes';

const contactIconByKey = {
	address: MapPin,
	phone: Phone,
	telegram: Send,
	handle: AtSign,
	email: Mail
};

export const Footer = (): JSX.Element => {
	return (
		<footer className="relative mt-16 overflow-hidden bg-[#201915] text-(--color-text-on-dark)">
			<div
				className="pointer-events-none absolute inset-0 opacity-20"
				style={{
					backgroundImage: "url('/paw-pattern.svg')",
					backgroundSize: '220px',
					opacity: '10%',
					backgroundRepeat: 'repeat'
				}}
			/>

			<div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-6 pb-5 pt-8 md:pb-6 md:pt-10">
				<div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:items-start md:text-left">
					<div className="flex max-w-[380px] flex-col items-center gap-6 md:items-start">
						<Link to={ROUTES.home} className="flex items-center gap-3">
							<LogoLight className="h-[52px] w-[44px] text-(--color-text-on-dark)" />
							<div className="leading-[1.05]">
								<p className="text-[16px] font-semibold">{footerBrand.title}</p>
								<p className="text-[12px] font-semibold uppercase opacity-85">{footerBrand.subtitle}</p>
							</div>
						</Link>

						<div className="flex items-center gap-4">
							{footerSocialLinks.map((item) => {
								return (
									<a
										key={item.key}
										href={item.href}
										className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-(--color-text-on-dark) shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-[2px] transition-all duration-150 hover:bg-white/8 md:h-10 md:w-10"
										aria-label={item.label}>
										{item.key === 'telegram' && (
											<svg
												viewBox="0 0 24 24"
												className="h-4 w-4 fill-current sm:h-5 sm:w-5 md:h-6 md:w-6">
												<path d="M22 3.9c-.2-.2-.6-.3-1-.2L2.6 10.3c-.8.3-.8 1.3 0 1.6l4.8 1.5 1.8 5.7c.2.7 1.1.8 1.5.2l2.7-3.6 4.8 3.5c.6.4 1.4.1 1.5-.6l2.4-13.9c.1-.3 0-.6-.1-.8zm-12 10.8-.4 2.7-.9-3 8.6-6.8-7.3 7.1z" />
											</svg>
										)}
										{item.key === 'vk' && (
											<svg
												viewBox="0 0 24 24"
												className="h-4 w-4 fill-current sm:h-5 sm:w-5 md:h-6 md:w-6">
												<path d="M3.4 7.2c.1-.3.4-.5.7-.5H7c.3 0 .6.2.7.5 1 2.4 1.7 3.8 2.2 4.5.2.3.4.5.6.5.1 0 .2-.1.3-.2.1-.2.2-.5.2-.9V7.4c0-.4.3-.7.7-.7h2.7c.4 0 .7.3.7.7v3c0 .6.1 1 .3 1.2.1.1.1.1.2.1.2 0 .5-.2.9-.6.7-.8 1.4-2 2.1-3.7.1-.3.4-.5.7-.5h2.9c.5 0 .9.5.7 1-.5 1.4-1.5 3.1-3 5 .1.1.2.2.3.2 1 .9 2.1 2.1 3.2 3.8.3.5 0 1.1-.6 1.1h-3.2c-.2 0-.5-.1-.6-.3-.6-.8-1.1-1.4-1.6-1.9-.5-.5-.8-.7-1.1-.7-.1 0-.2 0-.3.1-.1.1-.1.3-.1.5v1.5c0 .4-.3.7-.7.7h-1.6c-1.7 0-3.4-.8-4.9-2.3C6.7 14.9 5 12.3 3.2 8.4c-.1-.4-.1-.8.2-1.2z" />
											</svg>
										)}
										{item.key === 'instagram' && (
											<svg
												viewBox="0 0 24 24"
												className="h-4 w-4 fill-current sm:h-5 sm:w-5 md:h-6 md:w-6">
												<path
													fillRule="evenodd"
													d="M7.5 2C4.5 2 2 4.5 2 7.5v9C2 19.5 4.5 22 7.5 22h9c3 0 5.5-2.5 5.5-5.5v-9C22 4.5 19.5 2 16.5 2h-9zM12 7a5 5 0 100 10 5 5 0 000-10zm0 1.8a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4zm5.4-2.3a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
													clipRule="evenodd"
												/>
											</svg>
										)}
									</a>
								);
							})}
						</div>
					</div>

					<div className="w-full max-w-[330px]">
						<h3 className="mb-3 text-[16px] font-semibold">{footerContactsTitle}</h3>
						<ul className="space-y-2">
							{footerContacts.map((item) => {
								const Icon = contactIconByKey[item.key];
								return (
									<li key={item.key}>
										<a
											href={item.href}
											className="inline-flex items-start gap-2 text-[14px] font-semibold opacity-90 transition-opacity hover:opacity-100">
											<Icon size={14} className="mt-[3px] shrink-0" />
											<span>{item.label}</span>
										</a>
									</li>
								);
							})}
						</ul>
					</div>
				</div>

				<div className="flex w-full flex-col items-center justify-center gap-3 border-t border-white/12 pt-4 text-center md:flex-row">
					<div className="group relative inline-flex items-center gap-2">
						<p className="text-[12px] font-semibold opacity-75 uppercase">
							сайт не является официальным сайтом приюта, выполнен в качестве дипломной работы
						</p>
						<button
							type="button"
							aria-label="Важная информация о сайте"
							className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-[12px] font-bold leading-none text-(--color-text-on-dark) opacity-90">
							!
						</button>
						<div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[min(92vw,620px)] -translate-x-1/2 rounded-xl border border-white/20 bg-[#2a221d]/95 p-3 text-left text-[12px] font-semibold normal-case leading-5 text-(--color-text-on-dark) opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
							Сайт создан в рамках дипломной работы и является демонстрационным проектом. Сайт не
							официальный и не работает как реальный сервис: данные сгенерированы, реальные животные,
							контакты и другие сущности отсутствуют. Платежи также демонстрационные: используются моковые
							операции, которые автоматически помечаются как оплаченные.
						</div>
					</div>
					<a
						href={footerAuthor.href}
						target="_blank"
						rel="noreferrer"
						className="inline-flex h-7 items-center justify-center rounded-full border border-white/30 bg-white/10 px-3 text-[12px] font-semibold backdrop-blur-md transition-colors hover:bg-white/15">
						{footerAuthor.label}
					</a>
				</div>
			</div>
		</footer>
	);
};
