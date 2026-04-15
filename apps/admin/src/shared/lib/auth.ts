export const clearAuthState = (): void => {
	localStorage.removeItem('token');
};
