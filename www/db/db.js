
let dataAPI;
const { Sequelize } = require('sequelize');
const mode = process.env.NODE_ENV || "docker_conn";
console.log(mode);
const mongoose = require('mongoose');
const server = require('../rest/server');
const appConfig = require('../../config/appConfig');
const db = {};
const redis = require('redis');
const colors = require('colors');
// const chalk = require('chalk');

const fs = require("fs");
// const path = require("../../src/models/SQL_MODELS/userDetail");
const path = require("path");

// if (!dbConfig) {
//     console.error("Invalid NODE_ENV. No database config found for:", mode);
//     process.exit(1);
// }

const connectionModeHandler = async (app, db_type) => {
    try {
        const databaseTypes = db_type.split(",");
        console.log("Database Types =", db_type);
        const connectionTypes = databaseTypes.map((type) => startDB(app, type))
        // console.log("Connection Types Is::",connectionTypes);

        const connections = await Promise.all(connectionTypes);

        // Load models dynamically
        // const models = {};
        // const modelPath = require("../../src/models/SQL_MODELS/userDetail");
        // const modelsPath = path.join(__dirname, '../../src/models/SQL_MODELS');
        // fs.readdirSync(modelsPath).forEach((file) => {
        //     if (file.endsWith(".js")) {
        //         databaseTypes.forEach((dbType) => {
        //             const sequelize = databaseConnections[dbType];
        //             if (sequelize) {
        //                 const model = require(path.join(modelsPath, file))(sequelize);
        //                 models[model.name] = model;
        //             }
        //         });
        //     }
        // });

        // Sync models with the database
        // await Promise.all(
        //     Object.values(models).map((model) => model.sync({ alter: true }))
        // );

        console.log("All models synchronized with the database.");


        server.startServer(app);
        // server.startServer(app);
        // Initilizing GraphQl..
        // graphQl.initializeGraphQL(app);
        // Initilizing GraphQl..
    } catch (error) {
        console.log("Some Error Ocurres To Send The Connection Mode....!!!", error);
    }
}


