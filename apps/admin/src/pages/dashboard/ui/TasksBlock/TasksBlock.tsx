import { Calendar, UserCheck } from 'lucide-react';
import { FC } from 'react';
import { DashboardCard } from '../DashboardCard/DashboardCard';

interface Props {
	newCount: number;
	upcoming24hCount: number;
}

export const TasksBlock: FC<Props> = ({ newCount, upcoming24hCount }) => {
	return (
		<DashboardCard title="Мои задачи">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex items-center gap-4 bg-(--color-bg-primary) p-5 rounded-2xl border border-(--color-border) group hover:border-(--color-brand-orange) transition-colors">
					<div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
						<Calendar size={24} />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-bold">{upcoming24hCount}</span>
						<span className="text-xs text-(--color-text-secondary)">Встречи за 24ч</span>
					</div>
				</div>

				<div className="flex items-center gap-4 bg-(--color-bg-primary) p-5 rounded-2xl border border-(--color-border) group hover:border-(--color-brand-orange) transition-colors">
					<div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all">
						<UserCheck size={24} />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-bold">{newCount}</span>
						<span className="text-xs text-(--color-text-secondary)">Новые заявки</span>
					</div>
				</div>
			</div>
		</DashboardCard>
	);
};
