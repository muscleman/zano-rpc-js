'use strict'

const describe = require('mocha').describe
const it = require('mocha').it
const before = require('mocha').before
const after = require('mocha').after
const chai = require('chai')
const { v4: uuidv4 } = require('uuid');
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const rpcWallet = require('../../lib/rpcWallet.js')
const rpcDaemon = require('../../lib/rpcDaemon.js')

const config = require('./config')
const utils = require('./utils')

describe('RPCWallet contract tests', () => {
    const walletClient = rpcWallet.createWalletClient({
                            url: config.walletAddress,
                            username: config.walletUsername,
                            password: config.walletPassword
                        })
    walletClient.sslRejectUnauthorized(false)

    const otherClient = rpcWallet.createWalletClient({
                        url: config.watchOnlyWalletAddress,
                        username: config.watchOnlyWalletUsername,
                        password: config.watchOnlyWalletPassword
    })
    otherClient.sslRejectUnauthorized(false)

    const daemonClient = rpcDaemon.createDaemonClient({
                        url: config.daemonAddress,
                        username: config.daemonUsername,
                        password: config.daemonPassword
                    })
    daemonClient.sslRejectUnauthorized(false)


    before(async function() {
        try {} catch (error) {}
    })
    after(async function() {
        try {} catch (error) {}
    })

    it('should cancel alice\'s proposal after approval', async() => {
        const payment_id = uuidv4()
        const proposal_opts = {
            wallet_id: 0,
            details: {
                    t: 'test',
                    c: 'cancel_proposal_test',
                    a_addr: config.integratedTestAddressA,
                    b_addr: config.integratedTestAddressB,
                    to_pay: config.units * 1,
                    a_pledge: config.units * 1,
                    b_pledge: config.units * 1
                    },
            payment_id: payment_id,
            expiration_period: 5 * 60 * 60,
            fee: config.fee,
            b_fee: config.fee
        }
        console.log('\tcontract send proposal ...')
        await walletClient.contracts_send_proposal(proposal_opts)
        await utils.delay(config.seconds * 3)
        let proposals = await walletClient.contracts_get_all()
        let contract = proposals.contracts.find(contract => contract.payment_id === payment_id)

        const accept_opts = {
            contract_id: contract.contract_id,
            acceptance_fee: config.fee
        }
        console.log('\tcontract accept proposal ...')
        await otherClient.contracts_accept_proposal(accept_opts)
        console.log('\twait for 10 confirmations ...')
        await utils.waitForConfirmations(daemonClient, 10)

        const request_cancel_opts = {
            contract_id: contract.contract_id, 
            fee: config.fee,
            expiration_period: 10 * 60 * 60 
        }
        console.log('\tcontract request cancellation ...')
        await walletClient.contracts_request_cancel(request_cancel_opts)
        await utils.delay(config.seconds * 3)
        const accept_cancel_opts = {
            contract_id: contract.contract_id,
        }
        console.log('\tcontract accept cancellation ...')
        await otherClient.contracts_accept_cancel(accept_cancel_opts)
        console.log('\twait for 10 confirmations ...')
        await utils.waitForConfirmations(daemonClient, 10)
        proposals = await walletClient.contracts_get_all()
        contract = proposals.contracts.find(contract => contract.payment_id === payment_id)
        return expect(contract).to.have.property('state', 6) 
    })

    it('should release normal funds after alice\'s proposal is approved', async() => {
        const payment_id = uuidv4()
        const proposal_opts = {
            wallet_id: 0,
            details: {
                    t: 'test',
                    c: 'release_normal_proposal_test',
                    a_addr: config.integratedTestAddressA,
                    b_addr: config.integratedTestAddressB,
                    to_pay: config.units * 1,
                    a_pledge: config.units * 1,
                    b_pledge: config.units * 1
                    },
            payment_id: payment_id,
            expiration_period: 5 * 60 * 60,
            fee: config.fee,
            b_fee: config.fee
        }
        console.log('\tcontract send proposal ...')
        await walletClient.contracts_send_proposal(proposal_opts)
        await utils.delay(config.seconds * 3)
        let proposals = await walletClient.contracts_get_all()
        let contract = proposals.contracts.find(contract => contract.payment_id === payment_id)

        const accept_opts = {
            contract_id: contract.contract_id,
            acceptance_fee: config.fee
        }
        console.log('\tcontract accept proposal ...')
        await otherClient.contracts_accept_proposal(accept_opts)
        console.log('\twait for 10 confirmations ...')
        await utils.waitForConfirmations(daemonClient, 10)

        const release_opts = {
            contract_id: contract.contract_id, 
            release_type: 'REL_N' //REL_N = NORMAL, REL_B = BURN
        }
        console.log('\tcontract release normal ...')
        await walletClient.contracts_release(release_opts)
        await utils.delay(config.seconds * 3)
        proposals = await walletClient.contracts_get_all()
        contract = proposals.contracts.find(contract => contract.payment_id === payment_id)
        return expect(contract).to.have.property('state', 3) 
    })

    it('should release burn funds after alice\'s proposal is approved', async() => {
        const payment_id  = uuidv4()
        const proposal_opts = {
            wallet_id: 0,
            details: {
                    t: 'test',
                    c: 'release_burn_proposal_test',
                    a_addr: config.integratedTestAddressA,
                    b_addr: config.integratedTestAddressB,
                    to_pay: config.units * 1,
                    a_pledge: config.units * 1,
                    b_pledge: config.units * 1
                    },
            payment_id: payment_id,
            expiration_period: 5 * 60 * 60,
            fee: config.fee,
            b_fee: config.fee
        }
        console.log('\tcontract send proposal ...')
        await walletClient.contracts_send_proposal(proposal_opts)
        await utils.delay(config.seconds * 3)
        let proposals = await walletClient.contracts_get_all()
        let contract = proposals.contracts.find(contract => contract.payment_id === payment_id)

        const accept_opts = {
            contract_id: contract.contract_id,
            acceptance_fee: config.fee
        }
        console.log('\tcontract accept proposal ...')
        await otherClient.contracts_accept_proposal(accept_opts)
        console.log('\twait for 10 confirmations ...')
        await utils.waitForConfirmations(daemonClient, 10)

        const release_opts = {
            contract_id: contract.contract_id, 
            release_type: 'REL_B'
        }
        console.log('\tcontract release burn ...')
        await walletClient.contracts_release(release_opts)
        await utils.delay(config.seconds * 3)
        proposals = await walletClient.contracts_get_all()
        contract = proposals.contracts.find(contract => contract.payment_id === payment_id)
        return expect(contract).to.have.property('state', 4) 
    })

    xit('contracts_send_proposal', () => {
        const opts = {
            wallet_id: 0,
            details: {
                    t: 'test9',
                    c: 'testproposal',
                    a_addr: config.integratedTestAddressA,
                    b_addr: config.integratedTestAddressB,
                    to_pay: config.units * 1,
                    a_pledge: config.units * 1,
                    b_pledge: config.units * 1
                    },
            // payment_id: 435781,
            expiration_period: 5 * 60 * 60,
            fee: config.fee,
            b_fee: config.fee
        }
        return expect(walletClient.contracts_send_proposal(opts))
            .to.eventually.be.have.property('status', '')
    })
    xit('contracts_accept_proposal', () => {
        const opts = {
            contract_id: 'e6156f10484570af90c2dec2f7a9bfb25ed0ac9109103db105979139fd3ff436',
            acceptance_fee: config.fee
        }
        return expect(otherClient.contracts_accept_proposal(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_get_all', () => {
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
            contract_id: 'e6156f10484570af90c2dec2f7a9bfb25ed0ac9109103db105979139fd3ff436', 
            release_type: 'REL_N' //REL_N = NORMAL, REL_B = BURN
        }
        return expect(walletClient.contracts_release(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_request_cancel', () => {
        const opts = {
            contract_id: 'cfb6c2a448088c9dc43682857408e4f0deff080a06f0b5236d924d2877da3588', 
            fee: config.fee,
            expiration_period: 10 * 60 * 60 
        }
        return expect(walletClient.contracts_request_cancel(opts))
            .to.eventually.be.an('object').that.is.empty
    })
    xit('contracts_accept_cancel', () => {
        const opts = {
            contract_id: 'cfb6c2a448088c9dc43682857408e4f0deff080a06f0b5236d924d2877da3588'
        }
        return expect(otherClient.contracts_accept_cancel(opts))
            .to.eventually.be.an('object').that.is.empty
    })
})