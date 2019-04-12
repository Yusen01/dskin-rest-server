const jwt = require("jsonwebtoken");
const config = require("../config/config");
const secret1 = config.dev.secrets[0];

class JwtValidator {
    
    static sign(o) {
        return jwt.sign(o, secret1);
    }

    static async authorize (ctx, next) {
        const token = ctx.request.header.authorization;
    
        if (token == null) {
            ctx.unauthorized();
            return;
        }
    
        try {
            const decoded = jwt.verify(token, secret1);
            ctx.request.body.uid = decoded.uid;
        } catch (err) {
            ctx.unauthorized();
            return;
        }
    
        await next();
    }

    static async verifyItemInfo(ctx, next) {
        var item = ctx.request.body.item;

        if (item == null) {
            ctx.badRequest();
            return;
        }

        item = JSON.parse(item);
        ctx.request.body.item = item;

        try {
            const decoded = jwt.decode(item.token, secret1);
            ctx.request.body.item.steamid = decoded.steamid;
            ctx.request.body.item.appid = decoded.appid;
            ctx.request.body.item.contextid = decoded.contextid;
            ctx.request.body.item.assetid = decoded.assetid;
        } catch (err) {
            ctx.badRequest();
            return;
        }

        await next();
    }
}

module.exports = JwtValidator;