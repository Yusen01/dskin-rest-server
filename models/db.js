const mongoose = require("mongoose");
const config = require("../config/config");

mongoose.connect(config.dev.db.url, {useNewUrlParser: true});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));

db.once("open", function() {
    console.log("connection open");
});

module.exports = mongoose;