import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [HttpModule],
  providers: [PostController, PostService],
  exports: [PostService, PostController],
})
export class PostModule {}
