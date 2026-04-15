import ky from 'ky';
import { API_URL } from '../config';

export const api = ky.create({
	prefix: API_URL,
	credentials: 'include'
});
