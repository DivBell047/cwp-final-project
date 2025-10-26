'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        console.log('--- Oracle App Started ---');

        // 1. Load network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        console.log('1. Loaded connection profile');

        // 2. Setup wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`2. Wallet path: ${walletPath}`);

        const identity = await wallet.get('admin');
        if (!identity) {
            console.error('An identity for the user "admin" does not exist in the wallet. Run enrollAdmin.js first.');
            return;
        }
        console.log('3. Found "admin" identity in wallet');

        // 4. Connect to gateway
        const gateway = new Gateway();
        console.log('4. Connecting to gateway...');
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        console.log('5. Gateway connected');

        // 5. Connect to channel and get contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('welfare');
        console.log('6. Connected to channel "mychannel" and got contract "welfare"');

        // 6. Generate off-chain data (the oracle's job)
        const district = 'pune';
        const newRainfall = Math.floor(Math.random() * 150); // Random rainfall between 0 and 149
        const recordedBy = 'OracleNode-Primary';
        console.log(`7. Generated off-chain data: District=${district}, Rainfall=${newRainfall}`);
        
        // 8. Submit the transaction to update the rainfall data
        console.log('\n--> Submitting transaction: UpdateRainfall');
        await contract.submitTransaction('UpdateRainfall', district, newRainfall.toString(), recordedBy);
        console.log('Transaction has been submitted successfully!');

        // 9. Query the updated data to verify
        console.log('\n--> Evaluating query: ReadRainfall');
        const result = await contract.evaluateTransaction('ReadRainfall', district);
        console.log(`Query result: ${result.toString()}`);

        // 10. Disconnect from the gateway
        console.log('\n10. Disconnecting from gateway...');
        await gateway.disconnect();
        console.log('--- Oracle App Finished ---');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();