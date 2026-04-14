import ky from 'ky';
import { API_URL } from '../config';

export const api = ky.create({
	prefix: API_URL,
	credentials: 'include',
	hooks: {
		beforeRequest: [
			(req) => {
				const token = localStorage.getItem('token');
				if (token) {
					req.request.headers.set('Authorization', `Bearer ${token}`);
				}
			}
		],
		afterResponse: [
			async ({ response }) => {
				if (response.status === 401) {
					localStorage.removeItem('token');
					if (window.location.pathname !== '/login') {
						window.location.href = '/login';
					}
				}
			}
		]
	}
});
