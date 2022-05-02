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
const rpcDaemon = require('../../lib/rpcDaemon.js')

const config = require('./config')
const utils = require('./utils')

describe('RPCWallet atomics tests', () => {
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
    it('perform atomic swap between two zano wallets', async () =>{
        const proposal_opts = {
            amount: config.units * 1,
            counterparty_address: config.integratedTestAddressB,
            lock_blocks_count: 10
            // htlc_hash: ''
        }
        console.log('\tcreating htlc proposal ...')
        const proposal = await walletClient.atomics_create_htlc_proposal(proposal_opts)
        await utils.waitForConfirmations(daemonClient, 1)
        const list_opts = {
            income_redeem_only: false
        }
        await walletClient.atomics_get_list_of_active_htlc(list_opts)

        const redeem_opts = {
            tx_id: proposal.result_tx_id,
            origin_secret_as_hex: proposal.derived_origin_secret_as_hex
        }
        console.log('\tredeeming htlc proposal ...')
        await otherClient.atomics_redeem_htlc(redeem_opts)
        await utils.waitForConfirmations(daemonClient, 1)
        const redeemed_opts = {
            htlc_tx_id: proposal.result_tx_id
        }
        console.log('\tchecking propoal has been redeemed ...')
        const htlc_redeemed = await otherClient.atomics_check_htlc_redeemed(redeemed_opts)

        return expect(htlc_redeemed).to.have.property('origin_secrete_as_hex', proposal.derived_origin_secret_as_hex, 'redeem_tx_id', proposal.result_tx_id)

    })
    xit('atomics_create_htlc_proposal', () => {
        const opts = {
            amount: config.units * 3,
            counterparty_address: 'iZ2EDR1UGhGYcrWpvnnuvkGHHLre4dub961SnbAfB9fx6khF389FgURLHE9VHYq3n12FvJQLcPJjm5VRbLsFZivXhnByyZgfBqh2dsHDCMi5',
            lock_blocks_count: 1440
            // htlc_hash: ''
        }
        return expect(walletClient.atomics_create_htlc_proposal(opts))
          .to.eventually.have.keys('result_tx_blob', 'result_tx_id', 'derived_origin_secret_as_hex')
    })
    it('atomics_get_list_of_active_htlc', () => {
        const opts = {
            income_redeem_only: false
        }
        return expect(walletClient.atomics_get_list_of_active_htlc(opts))
          .to.eventually.satisfy(function(response) {
              if (Object.keys(response).length === 0) {
                return expect(response).to.be.an('object').that.is.empty
              }
              else {
                return expect(response)
                .to.have.nested.property('htlcs[0]')
                .that.have.nested.keys('amount', 'counterparty_address', 'is_redeem', 'sha256_hash', 'tx_id')
              }
          })
    })
    xit('atomics_redeem_htlc', () => {
        const opts = {
            tx_id: '6a749af81b17414cd994f29c2c49110981ab7aa1777602a7cc31ef39db87f006',
            origin_secret_as_hex: '08dd7ceadce0d63d2996a7b93ff5da026cdb7d22d4e1673401c7650ad1396ba0'
        }
        return expect(otherClient.atomics_redeem_htlc(opts))
          .to.eventually.have.keys('result_tx_blob', 'result_tx_id')
    })
    xit('atomics_check_htlc_redeemed', () => {
        const opts = {
            htlc_tx_id: '6a749af81b17414cd994f29c2c49110981ab7aa1777602a7cc31ef39db87f006'
        }
        return expect(otherClient.atomics_check_htlc_redeemed(opts))
          .to.eventually.have.keys('origin_secrete_as_hex', 'redeem_tx_id')
    })
})