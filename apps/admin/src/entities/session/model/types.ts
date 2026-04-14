export enum UserRole {
	ADMIN = 'ADMIN',
	VOLUNTEER = 'VOLUNTEER',
	SENIOR_VOLUNTEER = 'SENIOR_VOLUNTEER'
}

export interface IUser {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	telegram: string;
}

export interface ISession {
	user: IUser;
	expiresAt: string;
}
