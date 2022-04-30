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

describe('RPCWallet marketplace tests', () => {
    const walletClient = rpcWallet.createWalletClient({
                            url: config.walletAddress,
                            username: config.walletUsername,
                            password: config.walletPassword
                        })
    walletClient.sslRejectUnauthorized(false)

    const daemonClient = rpcDaemon.createDaemonClient({
                            url: config.daemonAddress,
                            username: config.daemonUsername,
                            password: config.daemonPassword
                        })
    daemonClient.sslRejectUnauthorized(false)

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
    it('marketplace_push_offer', async () => {
        const opts = {
            od: {
                fee: config.units,
                ot: 1,
                ap: '20',
                at: '1',
                t: 'T-shirt with Zano logo',
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
        console.log('\tcreating push offer ...')
        let offer = await walletClient.marketplace_push_offer(opts)
        let cancel_opts = {
            tx_id: offer.tx_hash,
            no: 0,
            fee: config.units
        }
        await waitForConfirmations(1)
        console.log(`\tcancelling  offer ${offer.tx_hash} ...`)
        await walletClient.marketplace_cancel_offer(cancel_opts)
        return expect(offer).to.have.keys('tx_hash', 'tx_blob_size')
    })
    it('marketplace_push_update_offer', async () => {

        const opts = {
            od: {
                fee: config.units,
                ot: 1,
                ap: '20',
                at: '1',
                t: 'T-shirt with Zano logo',
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
        console.log('\tcreating push offer ...')
        let offer = await walletClient.marketplace_push_offer(opts)
        console.log(`\twaiting for confirmation of push offer\ ${offer.tx_hash} ...`)
        await waitForConfirmations(1)
        
        opts.od.lco = 'Europe'
        opts.tx_id = offer.tx_hash
        opts.no = 0
        console.log(`\tupdating  offer ${offer.tx_hash}  ...`)   
        offer = await walletClient.marketplace_push_update_offer(opts)
        let cancel_opts = {
                tx_id: offer.tx_hash,
                no: 0,
                fee: config.units
            }
        await waitForConfirmations(1)
        console.log(`\tcancelling  offer ${offer.tx_hash} ...`)
        return expect(walletClient.marketplace_cancel_offer(cancel_opts))
                    .to.eventually.have.keys('tx_hash', 'tx_blob_size')
    })

    function delay(ms){
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async function waitForConfirmations(numberOfConfirmations) {
        let response = await daemonClient.getheight()
        const inclusiveLimit = response.height + numberOfConfirmations
        while (response.height < inclusiveLimit) {
            response = await daemonClient.getheight()
            await delay(config.seconds * 10)
        }
    }
})