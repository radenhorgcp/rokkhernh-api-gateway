import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseGuard } from 'src/auth/firebase.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/register')
  async register(@Body() body: any): Promise<any> {
    return this.userService.registerUser(body);
  }

  @Get('/me')
  @UseGuards(FirebaseGuard)
  async me(@CurrentUser() user: DecodedIdToken): Promise<any> {
    return this.userService.me(Number(user.uid));
  }

  @Get('/fakeToken')
  async fakeToken(): Promise<any> {
    return this.userService.fakeToken();
  }
}
