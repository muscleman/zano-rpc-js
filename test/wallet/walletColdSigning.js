'use strict'

const describe = require('mocha').describe
const it = require('mocha').it
const before = require('mocha').before
const after = require('mocha').after
const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const rpcWallet = require('../../lib/rpcWallet.js')

const config = require('./config')

describe('RPCWallet cold signing tests', () => {
    const walletClient = rpcWallet.createWalletClient({
                            url: config.walletAddress,
                            username: config.walletUsername,
                            password: config.walletPassword
                        })
    walletClient.sslRejectUnauthorized(false)

    const watchOnlyClient = rpcWallet.createWalletClient({
                            url: config.watchOnlyWalletAddress,
                            username: config.watchOnlyWalletUsername,
                            password: config.watchOnlyWalletPassword
                        })
    watchOnlyClient.sslRejectUnauthorized(false)

    let transferResult = {}
    let signedTransferResult = {}

    before(async function() {
        try {
            console.log('creating transfer with watch only wallet ...')
            let opts = { destinations: [{amount: 1 * config.units, address: config.integratedTestAddressB}], mixin: 1, fee: 10000000000, comment: 'woot woot'}
            transferResult = await watchOnlyClient.transfer(opts)
            console.log('signing transfer with regular wallet ...')
            signedTransferResult = await walletClient.sign_transfer({ tx_unsigned_hex: transferResult.tx_unsigned_hex})
        } catch (error) {
            
        }
    })
    after(async function() {
        try {} catch (error) {}
    })

    it('send signed transfer', () => {
        return expect(walletClient.submit_transfer({ tx_signed_hex: signedTransferResult.tx_signed_hex}))
            .to.eventually.have.property('tx_hash')
    })

})