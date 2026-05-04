import { zodResolver } from '@hookform/resolvers/zod';
import { phoneSchema } from '@pif/contracts';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { createMeetingRequest } from '../api/meeting-request.api';

// Form schema for collecting separate date and time inputs
const formSchema = z.object({
	animalId: z.uuid('Некорректный идентификатор животного'),
	name: z.string().trim().min(2, 'Укажите ваше имя').max(120),
	phone: phoneSchema,
	email: z.string().email('Неверный почтовый адрес').trim().optional().or(z.literal('')),
	comment: z.string().trim().max(1000).optional().or(z.literal('')),
	meetingDate: z.string().min(1, 'Выберите дату встречи'),
	meetingTime: z.string().min(1, 'Выберите время встречи')
});

type FormValues = z.infer<typeof formSchema>;

type UseMeetingRequestReturn = {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	form: UseFormReturn<FormValues>;
	mutation: ReturnType<typeof useMutation<{ id: string }, Error, FormValues>>;
	step: 'form' | 'success';
};

export const useMeetingRequest = (animalId: string): UseMeetingRequestReturn => {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<'form' | 'success'>('form');

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			animalId,
			name: '',
			phone: '',
			email: '',
			comment: '',
			meetingDate: '',
			meetingTime: ''
		}
	});

	const mutation = useMutation<{ id: string }, Error, FormValues>({
		mutationFn: async (values) => {
			// Combine date and time into ISO datetime
			// The date/time inputs are in local timezone, so we create a Date object
			// and convert it to UTC using toISOString()
			const [year, month, day] = values.meetingDate.split('-').map(Number);
			const [hours, minutes] = values.meetingTime.split(':').map(Number);
			const localDate = new Date(year, month - 1, day, hours, minutes, 0);
			const isoDateTime = localDate.toISOString();

			return createMeetingRequest({
				animalId,
				name: values.name,
				phone: values.phone,
				email: values.email || undefined,
				comment: values.comment || undefined,
				meetingAt: isoDateTime
			});
		},
		onSuccess: () => {
			setStep('success');
		}
	});

	const open = (): void => {
		setIsOpen(true);
		setStep('form');
		form.reset();
		mutation.reset();
	};

	const close = (): void => {
		setIsOpen(false);
	};

	return { isOpen, open, close, form, mutation, step };
};
