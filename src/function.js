const stationInfo  = require('./station-data');

exports.lambdaHandler = async (event, context) => {
    const results = await stationInfo.generateStationData(process.env.REGION,process.env.BUCKET_NAME,process.env.FILE_NAME);
    return results;
}