import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { GetStreamModule } from 'src/getstream/getstream.module';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [HttpModule, GetStreamModule, SearchModule],
  providers: [UserController, UserService],
  exports: [UserService, UserController],
})
export class UserModule {}
