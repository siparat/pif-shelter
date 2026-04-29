import { JSX, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { VolunteerInviteProvider } from '../../../../features/volunteer-invite';
import { Footer } from '../../../footer';
import { Header } from '../Header/Header';

export const Layout = (): JSX.Element => {
	useEffect(() => {
		const storageKey = 'web-disclaimer-disabled';
		const isDisabled = window.localStorage.getItem(storageKey) === '1';
		if (isDisabled) {
			return;
		}

		const id = toast(
			(t) => (
				<div className="flex max-w-[520px] flex-col gap-3">
					<p className="text-sm leading-relaxed">
						Демо-режим: сайт выполнен как дипломный проект, не является официальным и не работает как
						реальный сервис. Данные сгенерированы, животных не существует, платежи моковые и автоматически
						отмечаются оплаченными.
					</p>
					<button
						type="button"
						onClick={() => {
							window.localStorage.setItem(storageKey, '1');
							toast.dismiss(t.id);
						}}
						className="inline-flex h-8 w-fit items-center justify-center rounded-full bg-(--color-brand-brown) px-4 text-xs font-semibold text-(--color-text-on-dark) transition-colors hover:bg-(--color-brand-brown-strong)">
						Больше не показывать
					</button>
				</div>
			),
			{ duration: Infinity }
		);

		return () => {
			toast.dismiss(id);
		};
	}, []);

	return (
		<VolunteerInviteProvider>
			<div className="flex min-h-screen flex-col bg-(--color-bg-soft) text-(--color-text-primary)">
				<Header />
				<main className="mx-auto min-h-screen w-full max-w-[1680px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
					<Outlet />
				</main>
				<Footer />
			</div>
		</VolunteerInviteProvider>
	);
};
