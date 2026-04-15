import { Query } from '@nestjs/cqrs';
import { ReturnData, ListVolunteersResponseDto } from '../../../../core/dto';

export class ListVolunteersQuery extends Query<ReturnData<typeof ListVolunteersResponseDto>> {}
