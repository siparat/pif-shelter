import { JSX, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../../shared/ui';

export const PwaUpdater = (): JSX.Element | null => {
	const {
		needRefresh: [needRefresh],
		updateServiceWorker
	} = useRegisterSW({
		immediate: true
	});

	useEffect(() => {
		if (!needRefresh) {
			return;
		}

		toast.custom(
			(t) => (
				<div className="w-[360px] rounded-xl border border-(--color-border) bg-(--color-bg-secondary) p-4 text-(--color-text-primary) shadow-xl">
					<p className="text-sm font-semibold">Доступна новая версия админки</p>
					<p className="mt-1 text-xs text-(--color-text-secondary)">
						Обновите страницу, чтобы применить последние изменения.
					</p>
					<div className="mt-3 flex justify-end gap-2">
						<Button
							className="mt-0 h-8 px-3 text-xs"
							appearance="ghost"
							onClick={() => toast.dismiss(t.id)}>
							Позже
						</Button>
						<Button
							className="mt-0 h-8 px-3 text-xs"
							onClick={() => {
								toast.dismiss(t.id);
								void updateServiceWorker(true);
							}}>
							Обновить
						</Button>
					</div>
				</div>
			),
			{
				duration: Infinity,
				id: 'pwa-update-available'
			}
		);
	}, [needRefresh, updateServiceWorker]);

	return null;
};
