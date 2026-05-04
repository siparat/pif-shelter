import { zodResolver } from '@hookform/resolvers/zod';
import { startGuardianshipRequestSchema } from '@pif/contracts';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import {
	confirmGuardianshipViaPaymentWebhook,
	signInEmail,
	startAuthenticatedGuardianshipRequest,
	startGuardianshipRequest
} from '../../../entities/guardianship/api/guardianship.api';

const formSchema = startGuardianshipRequestSchema.omit({ animalId: true });
type FormValues = z.infer<typeof formSchema>;

const authFormSchema = z.object({
	email: z.email('Неверный почтовый адрес').trim(),
	password: z.string().min(4, 'Введите пароль')
});
type AuthFormValues = z.infer<typeof authFormSchema>;

type UseGuardianshipRequestReturn = {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	form: UseFormReturn<FormValues>;
	mutation: ReturnType<typeof useMutation<{ guardianshipId: string; paymentUrl: string }, Error, FormValues>>;
	step: 'form' | 'success' | 'auth-required';
	paymentUrl: string | null;
	isAuthModalOpen: boolean;
	openAuthModal: () => void;
	closeAuthModal: () => void;
	authForm: UseFormReturn<AuthFormValues>;
	authMutation: ReturnType<typeof useMutation<void, Error, AuthFormValues>>;
};

const is409 = (error: Error): boolean =>
	'response' in error && typeof (error as Error & { response?: { status?: number } }).response?.status === 'number'
		? (error as Error & { response: { status: number } }).response.status === 409
		: false;

export const useGuardianshipRequest = (
	animalId: string,
	costOfGuardianship: number | null
): UseGuardianshipRequestReturn => {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<'form' | 'success' | 'auth-required'>('form');
	const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: '', email: '', telegramUsername: '' }
	});

	const authForm = useForm<AuthFormValues>({
		resolver: zodResolver(authFormSchema),
		defaultValues: { email: '', password: '' }
	});

	const confirmPayment = async (subscriptionId: string): Promise<void> => {
		if (costOfGuardianship && costOfGuardianship > 0) {
			await confirmGuardianshipViaPaymentWebhook({
				subscriptionId,
				amountKopecks: Math.round(costOfGuardianship * 100)
			});
		}
	};

	const mutation = useMutation<{ guardianshipId: string; paymentUrl: string }, Error, FormValues>({
		mutationFn: async (values) => {
			const response = await startGuardianshipRequest({ animalId, ...values });
			await confirmPayment(new URLSearchParams(response.paymentUrl.split('?').pop()).get('transaction-id') || '');
			return response;
		},
		onSuccess: (data) => {
			setPaymentUrl(data.paymentUrl);
			setStep('success');
		},
		onError: (error) => {
			if (is409(error)) {
				setStep('auth-required');
				const guestEmail = form.getValues('email');
				if (guestEmail) {
					authForm.setValue('email', guestEmail);
				}
			}
		}
	});

	const authMutation = useMutation<void, Error, AuthFormValues>({
		mutationFn: async (values) => {
			await signInEmail({ email: values.email, password: values.password });
			const response = await startAuthenticatedGuardianshipRequest(animalId);
			const subscriptionId =
				new URLSearchParams(response.paymentUrl.split('?').pop()).get('transaction-id') || '';
			await confirmPayment(subscriptionId);
			setPaymentUrl(response.paymentUrl);
		},
		onSuccess: () => {
			setIsAuthModalOpen(false);
			setStep('success');
		}
	});

	const open = (): void => {
		setIsOpen(true);
		setStep('form');
		setPaymentUrl(null);
		form.reset();
		mutation.reset();
	};

	const close = (): void => {
		setIsOpen(false);
		setIsAuthModalOpen(false);
	};

	const openAuthModal = (): void => {
		setIsAuthModalOpen(true);
	};

	const closeAuthModal = (): void => {
		setIsAuthModalOpen(false);
		authForm.reset();
		authMutation.reset();
	};

	return {
		isOpen,
		open,
		close,
		form,
		mutation,
		step,
		paymentUrl,
		isAuthModalOpen,
		openAuthModal,
		closeAuthModal,
		authForm,
		authMutation
	};
};
