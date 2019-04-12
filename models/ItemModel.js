const mongoose = require("./db");

const ItemSchema = new mongoose.Schema({
    uid: mongoose.Schema.Types.ObjectId,
    sell_mode: Number,
    price: Number,
    description: String,
    info: {
        appid: Number,
        contextid: String,
        assetid: String,
        classid: String,
        instanceid: String,
        name: String,
        market_name: String,
        icon_url: String,
        stickers: [String],
        marketable: Number,
        tradable: Number,
        tags: {
            weapon_type: String,
            weapon: String,
            itemset: String,
            quality: String,
            rarity: String,
            exterior: String,
            tournament: String,
            tournamentteam: String
        },
        link: String,
        float_value: {
            paintindex: Number,
            paintseed: Number,
            customname: String,
            floatvalue: Number,
            imageurl: String,
            stickers: [{
                slot: Number,
                stickerId: Number,
                wear: Number,
                scale: Number,
                rotation: Number,
                tintId: Number,
                codename: String,
                name: String
            }]
        }
    }
});

const ItemClassSchema = new mongoose.Schema({
    market_name: String,
    count: Number,
    price: Number,
    imageurl: String
});

const Item = mongoose.model("item", ItemSchema);
const ItemClass = mongoose.model("item_class", ItemClassSchema);

class ItemModel {
    static async add(uid, sellMode, price, description, info) {
        const item = new Item({
            uid: uid,
            sell_mode: sellMode,
            price: price,
            description: description,
            info: info
        });

        await item.save();

        var itemClass = await ItemModel.getItemClass(item.info.market_name);

        if (itemClass == null) {
            itemClass = new ItemClass({
                market_name: item.info.market_name,
                count: 1,
                price: price,
                imageurl: item.icon_url
            });

            await itemClass.save();
        } else {
            await updateItemClassCount(itemClass.name, itemClass.count + 1);

            if (itemClass.price > price) {
                await updateItemClassPrice(itemClass.name, price);
            }
        }

        return item._id;
    }
    
    static async getByAssetid(appid, contextid, assetid) {
        return await Item.findOne({"info.appid": appid, "info.contextid": contextid, "info.assetid": assetid});
    }

    static async getListByMarketName(name) {
        return await Item.find({"info.market_name": name}, null, {
            sort: {
                price: 1
            }
        });
    }

    static async getItemClass(name) {
        return await ItemClass.findOne({market_name: name});
    }

    static async getItemClassList() {
        return await ItemClass.find();
    }

    static async updateItemClassCount(name, count) {
        await ItemClass.findOneAndUpdate({market_name: name}, {count: count});
    }

    static async updateItemClassPrice(name, price) {
        await ItemClass.findOneAndUpdate({market_name: name}, {price: price});
    }
}

module.exports = ItemModel;