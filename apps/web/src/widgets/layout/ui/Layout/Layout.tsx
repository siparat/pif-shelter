import { JSX, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { Footer } from '../../../footer';
import { Header } from '../Header/Header';

export const Layout = (): JSX.Element => {
	useEffect(() => {
		const storageKey = 'web-first-visit-disclaimer-shown';
		const isShown = window.localStorage.getItem(storageKey);
		if (isShown) {
			return;
		}

		toast(
			'Демо-режим: сайт выполнен как дипломный проект, не является официальным и не работает как реальный сервис. Данные сгенерированы, животных не существует, платежи моковые и автоматически отмечаются оплаченными.'
		);
		window.localStorage.setItem(storageKey, '1');
	}, []);

	return (
		<div className="flex min-h-screen flex-col bg-(--color-bg-soft) text-(--color-text-primary)">
			<Header />
			<main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-8">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};
