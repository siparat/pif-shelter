import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useVolunteerInvite } from '../../../../features/volunteer-invite';
import { footerSocialLinks } from '../../../../shared/config/footer';
import { ROUTES } from '../../../../shared/config/routes';
import { AnimalsPreviewSection } from '../../../../widgets/animals-preview';
import { HelpCtaSection } from '../../../../widgets/help-cta';
import { UrgentCampaignsSection } from '../../../../widgets/urgent-campaigns';
import { AboutSection } from './About/AboutSection';
import { DonationsSections } from './Donations/DonationsSection';

const VkIcon = ({ size = 24 }: { size?: number }): JSX.Element => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
		<path d="M3.4 7.2c.1-.3.4-.5.7-.5H7c.3 0 .6.2.7.5 1 2.4 1.7 3.8 2.2 4.5.2.3.4.5.6.5.1 0 .2-.1.3-.2.1-.2.2-.5.2-.9V7.4c0-.4.3-.7.7-.7h2.7c.4 0 .7.3.7.7v3c0 .6.1 1 .3 1.2.1.1.1.1.2.1.2 0 .5-.2.9-.6.7-.8 1.4-2 2.1-3.7.1-.3.4-.5.7-.5h2.9c.5 0 .9.5.7 1-.5 1.4-1.5 3.1-3 5 .1.1.2.2.3.2 1 .9 2.1 2.1 3.2 3.8.3.5 0 1.1-.6 1.1h-3.2c-.2 0-.5-.1-.6-.3-.6-.8-1.1-1.4-1.6-1.9-.5-.5-.8-.7-1.1-.7-.1 0-.2 0-.3.1-.1.1-.1.3-.1.5v1.5c0 .4-.3.7-.7.7h-1.6c-1.7 0-3.4-.8-4.9-2.3C6.7 14.9 5 12.3 3.2 8.4c-.1-.4-.1-.8.2-1.2z" />
	</svg>
);

