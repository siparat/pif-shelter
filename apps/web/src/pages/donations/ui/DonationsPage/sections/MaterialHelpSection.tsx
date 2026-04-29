import { WISHLIST_ITEM_STATUS_LABEL, WishlistItemStatusEnum } from '@pif/shared';
import { AlertCircle, ArrowRight, Gift, MapPin, Package } from 'lucide-react';
import { JSX } from 'react';
import { useVolunteerInvite } from '../../../../../features/volunteer-invite';
import { usePublicWishlistQuery } from '../../../../../entities/wishlist';
import { cn } from '../../../../../shared/lib/cn';

const wishlistRowClassName: Record<WishlistItemStatusEnum, string> = {
	[WishlistItemStatusEnum.ALWAYS_NEEDED]: 'border border-(--color-border-soft) bg-(--color-surface-primary)',
	[WishlistItemStatusEnum.SOS]:
		'border-2 border-(--color-brand-accent)/80 bg-(--color-brand-accent)/12 ring-1 ring-(--color-brand-accent)/25',
	[WishlistItemStatusEnum.NOT_NEEDED]:
		'border border-dashed border-(--color-border-soft) bg-(--color-brand-brown-soft)/45'
};

const wishlistBadgeClassName: Record<WishlistItemStatusEnum, string> = {
	[WishlistItemStatusEnum.ALWAYS_NEEDED]: 'bg-(--color-brand-brown-soft) text-(--color-brand-brown)',
	[WishlistItemStatusEnum.SOS]: 'bg-(--color-brand-accent) text-white',
	[WishlistItemStatusEnum.NOT_NEEDED]: 'bg-(--color-surface-secondary) text-(--color-text-secondary)'
};

const MATERIAL_HELP_POST_HEADING = 'Отправка почтой';

const MATERIAL_HELP_POST_BODY =
	'Можно отправить посылку через Почту России на адрес: 283020, г. Донецк, ул. Бехтерева, 16Д. Обязательно укажите пометку: «для приюта ПИФ», чтобы мы точно получили вашу посылку.';

const MATERIAL_HELP_IN_PERSON_HEADING = 'Привезти лично';

const MATERIAL_HELP_IN_PERSON_BODY =
	'Доставить помощь можно по адресу: улица Бехтерева, 16Д, Донецк. Приём ведётся ежедневно с 10:00 до 18:00, вас встретят волонтёры и помогут разгрузить вещи.';