const startDB = async (app, db_type) => {
    // console.log(chalk.blue('Hello world!'));
    console.log("Db_type:::".red, db_type.green);
    // console.log(chalk.blue("Database type",app,db_type));
    if (db_type === 'mongo,mysql,redis') {
        console.log("hii 3 Database Gets Connected...".blue);
    }
    else {
        switch (db_type) {
            case "mysql":
                console.log("Mysql Connection Reading....!!!".bgBlue);
                console.log(`Environment : ${process.env.NODE_ENV} Database : ${process.env.DATABASE_TYPE}`.bgBlack);
                //Import the sequelize module
                const dbConfig = require("../../config/dbConfig.json")[mode];
                dataAPI = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
                    host: dbConfig.host,
                    dialect: dbConfig.dialect,
                    pool: {
                        max: 3,         // Maximum number of connections in the pool
                        min: 2,          // Minimum number of connections in the pool
                        acquire: 30000,  // Max time (ms) to get a connection before throwing an error
                        idle: 10000      // Max time (ms) a connection can be idle before being released
                    },
                    logging: false,  // Disable logging for cleaner output
                });
                try {
                    await dataAPI.authenticate()
                    // .then(() => {
                    console.log(`Database Connection open Success : ${JSON.stringify(dbConfig.host)}`.bgGreen);
                    module.exports.dataAPI = dataAPI;
                    // Load models dynamically for MySQL
                    const models = {};
                    const modelsPath = path.join(__dirname, "../../src/models/SQL_MODELS");
                    console.log("Loading models from:", modelsPath);
                    fs.readdirSync(modelsPath).forEach((file) => {
                        if (file.endsWith(".js")) {
                            const model = require(path.join(modelsPath, file))(dataAPI);
                            models[model.name] = model;
                            console.log(`Model Loaded: ${model.name}`);
                        }
                    });
                    // Sync models with MySQL
                    // });
                    await Promise.all(
                        Object.values(models).map((model) => model.sync({ alter: true }))
                    );
                    console.log("✅ All models synchronized with MySQL.");
                    console.log("✅ All models synchronized with MySQL.");
                    // connections.mysql = mysqlDB;

                } catch (err) {
                    console.log(`Database Connection Open Error : ${err}`.bgRed);
                }
                break;
            case "mongo":
                console.log(`Mongopart Environment : ${process.env.NODE_ENV} Database : ${process.env.DATABASE_TYPE}`.bgBlack);
                try {
                    /**
                     * database connection settings
                     */
                    // console.log("MongoDb Connection Reading...!!!".bgG);
                    console.log("MongoDb Database Url...!!!".red, appConfig.db.uri);
                    mongoose.connect(appConfig.db.uri, { useNewUrlParser: true,useUnifiedTopology: true });
                    // mongoose.set('debug', true);

                    mongoose.connection.on('error', function (err) {
                        console.log(`database error:${err}`);
                        process.exit(1)
                    }); // end mongoose connection error

                    mongoose.connection.on('open', function (err) {
                        if (err) {
                            console.log(`database error:${JSON.stringify(err)}`);
                            process.exit(1)
                        } else {
                            module.exports.mongooseClient = mongoose;
                            console.log("database connection open success".bgGreen);
                            // const redis_client = redis.createClient({
                            //     url:appConfig.redis_url
                            // });
                            // redis_client.connect();
                            // redis_client.on('error', (err) => {
                            //     console.log("REDIS Error " + err)
                            // });
                            // module.exports.redis_client = redis_client;
                            /**
                             * Create HTTP server.
                             */
                            // server.startServer(app);
                        }
                    }); // end mongoose connection open handler
                } catch (err) {
                    console.log(`Database Connection Open Error : ${err}`.bgRed);
                }
                break;
            // case "redis":
            //     console.log("Redis::")
            //     console.log(`Environment : ${process.env.NODE_ENV} Database : ${process.env.DATABASE_TYPE}`.bgBlack);
            //     const redisConfig = require("../../config/dbConfig.json")[mode];

            //     console.log("REDIS CONFIG===>>", redisConfig.redis_url);
            //     console.log(redisConfig.redis_url, "Connection String For Redis:::".bgBlack);
            //     const redis_client = redis.createClient({
            //         url: redisConfig.redis_url,
            //     });
            //     async function connectToRedis() {
            //         try {
            //             await redis_client.connect();
            //             console.log("Redis connected successfully!".bgGreen);

            //         } catch (err) {
            //             console.log(`Redis connection error: ${err}`.bgRed);
            //         }
            //     }
            //     // Call the async function
            //     await connectToRedis();
            //     module.exports.redis_client = redis_client;
            //     break;
            case "redis":
                console.log("Redis::");
                console.log(`Environment : ${process.env.NODE_ENV} Database : ${process.env.DATABASE_TYPE}`.bgBlack);

                const redisConfig = require("../../config/dbConfig.json")[mode];

                if (!redisConfig || !redisConfig.redis_url) {
                    console.error("Redis URL is missing from config!");
                    process.exit(1);  // Stop execution if Redis config is missing
                }

                console.log("REDIS CONFIG===>>", redisConfig.redis_url);

                const redis_client = redis.createClient({ url: redisConfig.redis_url });

                try {
                    await redis_client.connect();
                    console.log("Redis connected successfully!".bgGreen);
                    module.exports.redis_client = redis_client;
                } catch (err) {
                    console.log(`Redis connection error: ${err}`.bgRed);
                }
                break;

            default:
                console.log('No Database Connected,webserver will not start!');
        }
    }
}
// const startDB = async (app, db_type) => {
//     console.log("Db_type:::".red, db_type.green);

//     let connections = {};

//     if (db_type.includes("mysql")) {
//         console.log("MySQL Connection Initializing...".bgBlue);
//         const mysqlDB = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
//             host: dbConfig.host,
//             dialect: dbConfig.dialect,
//             pool: {
//                 max: 3,
//                 min: 2,
//                 acquire: 30000,
//                 idle: 10000
//             },
//             logging: false,
//         });

//         try {
//             await mysqlDB.authenticate();
//             console.log(`✅ MySQL Connected: ${dbConfig.host}`);
//              module.exports.dataAPI = dataAPI;
//             // Load models dynamically for MySQL
//             const models = {};
//             const modelsPath = path.join(__dirname, "../../src/models/SQL_MODELS");

//             console.log("Loading models from:", modelsPath);

//             fs.readdirSync(modelsPath).forEach((file) => {
//                 if (file.endsWith(".js")) {
//                     const model = require(path.join(modelsPath, file))(mysqlDB);
//                     models[model.name] = model;
//                     console.log(`Model Loaded: ${model.name}`);
//                 }
//             });

//             // Sync models with MySQL
//             await Promise.all(
//                 Object.values(models).map((model) => model.sync({ alter: true }))
//             );

//             console.log("✅ All models synchronized with MySQL.");
//             connections.mysql = mysqlDB;
//         } catch (err) {
//             console.log(`❌ MySQL Connection Error: ${err.message}`);
//         }
//     }

//     if (db_type.includes("mongo")) {
//         console.log("MongoDB Connection Initializing...".green);
//         try {
//             await mongoose.connect(dbConfig.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
//             console.log("✅ MongoDB Connected Successfully!");
//             connections.mongo = mongoose;
//         } catch (err) {
//             console.log(`❌ MongoDB Connection Error: ${err.message}`);
//         }
//     }

