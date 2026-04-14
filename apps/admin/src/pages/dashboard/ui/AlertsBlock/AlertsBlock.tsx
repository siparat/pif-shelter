import { AlertCircle, ShoppingCart } from 'lucide-react';
import { FC } from 'react';
import { DashboardCard } from '../DashboardCard/DashboardCard';

interface Props {
	sosCount: number;
	activeItemsCount: number;
}

export const AlertsBlock: FC<Props> = ({ sosCount, activeItemsCount }) => {
	return (
		<DashboardCard title="Внимание">
			<div className="flex flex-col gap-4">
				{sosCount > 0 && (
					<div className="flex items-center gap-4 bg-red-400/10 border border-red-400/20 p-4 rounded-xl text-red-400">
						<AlertCircle size={24} />
						<div className="flex flex-col">
							<span className="text-sm font-bold">Срочные нужды (SOS)</span>
							<span className="text-xs opacity-80">{sosCount} позиций требуют пополнения</span>
						</div>
					</div>
				)}

				<div className="flex items-center gap-4 bg-(--color-brand-orange)/10 border border-(--color-brand-orange)/20 p-4 rounded-xl text-(--color-brand-orange)">
					<ShoppingCart size={24} />
					<div className="flex flex-col">
						<span className="text-sm font-bold">Список желаний</span>
						<span className="text-xs opacity-80">Активно: {activeItemsCount} позиций</span>
					</div>
				</div>
			</div>
		</DashboardCard>
	);
};
