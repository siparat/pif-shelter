import { Calendar, X } from 'lucide-react';
import { JSX, useEffect, useRef } from 'react';
import { cn } from '../../../shared/lib/cn';
import type { useMeetingRequest } from '../model/use-meeting-request';

type MeetingRequestModalProps = {
	open: boolean;
	onClose: () => void;
	animalName: string;
	form: ReturnType<typeof useMeetingRequest>['form'];
	mutation: ReturnType<typeof useMeetingRequest>['mutation'];
	step: ReturnType<typeof useMeetingRequest>['step'];
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const todayString = (): string => new Date().toISOString().split('T')[0];

export const MeetingRequestModal = ({
	open,
	onClose,
	animalName,
	form,
	mutation,
	step,
	onSubmit
}: MeetingRequestModalProps): JSX.Element => {
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
			aria-labelledby="meeting-request-title"
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
							<Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
							Запись на встречу
						</span>
						<h2
							id="meeting-request-title"
							className="text-xl font-bold tracking-tight text-(--color-text-primary) sm:text-2xl">
							Познакомиться с {animalName}
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
					{step === 'success' ? (
						<div className="flex flex-col items-center gap-4 py-8 text-center">
							<span className="text-5xl" aria-hidden>
								✅
							</span>
							<p className="text-xl font-bold text-(--color-text-primary)">Заявка отправлена!</p>
							<p className="max-w-xs text-sm leading-relaxed text-(--color-text-secondary)">
								Куратор свяжется с вами по телефону для подтверждения времени.
							</p>
							<button
								type="button"
								onClick={onClose}
								className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-(--color-brand-accent) font-bold text-white transition-[transform,filter] hover:brightness-105 active:scale-[0.98]">
								Закрыть
							</button>
						</div>
					) : (
						<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
							<div>
								<label htmlFor="mr-name" className={labelClass}>
									Ваше имя
								</label>
								<input
									id="mr-name"
									type="text"
									autoComplete="name"
									className={inputClass}
									{...register('name')}
								/>
								{errors.name && <p className={errorClass}>{errors.name.message}</p>}
							</div>

							<div>
								<label htmlFor="mr-phone" className={labelClass}>
									Телефон
								</label>
								<input
									id="mr-phone"
									type="tel"
									autoComplete="tel"
									placeholder="+7 (999) 999-99-99"
									className={inputClass}
									{...register('phone')}
								/>
								{errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
							</div>

							<div>
								<label htmlFor="mr-email" className={labelClass}>
									Email (необязательно)
								</label>
								<input
									id="mr-email"
									type="email"
									autoComplete="email"
									className={inputClass}
									{...register('email')}
								/>
								{errors.email && <p className={errorClass}>{errors.email.message}</p>}
							</div>

							<div>
								<p className={labelClass}>Желаемая дата и время встречи</p>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<input
											id="mr-date"
											type="date"
											min={todayString()}
											className={inputClass}
											{...register('meetingDate')}
										/>
									</div>
									<div>
										<input
											id="mr-time"
											type="time"
											className={inputClass}
											{...register('meetingTime')}
										/>
									</div>
								</div>
								{(errors.meetingDate || errors.meetingTime) && (
									<p className={errorClass}>
										{errors.meetingDate?.message || errors.meetingTime?.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="mr-comment" className={labelClass}>
									Комментарий (необязательно)
								</label>
								<textarea
									id="mr-comment"
									rows={3}
									maxLength={1000}
									className={cn(inputClass, 'resize-none')}
									{...register('comment')}
								/>
								{errors.comment && <p className={errorClass}>{errors.comment.message}</p>}
							</div>

							{mutation.isError && (
								<p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
									{mutation.error?.message || 'Ошибка при отправке заявки'}
								</p>
							)}

							<button
								type="submit"
								disabled={mutation.isPending}
								className="inline-flex h-12 w-full items-center justify-center rounded-full bg-(--color-brand-accent) font-bold text-white transition-[transform,filter] hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
								{mutation.isPending ? 'Отправка…' : 'Записаться на встречу'}
							</button>
						</form>
					)}
				</div>
			</div>
		</dialog>
	);
};