export const MaterialHelpSection = (): JSX.Element => {
	const { open: openVolunteerInvite } = useVolunteerInvite();
	const { data, isLoading, isError, refetch } = usePublicWishlistQuery();
	const categories = data?.categories ?? [];

	return (
		<div className="flex w-full min-w-0 max-w-full flex-col gap-8">
			<section
				className="flex flex-col gap-6 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) from-(--color-surface-primary) to-(--color-brand-accent-strong)/40 p-4 shadow-[0_12px_32px_rgba(79,61,56,0.1)] sm:flex-row sm:items-start sm:gap-8 sm:p-6 md:p-8"
				aria-labelledby="material-help-heading">
				<div className="flex flex-col gap-4 sm:flex-1 sm:flex-row sm:gap-4">
					<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--color-brand-brown)/90 text-(--color-text-on-dark) shadow-inner max-sm:mx-auto">
						<Gift className="h-7 w-7" strokeWidth={2} aria-hidden />
					</span>
					<div className="flex min-w-0 flex-col gap-2 text-center sm:text-left">
						<h2 id="material-help-heading" className="text-xl font-bold text-(--color-text-primary)">
							Помощь вещами
						</h2>
						<p className="leading-relaxed text-(--color-text-secondary)">
							Ниже — актуальный список того, что особенно нужно приюту. Также можно записаться волонтёром:
							прогулки, транспорт, мелкий ремонт — всё это ценно.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => openVolunteerInvite()}
					className="inline-flex h-12 items-center justify-center gap-2 self-center rounded-full bg-(--color-brand-brown) px-6 text-sm font-bold text-(--color-text-on-dark) transition-transform hover:scale-[1.02] active:scale-[0.98] sm:self-start">
					Как ещё помочь
					<ArrowRight className="h-4 w-4" aria-hidden />
				</button>
			</section>

			<section
				className="w-full min-w-0 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_12px_36px_rgba(79,61,56,0.1)] sm:p-6 md:p-8"
				aria-labelledby="wishlist-heading">
				<div className="mb-5">
					<h2 id="wishlist-heading" className="text-lg font-bold text-(--color-text-primary) sm:text-xl">
						Список нужд
					</h2>
					<p className="mt-1 text-sm text-(--color-text-secondary)">
						У каждой позиции указано, насколько актуальна потребность: постоянно, срочно или пока не
						требуется.
					</p>
				</div>

				{isError ? (
					<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-brand-brown-soft) px-4 py-8 text-center">
						<AlertCircle className="h-8 w-8 text-(--color-brand-accent)" aria-hidden />
						<p className="text-sm font-semibold text-(--color-text-primary)">Не удалось загрузить список</p>
						<button
							type="button"
							onClick={() => refetch()}
							className="rounded-full bg-(--color-brand-brown) px-5 py-2 text-xs font-bold text-(--color-text-on-dark)">
							Повторить
						</button>
					</div>
				) : (
					<div className="flex flex-col gap-6">
						{isLoading && categories.length === 0 ? (
							<ul className="flex flex-col gap-4" aria-busy>
								{Array.from({ length: 3 }).map((_, i) => (
									<li
										key={`wl-skel-${i}`}
										className="h-28 animate-pulse rounded-2xl border border-(--color-border-soft) bg-(--color-brand-brown-soft)/50"
									/>
								))}
							</ul>
						) : null}
						{!isLoading && categories.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-brand-brown-soft)/40 px-4 py-8 text-center text-sm text-(--color-text-secondary)">
								Пока нет открытых позиций. Загляните позже или свяжитесь с приютом через раздел
								«Помощь».
							</p>
						) : null}
						{categories.map((category) => (
							<div
								key={category.id}
								className="rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) p-4 sm:p-5">
								<h3 className="text-base font-bold text-(--color-text-primary)">{category.name}</h3>
								<ul className="mt-3 flex flex-col gap-2">
									{category.items.map((item) => (
										<li
											key={item.id}
											className={cn(
												'flex flex-col gap-2 rounded-xl px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
												wishlistRowClassName[item.status]
											)}>
											<span className="min-w-0 flex-1 text-sm font-medium text-(--color-text-primary)">
												{item.name}
											</span>
											<span
												className={cn(
													'shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-bold sm:self-center',
													wishlistBadgeClassName[item.status]
												)}>
												{WISHLIST_ITEM_STATUS_LABEL[item.status]}
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</section>

			<div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
				<section
					className="flex flex-col gap-3 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5 shadow-[0_8px_28px_rgba(79,61,56,0.08)] sm:p-6"
					aria-labelledby="material-post-heading">
					<div className="flex items-start gap-3">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-brown-soft) text-(--color-brand-brown)">
							<Package className="h-5 w-5" aria-hidden />
						</span>
						<div className="min-w-0">
							<h2 id="material-post-heading" className="text-base font-bold text-(--color-text-primary)">
								{MATERIAL_HELP_POST_HEADING}
							</h2>
							<p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
								{MATERIAL_HELP_POST_BODY}
							</p>
						</div>
					</div>
				</section>

				<section
					className="flex flex-col gap-3 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5 shadow-[0_8px_28px_rgba(79,61,56,0.08)] sm:p-6"
					aria-labelledby="material-in-person-heading">
					<div className="flex items-start gap-3">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-brown-soft) text-(--color-brand-brown)">
							<MapPin className="h-5 w-5" aria-hidden />
						</span>
						<div className="min-w-0">
							<h2
								id="material-in-person-heading"
								className="text-base font-bold text-(--color-text-primary)">
								{MATERIAL_HELP_IN_PERSON_HEADING}
							</h2>
							<p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
								{MATERIAL_HELP_IN_PERSON_BODY}
							</p>
						</div>
					</div>
				</section>
			</div>

			<div
				className="min-h-[min(55vw,22rem)] w-full min-w-0 shrink-0 rounded-3xl border overflow-hidden border-(--color-border-soft) bg-(--color-brand-brown-soft)/25 sm:min-h-72"
				aria-label="Карта проезда"
				role="region">
				<iframe
					src="https://yandex.ru/map-widget/v1/?um=constructor%3A1c8f4088e455be850e21e0d92056c33b8c9840aa6fbfff9445785eaa5bd28cc5&amp;source=constructor"
					width="100%"
					height="288"></iframe>
			</div>
		</div>
	);
};
