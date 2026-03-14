import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsModule } from '../animals/animals.module';
import { CreatePostHandler } from './commands/create-post/create-post.handler';
import { CanCreatePostPolicy } from './commands/create-post/can-create-post.policy';
import { PostCreatedHandler } from './events/post-created/post-created.handler';
import { PostsController } from './posts.controller';
import { DrizzlePostsRepository } from './repositories/drizzle-posts.repository';
import { PostsRepository } from './repositories/posts.repository';

@Module({
	imports: [CqrsModule, AnimalsModule],
	controllers: [PostsController],
	providers: [
		CanCreatePostPolicy,
		CreatePostHandler,
		PostCreatedHandler,
		{
			provide: PostsRepository,
			useClass: DrizzlePostsRepository
		}
	]
})
export class PostsModule {}
