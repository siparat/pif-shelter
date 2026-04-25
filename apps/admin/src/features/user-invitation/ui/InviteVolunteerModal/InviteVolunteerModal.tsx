import { createInvitationRequestSchema } from '@pif/contracts';
import { Loader2, Mail, Shield, UserPlus, Users } from 'lucide-react';
import { JSX, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../../../shared/api';
import { Button, Input, Modal } from '../../../../shared/ui';
import { useCreateInvitationMutation } from '../../model/hooks';

interface Props {
	onClose: () => void;
}

interface FormState {
	name: string;
	email: string;
	roleName: string;
}

const INITIAL_STATE: FormState = {
	name: '',
	email: '',
	roleName: ''
};

export const InviteVolunteerModal = ({ onClose }: Props): JSX.Element => {
	const mutation = useCreateInvitationMutation();
	const [form, setForm] = useState<FormState>(INITIAL_STATE);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

	const setField = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
		setForm((prev) => ({ ...prev, [key]: value }));
		setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
	};

	const handleSubmit = async (): Promise<void> => {
		const parsed = createInvitationRequestSchema.safeParse(form);
		if (!parsed.success) {
			const errors: Partial<Record<keyof FormState, string>> = {};
			for (const issue of parsed.error.issues) {
				const path = issue.path[0] as keyof FormState | undefined;
				if (path && !errors[path]) {
					errors[path] = issue.message;
				}
			}
			setFieldErrors(errors);
			return;
		}

		try {
			await mutation.mutateAsync(parsed.data);
			toast.success('Приглашение отправлено на почту');
			onClose();
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	return (
		<Modal title="Пригласить волонтёра" onClose={onClose}>
			<div className="space-y-4">
				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-primary) p-3 text-sm text-(--color-text-secondary)">
					Пользователь получит письмо с персональной ссылкой. При регистрации приглашение автоматически
					привяжется к его аккаунту.
				</div>

				<Input
					label="Имя и фамилия"
					placeholder="Анна Петрова"
					value={form.name}
					error={fieldErrors.name}
					Icon={Users}
					onChange={(event) => setField('name', event.target.value)}
				/>

				<Input
					label="Email"
					type="email"
					placeholder="anna@pif.team"
					value={form.email}
					error={fieldErrors.email}
					Icon={Mail}
					onChange={(event) => setField('email', event.target.value)}
				/>

				<Input
					label="Роль в команде"
					type="text"
					placeholder="Волонтёр, водитель, фотограф"
					value={form.roleName}
					error={fieldErrors.roleName}
					Icon={Shield}
					onChange={(event) => setField('roleName', event.target.value)}
				/>

				<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
					<Button appearance="ghost" className="mt-0 sm:w-auto px-4 py-2" onClick={onClose}>
						Отмена
					</Button>
					<Button
						isLoading={mutation.isPending}
						className="mt-0 sm:w-auto px-4 py-2"
						onClick={() => void handleSubmit()}>
						{mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
						Отправить приглашение
					</Button>
				</div>
			</div>
		</Modal>
	);
};
