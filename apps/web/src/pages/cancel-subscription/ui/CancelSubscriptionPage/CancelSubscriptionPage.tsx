import { useMutation } from '@tanstack/react-query';
import { Ban, CheckCircle2, Home, Loader2, WalletCards } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { cancelDonationSubscriptionByToken } from '../../../../entities/donation';
import { ROUTES } from '../../../../shared/config/routes';

const CancelSubscriptionPage = (): JSX.Element => {
	const [searchParams] = useSearchParams();
	const token = useMemo(() => {
		const raw = searchParams.get('token');
		if (!raw) {
			return null;
		}
		const parsed = z.string().uuid().safeParse(raw);
		return parsed.success ? parsed.data : null;
	}, [searchParams]);

	const mutation = useMutation({
		mutationFn: async () => {
			const resolved = token;
			if (!resolved) {
				throw new Error('Нет токена отмены');
			}
			return cancelDonationSubscriptionByToken(resolved);
		}
	});

	const onConfirm = (): void => {
		if (!token) {
			return;
		}
		void mutation.mutateAsync();
	};

	if (!token) {
		return (
			<div className="mx-auto flex w-full max-w-lg flex-col gap-6">
				<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 shadow-[0_12px_36px_rgba(79,61,56,0.1)] sm:p-8">
					<div className="flex flex-col items-center gap-4 text-center">
						<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-brand-brown-soft) text-(--color-brand-brown)">
							<Ban className="h-7 w-7" aria-hidden />
						</span>
						<div className="space-y-2">
							<h1 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
								Ссылка недействительна
							</h1>
							<p className="text-sm text-(--color-text-secondary)">
								В адресе нет корректного токена отмены. Откройте ссылку из письма целиком или запросите
								новое письмо у приюта.
							</p>
						</div>
						<Link
							to={ROUTES.home}
							className="inline-flex h-11 items-center gap-2 rounded-full bg-(--color-brand-brown) px-6 text-sm font-bold text-(--color-text-on-dark)">
							<Home className="h-4 w-4" aria-hidden />
							На главную
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const isSuccess = mutation.isSuccess;
	const isError = mutation.isError;
	const isPending = mutation.isPending;

	return (
		<div className="mx-auto flex w-full max-w-lg flex-col gap-6">
			<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 shadow-[0_12px_36px_rgba(79,61,56,0.1)] sm:p-8">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
						<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-brand-brown-soft) text-(--color-brand-brown) max-sm:mx-auto">
							<Ban className="h-7 w-7" aria-hidden />
						</span>
						<div className="space-y-2">
							<p className="eyebrow max-sm:mx-auto">Донат-подписка</p>
							<h1 className="text-xl font-bold text-balance text-(--color-text-primary) sm:text-2xl">
								Отмена ежемесячного пожертвования
							</h1>
							<p className="text-sm leading-relaxed text-(--color-text-secondary)">
								После подтверждения автоматические списания по этой подписке прекратятся. Ранее
								переведённые суммы не возвращаются.
							</p>
						</div>
					</div>

					{isSuccess ? (
						<div
							className="flex flex-col items-center gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-brand-brown-soft) px-4 py-6 text-center sm:items-start sm:text-left"
							role="status">
							<CheckCircle2
								className="h-10 w-10 text-(--color-brand-accent) max-sm:mx-auto"
								aria-hidden
							/>
							<p className="font-semibold text-(--color-text-primary)">Подписка отменена</p>
							<p className="text-sm text-(--color-text-secondary)">
								Спасибо, что поддерживали приют. Вы всегда можете снова помочь в разделе пожертвований.
							</p>
							<div className="flex w-full flex-col gap-2 sm:flex-row">
								<Link
									to={ROUTES.donations}
									className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) text-sm font-bold text-white">
									<WalletCards className="h-4 w-4" aria-hidden />К пожертвованиям
								</Link>
								<Link
									to={ROUTES.home}
									className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) text-sm font-bold text-(--color-text-primary)">
									<Home className="h-4 w-4" aria-hidden />
									На главную
								</Link>
							</div>
						</div>
					) : null}

					{isError ? (
						<div className="rounded-2xl border border-(--color-border-primary) bg-(--color-brand-brown-soft) px-4 py-3 text-sm font-semibold text-(--color-text-primary)">
							{mutation.error instanceof Error ? mutation.error.message : 'Не удалось отменить подписку'}
						</div>
					) : null}

					{!isSuccess ? (
						<button
							type="button"
							disabled={isPending}
							onClick={onConfirm}
							className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-brown) text-sm font-bold text-(--color-text-on-dark) transition-opacity disabled:cursor-not-allowed disabled:opacity-60">
							{isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
							{isPending ? 'Отменяем…' : 'Подтвердить отмену подписки'}
						</button>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default CancelSubscriptionPage;
