const mongoose = require("./db");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    verified: {type: Boolean, default: false},
    uuid: String,
    nickname: String,
    avatar: {type: String, default: ""},
    steam: {
        steamid: String,
        trade_url: String,
        api_key: String
    },
    pay: {
        ethereum: {
            account: String
        }
    }
});

const User = mongoose.model("User", userSchema);

module.exports = {
    add: async function (email, password, uuid) {
        const user = new User({
            email: email,
            password: password,
            uuid: uuid,
            nickname: email
        });

        await user.save();

        return user._id;
    },
    getByEmail: async function (email) {
        return await User.findOne({email: email});
    },
    getById: async function (uid) {
        return await User.findById(uid);
    },
    active: async function (uid) {
        await User.findByIdAndUpdate(uid, {verified: true});
    },
    updateUuid: async function (email, uuid) {
        await User.findOneAndUpdate({email: email}, {uuid: uuid});
    },
    updatePassword: async function (email, password) {
        await User.findOneAndUpdate({email: email}, {password: password});
    },
    updateNickname: async function (uid, nickname) {
        await User.findByIdAndUpdate(uid, {nickname: nickname});
    },
    updateAvatar: async function (uid, avatar) {
        await User.findByIdAndUpdate(uid, {avatar: avatar});
    },
    bindSteamid: async function (uid, steamid) {
        await User.findByIdAndUpdate(uid, {"steam.steamid": steamid});
    },
    bindTradeUrl: async function (uid, tradeUrl) {
        await User.findByIdAndUpdate(uid, {"steam.trade_url": tradeUrl});
    },
    bindApiKey: async function (uid, apiKey) {
        await User.findByIdAndUpdate(uid, {"steam.api_key": apiKey});
    },
    bindEthereumAccount: async function (uid, account) {
        await User.findByIdAndUpdate(uid, {"pay.ethereum.account": account});
    }
}