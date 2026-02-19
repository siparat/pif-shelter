import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService, invitations, relations, schema } from '@pif/database';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Logger } from 'nestjs-pino';
import * as path from 'path';
import { Pool } from 'pg';
import { UsersService } from '../../../../users/users.service';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { DrizzleAdminUsersRepository } from '../../repositories/drizzle-admin-users.repository';
import { CreateInvitationCommand } from './create-invitation.command';
import { CreateInvitationHandler } from './create-invitation.handler';

describe('CreateInvitationHandler (Integration)', () => {
	let container: StartedPostgreSqlContainer;
	let handler: CreateInvitationHandler;
	let dbService: DatabaseService;
	let pool: Pool;
	let usersService: UsersService;

	beforeAll(async () => {
		container = await new PostgreSqlContainer('postgres:17-alpine').start();
		pool = new Pool({ connectionString: container.getConnectionUri() });
		const db = drizzle({ schema, relations, client: pool });

		await migrate(db, {
			migrationsFolder: path.join(__dirname, '../../../../../../../../migrations')
		});

		dbService = new DatabaseService(db);
		usersService = createMock<UsersService>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateInvitationHandler,
				{ provide: AdminUsersRepository, useValue: new DrizzleAdminUsersRepository(dbService) },
				{ provide: UsersService, useValue: usersService },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<CreateInvitationHandler>(CreateInvitationHandler);
	}, 60000);

	afterAll(async () => {
		await pool.end();
		await container.stop();
	});

	it('should successfully create an invitation and store it in the database', async () => {
		const email = 'new-volunteer@pif.xyz';
		const command = new CreateInvitationCommand({
			email,
			name: 'John Doe',
			roleName: 'Volunteer'
		});

		(usersService.findByEmail as jest.Mock).mockResolvedValue(null);

		const result = await handler.execute(command);

		expect(result).toBeDefined();
		expect(result.invitationId).toBeDefined();

		const dbRecord = await dbService.client.select().from(invitations).where(eq(invitations.email, email)).limit(1);

		expect(dbRecord).toHaveLength(1);
		expect(dbRecord[0].personName).toBe('John Doe');
		expect(dbRecord[0].used).toBe(false);
	});

	it('should invalidate old invitations when a new one is created for the same email', async () => {
		const email = 'duplicate@pif.xyz';
		const command = new CreateInvitationCommand({
			email,
			name: 'Duplicate Test',
			roleName: 'Volunteer'
		});

		(usersService.findByEmail as jest.Mock).mockResolvedValue(null);

		const firstResult = await handler.execute(command);
		const secondResult = await handler.execute(command);

		const records = await dbService.client.select().from(invitations).where(eq(invitations.email, email));

		expect(records).toHaveLength(2);

		const firstRecord = records.find((r) => r.id === firstResult.invitationId);
		const secondRecord = records.find((r) => r.id === secondResult.invitationId);

		expect(firstRecord?.deletedAt).not.toBeNull();
		expect(secondRecord?.deletedAt).toBeNull();
	});
});
