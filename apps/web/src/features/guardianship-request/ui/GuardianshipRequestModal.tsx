import { HeartHandshake, X } from 'lucide-react';
import { JSX, useEffect, useRef } from 'react';
import { cn } from '../../../shared/lib/cn';
import { useGuardianshipRequest } from '../model/use-guardianship-request';

type GuardianshipRequestModalProps = {
	open: boolean;
	onClose: () => void;
	animalName: string;
	costOfGuardianship: number | null;
	form: ReturnType<typeof useGuardianshipRequest>['form'];
	mutation: ReturnType<typeof useGuardianshipRequest>['mutation'];
	step: ReturnType<typeof useGuardianshipRequest>['step'];
	paymentUrl: string | null;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	onAuthOpen: () => void;
};

export const GuardianshipRequestModal = ({
	open,
	onClose,
	animalName,
	costOfGuardianship,
	form,
	mutation,
	step,
	onSubmit,
	onAuthOpen
}: GuardianshipRequestModalProps): JSX.Element => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const node = dialogRef.current;
		if (!node) return;
		if (open) {
			if (!node.open) node.showModal();
			requestAnimationFrame(() => {
				closeButtonRef.current?.focus();
			});
		} else if (node.open) {
			node.close();
		}
	}, [open]);

	const {
		register,
		formState: { errors }
	} = form;

	const labelClass = 'block text-sm font-semibold text-(--color-text-primary) mb-1.5';
	const inputClass =
		'w-full rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-2.5 text-(--color-text-primary) outline-none focus:ring-2 focus:ring-(--color-brand-accent)/40';
	const errorClass = 'text-xs text-red-500 mt-1';

	return (
		<dialog
			ref={dialogRef}
			className={cn(
				'fixed inset-0 z-200 m-auto w-[calc(100vw-1.5rem)] max-w-lg max-h-[min(90dvh,44rem)] overflow-visible rounded-4xl border-0 bg-transparent p-0 shadow-none sm:w-full',
				'backdrop:bg-[rgba(79,61,56,0.48)] backdrop:backdrop-blur-[6px]'
			)}
			aria-labelledby="guardianship-request-title"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}>
			<div
				className="relative flex max-h-[min(90dvh,44rem)] flex-col overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) shadow-[0_28px_72px_rgba(79,61,56,0.22)]"
				onClick={(event) => event.stopPropagation()}>
				<div
					className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-(--color-brand-accent)/25 blur-3xl"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute -bottom-16 -left-20 h-44 w-44 rounded-full bg-(--color-brand-accent-strong)/80 blur-3xl"
					aria-hidden
				/>

				<div className="relative flex items-start justify-between gap-3 border-b border-(--color-border-soft) bg-(--color-surface-primary) px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
					<div className="flex min-w-0 flex-col gap-1">
						<span className="eyebrow inline-flex w-fit items-center gap-1.5 text-(--color-brand-accent)">
							<HeartHandshake className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
							Опекунство
						</span>
						<h2
							id="guardianship-request-title"
							className="text-xl font-bold tracking-tight text-(--color-text-primary) sm:text-2xl">
							Заботиться о {animalName}
						</h2>
					</div>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) text-(--color-text-primary) transition-colors hover:bg-(--color-brand-brown-soft)"
						aria-label="Закрыть">
						<X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
					</button>
				</div>

				<div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
					{step === 'auth-required' ? (
						<div className="flex flex-col items-center gap-4 py-8 text-center">
							<span className="text-5xl" aria-hidden>
								🔐
							</span>
							<div>
								<p className="text-xl font-bold text-(--color-text-primary)">Вы уже зарегистрированы</p>
								<p className="mt-2 max-w-xs text-sm leading-relaxed text-(--color-text-secondary)">
									Аккаунт с этим email или Telegram уже существует. Войдите, чтобы оформить
									опекунство.
								</p>
							</div>
							<button
								type="button"
								onClick={onAuthOpen}
								className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) font-bold text-white transition-[transform,filter] hover:brightness-105 active:scale-[0.98]">
								<HeartHandshake className="h-5 w-5" aria-hidden />
								Войти в аккаунт
							</button>
						</div>
					) : step === 'success' ? (
						<div className="flex flex-col items-center gap-4 py-8 text-center">
							<span className="text-5xl" aria-hidden>
								✅
							</span>
							<p className="text-xl font-bold text-(--color-text-primary)">Опекунство оформлено!</p>
							<p className="max-w-xs text-sm leading-relaxed text-(--color-text-secondary)">
								Вам отправлено письмо с ссылкой на Telegram-бота, перейдите по ссылке чтобы подтвердить
								свой аккаунт
							</p>
							<button
								type="button"
								onClick={onClose}
								className="h-10 w-full items-center justify-center rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) px-6 font-semibold text-(--color-text-primary) transition-colors hover:bg-(--color-surface-primary)">
								Закрыть
							</button>
						</div>
					) : (
						<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
							<div>
								<label htmlFor="gr-name" className={labelClass}>
									Ваше имя
								</label>
								<input
									id="gr-name"
									type="text"
									autoComplete="name"
									className={inputClass}
									{...register('name')}
								/>
								{errors.name && <p className={errorClass}>{errors.name.message}</p>}
							</div>

							<div>
								<label htmlFor="gr-email" className={labelClass}>
									Email
								</label>
								<input
									id="gr-email"
									type="email"
									autoComplete="email"
									className={inputClass}
									{...register('email')}
								/>
								{errors.email && <p className={errorClass}>{errors.email.message}</p>}
							</div>

							<div>
								<label htmlFor="gr-telegram" className={labelClass}>
									Telegram
								</label>
								<input
									id="gr-telegram"
									type="text"
									placeholder="@username"
									className={inputClass}
									{...register('telegramUsername')}
								/>
								{errors.telegramUsername && (
									<p className={errorClass}>{errors.telegramUsername.message}</p>
								)}
							</div>

							{costOfGuardianship !== null && costOfGuardianship > 0 && (
								<div className="rounded-3xl bg-linear-to-br from-(--color-brand-accent) to-[#ff6f3a] p-5 text-white shadow-[0_18px_36px_rgba(254,134,81,0.32)]">
									<div className="flex items-baseline justify-between gap-3">
										<span className="text-sm font-semibold opacity-90">Сумма опекунства</span>
										<HeartHandshake className="h-5 w-5 opacity-90" />
									</div>
									<p className="mt-2 text-3xl font-black md:text-4xl">
										{costOfGuardianship.toLocaleString('ru-RU')} ₽
										<span className="text-base font-semibold opacity-80"> / мес</span>
									</p>
								</div>
							)}

							<div className="rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) p-4">
								<p className="text-xs leading-relaxed text-(--color-text-secondary)">
									<a
										href="/guardianship"
										className="font-semibold text-(--color-brand-accent) transition-opacity hover:opacity-70">
										Узнайте больше об опекунстве
									</a>{' '}
									и как вы можете помочь животному.
								</p>
							</div>

							{mutation.isError && (
								<p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
									{mutation.error?.message || 'Ошибка при оформлении опекунства'}
								</p>
							)}

							<button
								type="submit"
								disabled={mutation.isPending}
								className="inline-flex h-12 w-full items-center justify-center rounded-full bg-(--color-brand-accent) font-bold text-white transition-[transform,filter] hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
								{mutation.isPending ? 'Обработка…' : 'Начать опекунство'}
							</button>
						</form>
					)}
				</div>
			</div>
		</dialog>
	);
};
