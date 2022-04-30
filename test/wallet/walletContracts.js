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
    xit('contracts_send_proposal', () => {
        const opts = {
            details: {
                    t: 'foobar',
                    c: 'testproposal',
                    a_addr: config.integratedTestAddressA,
                    b_addr: config.integratedTestAddressB,
                    to_pay: config.units,
                    a_pledge: config.units,
                    b_pledge: config.units
                    },
            expiration_period: 5,
            fee: config.units * 1,
            b_fee: config.units * 1
        }
        return expect(walletClient.contracts_send_proposal(opts))
            .to.eventually.be.have.property('status', 'OK')
    })
    xit('contracts_accept_proposal', () => {
        const opts = {
            contract_id: 'ee684ba629ef3e1c11ef02a280b93841822e25ec30b0cd27c18153a98a527ca5',
            // acceptance_fee: config.units
            // wallet_id: 0
        }
        return expect(walletClient.contracts_accept_proposal(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    it('contracts_get_all', () => {
        return expect(walletClient.contracts_get_all())
            .to.eventually.satisfy(function(response) {
                if (Object.keys(response).length === 0) {
                    return expect(response).to.be.an('object')
                                .that.is.empty
                }
                else
                {
                    return expect(response).to.have.property('contracts')
                }
            })
            // .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_release', () => {
        const opts = {
            contract_id: 'ee684ba629ef3e1c11ef02a280b93841822e25ec30b0cd27c18153a98a527ca5', 
            release_type: 'burn'
        }
        return expect(walletClient.contracts_release(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_request_cancel', () => {
        const opts = {
            wallet_id: '',
            contract_id: 'ee684ba629ef3e1c11ef02a280b93841822e25ec30b0cd27c18153a98a527ca5', 
            fee: 10000000000,
            expiration_period: 1 
        }
        return expect(walletClient.contracts_request_cancel(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    it('contracts_accept_cancel', () => {
        const opts = {
            contract_id: 'ee684ba629ef3e1c11ef02a280b93841822e25ec30b0cd27c18153a98a527ca5'
        }
        return expect(walletClient.contracts_accept_cancel(opts))
            .to.eventually.be.an('object').that.is.empty
    })
})