import { Heart, Sparkles, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { JSX, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { campaignQueryKeys, Campaign } from '../../../entities/campaign';
import {
	confirmDonationOneTimeViaPaymentWebhook,
	donationQueryKeys,
	parseDonationAmountKopecks,
	useCreateOneTimeDonationMutation
} from '../../../entities/donation';

type CampaignDonationModalProps = {
	open: boolean;
	campaign: Campaign | null;
	amountRub: number;
	onAmountChange: (value: number) => void;
	onClose: () => void;
};

const PRESETS = [300, 700, 1500, 3000];

export const CampaignDonationModal = ({
	open,
	campaign,
	amountRub,
	onAmountChange,
	onClose
}: CampaignDonationModalProps): JSX.Element => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [displayName, setDisplayName] = useState('');
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [amountError, setAmountError] = useState<string | null>(null);
	const [nameError, setNameError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const queryClient = useQueryClient();
	const oneTimeMutation = useCreateOneTimeDonationMutation();
	const isBusy = isSubmitting || oneTimeMutation.isPending;

	useEffect(() => {
		const node = dialogRef.current;
		if (!node) {
			return;
		}
		if (open) {
			if (!node.open) {
				node.showModal();
			}
		} else if (node.open) {
			node.close();
		}
	}, [open]);

	const submitDonation = async (): Promise<void> => {
		setAmountError(null);
		setNameError(null);
		setSubmitError(null);

		const amountKopecks = Math.round(amountRub * 100);
		const parsedAmount = parseDonationAmountKopecks(amountKopecks);
		if (!parsedAmount.success) {
			setAmountError('Проверьте сумму пожертвования');
			toast.error('Проверьте сумму пожертвования');
			return;
		}

		if (!isAnonymous && displayName.trim() === '') {
			setNameError('Укажите имя или включите анонимность');
			toast.error('Укажите имя или включите анонимность');
			return;
		}

		setIsSubmitting(true);
		try {
			const created = await oneTimeMutation.mutateAsync({
				displayName: isAnonymous ? '' : displayName.trim(),
				hidePublicName: isAnonymous,
				amount: amountKopecks,
				...(campaign ? { campaignId: campaign.id } : {})
			});
			await confirmDonationOneTimeViaPaymentWebhook({
				transactionId: created.transactionId,
				amountKopecks
			});
			if (campaign) {
				queryClient.setQueryData<Campaign[]>(campaignQueryKeys.list(), (current) =>
					(current ?? []).map((item) =>
						item.id === campaign.id
							? {
									...item,
									collectedAmount: (item.collectedAmount ?? 0) + amountKopecks
								}
							: item
					)
				);
			}
			void queryClient.invalidateQueries({ queryKey: donationQueryKeys.root });
			toast.success('Спасибо! Пожертвование учтено — запись скоро появится в списке.');
			onClose();
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Не удалось завершить пожертвование';
			setSubmitError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<dialog
			ref={dialogRef}
			className="fixed inset-0 z-200 m-auto w-[calc(100vw-1.5rem)] max-w-xl rounded-4xl border-0 bg-transparent p-0 shadow-none backdrop:bg-[rgba(79,61,56,0.48)] backdrop:backdrop-blur-[6px]"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}>
			<div
				className="relative overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5 shadow-[0_28px_72px_rgba(79,61,56,0.22)] sm:p-6"
				onClick={(event) => event.stopPropagation()}>
				<div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-(--color-brand-accent)/20 blur-3xl" />
				<div className="relative flex items-start justify-between gap-3">
					<div>
						<p className="eyebrow inline-flex items-center gap-1.5 text-(--color-brand-accent)">
							<Sparkles className="h-3.5 w-3.5" />
							Поддержка сбора
						</p>
						<h2 className="mt-2 text-xl font-bold text-(--color-text-primary)">
							{campaign ? campaign.title : 'Пожертвование'}
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) text-(--color-text-primary) hover:bg-(--color-brand-brown-soft)">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="mt-5 space-y-4">
					<p className="rounded-2xl bg-(--color-brand-brown-soft) px-4 py-3 text-sm font-semibold text-(--color-text-primary)">
						Срочный сбор поддерживается только разовым пожертвованием.
					</p>

					<div className="flex flex-wrap gap-2">
						{PRESETS.map((preset) => (
							<button
								key={preset}
								type="button"
								onClick={() => onAmountChange(preset)}
								className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
									amountRub === preset
										? 'bg-(--color-brand-accent) text-white'
										: 'bg-(--color-brand-brown-soft) text-(--color-text-primary) hover:bg-(--color-brand-brown-muted)'
								}`}>
								{preset.toLocaleString('ru-RU')} ₽
							</button>
						))}
					</div>

					<label className="block">
						<span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
							Своя сумма
						</span>
						<input
							type="number"
							min={100}
							step={100}
							value={Number.isFinite(amountRub) ? amountRub : ''}
							onChange={(event) => {
								setAmountError(null);
								onAmountChange(Math.max(100, Number(event.target.value || 0)));
							}}
							className="h-12 w-full rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 text-(--color-text-primary) outline-none focus:ring-2 focus:ring-(--color-brand-accent)/35"
						/>
						{amountError && <p className="mt-1 text-xs font-semibold text-[#b64d2a]">{amountError}</p>}
					</label>

					<label className="block">
						<span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
							Имя в отчете
						</span>
						<input
							type="text"
							value={displayName}
							disabled={isAnonymous}
							onChange={(event) => {
								setNameError(null);
								setDisplayName(event.target.value);
							}}
							placeholder={isAnonymous ? 'Анонимно' : 'Например, Мария'}
							className="h-12 w-full rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 text-(--color-text-primary) outline-none focus:ring-2 focus:ring-(--color-brand-accent)/35 disabled:opacity-60"
						/>
						{nameError && <p className="mt-1 text-xs font-semibold text-[#b64d2a]">{nameError}</p>}
					</label>

					<label className="flex items-center gap-2 rounded-2xl bg-(--color-brand-brown-soft) px-4 py-3 text-sm font-semibold text-(--color-text-primary)">
						<input
							type="checkbox"
							checked={isAnonymous}
							onChange={(event) => setIsAnonymous(event.target.checked)}
						/>
						Пожертвовать анонимно
					</label>

					{submitError && (
						<p className="rounded-2xl border border-[#f2c7b8] bg-[#fff1ea] px-4 py-3 text-sm font-semibold text-[#9f3f22]">
							{submitError}
						</p>
					)}

					<button
						type="button"
						disabled={isBusy}
						onClick={() => void submitDonation()}
						className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) text-sm font-bold text-white shadow-[0_12px_24px_rgba(254,134,81,0.3)] transition-[transform,filter] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70">
						<Heart className="h-4 w-4" />
						Пожертвовать {amountRub.toLocaleString('ru-RU')} ₽
					</button>
				</div>
			</div>
		</dialog>
	);
};
