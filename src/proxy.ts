import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Env } from './types/Env';
import { proxyRequest } from './common';

dotenv.config();

const env: Env = {
  CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN || '',
  API_KEY: process.env.API_KEY || '',
  API_BASE_URL: process.env.API_BASE_URL || '',
  API_KEY_INSERTION_METHOD: (process.env.API_KEY_INSERTION_METHOD || 'query') as 'query' | 'header' | 'basic_auth',
  API_KEY_HEADER_KEY: process.env.API_KEY_HEADER_KEY || '',
  API_KEY_QUERY_PARAM: process.env.API_KEY_QUERY_PARAM || '',
};

const app = express();
const port = process.env.PORT || 3001;
let corsOptions = {
  origin: process.env.CORS_ALLOW_ORIGIN || "*", // default to allow all
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());

proxyRequest(app, '*', env.API_BASE_URL)

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
