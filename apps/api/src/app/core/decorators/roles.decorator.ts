import { Reflector } from '@nestjs/core';
import { UserRole } from '@pif/shared';

export const Roles = Reflector.createDecorator<UserRole[]>();
