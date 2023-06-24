import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { GetStreamModule } from 'src/getstream/getstream.module';
@Module({
  imports: [HttpModule, GetStreamModule],
  providers: [PostController, PostService],
  exports: [PostService, PostController],
})
export class PostModule {}
