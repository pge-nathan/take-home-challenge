'use strict';

const stationInfo = require('../../station-data.js');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const { init } = require('../../server.js');
const Lab = require('@hapi/lab');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const fs = require('fs');

describe('Tests creating the file', function () {
    it('Verifies successfully creating the file', async () => {
        const fileName = 'station-output.csv';
        const result = await stationInfo.generateStationData(null,null,fileName,false);
        
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        assert.isOk(fs.existsSync(fileName));

    });
});
  
describe('Server Testing', function () {
    let server ;

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });

    it('should invalidate if server is running ', async function () {
        let response = await server.inject({
                method: 'GET',
                url: '/heartbeat'
            })
        
        assert.deepEqual(response.statusCode, 200);
                
    })

    it('should validate if I can write locally by calling to the server', async function () {
        let fileName = 'station-output.csv';
        let result = await server.inject({
            method: 'POST',
            url: '/',
            payload: JSON.stringify({writeToS3: false, fileName: fileName})
        })
                    
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.payload).to.contain('Successful');

        assert.isOk(fs.existsSync(fileName));
    
    })

    it('should validate if I can to S3 from the server call', async function () {
        let result = await server.inject({
                method: 'POST',
                url: '/'
            })

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.payload).to.contain('successful')        
    })
})