import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as firebaseServiceAccount from 'src/auth/firebaseServiceAccount.json';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix('/api/v1');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const adminConfig: ServiceAccount = {
    projectId: firebaseServiceAccount.project_id,
    privateKey: firebaseServiceAccount.private_key,
    clientEmail: firebaseServiceAccount.client_email,
  };
  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
