/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: '../../node_modules/.vite/apps/web',
	server: {
		port: 5173,
		host: 'localhost'
	},
	preview: {
		port: 5173,
		host: 'localhost'
	},
	plugins: [react(), svgr(), tailwindcss(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
	build: {
		outDir: '../../dist/apps/web',
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true
		}
	}
}));
