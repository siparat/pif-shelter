import { useQueryClient } from '@tanstack/react-query';
import { Bitcoin, Heart, Loader2, Sparkles } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import {
	confirmDonationOneTimeViaPaymentWebhook,
	confirmDonationSubscriptionViaPaymentWebhook,
	DEFAULT_DONATION_AMOUNT_KOPECKS,
	DONATION_MAX_AMOUNT_KOPECKS,
	DONATION_MIN_AMOUNT_KOPECKS,
	DONATION_PRESET_AMOUNTS_KOPECKS,
	donationQueryKeys,
	parseDonationAmountKopecks,
	useCreateDonationSubscriptionMutation,
	useCreateOneTimeDonationMutation
} from '../../../../../entities/donation';
import { ChoiceChipGroup, LabeledSwitch, SegmentedControl, SoftField, SoftInput } from '../../../../../shared/ui';

const MIN_RUB = DONATION_MIN_AMOUNT_KOPECKS / 100;
const MAX_RUB = DONATION_MAX_AMOUNT_KOPECKS / 100;
const DEFAULT_RUB = DEFAULT_DONATION_AMOUNT_KOPECKS / 100;

type Frequency = 'once' | 'monthly';

export const DonationFormSection = (): JSX.Element => {
	const [searchParams] = useSearchParams();
	const campaignId = useMemo(() => {
		const raw = searchParams.get('campaign');
		if (!raw) {
			return undefined;
		}
		return z.uuid().safeParse(raw).success ? raw : undefined;
	}, [searchParams]);

	const [frequency, setFrequency] = useState<Frequency>('once');
	const [rubles, setRubles] = useState<number>(DEFAULT_RUB);
	const [displayName, setDisplayName] = useState('');
	const [email, setEmail] = useState('');
	const [anonymous, setAnonymous] = useState(false);

	const [nameError, setNameError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [amountError, setAmountError] = useState<string | null>(null);

	const oneTimeMutation = useCreateOneTimeDonationMutation();
	const subscriptionMutation = useCreateDonationSubscriptionMutation();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isBusy = isSubmitting || oneTimeMutation.isPending || subscriptionMutation.isPending;

	const presetChips = useMemo(
		() =>
			DONATION_PRESET_AMOUNTS_KOPECKS.map((k) => {
				const rub = k / 100;
				return { value: rub, label: `${rub.toLocaleString('ru-RU')} ₽` };
			}),
		[]
	);

	const onSubmit = async (): Promise<void> => {
		setNameError(null);
		setEmailError(null);
		setAmountError(null);

		const roundedRubles = Number.isFinite(rubles) ? Math.trunc(rubles) : MIN_RUB;
		if (roundedRubles < MIN_RUB || roundedRubles > MAX_RUB) {
			setAmountError(`От ${MIN_RUB} до ${MAX_RUB.toLocaleString('ru-RU')} ₽`);
			toast.error('Проверьте сумму');
			return;
		}

		const amountKopecks = Math.round(roundedRubles * 100);
		const parsedAmount = parseDonationAmountKopecks(amountKopecks);
		if (!parsedAmount.success) {
			setAmountError('Сумма не проходит проверку');
			toast.error('Сумма вне допустимого диапазона');
			return;
		}

		if (!anonymous && displayName.trim() === '') {
			setNameError('Как к вам обращаться в отчёте?');
			toast.error('Укажите имя или включите анонимность');
			return;
		}

		if (frequency === 'monthly') {
			const parsedEmail = z.string().email().safeParse(email.trim());
			if (!parsedEmail.success) {
				setEmailError('Нужен email для ссылки отмены подписки');
				toast.error('Проверьте email');
				return;
			}
		}

		const basePayload = {
			displayName: anonymous ? '' : displayName.trim(),
			hidePublicName: anonymous,
			amount: amountKopecks
		};

		setIsSubmitting(true);
		try {
			if (frequency === 'once') {
				const created = await oneTimeMutation.mutateAsync({
					...basePayload,
					...(campaignId ? { campaignId } : {})
				});
				await confirmDonationOneTimeViaPaymentWebhook({
					transactionId: created.transactionId,
					amountKopecks
				});
			} else {
				const created = await subscriptionMutation.mutateAsync({
					displayName: basePayload.displayName,
					hidePublicName: basePayload.hidePublicName,
					email: email.trim(),
					amountPerMonth: amountKopecks
				});
				await confirmDonationSubscriptionViaPaymentWebhook({
					subscriptionId: created.subscriptionId,
					amountKopecks
				});
			}
			void queryClient.invalidateQueries({ queryKey: donationQueryKeys.root });
			toast.success('Спасибо! Пожертвование учтено — запись скоро появится в списке.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Не удалось завершить пожертвование');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section
			className="flex min-w-0 max-w-full flex-col gap-6 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_16px_40px_rgba(79,61,56,0.12)] sm:p-6 md:p-8"
			aria-labelledby="donation-form-title">
			<div className="flex flex-col gap-2">
				<p className="inline-flex items-center gap-2 text-sm font-bold text-(--color-brand-accent)">
					<Sparkles className="h-4 w-4 shrink-0" aria-hidden />
					Вместе теплее
				</p>
				<h2
					id="donation-form-title"
					className="text-xl font-bold text-balance text-(--color-text-primary) sm:text-2xl">
					Помочь приюту — важна любая сумма
				</h2>
				{campaignId ? (
					<p className="rounded-2xl bg-(--color-brand-brown-soft) px-4 py-2 text-sm font-semibold text-(--color-text-primary)">
						Платёж будет учтён в рамках выбранного сбора.
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
					Как помочь
				</span>
				<SegmentedControl
					value={frequency}
					onValueChange={setFrequency}
					aria-label="Периодичность пожертвования"
					items={[
						{ value: 'once', label: 'Разово' },
						{ value: 'monthly', label: 'Каждый месяц' }
					]}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
					Быстрый выбор
				</span>
				<ChoiceChipGroup
					items={presetChips}
					selectedValue={rubles}
					onSelect={setRubles}
					equals={(a, b) => Math.round(a * 100) === Math.round(b * 100)}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SoftField id="donation-amount" label="Сумма, ₽" error={amountError}>
					<SoftInput
						id="donation-amount"
						type="number"
						min={MIN_RUB}
						max={MAX_RUB}
						step={50}
						value={Number.isFinite(rubles) ? rubles : ''}
						onChange={(e) => setRubles(Number(e.target.value))}
					/>
				</SoftField>
				<SoftField id="donation-name" label="Имя в отчёте" error={nameError}>
					<SoftInput
						id="donation-name"
						type="text"
						autoComplete="name"
						disabled={anonymous}
						placeholder={anonymous ? 'Анонимно' : 'Например, Мария'}
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
					/>
				</SoftField>
			</div>

			{frequency === 'monthly' ? (
				<SoftField id="donation-email" label="Email для отмены подписки" error={emailError}>
					<SoftInput
						id="donation-email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</SoftField>
			) : null}

			<LabeledSwitch
				checked={anonymous}
				onCheckedChange={setAnonymous}
				title="Анонимно в отчёте"
				description="Имя не покажем в публичной таблице"
			/>

			<div className="flex flex-col gap-3">
				<button
					type="button"
					disabled={isBusy}
					onClick={() => void onSubmit()}
					className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) text-base font-bold text-white shadow-[0_12px_28px_rgba(254,134,81,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100">
					{isBusy ? (
						<Loader2 className="h-5 w-5 animate-spin" aria-hidden />
					) : (
						<Heart className="h-5 w-5" aria-hidden />
					)}
					Пожертвовать
				</button>
				<button
					type="button"
					disabled={isBusy}
					onClick={() =>
						toast('Напишите нам в соцсетях или на почту — вышлем реквизиты для криптовалюты.', {
							duration: 6000
						})
					}
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-(--color-brand-brown) bg-transparent text-sm font-bold text-(--color-brand-brown) transition-colors hover:bg-(--color-brand-brown-soft) disabled:cursor-not-allowed disabled:opacity-60">
					<Bitcoin className="h-5 w-5" aria-hidden />
					Другие способы и крипта
				</button>
			</div>
		</section>
	);
};
