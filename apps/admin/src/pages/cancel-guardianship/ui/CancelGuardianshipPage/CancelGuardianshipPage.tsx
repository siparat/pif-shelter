import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { cancelGuardianshipByToken } from '../../../../features/guardianship-cancel-by-token/api/cancel-guardianship-by-token.api';
import { getErrorMessage } from '../../../../shared/api';
import { Button, ErrorState } from '../../../../shared/ui';

const tokenSchema = z.uuid('Некорректный токен отмены');

export const CancelGuardianshipPage = (): JSX.Element => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const tokenParam = searchParams.get('token') ?? '';
	const parsedToken = useMemo(() => tokenSchema.safeParse(tokenParam), [tokenParam]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCancelled, setIsCancelled] = useState(false);

	const handleCancel = async (): Promise<void> => {
		if (!parsedToken.success) {
			toast.error(parsedToken.error.issues[0]?.message ?? 'Некорректный токен отмены');
			return;
		}

		setIsSubmitting(true);
		try {
			await cancelGuardianshipByToken({ token: parsedToken.data });
			setIsCancelled(true);
			toast.success('Опекунство отменено');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!parsedToken.success) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary) p-4">
				<div className="w-full max-w-lg">
					<ErrorState
						description="Ссылка отмены опекунства некорректна или повреждена."
						onRetry={() => navigate('/login')}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary) p-4">
			<div className="w-full max-w-lg p-6 md:p-8 bg-(--color-bg-secondary) rounded-2xl border border-(--color-border) shadow-pif-lg">
				{isCancelled ? (
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-300">
							<CheckCircle2 size={16} />
							Опекунство отменено
						</div>
						<p className="text-sm text-(--color-text-secondary)">
							Ваше опекунство было успешно отменено. При желании вы всегда можете вернуться и выбрать
							другого подопечного.
						</p>
						<Button className="mt-0 w-full" onClick={() => navigate('/login')}>
							Перейти ко входу
						</Button>
					</div>
				) : (
					<div className="space-y-5">
						<div className="space-y-2">
							<h1 className="text-2xl md:text-3xl font-bold text-(--color-text-primary)">
								Отмена опекунства
							</h1>
							<p className="text-(--color-text-secondary)">
								Подтвердите действие. После отмены доступ к привилегиям опекуна будет прекращен по
								правилам системы.
							</p>
						</div>
						<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200 flex items-start gap-2">
							<AlertTriangle size={16} className="mt-0.5 shrink-0" />
							<span>
								Действие нельзя отменить автоматически. Для повторного оформления создайте новое
								опекунство.
							</span>
						</div>
						<div className="flex flex-col-reverse sm:flex-row gap-2">
							<Button appearance="ghost" className="mt-0 w-full" onClick={() => navigate('/login')}>
								Назад
							</Button>
							<Button
								className="mt-0 w-full"
								isLoading={isSubmitting}
								onClick={() => void handleCancel()}>
								Подтвердить отмену
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CancelGuardianshipPage;
