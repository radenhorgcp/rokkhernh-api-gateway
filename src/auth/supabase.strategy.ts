import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import appConfig from '../config/app.config';
import { AppConfig } from 'src/config/config.type';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  public constructor() {
    super({
      supabaseUrl: (appConfig() as AppConfig).supabaseUrl,
      supabaseKey: (appConfig() as AppConfig).supabaseKey,
      supabaseOptions: {},
      supabaseJwtSecret: (appConfig() as AppConfig).supabaseJwtSecret,
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<any> {
    super.validate(payload);
  }

  authenticate(req) {
    super.authenticate(req);
  }
}
