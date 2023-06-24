import { Module } from '@nestjs/common';
import { GetStreamService } from './getstream.service';

@Module({
  imports: [],
  providers: [GetStreamService],
  exports: [GetStreamService],
})
export class GetStreamModule {}