const HomePage = (): JSX.Element => {
	const { open: openVolunteerInvite } = useVolunteerInvite();

	return (
		<>
			<div className="relative flex-1 w-full min-h-screen overflow-hidden bg-[linear-gradient(107deg,rgba(130,120,112,1)_0%,rgba(74,57,52,1)_100%)]">
				<div className="absolute inset-0 mix-blend-overlay bg-[url('/transparent-grid.png')] bg-repeat opacity-20 animate-[grid-fade-in_3.3s_ease-out_infinite_alternate]" />
				<div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,1)_-71%,rgba(255,255,255,0)_50%)] z-30" />
				<div className="absolute right-0 top-[27%] h-[75%] opacity-0 animate-fade-in delay-500 pointer-events-none z-0">
					<img
						src="/dog-food.png"
						alt=""
						className="h-full object-contain object-right mix-blend-overlay animate-float opacity-8 saturate-50"
						aria-hidden="true"
					/>
				</div>
				<div className="absolute top-[15%] max-lg:top-[10%] left-0 w-full flex justify-center pointer-events-none select-none z-0 px-4 opacity-0 animate-fade-in delay-100">
					<h1
						className="font-['Montserrat_Alternates'] font-bold text-[160px] max-[1400px]:text-[120px] max-[1024px]:text-[90px] max-[768px]:text-[60px] max-[480px]:text-[40px] text-transparent bg-clip-text leading-[120%] tracking-[-0.05em] uppercase text-center"
						style={{ backgroundImage: 'linear-gradient(to bottom, #E3DACC, #7A6D68)' }}>
						Приют ПИФ
					</h1>

					<div className="absolute -bottom-[60px] max-lg:-bottom-10 w-full flex justify-center gap-100 text-[#E3DACC] text-4xl font-normal leading-tight tracking-[-1.20px] max-lg:gap-2 max-[768px]:flex-col max-[768px]:text-center max-[768px]:items-center max-[768px]:gap-0! max-[768px]:-bottom-full! max-[768px]:text-2xl max-[480px]:text-xl">
						<span>20 лет доброты и</span>
						<span>спасенных жизней</span>
					</div>
				</div>
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[75vh] max-lg:h-[70vh] flex justify-center items-end z-10 pointer-events-none opacity-0 animate-fade-in-up delay-200">
					<img
						src="/main-dog.png"
						alt="Собака приюта ПИФ"
						className="w-full h-full object-contain object-bottom drop-shadow-2xl"
					/>
				</div>
				<div className="relative z-40 mx-auto h-screen min-h-[800px] max-lg:min-h-0 px-6 max-lg:pb-7 md:px-12 xl:px-30 flex flex-col justify-end pb-24 max-[768px]:pb-16 max-[768px]:justify-end">
					<div className="flex justify-between items-end w-full max-[768px]:flex-col-reverse max-[768px]:items-center max-[768px]:gap-5">
						<div className="text-shadow-[0_1px_2px_var(--color-text-primary)] max-w-[512px] max-[768px]:text-center opacity-0 animate-fade-in-up delay-400">
							<div>
								<h2 className="text-(--color-bg-primary) text-[32px] max-[1024px]:text-[28px] max-[768px]:text-[24px] font-semibold tracking-[-1.20px] leading-tight mb-4">
									Приют для бездомных животных
								</h2>
								<p className="text-(--color-bg-primary) text-[22px] font-light max-[1024px]:text-[16px] tracking-normal leading-tight mb-8 pr-20 max-[768px]:text-center max-[768px]:p-0">
									С 2005 года мы спасаем, лечим и находим семьи для сотен собак и кошек. Сегодня у нас
									живут более 800 хвостиков, и каждый из них ждёт шанс на новую жизнь
								</p>
							</div>

							<div className="inline-flex items-center gap-0 h-[64px] max-[1024px]:h-[56px]">
								<button
									aria-label="Стать опекуном"
									title="Стать опекуном"
									onClick={openVolunteerInvite}
									className="inline-flex items-center bg-(--color-bg-primary) h-full hover:bg-white text-(--color-text-primary) font-bold text-[22px] max-[1024px]:text-[16px] px-8 max-[1024px]:px-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl">
									Стать опекуном
								</button>
								<Link
									aria-label="Пожертвовать приюту"
									title="Пожертвовать приюту"
									to={ROUTES.donations}
									className="flex items-center justify-center bg-(--color-bg-primary) hover:bg-white text-(--color-text-primary) max-[1024px]:text-[16px] h-full aspect-square rounded-full transition-all hover:scale-110 active:scale-95 shadow-xl">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 32 32"
										fill="none">
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M16 1.39883L16.6171 0.438828C16.433 0.320679 16.2188 0.257874 16 0.257874C15.7812 0.257874 15.567 0.320679 15.3829 0.438828L16 1.39883ZM16 1.39883L15.3829 0.438828H15.3783L15.3737 0.443399L15.3554 0.454828L15.3006 0.491399L15.1017 0.628542C14.116 1.34195 13.2102 2.15964 12.4 3.0674C10.9371 4.7154 9.36686 7.19311 9.36686 10.2583C9.36686 11.8697 10.1166 13.3691 11.376 14.4434C12.6286 15.5154 14.2926 16.0914 16 16.0914C17.7074 16.0914 19.3714 15.5154 20.624 14.4457C21.8834 13.3691 22.6354 11.8697 22.6354 10.2583C22.6354 7.19311 21.0606 4.7154 19.6 3.06969C18.7353 2.10182 17.762 1.2367 16.6994 0.491399L16.6446 0.457114L16.6263 0.443399L16.6217 0.438828H16.6171L16 1.39883ZM13.7143 31.744C13.7143 27.136 13.7143 22.8845 12.0023 19.1497C11.836 18.8071 11.5749 18.5194 11.25 18.3209C10.925 18.1223 10.5499 18.0212 10.1691 18.0297C9.59364 18.0303 9.04192 18.2593 8.63519 18.6665C8.22846 19.0736 8 19.6256 8 20.2011V22.9851C7.99973 23.1556 7.95118 23.3226 7.85997 23.4666C7.76876 23.6107 7.63863 23.726 7.48462 23.7992C7.33062 23.8723 7.15904 23.9004 6.98975 23.8801C6.82045 23.8598 6.66036 23.792 6.528 23.6845C6.11261 23.3461 5.77773 22.9195 5.54764 22.4356C5.31755 21.9517 5.19802 21.4226 5.19771 20.8868V12.6285C5.19771 11.9393 4.92391 11.2783 4.43653 10.7909C3.94915 10.3035 3.28812 10.0297 2.59886 10.0297C1.9096 10.0297 1.24857 10.3035 0.761188 10.7909C0.273807 11.2783 0 11.9393 0 12.6285L0 23.4263C0 24.6034 0.402286 25.7485 1.136 26.6697L5.19086 31.744H13.7143ZM19.9977 19.1497C18.2857 22.8845 18.2857 27.136 18.2857 31.744H26.8114L30.864 26.6697C31.5977 25.7485 32 24.6057 32 23.424V12.6308C32 11.9416 31.7262 11.2805 31.2388 10.7932C30.7514 10.3058 30.0904 10.032 29.4011 10.032C28.7119 10.032 28.0509 10.3058 27.5635 10.7932C27.0761 11.2805 26.8023 11.9416 26.8023 12.6308V20.8891C26.8023 21.9748 26.3131 23.0011 25.472 23.6868C25.3396 23.7943 25.1795 23.8621 25.0103 23.8824C24.841 23.9027 24.6694 23.8746 24.5154 23.8014C24.3614 23.7283 24.2312 23.613 24.14 23.4689C24.0488 23.3249 24.0003 23.1579 24 22.9874V20.1988C24 19.6229 23.7712 19.0706 23.364 18.6634C22.9568 18.2562 22.4045 18.0274 21.8286 18.0274C21.4482 18.0194 21.0736 18.1207 20.7491 18.3192C20.4246 18.5177 20.1638 18.8051 19.9977 19.1474"
											fill="#4F3D38"
										/>
									</svg>
								</Link>
							</div>
						</div>

						<div className="flex items-center gap-4 max-[768px]:justify-center opacity-0 animate-fade-in-up delay-500">
							{footerSocialLinks
								.filter(({ href }) => !!href)
								.map((item) => {
									return (
										<Link
											key={item.key}
											to={item.href}
											className="w-[64px] h-[64px] max-[1024px]:w-[56px] max-[1024px]:h-[56px] bg-(--color-bg-primary) hover:bg-white text-(--color-text-primary) rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
											aria-label="ВКонтакте">
											{item.key === 'telegram' && (
												<svg
													viewBox="0 0 24 24"
													className="h-4 w-4 fill-current sm:h-5 sm:w-5 md:h-6 md:w-6">
													<path d="M22 3.9c-.2-.2-.6-.3-1-.2L2.6 10.3c-.8.3-.8 1.3 0 1.6l4.8 1.5 1.8 5.7c.2.7 1.1.8 1.5.2l2.7-3.6 4.8 3.5c.6.4 1.4.1 1.5-.6l2.4-13.9c.1-.3 0-.6-.1-.8zm-12 10.8-.4 2.7-.9-3 8.6-6.8-7.3 7.1z" />
												</svg>
											)}
											{item.key === 'vk' && <VkIcon size={28} />}
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
										</Link>
									);
								})}
						</div>
					</div>
				</div>
			</div>
			<AboutSection />
			<UrgentCampaignsSection />
			<AnimalsPreviewSection />
			<DonationsSections />
			<HelpCtaSection />
		</>
	);
};

export default HomePage;
