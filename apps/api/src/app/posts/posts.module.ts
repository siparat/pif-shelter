import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { POSTS_QUEUE_NAME } from '@pif/shared';
import { AnimalsModule } from '../animals/animals.module';
import { CanCreatePostPolicy } from './commands/create-post/can-create-post.policy';
import { CreatePostHandler } from './commands/create-post/create-post.handler';
import { DeletePostHandler } from './commands/delete-post/delete-post.handler';
import { SetPostReactionHandler } from './commands/set-post-reaction/set-post-reaction.handler';
import { UpdatePostHandler } from './commands/update-post/update-post.handler';
import { PostCreatedHandler } from './events/post-created/post-created.handler';
import { SendAnimalNewPostTelegramHandler } from './events/post-created/send-animal-new-post-telegram.handler';
import { PostDeletedHandler } from './events/post-deleted/post-deleted.handler';
import { PostReactionSetHandler } from './events/post-reaction-set/post-reaction-set.handler';
import { PostUpdatedHandler } from './events/post-updated/post-updated.handler';
import { CanEditPostPolicy } from './policies/can-edit-post.policy';
import { CanViewPostPolicy } from './policies/can-view-post.policy';
import { PostsController } from './posts.controller';
import { PostsProcessor } from './posts.processor';
import { GetPostQueryHandler } from './queries/get-post/get-post.handler';
import { ListPostsHandler } from './queries/list-posts/list-posts.handler';
import { DrizzlePostReactionsRepository } from './repositories/drizzle-post-reactions.repository';
import { DrizzlePostsRepository } from './repositories/drizzle-posts.repository';
import { PostReactionsRepository } from './repositories/post-reactions.repository';
import { PostsRepository } from './repositories/posts.repository';

@Module({
	imports: [
		BullModule.registerQueue({
			name: POSTS_QUEUE_NAME,
			defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 10000, jitter: 0.5 } }
		}),
		CqrsModule,
		AnimalsModule
	],
	controllers: [PostsController],
	providers: [
		CanCreatePostPolicy,
		CanEditPostPolicy,
		CanViewPostPolicy,
		CreatePostHandler,
		UpdatePostHandler,
		DeletePostHandler,
		SetPostReactionHandler,
		GetPostQueryHandler,
		ListPostsHandler,
		PostCreatedHandler,
		SendAnimalNewPostTelegramHandler,
		PostUpdatedHandler,
		PostDeletedHandler,
		PostReactionSetHandler,
		PostsProcessor,
		{
			provide: PostsRepository,
			useClass: DrizzlePostsRepository
		},
		{
			provide: PostReactionsRepository,
			useClass: DrizzlePostReactionsRepository
		}
	]
})
export class PostsModule {}
