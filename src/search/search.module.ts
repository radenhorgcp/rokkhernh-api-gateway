import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import appConfig from 'src/config/app.config';
import { AppConfig } from 'src/config/config.type';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { FirebaseGuard } from 'src/auth/firebase.guard';
import { GetStreamModule } from 'src/getstream/getstream.module';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [],
      useFactory: async () => ({
        node: (appConfig() as AppConfig).elasticSearchNode,
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        auth: {
          username: 'rokkhernhdev',
          password: 'rokkhernhdev',
        },
      }),
    }),
    HttpModule,
    GetStreamModule,
  ],
  providers: [SearchService, SearchController, ElasticsearchModule],
  exports: [SearchService, SearchController],
})
export class SearchModule {}
