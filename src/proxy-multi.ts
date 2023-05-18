import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { proxyRequest } from './common';
import services from './config/services.json';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
let corsOptions = {
    origin: process.env.CORS_ALLOW_ORIGIN || "*", // default to allow all
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
for (const [service, baseUrl] of Object.entries(services)) {
    if (!baseUrl) {
        console.error(`Base URL for service ${service} not defined`);
        continue;
    }
    proxyRequest(app, `/${service}*`, baseUrl);
}

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
