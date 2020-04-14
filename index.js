import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import Koa from 'koa';
import Router from '@koa/router';
import axios from 'axios';
import uuid from 'uuid';
import serverless from 'serverless-http';

if (process.env.APP_ENV === 'local') {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

function getConfig() {
    if (process.env.APP_ENV === 'local') {
        const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.CONFIG_FILE || 'config.json')));
        return { tid: config.ga_track_id };
    }
    else {
        return {
            tid: process.env.GA_TRACK_ID
        };
    }
}

const config = {
    ...getConfig(),
    v: 1,
    ds: 'web'
};

const GOOGLE_ANALYTICS_URL = 'https://www.google-analytics.com/collect';

const app = new Koa();
const routes = new Router();

function buildQueryString(query) {
    return Object.keys(query)
        .filter(key => !!query[key])
        .map(key => `${key}=${query[key]}`)
        .join('&');
}

routes.get('/', async (ctx) => {

    const { t, dh, dp, dt, ec, ea, el, ev } = ctx.request.query;
    const userQuery = { t, dh, dp, dt, ec, ea, el, ev };

    const session = {
        cid: '850aaf48-42bb-498e-97df-09e31b56d59c'
    };
 
    const query = {
        ...config,
        ...session,
        ...userQuery
    };

    const queryString = buildQueryString(query);
    console.log(query, queryString);

    await axios.post(
        GOOGLE_ANALYTICS_URL,
        queryString
    )
    .then(response => {
        ctx.status = 200;
    })
    .catch(e => {
        ctx.status = 400;
    });

});

app.use(routes.routes()).use(routes.allowedMethods());

if (process.env.APP_ENV === 'local') {
    app.listen(process.env.PORT, () => {
        console.log(`${process.env.APP_NAME} server listening from port ${process.env.PORT}`);
    });
}

export const handler = serverless(app);
