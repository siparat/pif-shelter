import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { RoleGuard } from '../../core/guards/role.guard';

@ApiTags('Admin Users | Пользователи в админ-панели')
@UseGuards(AuthGuard, RoleGuard)
@Controller('admin/users')
export class AdminUsersController {}
