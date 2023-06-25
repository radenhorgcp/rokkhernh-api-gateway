import { Module } from '@nestjs/common';
import { FirebaseGuard } from './firebase.guard';
import { GetStreamModule } from 'src/getstream/getstream.module';

@Module({
  imports: [GetStreamModule],
  providers: [FirebaseGuard],
  exports: [FirebaseGuard],
})
export class AuthModule {}
