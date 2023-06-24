import { Injectable } from '@nestjs/common';
import * as stream from 'getstream';
import appConfig from 'src/config/app.config';
import { AppConfig } from 'src/config/config.type';

@Injectable()
export class GetStreamService {
  private readonly client = stream.connect(
    (appConfig() as AppConfig).getStreamApiKey,
    (appConfig() as AppConfig).getStreamApiSecret,
    (appConfig() as AppConfig).getStreamAppId,
  );

  getClient(): stream.StreamClient<stream.DefaultGenerics> {
    return this.client;
  }
}
