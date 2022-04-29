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

describe('RPCWallet atomic tests', () => {
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
    xit('atomics_create_htlc_proposal', () => {
        return expect(walletClient.atomics_create_htlc_proposal({}))
          .to.eventually.have.keys('result_tx_blob', 'result_tx_id', 'derived_origin_secret')
    })
    xit('atomics_get_list_of_active_htlc', () => {
        return expect(walletClient.atomics_get_list_of_active_htlc({}))
          .to.eventually.have.property('htlcs')
          .to.eventually.have.keys('counterparty_address', 'sha256_hash', 'tx_id', 'amount', 'is_redeem')
          .to.eventually.have.property('counterparty_address')
          .that.eventually.have.keys('spend_public_key', 'view_public_key')
    })
    xit('atomics_redeem_htlc', ({}) => {
        return expect(walletClient.atomics_redeem_htlc({}))
          .to.eventually.have.keys('result_tx_blob', 'result_tx_id')
    })
    xit('atomics_check_htlc_redeemed', ({}) => {
        return expect(walletClient.atomics_check_htlc_redeemed({}))
          .to.eventually.have.keys('origin_secrete', 'redeem_tx_id')
    })
})