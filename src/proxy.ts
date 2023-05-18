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

app.all('*', async (req, res) => {
  const query = req.query as querystring.ParsedUrlQueryInput;
  let queryString = '';
  if (query) {
    queryString = querystring.stringify(query);
  }
  const urlString = `${env.API_BASE_URL}${req.path}${req.query ? `?${queryString}` : ''}`;
  const { host } = url.parse(env.API_BASE_URL);
  console.log(`Proxying request to ${urlString}`)

  const requestOptions: AxiosRequestConfig = {
    method: req.method as any,
    headers: {
      ...req.headers,
      'Content-Type': 'application/json',
      'Host': host
    },
    data: req.body,
  };

  let queryParamKey = env.API_KEY_QUERY_PARAM || 'api-key';
  let headerKey = env.API_KEY_HEADER_KEY || 'X-API-Key';

  if (env.API_KEY_INSERTION_METHOD === 'query') {
    requestOptions.params = requestOptions.params || {}; // Ensure params exist
    requestOptions.params = {
      ...requestOptions.params,
      [queryParamKey]: env.API_KEY, //use computed property name
    };
  } else if (env.API_KEY_INSERTION_METHOD === 'header') {
    requestOptions.headers = requestOptions.headers || {}; // Ensure headers exist
    requestOptions.headers = {
      ...requestOptions.headers,
      [headerKey]: env.API_KEY, //use computed property name
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
