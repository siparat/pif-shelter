/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: '../../node_modules/.vite/apps/admin',
	server: {
		port: 4200,
		host: 'localhost'
	},
	preview: {
		port: 4200,
		host: 'localhost'
	},
	plugins: [
		react(),
		svgr(),
		tailwindcss(),
		nxViteTsPaths(),
		nxCopyAssetsPlugin(['*.md']),
		VitePWA({
			registerType: 'prompt',
			includeAssets: ['favicon.svg'],
			manifest: {
				id: '/',
				name: 'Админ панель ПИФ',
				short_name: 'Приют ПИФ',
				description:
					'Админ-панель приюта ПИФ для управления животными, пользователями, встречами и опекунством.',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#0f0e0d',
				theme_color: '#4F3D38',
				lang: 'ru',
				icons: [
					{
						src: '/favicon.svg',
						sizes: '192x192',
						type: 'image/svg+xml',
						purpose: 'any'
					},
					{
						src: '/favicon.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'any'
					},
					{
						src: '/favicon.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				navigateFallback: '/index.html',
				globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
				runtimeCaching: [
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
						handler: 'NetworkOnly'
					}
				]
			},
			devOptions: {
				enabled: false
			}
		})
	],
	build: {
		outDir: '../../dist/apps/admin',
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true
		}
	}
}));
