const UserModel = require("../models/UserModel");
const ItemModel = require("../models/ItemModel");

const SELF_SELL_MODE = 1;

class ItemController {
    static async selfSell(ctx) {
        const uid = ctx.request.body.uid;
        const price = ctx.request.body.price;
        const description = ctx.request.body.description;
        const item = ctx.request.body.item;
        const user = await UserModel.getById(uid);

        if (price == null) {
            ctx.badRequest({message: "饰品价格不能为空"});
            return;
        }

        if (user.steam.steamid == null || user.steam.steamid != item.steamid) {
            ctx.forbidden();
            return;
        }

        const item1 = await ItemModel.getByAssetid(item.appid, item.contextid, item.assetid);

        if (item1 != null) {
            ctx.forbidden({message: "饰品已上架"});
            return;
        }

        await ItemModel.add(uid, SELF_SELL_MODE, price, description, item);

        ctx.ok();
    }

    static async getItemClassList(ctx) {
        const list = await ItemModel.getItemClassList();

        ctx.ok({item_class_list: list});
    }

    static async getItemList(ctx) {
        const name = ctx.request.query.market_name;

        if (name == null) {
            ctx.badRequest({message: "饰品名称不能为空"});
            return;
        }
        
        const list = await ItemModel.getListByMarketName(name);

        ctx.ok({item_list: list});
    }
}

module.exports = ItemController;