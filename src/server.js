'use strict';
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const stationInfo = require('./station-data');


    const server = Hapi.server({
        port: 8080,
        routes: { cors: true }
    });

    server.route([{
        method: 'POST',
        path: '/',
        handler: async (request, h) => {
            let writeToS3 = (typeof request.payload?.writeToS3 != 'undefined') ? request.payload?.writeToS3 : true
            let fileName = (typeof request.payload?.fileName != 'undefined') ? request.payload?.fileName : process.env.FILE_NAME
            let result = await stationInfo.generateStationData(process.env.REGION,process.env.BUCKET_NAME,fileName,writeToS3);
            return result;
        }
    },{
        method: 'GET',
        path: '/heartbeat',
        handler: async (request, h) => {
            return true;
        }
    }
]);

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});


exports.init = async () => {
    await server.initialize();
    return server;
};

exports.start = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
    return server;
};


//init();
