'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        console.log('--- Initializing Ledger ---');

        // Load network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Setup wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('admin');
        if (!identity) {
            console.error('An identity for the user "admin" does not exist in the wallet. Run enrollAdmin.js first.');
            return;
        }

        // Connect to gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('welfare');

        // Submit the InitLedger transaction
        console.log('\n--> Submitting transaction: InitLedger');
        await contract.submitTransaction('InitLedger');
        console.log('Transaction has been submitted successfully!');

        // Disconnect from the gateway
        await gateway.disconnect();
        console.log('--- Ledger Initialized ---');

    } catch (error) {
        console.error(`Failed to initialize ledger: ${error}`);
        process.exit(1);
    }
}

main();