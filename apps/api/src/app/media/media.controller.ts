import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUploadUrlRequestDto, GetUploadUrlResponseDto, ReturnDto } from '@pif/contracts';
import { GetUploadUrlQuery } from './queries/get-upload-url/get-upload-url.query';

@ApiTags('Media | Медиа-файлы')
@Controller('media')
export class MediaController {
	constructor(private readonly queryBus: QueryBus) {}

	@ApiOperation({ summary: 'Получить данные для прямой загрузки файла в S3' })
	@ApiOkResponse({ type: GetUploadUrlResponseDto })
	@Get('upload-url')
	async getUploadUrl(@Query() dto: GetUploadUrlRequestDto): Promise<ReturnDto<typeof GetUploadUrlResponseDto>> {
		return this.queryBus.execute(new GetUploadUrlQuery(dto));
	}
}
