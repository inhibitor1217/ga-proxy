import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import Koa from 'koa';
import Router from '@koa/router';
import serverless from 'serverless-http';

if (process.env.APP_ENV === 'local') {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

function getConfig() {
    if (process.env.APP_ENV === 'local') {
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, process.env.CONFIG_FILE || 'config.json')));
    }
    else {
        return {
            ga_track_id: process.env.GA_TRACK_ID
        };
    }
}

const config = getConfig();

config.protocol_version = 1;
config.data_source = 'web';

console.log(config);

const app = new Koa();
const routes = new Router();

routes.get('/', (ctx) => {

    console.log(ctx.request.query);
    console.log(ctx.request.ip);

    ctx.status = 200;
    ctx.body = {
        msg: 'hello'
    };

});

app.use(routes.routes()).use(routes.allowedMethods());

if (process.env.APP_ENV === 'local') {
    app.listen(process.env.PORT, () => {
        console.log(`${process.env.APP_NAME} server listening from port ${process.env.PORT}`);
    });
}

export const handler = serverless(app);
