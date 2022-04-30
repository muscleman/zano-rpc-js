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

    beforeEach(async function() {
        try {} catch (error) {}
    })
    after(async function() {
        try {} catch (error) {}
    })
    it('marketplace_get_offers_ex', () => {
        return expect(walletClient.marketplace_get_offers_ex())
        .to.eventually.satisfy(function(response) {
            if ('total_transfers' in response)
                return expect(response).to.have.keys('tx_hash', 'tx_blob_size', 'status', 'total_transfers', 'total_offers')
            else
                return expect(response).to.have.keys('status', 'total_offers')
                        .and.to.have.property('total_offers', 0)
          })
    })
    it('marketplace_push_offer', () => {
        const opts = {
            od: {
                // tx_hash: '',
                // tx_original_hash: '',
                // index_in_tx: '',
                // timestamp: 0,
                fee: config.units,
                // security: '',
                ot: 1,
                ap: '20',
                at: '1',
                // b:
                t: 'T-shirt with Zano logo',
                // p
                lco: 'World Wide',
                lci: '',
                cnt: 'Skype: some_skype, discord: some_user#01012',
                com: 'A comment about the tshirt',
                pt: 'Credit cards, BTC, ZANO, ETH',
                do: 'Additional conditions',
                cat: 'CLS:MAN:TSH',
                et: 10,
                url: ''
            }
        }
        return expect(walletClient.marketplace_push_offer(opts))
                    .to.eventually.have.keys('tx_hash', 'tx_blob_size')
    })
    it('marketplace_push_update_offer', async () => {

        const opts = {
            od: {
                // tx_hash: '',
                // tx_original_hash: '',
                // index_in_tx: '',
                // timestamp: 0,
                fee: config.units,
                // security: '',
                ot: 1,
                ap: '20',
                at: '1',
                // b:
                t: 'T-shirt with Zano logo',
                // p
                lco: 'World Wide',
                lci: '',
                cnt: 'Skype: some_skype, discord: some_user#01012',
                com: 'A comment about the tshirt',
                pt: 'Credit cards, BTC, ZANO, ETH',
                do: 'Additional conditions',
                cat: 'CLS:MAN:TSH',
                et: 10,
                url: ''
            }
        }
        let offer = await walletClient.marketplace_push_offer(opts)
        console.log('waiting for confirmations')
        await waitForBlocks(1000 * 120)
        opts.od.lco = 'Europe'
        opts.tx_id = offer.tx_hash
            
        offer = await walletClient.marketplace_push_update_offer(opts)
        opts.tx_id = offer.tx_hash
        return expect(1).to.equal(1)
        // console.log('waiting for confirmations')
        // await waitForBlocks(1000 * 60)
        // return expect(walletClient.marketplace_cancel_offer(opts))
        //             .to.eventually.have.keys('tx_hash', 'tx_blob_size')

    })

    function waitForBlocks(numberOfBlocks) {
        return new Promise(resolve => setTimeout(resolve, numberOfBlocks))
    }
})