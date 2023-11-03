import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseGuard } from 'src/auth/firebase.guard';
import { PostService } from './post.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { TransformInterceptor } from 'src/decorator/transform.decorator';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/wp/userPosts')
  @UseGuards(FirebaseGuard)
  async userPostsWp(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.postService.userPosts(user.uid);
  }

  @Post('/wp/post')
  @UseGuards(FirebaseGuard)
  async createPostWp(
    @CurrentUser() user: DecodedIdToken,
    @Body() body: any,
  ): Promise<any> {
    return this.postService.createPostWp(user.uid, body);
  }

  @Get('/wp/posts')
  async postsWp(): Promise<any> {
    return this.postService.postsWp();
  }

  @Get('/wp/posts/:id')
  async getPostByIdWp(@Param('id') id): Promise<any> {
    return this.postService.getPostByIdWp(id);
  }

  @Delete('/wp/posts/:id')
  @UseGuards(FirebaseGuard)
  async deletePostByIdWp(
    @CurrentUser() user: DecodedIdToken,
    @Param('id') id,
  ): Promise<any> {
    return this.postService.deletePostByIdWp(id, user.uid);
  }

  @Put('/wp/posts/:id')
  @UseGuards(FirebaseGuard)
  async updatePostByIdWp(
    @CurrentUser() user: DecodedIdToken,
    @Param('id') id,
    @Body() body: any,
  ): Promise<any> {
    return this.postService.updatePostByIdWp(id, user.uid, body);
  }

  @Get('/posts')
  @UseInterceptors(TransformInterceptor)
  async posts(@Query() query): Promise<any> {
    const { idLt = '', limit = 10, target = 'global' } = query;
    return this.postService.posts(idLt, limit, target);
  }

  @Get('/posts/:target')
  @UseInterceptors(TransformInterceptor)
  async postsByTarget(@Param('target') target, @Query() query): Promise<any> {
    const { idLt = '', limit = 10 } = query;
    return this.postService.postsByTarget(idLt, limit, target);
  }

  @Post('/post')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async createPost(
    @CurrentUser() user: DecodedIdToken,
    @Body() body: any,
  ): Promise<any> {
    return this.postService.createPosts(user.uid, body);
  }

  @Post('/postImage')
  @UseInterceptors(FileInterceptor('filename'))
  @UseInterceptors(TransformInterceptor)
  @UseGuards(FirebaseGuard)
  async imagePost(
    @CurrentUser() user: DecodedIdToken,
    @UploadedFile() file,
  ): Promise<any> {
    return this.postService.createImagePost(file, user);
  }

  @Delete('/deleteFile')
  @UseInterceptors(TransformInterceptor)
  async deleteImage(): Promise<any> {
    return this.postService.deleteImage();
  }

  @Post('/post/like/:id')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async likePost(
    @Param('id') id,
    @CurrentUser() user: DecodedIdToken,
  ): Promise<any> {
    return this.postService.likePost(id, user);
  }

  @Get('/post/like/:id')
  @UseInterceptors(TransformInterceptor)
  async getLikePost(@Param('id') id): Promise<any> {
    return this.postService.getLikePost(id);
  }

  @Get('/post/comment/:id')
  @UseInterceptors(TransformInterceptor)
  async getCommentPost(@Param('id') id): Promise<any> {
    return this.postService.getCommentPost(id);
  }

  @Post('/post/comment/:id')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async commentPost(
    @CurrentUser() user: DecodedIdToken,
    @Body() body: any,
    @Param('id') id,
  ): Promise<any> {
    return this.postService.commentPost(id, user.uid, body);
  }

  @Get('/userPosts')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async userPosts(
    @CurrentUser() user: DecodedIdToken,
    @Query() query,
  ): Promise<any> {
    const { idLt = '', limit = 10 } = query;
    return this.postService.userPosts(user.uid, idLt, limit);
  }

  @Get('/userPosts/:id')
  @UseInterceptors(TransformInterceptor)
  async userPostsById(@Query() query, @Param('id') id): Promise<any> {
    const { idLt = '', limit = 10 } = query;
    return this.postService.userPosts(id, idLt, limit);
  }

  @Get('/followingPosts')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async followingPosts(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.postService.followingPosts(user.uid);
  }

  @Delete('/posts/:id')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async deletePostById(
    @CurrentUser() user: DecodedIdToken,
    @Param('id') id,
  ): Promise<any> {
    return this.postService.deletePostById(id, user.uid);
  }

  @Post('/post/follow')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async followPost(
    @Body() body: { targetUserId: string },
    @CurrentUser() user: DecodedIdToken,
  ): Promise<any> {
    return this.postService.follow(user.uid, body.targetUserId);
  }

  @Post('/post/unFollow')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async unFollowPost(
    @Body() body: { targetUserId: string },
    @CurrentUser() user: DecodedIdToken,
  ): Promise<any> {
    return this.postService.unFollow(user.uid, body.targetUserId);
  }

  @Get('/userFollowerFeed')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async userFollowerFeed(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.postService.userFollowerFeed(user.uid);
  }

  @Get('/userFollowingFeed')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async userFollowingFeed(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.postService.userFollowingFeed(user.uid);
  }

  @Post('/post/share/:id')
  @UseGuards(FirebaseGuard)
  @UseInterceptors(TransformInterceptor)
  async sharePost(
    @Param('id') id,
    @Body() body: any,
    @CurrentUser() user: DecodedIdToken,
  ): Promise<any> {
    return this.postService.sharePost(id, body, user.uid);
  }
}