//     if (db_type.includes("redis")) {
//         console.log("Redis Connection Initializing...".yellow);
//         const redis_client = redis.createClient({ url: dbConfig.redis_url });

//         try {
//             await redis_client.connect();
//             console.log("✅ Redis Connected Successfully!");
//             connections.redis = redis_client;
//         } catch (err) {
//             console.log(`❌ Redis Connection Error: ${err.message}`);
//         }
//     }

//     module.exports.dbConnections = connections;
//     return connections;
// };




// const startDB = async (app, db_type) => {
//     console.log("Db_type:::".red, db_type.green);

//     if (db_type === 'mongo,mysql,redis') {
//       console.log("Connecting to 3 Databases: Mongo, MySQL, Redis".blue);
//     } else {
//       try {
//         switch (db_type) {
//           case "mysql":
//             console.log("MySQL Connection Reading....!!!".bgBlue);
//             console.log(`Environment: ${process.env.NODE_ENV} | Database Type: ${process.env.DATABASE_TYPE}`.bgBlack);

//             // Use environment variables for the database connection
//             const dbConfig = require("../../config/dbConfig.json")[process.env.NODE_ENV];
//             const { username, password, database, host, dialect } = dbConfig.mysql;

//             // Adjust for Docker usage, replace 'localhost' with 'host.docker.internal' (Mac/Windows) or '172.17.0.1' (Linux)
//             const mysqlHost = process.env.DB_HOST || "host.docker.internal"; // Default to host.docker.internal

//             // Connect to MySQL using Sequelize
//             const { Sequelize } = require("sequelize");
//             const sequelize = new Sequelize(database, username, password, {
//               host: mysqlHost,
//               dialect: dialect,
//               pool: {
//                 max: 10,
//                 min: 2,
//                 acquire: 30000,
//                 idle: 10000
//               },
//               logging: false,
//             });

//             await sequelize.authenticate();
//             console.log(`MySQL Connection Successful: ${mysqlHost}`.bgGreen);

//             // Loading and syncing MySQL models
//             const models = {};
//             const modelsPath = path.join(__dirname, "../../src/models/SQL_MODELS");
//             console.log("Loading models from:", modelsPath);

//             fs.readdirSync(modelsPath).forEach((file) => {
//               if (file.endsWith(".js")) {
//                 const model = require(path.join(modelsPath, file))(sequelize);
//                 models[model.name] = model;
//                 console.log(`Model Loaded: ${model.name}`);
//               }
//             });

//             await Promise.all(
//               Object.values(models).map((model) => model.sync({ alter: true }))
//             );
//             console.log("✅ All models synchronized with MySQL.");
//             module.exports.sequelize = sequelize;
//             break;

//           case "mongo":
//             console.log("MongoDB Connection Reading...!!!".bgGreen);

//             const mongoose = require('mongoose');
//             const mongoConfig = require("../../config/dbConfig.json")[process.env.NODE_ENV].mongo;
//             const mongoHost = process.env.DB_HOST || "localhost";

//             const mongoURI = `mongodb://${mongoConfig.username}:${mongoConfig.password}@${mongoHost}:${mongoConfig.port}/${mongoConfig.database}?authSource=admin`;

//             console.log("MongoDB URI:", mongoURI);
//             try {
//               await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
//               console.log("✅ MongoDB Connection Successful".bgGreen);
//             } catch (err) {
//               console.error(`MongoDB Connection Error: ${err.message}`.bgRed);
//               process.exit(1); // Exit if DB connection fails
//             }
//             break;

//           case "redis":
//             console.log("Redis Connection Reading...!!!".bgCyan);

//             const redis = require('redis');
//             const redisConfig = require("../../config/dbConfig.json")[process.env.NODE_ENV].redis;
//             const redisUrl = process.env.REDIS_URL || redisConfig.redis_url;

//             const redisClient = redis.createClient({
//               url: redisUrl,
//             });

//             redisClient.on('error', (err) => {
//               console.error(`Redis Connection Error: ${err.message}`.bgRed);
//               process.exit(1); // Exit if Redis connection fails
//             });

//             await redisClient.connect();
//             console.log("✅ Redis Connection Successful".bgGreen);
//             module.exports.redisClient = redisClient;
//             break;

//           default:
//             console.log("No database specified. Webserver will not start!".bgYellow);
//         }
//       } catch (error) {
//         console.error("Error in Database Connection:".bgRed, error.message);
//         process.exit(1); // Exit if any error occurs during DB setup
//       }
//     }
//   };


mongoose.set('debug', true);

module.exports = {
    startDB: startDB,
    connectionModeHandler: connectionModeHandler,
}