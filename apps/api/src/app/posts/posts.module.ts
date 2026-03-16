import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsModule } from '../animals/animals.module';
import { CreatePostHandler } from './commands/create-post/create-post.handler';
import { CanCreatePostPolicy } from './commands/create-post/can-create-post.policy';
import { DeletePostHandler } from './commands/delete-post/delete-post.handler';
import { UpdatePostHandler } from './commands/update-post/update-post.handler';
import { PostCreatedHandler } from './events/post-created/post-created.handler';
import { PostDeletedHandler } from './events/post-deleted/post-deleted.handler';
import { PostUpdatedHandler } from './events/post-updated/post-updated.handler';
import { CanEditPostPolicy } from './policies/can-edit-post.policy';
import { CanViewPostPolicy } from './policies/can-view-post.policy';
import { PostsController } from './posts.controller';
import { GetPostQueryHandler } from './queries/get-post/get-post.handler';
import { ListPostsHandler } from './queries/list-posts/list-posts.handler';
import { DrizzlePostsRepository } from './repositories/drizzle-posts.repository';
import { PostsRepository } from './repositories/posts.repository';

@Module({
	imports: [CqrsModule, AnimalsModule],
	controllers: [PostsController],
	providers: [
		CanCreatePostPolicy,
		CanEditPostPolicy,
		CanViewPostPolicy,
		CreatePostHandler,
		UpdatePostHandler,
		DeletePostHandler,
		GetPostQueryHandler,
		ListPostsHandler,
		PostCreatedHandler,
		PostUpdatedHandler,
		PostDeletedHandler,
		{
			provide: PostsRepository,
			useClass: DrizzlePostsRepository
		}
	]
})
export class PostsModule {}
