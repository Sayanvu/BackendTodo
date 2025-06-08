const envConf = require('dotenv').config({ debug: process.env.DEBUG });
const cors = require('cors');
if (envConf.error) {
  throw envConf.error
}
 
const express = require('express');
const database = require('./www/db/db');
const serverClusetrPool = require('./www/rest/server')
const appConfig = require('./config/appConfig');
const routeLoggerMiddleware = require('./src/middlewares/routeLogger');
const globalErrorMiddleware = require('./src/middlewares/appErrorHandler');
const fs = require('fs');
const path = require('path');
const requestLogger = require('./src/middlewares/requestLogger');
const logger = require('./src/middlewares/winLogger');
const morgan = require('morgan');
const useragent = require('useragent');


const app = express();
const schemaPath = './src/models';
//Bootstrap models
fs.readdirSync(schemaPath).forEach(function (file) {
  if (~file.indexOf('.js')) require(schemaPath + '/' + file)
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(routeLoggerMiddleware.logIp);
app.use(requestLogger.requestLogger);
app.use(globalErrorMiddleware.globalErrorHandler);
// app.use(session({
//   resave: false,
//   saveUninitialized: true,
//   secret: process.env.SESSION_SECRET
// }));


// Create logs folder if not exists
const logPath = path.join(__dirname, 'logs');
// console.log("fs.existsSync(logPath)",fs.existsSync(logPath))
// console.log("Expected At ",logPath)
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath,{ recursive: true });
}
// Setup morgan to use winston as stream
const morganStream = {
  write: (message) => logger.info(message.trim())
};

// Create Custom Morgan Token...
morgan.token('remote-ip', (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});
// 🧠 Custom token for device (user-agent parsed)
morgan.token('device', (req) => {
  const agent = useragent.parse(req.headers['user-agent']);
  return `${agent.os.toString()} - ${agent.toAgent()}`;
});

// 🧠 Final format string
const format =
  ':remote-ip | :method :url :status | :res[content-length] - :response-time ms | :device';
// 🧾 Write to winston stream

// Use morgan middleware with winston stream
app.use(morgan(format, { stream: morganStream }));

app.all(appConfig.allowedCorsOrigin, function(req, res, next) {
  res.header("Access-Control-Allow-Origin", appConfig.allowedCorsOrigin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,token,key");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  next();
});
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

app.use(express.static(path.join(__dirname, 'views')));

// Bootstrap route
const routesPath = './src/routes';
fs.readdirSync(routesPath).forEach(function (file) {
  if (~file.indexOf('.js')) {
    let route = require(routesPath + '/' + file);
    route.setRouter(app);
  }
});
// end bootstrap route

/* Start Database*/
// serverClusetrPool.databaseConnection(app,process.env.DATABASE_TYPE)
database.connectionModeHandler(app,process.env.DATABASE_TYPE);
