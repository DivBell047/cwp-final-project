'use strict';

// Import the Hyperledger Fabric contract API
const { Contract } = require('fabric-contract-api');

class WelfareContract extends Contract {

    /**
     * InitLedger adds a base set of rainfall records to the ledger.
     * This function is for demonstration purposes.
     */
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const initialData = [
            {
                district: 'pune',
                rainfall: 78,
                timestamp: new Date().toISOString(),
                recordedBy: 'IMD',
            },
            {
                district: 'mumbai',
                rainfall: 102,
                timestamp: new Date().toISOString(),
                recordedBy: 'IMD',
            },
        ];

        for (const data of initialData) {
            await ctx.stub.putState(data.district, Buffer.from(JSON.stringify(data)));
            console.info(`Rainfall record for ${data.district} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * ReadRainfall returns the rainfall record stored in the world state with the given district.
     * @param {Context} ctx the transaction context
     * @param {string} district the district to query
     */
    async ReadRainfall(ctx, district) {
        const recordJSON = await ctx.stub.getState(district); // get the record from chaincode state
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The rainfall record for ${district} does not exist`);
        }
        return recordJSON.toString();
    }

    /**
     * UpdateRainfall updates an existing rainfall record in the world state with provided details.
     * @param {Context} ctx the transaction context
     * @param {string} district the district of the record to update
     * @param {number} newRainfall the new rainfall value
     * @param {string} recordedBy the entity that recorded this data (e.g., 'OracleNode-Alpha')
     */
    async UpdateRainfall(ctx, district, newRainfall, recordedBy) {
        console.info('============= START : UpdateRainfall ===========');

        const recordString = await this.ReadRainfall(ctx, district);
        const record = JSON.parse(recordString);

        // Update the record with new values
        record.rainfall = parseInt(newRainfall, 10);
        record.timestamp = new Date().toISOString();
        record.recordedBy = recordedBy;
        
        // update the record in the world state
        await ctx.stub.putState(district, Buffer.from(JSON.stringify(record)));
        console.info('============= END : UpdateRainfall ===========');
        return JSON.stringify(record);
    }
}

module.exports = WelfareContract;