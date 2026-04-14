import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { JSX } from 'react';
import { getDashboardSummary } from '../../api/get-summary';
import { AlertsBlock } from '../AlertsBlock/AlertsBlock';
import { TasksBlock } from '../TasksBlock/TasksBlock';

export const DashboardPage = (): JSX.Element => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['dashboard-summary'],
		queryFn: getDashboardSummary
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="p-8 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-center">
				<p className="font-bold">Ошибка загрузки данных дашборда</p>
				<p className="text-sm opacity-80">Попробуйте обновить страницу позже</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 pb-10">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Обзор</h1>
				<p className="text-(--color-text-secondary)">Оперативная информация на сегодня</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<AlertsBlock sosCount={data.wishlist.sosCount} activeItemsCount={data.wishlist.activeItemsCount} />
				<TasksBlock
					newCount={data.meetingRequests.newCount}
					upcoming24hCount={data.meetingRequests.upcoming24hCount}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-32 flex flex-col justify-center border-dashed opacity-50">
					<span className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
						Статистика
					</span>
					<span className="text-sm">В разработке...</span>
				</div>
				<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-32 flex flex-col justify-center border-dashed opacity-50">
					<span className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
						Финансы
					</span>
					<span className="text-sm">В разработке...</span>
				</div>
				<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-32 flex flex-col justify-center border-dashed opacity-50">
					<span className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
						Команда
					</span>
					<span className="text-sm">В разработке...</span>
				</div>
			</div>
		</div>
	);
};
