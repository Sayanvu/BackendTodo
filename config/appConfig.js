const dbConfig = require("./dbConfig.json")[process.env.NODE_ENV]
let admin = require('firebase-admin');
const events = require('events');
const eventEmitter = new events.EventEmitter();

let appConfig = {};

appConfig.eventEmitter = eventEmitter;
appConfig.allowedCorsOrigin = "*";
appConfig.sessionExpTime = (120 * 120);
// appConfig.ticketPrice = 20,
    appConfig.apiVersion = '/api/v1';
appConfig.db = {
    uri: `mongodb://localhost:27017/QuizApp?authSource=admin`
};


appConfig.baseUrl = 'http://LIVE.ANONOMYOUS.com:3009/';

module.exports = appConfig;