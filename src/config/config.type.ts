export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  backendDomain: string;
  port: number;
  supabaseUrl: string;
  supabaseJwtSecret: string;
  supabaseKey: string;
};

export type AuthConfig = {
  secret?: string;
  expires?: string;
};
