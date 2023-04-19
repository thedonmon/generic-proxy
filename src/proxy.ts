import express from 'express';
import cors from 'cors';
import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import { Env } from './types/Env';

dotenv.config();

const env: Env = {
  CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN || '',
  API_KEY: process.env.API_KEY || '',
  API_BASE_URL: process.env.API_BASE_URL || '',
  API_KEY_INSERTION_METHOD: (process.env.API_KEY_INSERTION_METHOD || 'query') as 'query' | 'header' | 'basic_auth',
};

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.all('*', async (req, res) => {
  const url = `${env.API_BASE_URL}${req.path}`;

  const requestOptions: AxiosRequestConfig = {
    method: req.method as any,
    headers: {
      ...req.headers,
      'Content-Type': 'application/json',
    },
    data: req.body,
  };

  if (env.API_KEY_INSERTION_METHOD === 'query') {
    requestOptions.params = {
      ...req.query,
      'api-key': env.API_KEY, //change to your format eg. apiKey
    };
  } else if (env.API_KEY_INSERTION_METHOD === 'header') {
    requestOptions.headers = {
        ...requestOptions.headers,
        'X-API-Key': env.API_KEY, //change to your format eg. X-Api-Secret
    }
  } else if (env.API_KEY_INSERTION_METHOD === 'basic_auth') {
    requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Basic ${Buffer.from(`:${env.API_KEY}`).toString('base64')}`,
    }
  }

  try {
    const response = await axios(url, requestOptions);
    res.status(response.status).send(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // The request was made, and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).send(error.response.data);
    } else {
      // Something went wrong while making the request
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
