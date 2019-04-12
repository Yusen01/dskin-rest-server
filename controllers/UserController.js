const UserModel = require("../models/UserModel");
const ItemModel = require("../models/ItemModel");
const JwtValidator = require("../middlewares/JwtValidator");
const uuid = require("uuid/v4");
const config = require("../config/config");

class UserController {

    // 基础信息

    static async register(ctx) {
        const email = ctx.request.body.email;
        const password = ctx.request.body.password;

        if (email == null || password == null) {
            ctx.badRequest({message: "邮箱或密码不能为空"});
            return;
        }

        const reg =  /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (!reg.test(email)) {
            ctx.badRequest({message: "非法的邮箱"});
            return;
        }

        if (await UserModel.getByEmail(email) != null) {
            ctx.badRequest({message: "邮箱已注册"});
            return;
        }
        
        if (password.length != 32) {
            ctx.badRequest({message: "密码未加密"});
            return;
        }

        const newUuid = uuid();
        const uid = await UserModel.add(email, password, newUuid);

        await sendEmail(email, "DSkin邮箱认证", ".....");

        ctx.ok();
    }

    static async active(ctx) {
        const uid = ctx.request.body.uid;
        const uuid = ctx.request.body.uuid;

        const user = await UserModel.getById(uid);

        if (user == null || user.uuid != uuid) {
            ctx.badRequest({message: "uid与uuid不匹配"});
            return;
        }

        await UserModel.active(uid);

        ctx.ok();
    }

    static async login(ctx) {
        const email = ctx.request.body.email;
        const password = ctx.request.body.password;

        if (email == null || password == null) {
            ctx.badRequest({message: "邮箱或密码不能为空"});
            return;
        }

        const user = await UserModel.getByEmail(email);

        if (user == null || user.password != password) {
            ctx.badRequest({message: "邮箱或密码错误"});
            return;
        }

        if (!user.verified) {
            ctx.forbidden({messgae: "邮箱未验证"});
            return;
        }

        ctx.ok({token: JwtValidator.sign({uid: user._id})});
    }

    static async forget(ctx) {
        const email = ctx.request.body.email;

        if (email == null) {
            ctx.badRequest({message: "邮箱不能为空"});
            return;
        }

        const user = UserModel.getByEmail(email);

        if (user == null || !user.verified) {
            ctx.badRequest({message: "用户不存在或未认证"});
            return;
        }

        await UserModel.updateUuid(email, uuid());

        sendEmail(email, "DSkin密码重置", "......");

        ctx.ok();
    }

    static async updatePassword(ctx) {
        const email = ctx.request.body.email;
        const uuid = ctx.request.body.uuid;

        if (email == null) {
            ctx.badRequest({message: "邮箱不能为空"});
            return;
        }

        const user = await UserModel.getByEmail(email);

        if (user == null) {
            ctx.badRequest({message: "用户不存在"});
            return;
        }

        if (user.uuid != uuid) {
            ctx.badRequest({message: "uuid错误"});
            return;
        }
        
        await UserModel.updateUuid(email, uuid());
        await UserModel.updatePassword(email, password);

        ctx.ok();
    }
 
    static async updateNickname(ctx) {
        const uid = ctx.request.body.uid;
        const nickname = ctx.request.body.nickname;

        if (nickname == null) {
            ctx.badRequest({message: "昵称不能为空"});
            return;
        }

        await UserModel.updateNickname(uid, nickname);

        ctx.ok();
    }

    static async updateAvatar(ctx) {
        const uid = ctx.request.body.uid;
        const avatar = ctx.request.body.avatar;

        if (avatar == null) {
            ctx.badRequest({message: "头像不能为空"});
            return;
        }

        await UserModel.updateAvatar(uid, avatar);

        ctx.ok();
    }

    static async getUserBasicInfo(ctx) {
        const uid = ctx.request.body.uid;
        const user = await UserModel.getById(uid);

        ctx.ok({uid: user._id, email: user.email, nickname: user.nickname, avatar: user.avatar});
    }

    static async getUserOpenInfo(ctx) {
        const uid = ctx.request.query.uid;
        const user = await UserModel.getById(uid);

        ctx.ok({uid: user._id, nickname: user.nickname, avatar: user.avatar});
    }

    // Steam信息

    static async bindSteamid(ctx) {
        const uid = ctx.request.body.uid;
        const steamid = ctx.request.body.steamid;

        if (steamid == null) {
            ctx.badRequest({message: "steamid不能为空"});
            return;
        }

        await UserModel.bindSteamid(uid, steamid);

        ctx.ok();
    }

    static async bindTradeUrl(ctx) {
        const uid = ctx.request.body.uid;
        const tradeUrl = ctx.request.body.trade_url;

        if (tradeUrl == null) {
            ctx.badRequest({message: "交易链接不能为空"});
            return;
        }

        await UserModel.bindTradeUrl(uid, tradeUrl);

        ctx.ok();
    }

