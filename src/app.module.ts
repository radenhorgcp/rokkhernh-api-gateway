import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { HttpModule } from '@nestjs/axios';
import { AppConfig } from 'src/config/config.type';
import { UserService } from './user/user.service';
import { PostService } from './post/post.service';
import { PostController } from './post/post.controller';
import { PostModule } from './post/post.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require('https');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    HttpModule.registerAsync({
      imports: [],
      useFactory: async () => ({
        baseURL: (appConfig() as AppConfig).wpApiUrl,
        headers: {
          Authorization: 'Basic ' + (appConfig() as AppConfig).wpApiToken,
        },
        timeout: 7000,
        maxRedirects: 5,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }),
      inject: [],
    }),
    AuthModule,
    UserModule,
    PostModule,
  ],
  controllers: [AppController, UserController, PostController],
  providers: [AppService, UserService, PostService],
})
export class AppModule {}
