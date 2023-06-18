import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseGuard } from 'src/auth/firebase.guard';
import { PostService } from './post.service';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/userPosts')
  @UseGuards(FirebaseGuard)
  async userPosts(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.postService.userPosts(user.uid);
  }

  @Post('/post')
  @UseGuards(FirebaseGuard)
  async createPost(
    @CurrentUser() user: DecodedIdToken,
    @Body() body: any,
  ): Promise<any> {
    return this.postService.createPost(user.uid, body);
  }

  @Get('/posts')
  async posts(): Promise<any> {
    return this.postService.posts();
  }

  @Get('/posts/:id')
  async getPostById(@Param('id') id): Promise<any> {
    return this.postService.getPostById(id);
  }

  @Delete('/posts/:id')
  @UseGuards(FirebaseGuard)
  async deletePostById(
    @CurrentUser() user: DecodedIdToken,
    @Param('id') id,
  ): Promise<any> {
    return this.postService.deletePostById(id, user.uid);
  }

  @Put('/posts/:id')
  @UseGuards(FirebaseGuard)
  async updatePostById(
    @CurrentUser() user: DecodedIdToken,
    @Param('id') id,
    @Body() body: any,
  ): Promise<any> {
    return this.postService.updatePostById(id, user.uid, body);
  }
}
