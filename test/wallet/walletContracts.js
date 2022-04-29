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

describe('RPCWallet contract tests', () => {
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
    it('contracts_send_proposal', () => {
        const opts = {
            details: {
                    title: 'foobar',
                    comment: 'testproposal',
                    a_addr: config.integratedTestAddressB
                    },
            // payment_id: config.payment_id,
            expiration_period: 5,
            fee: config.units * 1,
            b_fee: config.units * 1,
            fake_outputs_count: 1,
            unlock_time: 0
        }
        return expect(walletClient.contracts_send_proposal(opts))
            .to.eventually.be.have.property('status', 'OK')
    })
    xit('contracts_accept_proposal', () => {
        const opts = {
            contract_id: '',
            acceptance_fee: 1
        }
        return expect(walletClient.contracts_accept_proposal(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    it('contracts_get_all', () => {
        return expect(walletClient.contracts_get_all())
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_release', () => {
        const opts = {
            contract_id: '', 
            release_type: ''
        }
        return expect(walletClient.contracts_release(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_request_cancel', () => {
        const opts = {
            contract_id: '', 
            expiration_period: 1, 
            fee: 10000000000
        }
        return expect(walletClient.contracts_request_cancel(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_accept_cancel', () => {
        const opts = {
            contract_id: ''
        }
        return expect(walletClient.contracts_accept_cancel(opts))
            .to.eventually.be.an('object').that.is.empty
    })
})