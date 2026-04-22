import { MoreVertical } from 'lucide-react';
import { JSX, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCanEditPost, useDeletePostMutation } from '../../../../entities/post';
import { getErrorMessage } from '../../../../shared/api';
import { ROUTES } from '../../../../shared/config';
import { cn } from '../../../../shared/lib';
import { DeletePostConfirm } from '../DeletePostConfirm/DeletePostConfirm';
import { PostActionsDropdown } from './PostActionsDropdown';

interface Props {
	postId: string;
	animalId: string;
	authorId: string;
	title: string;
	onDeleted?: () => void;
	className?: string;
}

export const PostActionsMenu = ({
	postId,
	animalId,
	authorId,
	title,
	onDeleted,
	className
}: Props): JSX.Element | null => {
	const canEdit = useCanEditPost({ authorId });
	const navigate = useNavigate();
	const deleteMutation = useDeletePostMutation();
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	const [isOpen, setIsOpen] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	if (!canEdit) {
		return null;
	}

	const handleEdit = (): void => {
		setIsOpen(false);
		navigate(ROUTES.postEdit.replace(':animalId', animalId).replace(':postId', postId));
	};

	const handleRequestDelete = (): void => {
		setIsOpen(false);
		setIsConfirmOpen(true);
	};

	const handleConfirmDelete = async (): Promise<void> => {
		try {
			await deleteMutation.mutateAsync({ id: postId });
			toast.success('Пост удалён');
			setIsConfirmOpen(false);
			onDeleted?.();
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				aria-label="Действия с постом"
				aria-haspopup="menu"
				aria-expanded={isOpen}
				onClick={(event) => {
					event.stopPropagation();
					setIsOpen((prev) => !prev);
				}}
				className={cn(
					'inline-flex items-center justify-center rounded-lg p-1.5 text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text-primary) transition-colors',
					isOpen && 'bg-(--color-bg-secondary) text-(--color-text-primary)',
					className
				)}>
				<MoreVertical size={18} />
			</button>

			{isOpen && (
				<PostActionsDropdown
					triggerRef={triggerRef}
					onEdit={handleEdit}
					onDelete={handleRequestDelete}
					onClose={() => setIsOpen(false)}
				/>
			)}

			{isConfirmOpen && (
				<DeletePostConfirm
					title={title}
					isPending={deleteMutation.isPending}
					onConfirm={() => void handleConfirmDelete()}
					onCancel={() => setIsConfirmOpen(false)}
				/>
			)}
		</>
	);
};
