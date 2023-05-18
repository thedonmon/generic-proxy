import express from 'express';
import cors from 'cors';
import url from 'url';
import axios, { AxiosRequestConfig } from 'axios';
import * as querystring from 'querystring';
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
  const query = req.query as querystring.ParsedUrlQueryInput;
  let queryString = '';
  if (query) {
    queryString = querystring.stringify(query);
  }
  const urlString = `${env.API_BASE_URL}${req.path}${req.query ? `?${queryString}` : ''}`;
  const { host } = url.parse(env.API_BASE_URL);
  console.log(`Proxying request to ${url}`, req.method, req.body, req.query)

  const requestOptions: AxiosRequestConfig = {
    method: req.method as any,
    headers: {
      ...req.headers,
      'Content-Type': 'application/json',
      'Host': host
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
    const response = await axios(urlString, requestOptions);
    res.status(response.status).send(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // The request was made, and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response);
      res.status(error.response.status).send(error.response.data);
    } else {
      // Something went wrong while making the request
      console.log(error);
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
