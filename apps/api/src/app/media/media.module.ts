import { Module } from '@nestjs/common';
import { GetUploadUrlHandler } from './queries/get-upload-url/get-upload-url.handler';
import { MediaController } from './media.controller';

@Module({
	controllers: [MediaController],
	providers: [GetUploadUrlHandler]
})
export class MediaModule {}
