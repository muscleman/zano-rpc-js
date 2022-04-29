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

describe('RPCWallet marketplace tests', () => {
    const walletClient = rpcWallet.createWalletClient({
                            url: config.walletAddress,
                            username: config.walletUsername,
                            password: config.walletPassword
                        })
    walletClient.sslRejectUnauthorized(false)

    before(async function() {
        try {
            
        } catch (error) {
            
        }
    })
    after(async function() {
        try {
            
        } catch (error) {
            
        }
    })
    xit('marketplace_get_offers_ex', () => {
        const opts = {
          od: {
    
          }
        }
        return expect(walletClient.marketplace_get_offers_ex(opts))
          .to.eventually.have.keys('tx_hash', 'tx_blob_size')
    })
    xit('marketplace_push_offer', () => {
        return expect(walletClient.marketplace_push_offer({}))
          .to.eventually.have.keys('tx_hash', 'tx_blob_size')
    })
    xit('marketplace_push_update_offer', () => {
        return expect(walletClient.marketplace_push_update_offer({}))
          .to.eventually.have.keys('tx_hash', 'tx_blob_size')
    })
    xit('marketplace_cancel_offer', () => {
        return expect(walletClient.marketplace_cancel_offer({}))
            .to.eventually.have.keys('tx_hash', 'tx_blob_size')
    })
})