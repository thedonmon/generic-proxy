export interface Env {
    CORS_ALLOW_ORIGIN: string;
    API_KEY: string;
    API_BASE_URL: string;
    API_KEY_INSERTION_METHOD: 'query' | 'header' | 'basic_auth';
  }