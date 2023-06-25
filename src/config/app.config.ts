import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import { IsEnum, IsInt, IsOptional, IsUrl, Max, Min } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3000,
    wpApiUrl: process.env.WP_API_URL,
    wpApiToken: process.env.WP_API_TOKEN,
    getStreamAppUrl: process.env.GETSTREAM_APP_URL,
    getStreamAppId: process.env.GETSTREAM_APP_ID,
    getStreamApiKey: process.env.GETSTREAM_API_KEY,
    getStreamApiSecret: process.env.GETSTREAM_API_SECRET,
  };
});
