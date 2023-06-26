import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import appConfig from 'src/config/app.config';
import { AppConfig } from 'src/config/config.type';
import { SearchController } from './search.controller';

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
  ],
  providers: [SearchService, SearchController, ElasticsearchModule],
  exports: [SearchService, SearchController],
})
export class SearchModule {}
