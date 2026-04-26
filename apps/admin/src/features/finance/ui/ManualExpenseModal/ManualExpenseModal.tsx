import { ALLOW_IMAGE_EXT, IMAGE_MIME_TYPES } from '@pif/shared';
import { ImageOff, Images, Plus } from 'lucide-react';
import { ChangeEvent, JSX, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import {
	AdminLedgerEntryRow,
	useCreateManualExpenseMutation,
	useUpdateManualExpenseMutation
} from '../../../../entities/finance';
import { getErrorMessage } from '../../../../shared/api';
import { cn, getMediaUrl, kopecksToRublesInput, rublesInputToKopecks } from '../../../../shared/lib';
import { Button, Input, Modal, Textarea } from '../../../../shared/ui';

const RECEIPT_ACCEPT = Object.values(IMAGE_MIME_TYPES).join(',');

interface ManualExpenseFormValues {
	title: string;
	rubles: number;
	occurredAtLocal: string;
	note?: string;
}

const toDatetimeLocalValue = (iso: string): string => {
	const d = new Date(iso);
	const pad = (n: number): string => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const resolveImageExt = (file: File): (typeof ALLOW_IMAGE_EXT)[number] | null => {
	const raw = file.name.split('.').pop()?.toLowerCase();
	if (!raw) return null;
	return ALLOW_IMAGE_EXT.includes(raw as (typeof ALLOW_IMAGE_EXT)[number])
		? (raw as (typeof ALLOW_IMAGE_EXT)[number])
		: null;
};

const uploadReceipt = async (file: File): Promise<string> => {
	const ext = resolveImageExt(file);
	if (!ext) {
		throw new Error(`Допустимые форматы чека: ${ALLOW_IMAGE_EXT.join(', ')}`);
	}
	const uploadPayload = await getUploadUrl({ ext, type: 'image', space: 'ledger_receipts' });
	await uploadFileToS3(uploadPayload, file);
	return uploadPayload.data.key;
};

interface Props {
	mode: 'create' | 'edit';
	entry?: AdminLedgerEntryRow;
	onClose: () => void;
}

export const ManualExpenseModal = ({ mode, entry, onClose }: Props): JSX.Element => {
	const receiptInputId = useId();
	const receiptInputRef = useRef<HTMLInputElement>(null);
	const createMutation = useCreateManualExpenseMutation();
	const updateMutation = useUpdateManualExpenseMutation();
	const [receiptFile, setReceiptFile] = useState<File | null>(null);
	const [receiptError, setReceiptError] = useState<string | null>(null);
	const [receiptObjectUrl, setReceiptObjectUrl] = useState<string | null>(null);
	const [isReceiptPreviewBroken, setIsReceiptPreviewBroken] = useState(false);

	useEffect(() => {
		if (!receiptFile) {
			setReceiptObjectUrl(null);
			return;
		}
		const url = URL.createObjectURL(receiptFile);
		setReceiptObjectUrl(url);
		return () => {
			URL.revokeObjectURL(url);
		};
	}, [receiptFile]);

	const receiptPreviewSrc = useMemo(() => {
		if (receiptObjectUrl) return receiptObjectUrl;
		if (mode === 'edit' && entry?.receiptStorageKey) return getMediaUrl(entry.receiptStorageKey);
		return null;
	}, [receiptObjectUrl, mode, entry?.receiptStorageKey]);

	useEffect(() => {
		setIsReceiptPreviewBroken(false);
	}, [receiptObjectUrl, entry?.receiptStorageKey]);

	const handleReceiptFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const file = event.target.files?.[0] ?? null;
		setReceiptFile(file);
		setReceiptError(null);
		event.target.value = '';
	};

	const clearPickedReceipt = (): void => {
		setReceiptFile(null);
		setReceiptError(null);
	};

	const defaults = useMemo((): ManualExpenseFormValues => {
		if (mode === 'edit' && entry) {
			return {
				title: entry.title,
				rubles: kopecksToRublesInput(entry.netAmount),
				occurredAtLocal: toDatetimeLocalValue(entry.occurredAt),
				note: entry.note ?? ''
			};
		}
		return {
			title: '',
			rubles: 0,
			occurredAtLocal: toDatetimeLocalValue(new Date().toISOString()),
			note: ''
		};
	}, [entry, mode]);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ManualExpenseFormValues>({
		defaultValues: defaults
	});

	const isBusy = createMutation.isPending || updateMutation.isPending;

	const onSubmit = handleSubmit(async (values) => {
		setReceiptError(null);
		const occurredAt = new Date(values.occurredAtLocal).toISOString();
		const noteTrimmed = values.note?.trim();
		try {
			if (mode === 'create') {
				if (!receiptFile) {
					setReceiptError('Прикрепите фото чека');
					return;
				}
				const receiptStorageKey = await uploadReceipt(receiptFile);
				await createMutation.mutateAsync({
					amount: rublesInputToKopecks(values.rubles),
					occurredAt,
					title: values.title.trim(),
					...(noteTrimmed ? { note: noteTrimmed } : {}),
					receiptStorageKey
				});
				toast.success('Расход добавлен');
				onClose();
				return;
			}
			if (!entry) return;
			let receiptStorageKey: string | undefined;
			if (receiptFile) {
				receiptStorageKey = await uploadReceipt(receiptFile);
			}
			await updateMutation.mutateAsync({
				id: entry.id,
				amount: rublesInputToKopecks(values.rubles),
				occurredAt,
				title: values.title.trim(),
				note: noteTrimmed ? noteTrimmed : null,
				...(receiptStorageKey ? { receiptStorageKey } : {})
			});
			toast.success('Расход обновлён');
			onClose();
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	});

	return (
		<Modal title={mode === 'create' ? 'Новый расход' : 'Редактирование расхода'} onClose={onClose}>
			<form onSubmit={onSubmit} className="space-y-5 w-full min-w-0">
				<Input
					{...register('title', {
						required: 'Укажите название',
						maxLength: { value: 200, message: 'Не длиннее 200 символов' }
					})}
					label="Назначение"
					placeholder="Например: Корм, ветпрепараты"
					error={errors.title?.message}
					disabled={isBusy}
				/>
				<Input
					{...register('rubles', {
						valueAsNumber: true,
						required: 'Укажите сумму',
						validate: (v) => (Number.isFinite(v) && v > 0 ? true : 'Сумма должна быть больше нуля')
					})}
					type="number"
					step="0.01"
					min={0}
					label="Сумма, ₽"
					error={errors.rubles?.message}
					disabled={isBusy}
				/>
				<Input
					{...register('occurredAtLocal', { required: 'Укажите дату' })}
					type="datetime-local"
					label="Дата и время"
					error={errors.occurredAtLocal?.message}
					disabled={isBusy}
				/>
				<Textarea
					{...register('note', { maxLength: { value: 2000, message: 'Не длиннее 2000 символов' } })}
					label="Комментарий"
					placeholder="Необязательно"
					error={errors.note?.message}
					disabled={isBusy}
					rows={3}
				/>
				<div className="space-y-3 pt-2 border-t border-(--color-border)">
					<div className="flex items-center gap-2">
						<Images size={20} className="text-(--color-text-secondary)" />
						<h3 className="text-lg font-semibold text-(--color-text-primary)">Фото чека</h3>
					</div>
					<p className="text-xs text-(--color-text-secondary) leading-relaxed">
						{mode === 'create' ? 'Обязательно для новой проводки. ' : ''}
						Те же форматы, что в галерее животного. Файл уйдёт в хранилище после сохранения.
					</p>

					{!receiptPreviewSrc ? (
						<label
							htmlFor={receiptInputId}
							className={cn(
								'flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-(--color-border) bg-(--color-bg-primary) py-10 px-4 text-(--color-text-secondary) transition-colors',
								isBusy
									? 'pointer-events-none opacity-60'
									: 'hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) cursor-pointer'
							)}>
							<Plus size={26} />
							<span className="text-sm font-semibold">Добавить фото чека</span>
							<span className="text-xs text-center">JPEG, PNG, WebP или AVIF</span>
						</label>
					) : (
						<div className="space-y-3">
							<div className="relative aspect-square w-full max-w-[280px] rounded-xl overflow-hidden border border-(--color-border) bg-(--color-bg-primary)">
								{!isReceiptPreviewBroken ? (
									<img
										src={receiptPreviewSrc}
										alt="Чек"
										loading="lazy"
										className="absolute inset-0 w-full h-full object-cover"
										onError={() => setIsReceiptPreviewBroken(true)}
									/>
								) : (
									<div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-(--color-bg-primary) p-2 text-center">
										<ImageOff className="text-(--color-text-secondary)" size={28} />
										<span className="text-xs text-(--color-text-secondary)">
											Не удалось показать превью
										</span>
									</div>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									appearance="ghost"
									className="mt-0 px-4 py-2.5 text-sm"
									disabled={isBusy}
									onClick={() => receiptInputRef.current?.click()}>
									Заменить фото
								</Button>
								{receiptFile ? (
									<Button
										type="button"
										appearance="ghost"
										className="mt-0 px-4 py-2.5 text-sm text-red-400 hover:text-red-300"
										disabled={isBusy}
										onClick={clearPickedReceipt}>
										Отменить выбор
									</Button>
								) : null}
							</div>
						</div>
					)}

					<input
						ref={receiptInputRef}
						id={receiptInputId}
						type="file"
						accept={RECEIPT_ACCEPT}
						className="hidden"
						disabled={isBusy}
						onChange={handleReceiptFileChange}
					/>
					{receiptError && <p className="text-sm text-red-400">{receiptError}</p>}
				</div>
				<div className="flex flex-row gap-3 pt-2">
					<Button
						type="button"
						appearance="ghost"
						className="mt-0 w-full py-3 sm:py-2.5"
						onClick={onClose}
						disabled={isBusy}>
						Отмена
					</Button>
					<Button type="submit" className="mt-0 w-full sm:max-w-full py-3 sm:py-2.5" disabled={isBusy}>
						{mode === 'create' ? 'Сохранить' : 'Обновить'}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
