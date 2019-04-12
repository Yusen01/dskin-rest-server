const Router = require("koa-router");
const UserController = require("./controllers/UserController");
const JwtValidator = require("./middlewares/JwtValidator");
const ItemController = require("./controllers/ItemController");

const router = new Router();

// 用户基础信息相关

router.post("/api/user/register", UserController.register);

router.post("/api/user/active", UserController.active);

router.post("/api/user/login", UserController.login);

router.post("/api/user/forget", UserController.forget);

router.put("/api/user/password", UserController.updatePassword);

router.put("/api/user/nickname", JwtValidator.authorize, UserController.updateNickname);

router.put("/api/user/avatar", JwtValidator.authorize, UserController.updateAvatar);

router.get("/api/user/info/basic", JwtValidator.authorize, UserController.getUserBasicInfo);

router.get("/api/user/info/open", UserController.getUserOpenInfo);

// 用户库存

router.get("/api/user/inventory", JwtValidator.authorize, UserController.getInventory);

router.get("/api/user/item/float_value", JwtValidator.authorize, UserController.getSkinFloatValue);

// 用户Steam信息相关

router.put("/api/user/steam/steamid", JwtValidator.authorize, UserController.bindSteamid);

router.put("/api/user/steam/trade-url", JwtValidator.authorize, UserController.bindTradeUrl);

router.put("/api/user/steam/api-key", JwtValidator.authorize, UserController.bindApiKey);

router.get("/api/user/info/steam", JwtValidator.authorize, UserController.getUserSteamInfo);

// 用户支付信息相关

router.put("/api/user/pay/ethereum/account", JwtValidator.authorize, UserController.bindEthereumAccount);

router.get("/api/user/info/pay", JwtValidator.authorize, UserController.getUserPayInfo);

// 饰品相关

router.post("/api/item/self-sell", JwtValidator.authorize, JwtValidator.verifyItemInfo, ItemController.selfSell);

router.get("/api/item/item-class-list", JwtValidator.authorize, ItemController.getItemClassList);

router.get("/api/item/item-list", JwtValidator.authorize, ItemController.getItemList);

module.exports = router;