import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import Koa from 'koa';
import Router from '@koa/router';
import axios from 'axios';
import { v4 } from 'uuid';
import serverless from 'serverless-http';

if (process.env.APP_ENV === 'local') {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

function getConfig() {
    if (process.env.APP_ENV === 'local'
        || process.env.APP_ENV === 'docker') {
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
const CID_COOKIE = '__GA_CID__';

const beacon = Buffer.alloc(
    68,
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=",
    "base64"
); // an empty image

const app = new Koa();
const routes = new Router();

function buildQueryString(query) {
    return Object.keys(query)
        .filter(key => !!query[key])
        .map(key => `${key}=${query[key]}`)
        .join('&');
}

routes.get('/', async (ctx) => {

    const { type, page, title, ecategory, eaction, elabel, evalue } = ctx.request.query;
    const userQuery = {
        t: type, 
        dp: page, 
        dt: title, 
        ec: ecategory, 
        ea: eaction, 
        el: elabel, 
        ev: evalue
    };

    const session = {
        cid: ctx.cookies.get(CID_COOKIE)
    };

    if (!session.cid) {
        session.cid = v4();
        session.sc = 'start';
        ctx.cookies.set(CID_COOKIE, session.cid, {
            httpOnly: true,
            maxAge: 4 * 60 * 60 * 1000, // expires in 4h
            domain: process.env.DOMAIN
        });
    }
 
    const query = {
        ...config,
        ...session,
        ...userQuery
    };

    const queryString = buildQueryString(query);

    await axios.post(
        GOOGLE_ANALYTICS_URL,
        queryString
    );

    ctx.status = 200;
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // to invoke request every time
    ctx.set('Content-Type', 'image/png');
    ctx.body = beacon;

});

routes.head('/', async (ctx) => {
    ctx.status = 200;
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // to invoke request every time
    ctx.set('Content-Type', 'image/png');
    ctx.body = beacon;
});

app.use(routes.routes()).use(routes.allowedMethods());

if (process.env.APP_ENV === 'local' 
    || process.env.APP_ENV === 'docker') {
    app.listen(process.env.PORT, () => {
        console.log(`${process.env.APP_NAME} server listening from port ${process.env.PORT}`);
    });
}

const serverlessApp = serverless(app, { binary: ['image/*'] });
export const handler = async (event, context) => {
    const response = serverlessApp(event, context);
    return Object.assign(response, { isBase64Encoded: true });
};
