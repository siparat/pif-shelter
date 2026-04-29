import { UserRole, WishlistItemStatusEnum, WISHLIST_ITEM_STATUS_LABEL } from '@pif/shared';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
	useCreateWishlistCategoryMutation,
	useCreateWishlistItemMutation,
	useDeleteWishlistCategoryMutation,
	useDeleteWishlistItemMutation,
	useUpdateWishlistCategoryMutation,
	useUpdateWishlistItemMutation,
	useWishlistManage,
	WishlistManageCategory,
	WishlistManageItem
} from '../../../../entities/wishlist';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { Button, EmptyState, ErrorState, Input, PageTitle, Select } from '../../../../shared/ui';

interface ItemDraft {
	name: string;
	status: WishlistItemStatusEnum;
	sortOrder: number;
}

export const WishlistPage = (): JSX.Element => {
	const { data: session } = useSession();
	const canManage = useMemo(
		() => session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SENIOR_VOLUNTEER,
		[session?.user.role]
	);
	const query = useWishlistManage({ enabled: canManage });

	const createCategoryMutation = useCreateWishlistCategoryMutation();
	const updateCategoryMutation = useUpdateWishlistCategoryMutation();
	const deleteCategoryMutation = useDeleteWishlistCategoryMutation();
	const createItemMutation = useCreateWishlistItemMutation();
	const updateItemMutation = useUpdateWishlistItemMutation();
	const deleteItemMutation = useDeleteWishlistItemMutation();

	const [newCategoryName, setNewCategoryName] = useState('');
	const [newItemByCategory, setNewItemByCategory] = useState<Record<string, string>>({});
	const [categoryDrafts, setCategoryDrafts] = useState<Record<string, { name: string; sortOrder: number }>>({});
	const [itemDrafts, setItemDrafts] = useState<Record<string, ItemDraft>>({});

	const categories = query.data?.categories ?? [];

	const getCategoryDraft = (category: WishlistManageCategory): { name: string; sortOrder: number } =>
		categoryDrafts[category.id] ?? { name: category.name, sortOrder: category.sortOrder };
	const getItemDraft = (item: WishlistManageItem): ItemDraft =>
		itemDrafts[item.id] ?? { name: item.name, sortOrder: item.sortOrder, status: item.status };

	const onCreateCategory = async (): Promise<void> => {
		const name = newCategoryName.trim();
		if (!name) {
			toast.error('Введите название категории');
			return;
		}
		try {
			await createCategoryMutation.mutateAsync({ name });
			toast.success('Категория создана');
			setNewCategoryName('');
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	const onSaveCategory = async (category: WishlistManageCategory): Promise<void> => {
		const draft = getCategoryDraft(category);
		try {
			await updateCategoryMutation.mutateAsync({
				id: category.id,
				payload: { name: draft.name.trim(), sortOrder: Number(draft.sortOrder) }
			});
			toast.success('Категория обновлена');
			setCategoryDrafts((prev) => {
				const next = { ...prev };
				delete next[category.id];
				return next;
			});
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	const onDeleteCategory = async (categoryId: string): Promise<void> => {
		try {
			await deleteCategoryMutation.mutateAsync(categoryId);
			toast.success('Категория удалена');
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	const onCreateItem = async (categoryId: string): Promise<void> => {
		const name = (newItemByCategory[categoryId] ?? '').trim();
		if (!name) {
			toast.error('Введите название позиции');
			return;
		}
		try {
			await createItemMutation.mutateAsync({ categoryId, name, status: WishlistItemStatusEnum.ALWAYS_NEEDED });
			toast.success('Позиция создана');
			setNewItemByCategory((prev) => ({ ...prev, [categoryId]: '' }));
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	const onSaveItem = async (item: WishlistManageItem): Promise<void> => {
		const draft = getItemDraft(item);
		try {
			await updateItemMutation.mutateAsync({
				id: item.id,
				payload: {
					name: draft.name.trim(),
					sortOrder: Number(draft.sortOrder),
					status: draft.status
				}
			});
			toast.success('Позиция обновлена');
			setItemDrafts((prev) => {
				const next = { ...prev };
				delete next[item.id];
				return next;
			});
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	const onDeleteItem = async (itemId: string): Promise<void> => {
		try {
			await deleteItemMutation.mutateAsync(itemId);
			toast.success('Позиция удалена');
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	if (!canManage) {
		return (
			<ErrorState
				title="Недостаточно прав"
				description="Управление списком нужд доступно администратору и старшему волонтёру."
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
				description={query.error?.message ?? 'Не удалось загрузить список нужд.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title="Список нужд" subtitle="Управление категориями и позициями для публичного сайта." />

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
				<Input
					label="Новая категория"
					placeholder="Например: Корм, Лекарства"
					value={newCategoryName}
					onChange={(event) => setNewCategoryName(event.target.value)}
					small
				/>
				<Button
					type="button"
					className="mt-0 md:w-auto px-5 py-2"
					onClick={() => void onCreateCategory()}
					isLoading={createCategoryMutation.isPending}>
					<Plus size={16} />
					Добавить категорию
				</Button>
			</div>

			{categories.length === 0 ? (
				<EmptyState
					title="Категорий пока нет"
					description="Создайте первую категорию нужд, чтобы начать заполнять позиции."
				/>
			) : (
				<div className="space-y-4">
					{categories.map((category) => {
						const draft = getCategoryDraft(category);
						return (
							<div
								key={category.id}
								className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto_auto] gap-3 items-end">
									<Input
										label="Категория"
										value={draft.name}
										onChange={(event) =>
											setCategoryDrafts((prev) => ({
												...prev,
												[category.id]: {
													...draft,
													name: event.target.value
												}
											}))
										}
										small
									/>
									<Input
										label="Порядок"
										type="number"
										value={String(draft.sortOrder)}
										onChange={(event) =>
											setCategoryDrafts((prev) => ({
												...prev,
												[category.id]: {
													...draft,
													sortOrder: Number(event.target.value || 0)
												}
											}))
										}
										small
									/>
									<Button
										type="button"
										appearance="ghost"
										className="mt-0 md:w-auto px-4 py-2"
										onClick={() => void onSaveCategory(category)}
										isLoading={updateCategoryMutation.isPending}>
										<Save size={14} />
										Сохранить
									</Button>
									<Button
										type="button"
										appearance="red"
										className="mt-0 md:w-auto px-4 py-2"
										onClick={() => void onDeleteCategory(category.id)}
										isLoading={deleteCategoryMutation.isPending}>
										<Trash2 size={14} />
										Удалить
									</Button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
									<Input
										label="Новая позиция"
										placeholder="Например: Сухой корм для щенков"
										value={newItemByCategory[category.id] ?? ''}
										onChange={(event) =>
											setNewItemByCategory((prev) => ({
												...prev,
												[category.id]: event.target.value
											}))
										}
										small
									/>
									<Button
										type="button"
										className="mt-0 md:w-auto px-4 py-2"
										onClick={() => void onCreateItem(category.id)}
										isLoading={createItemMutation.isPending}>
										<Plus size={14} />
										Добавить позицию
									</Button>
								</div>

								<div className="space-y-2">
									{category.items.map((item) => {
										const itemDraft = getItemDraft(item);
										return (
											<div
												key={item.id}
												className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3 grid grid-cols-1 md:grid-cols-[1fr_180px_120px_auto_auto] gap-2 items-end">
												<Input
													label="Позиция"
													value={itemDraft.name}
													onChange={(event) =>
														setItemDrafts((prev) => ({
															...prev,
															[item.id]: { ...itemDraft, name: event.target.value }
														}))
													}
													small
												/>
												<Select<WishlistItemStatusEnum>
													label="Статус"
													value={itemDraft.status}
													options={Object.values(WishlistItemStatusEnum).map((status) => ({
														value: status,
														label: WISHLIST_ITEM_STATUS_LABEL[status]
													}))}
													onChange={(event) =>
														setItemDrafts((prev) => ({
															...prev,
															[item.id]: {
																...itemDraft,
																status: event.target.value as WishlistItemStatusEnum
															}
														}))
													}
													small
												/>
												<Input
													label="Порядок"
													type="number"
													value={String(itemDraft.sortOrder)}
													onChange={(event) =>
														setItemDrafts((prev) => ({
															...prev,
															[item.id]: {
																...itemDraft,
																sortOrder: Number(event.target.value || 0)
															}
														}))
													}
													small
												/>
												<Button
													type="button"
													appearance="ghost"
													className="mt-0 md:w-auto px-3 py-2"
													onClick={() => void onSaveItem(item)}
													isLoading={updateItemMutation.isPending}>
													<Save size={14} />
												</Button>
												<Button
													type="button"
													appearance="red"
													className="mt-0 md:w-auto px-3 py-2"
													onClick={() => void onDeleteItem(item.id)}
													isLoading={deleteItemMutation.isPending}>
													<Trash2 size={14} />
												</Button>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default WishlistPage;
