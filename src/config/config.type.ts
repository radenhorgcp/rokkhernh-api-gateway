export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  port: number;
  wpApiUrl: string;
  wpApiToken: string;
  getStreamAppUrl: string;
  getStreamAppId: string;
  getStreamApiKey: string;
  getStreamApiSecret: string;
  elasticSearchNode: string;
  elasticSearchIndex: string;
};

export type AuthConfig = {
  secret?: string;
  expires?: string;
};

export type AllConfigType = {
  app: AppConfig;
};
