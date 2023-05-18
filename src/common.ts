import express from 'express';
import url from 'url';
import axios, { AxiosRequestConfig } from 'axios';
import * as querystring from 'querystring';
import dotenv from 'dotenv';
import { Env } from './types/Env';

dotenv.config()
const env: Env = {
  CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN || '',
  API_KEY: process.env.API_KEY || '',
  API_BASE_URL: process.env.API_BASE_URL || '',
  API_KEY_INSERTION_METHOD: (process.env.API_KEY_INSERTION_METHOD || 'query') as 'query' | 'header' | 'basic_auth',
  API_KEY_HEADER_KEY: process.env.API_KEY_HEADER_KEY || '',
  API_KEY_QUERY_PARAM: process.env.API_KEY_QUERY_PARAM || '',
};

// Make the common proxy request logic a separate function
export const proxyRequest = (app: express.Application, path: string, baseUrl: string) => {
  app.all(path, async (req, res) => {
    // Replace service path if it exists
    console.log('path', path, req.path.replace(path, ''))
    const pathReplace = path.replace('*', '')
    let servicePath = path === '*' ? req.path : req.path.replace(pathReplace, '');
    const query = req.query as querystring.ParsedUrlQueryInput;
    let queryString = '';
    if (query) {
      queryString = querystring.stringify(query);
    }
    const urlString = `${baseUrl}${servicePath}${queryString ? `?${queryString}` : ''}`;
    const { host } = url.parse(baseUrl);
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
};