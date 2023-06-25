import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseGuard } from 'src/auth/firebase.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { TransformInterceptor } from 'src/decorator/transform.decorator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/wp/register')
  async registerWp(@Body() body: any): Promise<any> {
    return this.userService.registerUserWp(body);
  }

  @Get('/wp/me')
  @UseGuards(FirebaseGuard)
  async meWp(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.userService.meWp(Number(user.uid));
  }

  @Get('/fakeToken/:id')
  @UseInterceptors(TransformInterceptor)
  async fakeToken(@Param('id') id): Promise<any> {
    return this.userService.fakeToken(id);
  }

  @Post('/register')
  @UseInterceptors(TransformInterceptor)
  async register(@Body() body: CreateUserDto): Promise<any> {
    return this.userService.registerUser(body);
  }

  @Get('/me')
  @UseInterceptors(TransformInterceptor)
  @UseGuards(FirebaseGuard)
  async meV2(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.userService.me(user.uid);
  }
}
