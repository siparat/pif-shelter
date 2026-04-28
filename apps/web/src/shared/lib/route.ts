export const isRouteActive = (currentPath: string, targetPath: string): boolean => {
	if (targetPath === '/') {
		return currentPath === '/';
	}

	return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};
