const AWS = require('aws-sdk');
const Axios = require('axios');
const fs = require('fs');

const generateStationData = async (REGION = 'us-east-2', BUCKET_NAME = 'pg-e-nathan-cc', FILE_NAME='filtedStations.csv', WRITE_TO_S3=true) => {
    return Axios.get('https://gbfs.divvybikes.com/gbfs/en/station_information.json')
        .then(async response => {
            let stations = response?.data?.data?.stations;
    
            if (Array.isArray(stations) && stations.length > 0) {

                let relevantStations = stations.filter(item => item.capacity < 12).map(({rental_methods, rental_uris, station_id, external_id, legacy_id, ...rest}) => {
                    return { ...rest, stationId: station_id, externalId: external_id, legacyId: legacy_id }
                });
        
                // Build CSV
                const header = Object.keys(relevantStations[0]);
                const csv = [
                    header.join(','), 
                    ...relevantStations.map(row => header.map(fieldName => JSON.stringify(row[fieldName])).join(','))
                ].join('\r\n');
        
                if (WRITE_TO_S3) {
                    // Set the region 
                    AWS.config.update({region: REGION});
            
                    // Create S3 service object
                    s3 = new AWS.S3({apiVersion: '2006-03-01'});
            
                    try {
                        // Check if the bucket exists
                        const data = await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
                    } catch (err) {
                        // Bucket exists but we cant do anything with it
                        if (err.statusCode === 403) {
                            return {
                                'statusCode': 400,
                                'body': `Bucket "${BUCKET_NAME}" Access Denied`
                            }
                        }

                        // Bucket does not exist
                        if (err.statusCode >= 400 && err.statusCode < 500) {
                            const bucketParams = {
                                Bucket : BUCKET_NAME
                            };
                            
                            // call S3 to create the bucket
                            s3.createBucket(bucketParams, function(err, data) {
                                if (err) {
                                    return {
                                        'statusCode': 400,
                                        'body': 'Failed to create the S3 bucket with the following error: ' + JSON.stringify(err),
                                    }
                                }
                            });
                        }
                    }
                    
                    const uploadHandler = new Promise((resolve,reject) => {
                        return s3.putObject({
                            Bucket: BUCKET_NAME,
                            Key: FILE_NAME,
                            ContentType:'binary',
                            Body: Buffer.from(csv, 'binary')
                        }, (err,data) => {
                            if (err) {
                                let errDetails = JSON.stringify(err);
                                reject({
                                    'statusCode': 400,
                                    'body': `Failed to upload ${FILE_NAME} to ${BUCKET_NAME} because of: ${errDetails}`,
                                })
                            }

                            resolve({
                                'statusCode': 200,
                                'body': `Uploaded ${FILE_NAME} to ${BUCKET_NAME} successfully!`,
                            });
                        })
                    });

                    let result = await uploadHandler.then(response => response).catch(err => err);
                    return result;

                } else {
                    fs.writeFileSync(FILE_NAME,csv);
                    return {
                        'statusCode': 200,
                        'body': `Successfully created the file ${FILE_NAME}!`,
                    }
                }
            } else {
                return {
                    'statusCode': 400,
                    'body': 'The request for station information did not return the correct information',
                }
            }
        })
        .catch(function (error) {
            return {
                'statusCode': 400,
                'body': 'Request to get the Station information failed with: ' + JSON.stringify(error),
            }
        });
}

exports.generateStationData = generateStationData;