    static async bindApiKey(ctx) {
        const uid = ctx.request.body.uid;
        const apiKey = ctx.request.body.api_key;

        if (apiKey == null) {
            ctx.badRequest({message: "api key不能为空"});
            return;
        }

        await UserModel.bindApiKey(uid, apiKey);

        ctx.ok();
    }

    static async getUserSteamInfo(ctx) {
        const uid = ctx.request.body.uid;
        const user = await UserModel.getById(uid);

        ctx.ok({steamid: user.steam.steamid, trade_url: user.steam.trade_url, api_key: user.steam.api_key});
    }

    // 支付信息

    static async bindEthereumAccount(ctx) {
        const uid = ctx.request.body.uid;
        const account = ctx.request.body.account;

        if (account == null) {
            ctx.badRequest({message: "以太坊账户不能为空"});
            return;
        }

        await UserModel.bindEthereumAccount(uid, account);

        ctx.ok();
    }

    static async getUserPayInfo(ctx) {
        const uid = ctx.request.body.uid;
        const user = await UserModel.getById(uid);

        ctx.ok({ethereum: {account: user.pay.ethereum.account}});
    }

    // 用户库存

    static async getInventory(ctx) {
        const uid = ctx.request.body.uid;
        const appid = ctx.request.query.appid;
        const contextid = ctx.request.query.contextid;
        const user = await UserModel.getById(uid);
        const steamid = user.steam.steamid;

        if (steamid == null) {
            ctx.forbidden({message: "未绑定steam"});
            return;
        }

        try {
            const items = await loadInventory(appid, contextid, steamid);
            ctx.ok({items: items});
        } catch (err) {
            console.log(err);
            ctx.internalServerError();
        }
    }

    static async getSkinFloatValue(ctx) {
        const link = ctx.request.query.link;

        if (link == null) {
            ctx.badRequest({message: "检视链接不能为空"});
            return;
        }
        
        try {
            const axios = require("axios");
            const response = await axios.get("https://api.csgofloat.com/?url=" + link);
            ctx.ok(response.data);
        } catch (err) {
            console.log(err);
            ctx.internalServerError();
        }
    }
}

async function sendEmail(receiver, subject, content) {
    const mailer = require("nodemailer");

    const transporter = mailer.createTransport({
        host: "smtp.qq.com",
        port: 465,
        secure: true,
        auth: {
            user: config.dev.email.user,
            pass: config.dev.email.password
        }
    });

    const options = {
        from: `DSkin develop team ${config.dev.email.user}`,
        to: receiver,
        subject: subject,
        html: content
    };

    await transporter.sendMail(options);
}

async function loadInventory(appid, contextid, steamid) {
    const url = `https://steamcommunity.com/inventory/${steamid}/${appid}/${contextid}?l=schinese`;
    const axios = require("axios");
    const response = await axios.get(url);

    const assets = response.data.assets;
    const descriptions = response.data.descriptions;
    const items = [];

    if (appid == "730" && contextid == "2") {
        for (var i = 0;i < assets.length;i++) {
            const asset = assets[i];
            const description = findDescription(asset, descriptions);
    
            const item = {
                appid: asset.appid,
                contextid: asset.contextid,
                assetid: asset.assetid,
                classid: asset.classid,
                instanceid: asset.instanceid,
                token: JwtValidator.sign({steamid: steamid, appid: asset.appid, contextid: asset.contextid, assetid: asset.assetid}),
                name: description.name,
                market_name: description.market_name,
                on_sell: false,
                icon_url: `http://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}`,
                stickers: parseStickers(description.descriptions[description.descriptions.length - 1].value),
                marketable: description.marketable,
                tradable: description.tradable,
                tags: parseTags(description.tags),
            };
    
            if (description.actions != null) {
                item.link = description.actions[0].link.replace("%owner_steamid%", steamid).replace("%assetid%", asset.assetid);
            }

            if (await ItemModel.getByAssetid(asset.appid, asset.contextid, asset.assetid) != null) {
                item.on_sell = true;
            }
    
            items.push(item);
        }
    }

    return items;
}

function findDescription(asset, descriptions) {
    for (var i = 0;i < descriptions.length;i++) {
        if (descriptions[i].classid == asset.classid && descriptions[i].instanceid == asset.instanceid) {
            return descriptions[i];
        }
    }
}

function parseTags(tags) {
    const o = {};

    for (var i = 0;i < tags.length;i++) {
        const tag = tags[i];
        o[tag.category.toLowerCase()] = tag.localized_tag_name;
    }

    o.weapon_type = o.type;

    return o;
}

function parseStickers(content) {
    const res = require("html-dom-parser")(content);

    if (res.length < 2) {
        return null;
    }

    const o = res[res.length - 1];
    const stickers = [];
    const arr = o.children[0].children;

    for (var i = 0;i < arr.length;i++) {
        if (arr[i].name == "img") {
            stickers.push(arr[i].attribs.src);
        }
    }

    return stickers;
}

module.exports = UserController;