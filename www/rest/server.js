const http = require('http');
const os = require('os');
// const database = require('../d')

const numCPUs = os.cpus().length;  // Get the number of CPU cores
let app,db_type;
// Define the startServer function outside the cluster check so it is available globally
const startServer = (app) => {
    const server = http.createServer(app);

    server.listen(process.env.REST_PORT, () => {
        console.log(`Server listening on port: ${server.address().port}`);
        // ws.startSocket(server); // Start WebSocket on the same server
    });

    server.on('error', (err) => {
        console.log(`Error: ${err}`);
    });
    // Start gRPC Server
    // startGrpcServer();
};


module.exports = {
    startServer: startServer,
    // databaseConnection: databaseConnection
}