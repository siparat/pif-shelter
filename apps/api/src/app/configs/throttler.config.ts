import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const getThrottlerConfig = (): ThrottlerModuleOptions => [
	{
		name: 'short',
		ttl: 1000,
		limit: 10
	},
	{
		name: 'medium',
		ttl: 60000,
		limit: 300
	},
	{
		name: 'long',
		ttl: 3600000,
		limit: 2000
	}
];
