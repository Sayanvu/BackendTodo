require("dotenv").config(); // Load environment variables from .env
const dbConfig = require("./dbConfig.json"); // Load full database config object

const dbEnv = process.env.NODE_ENV || "development";


if (!dbConfig[dbEnv]) {
    throw new Error(`Database configuration for environment '${dbEnv}' not found.`);
  }
  
  // Log the selected environment and its configuration
  console.log(`Using database configuration for environment: ${dbEnv}`);
  console.log("Assigned Database Config:", dbConfig[dbEnv]);
  
  module.exports = {
    [dbEnv]: dbConfig[dbEnv], 
  };


