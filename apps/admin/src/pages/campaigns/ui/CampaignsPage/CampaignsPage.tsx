import { CampaignStatus, UserRole } from '@pif/shared';
import { Loader2, Plus } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
	CampaignItem,
	useCampaignsList,
	useChangeCampaignStatusMutation,
	useDeleteCampaignMutation
} from '../../../../entities/campaign';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { Button, EmptyState, ErrorState, PageTitle, Select } from '../../../../shared/ui';
import { CampaignCard } from './CampaignCard';
import { CampaignFormModal } from './CampaignFormModal';
import { STATUS_LABEL } from './utils';

type FormModalState = { mode: 'create' } | { mode: 'edit'; campaign: CampaignItem };

export const CampaignsPage = (): JSX.Element => {
	const { data: session } = useSession();
	const canManage = useMemo(
		() => session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SENIOR_VOLUNTEER,
		[session?.user.role]
	);
	const [statusFilter, setStatusFilter] = useState<CampaignStatus | undefined>(undefined);
	const [formModal, setFormModal] = useState<FormModalState | null>(null);

	const query = useCampaignsList({ page: 1, perPage: 50, status: statusFilter }, { enabled: canManage });
	const changeStatusMutation = useChangeCampaignStatusMutation();
	const deleteMutation = useDeleteCampaignMutation();

	const campaigns = query.data?.data ?? [];

	const onDelete = async (id: string): Promise<void> => {
		try {
			await deleteMutation.mutateAsync(id);
			toast.success('Сбор удалён');
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	const onChangeStatus = async (id: string, status: CampaignStatus): Promise<void> => {
		try {
			await changeStatusMutation.mutateAsync({ id, status });
			toast.success('Статус сбора обновлен');
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	if (!canManage) {
		return (
			<ErrorState
				title="Недостаточно прав"
				description="Управление сборами доступно администратору и старшему волонтёру."
			/>
		);
	}

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить список сборов.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const deleteTargetId = typeof deleteMutation.variables === 'string' ? deleteMutation.variables : undefined;
	const statusChangeTargetId =
		changeStatusMutation.variables &&
		typeof changeStatusMutation.variables === 'object' &&
		'id' in changeStatusMutation.variables
			? (changeStatusMutation.variables as { id: string }).id
			: undefined;

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title="Срочные сборы" subtitle="Карточки сборов, прогресс, привязка к животным и статусы.">
				<Button
					type="button"
					className="mt-0 md:w-auto px-5 py-2.5"
					onClick={() => setFormModal({ mode: 'create' })}>
					<Plus size={16} />
					Новый сбор
				</Button>
			</PageTitle>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 max-w-md">
				<Select<string>
					label="Статус"
					value={statusFilter ?? ''}
					options={[
						{ value: '', label: 'Все статусы' },
						...Object.values(CampaignStatus).map((status) => ({
							value: status,
							label: STATUS_LABEL[status]
						}))
					]}
					onChange={(event) => {
						const value = event.target.value;
						setStatusFilter(value ? (value as CampaignStatus) : undefined);
					}}
					small
				/>
			</div>

			{campaigns.length === 0 ? (
				<EmptyState
					title="Сборов нет"
					description="Создайте сбор кнопкой «Новый сбор» — в форме можно привязать животное и загрузить превью."
					actionLabel="Создать сбор"
					onAction={() => setFormModal({ mode: 'create' })}
				/>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
					{campaigns.map((item) => (
						<CampaignCard
							key={item.id}
							item={item}
							isChangingStatus={changeStatusMutation.isPending && statusChangeTargetId === item.id}
							isDeleting={deleteMutation.isPending && deleteTargetId === item.id}
							onEdit={() => setFormModal({ mode: 'edit', campaign: item })}
							onDelete={() => void onDelete(item.id)}
							onChangeStatus={(status) => void onChangeStatus(item.id, status)}
						/>
					))}
				</div>
			)}

			{formModal && (
				<CampaignFormModal
					key={formModal.mode === 'edit' ? formModal.campaign.id : 'create'}
					mode={formModal.mode}
					campaign={formModal.mode === 'edit' ? formModal.campaign : undefined}
					onClose={() => setFormModal(null)}
				/>
			)}
		</div>
	);
};

export default CampaignsPage;
