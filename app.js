const Koa = require("koa");
const router = require("./router");
const respond = require("koa-respond");
const koaBody = require("koa-body");
const cors = require('@koa/cors');

const app = new Koa();


app.use(koaBody());

app.use(respond());

app.use(cors());

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
