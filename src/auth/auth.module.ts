import { Module } from '@nestjs/common';
import { FirebaseGuard } from './firebase.guard';

@Module({
  imports: [],
  providers: [FirebaseGuard],
  exports: [FirebaseGuard],
})
export class AuthModule {}
