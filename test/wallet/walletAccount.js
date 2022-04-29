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

describe('RPCWallet wallet account functions', function () {
  const walletClient = rpcWallet.createWalletClient({
    url: config.walletAddress,
    username: config.walletUsername,
    password: config.walletPassword
  })
  walletClient.sslRejectUnauthorized(false)

  it('getbalance', () => {
    return expect(walletClient.getBalance())
                .to.eventually.have.keys('balance', 'unlocked_balance')
  })
  it('getaddress', () => {
    return expect(walletClient.getAddress())
      .to.eventually.have.keys('address')
  })
  it('get_wallet_info', () => {
    return expect(walletClient.get_wallet_info())
      .to.eventually.have.keys('address', 'current_height', 'is_whatch_only', 'path', 'transfer_entries_count', 'transfers_count', 'utxo_distribution')
  })
  it('get_recent_txs_and_info', () => {
    return expect(walletClient.get_recent_txs_and_info())
      .to.eventually.satisfy(function(response) {
        if (response.transfers) {
          return expect(response).to.have.keys('last_item_index', 'pi', 'total_transfers', 'transfers')
        }
        return expect(response).to.have.keys('last_item_index', 'pi', 'total_transfers')
      })
      .to.eventually.have.property('pi')
      .that.eventually.have.keys('balance', 'curent_height', 'transfer_entries_count', 'transfers_count', 'unlocked_balance')
  })
  it('transfer', () => {
    let opts = { destinations: [{amount: 1 * config.units, address: config.integratedTestAddressB}], mixin: 1, fee: 10000000000, comment: 'woot woot'}
    return expect(walletClient.transfer(opts))
      .to.eventually.have.keys('tx_hash', 'tx_unsigned_hex', 'tx_size')
  })
  it('store', () => {
    return expect(walletClient.store())
      .to.eventually.have.keys('wallet_file_size')
  })
  it('get_payments', () => {
    return expect(walletClient.get_payments({ payment_id: config.payment_idA }))
            .to.eventually.satisfy(function(response) {
              // response = {payments: [{payment_id: 10}]}
              if (Object.keys(response).length === 0) {
                return expect(response).to.not.have.nested.property('payments[0].payment_id')
              }
              return expect(response).to.have.nested.property('payments[0].payment_id')
            })
  })
  it('get_bulk_payments', () => {
    return expect(walletClient.get_bulk_payments({ payment_ids: [config.payment_idA], min_block_height: 1 }))
            .to.eventually.satisfy(function(response) {
              // response = {payments: [{payment_id: 10}]}
              if (Object.keys(response).length === 0) {
                return expect(response).to.not.have.nested.property('payments[0].payment_id')
              }
              return expect(response).to.have.nested.property('payments[0].payment_id')
            })
  })
  it('make_integrated_address', () => {
    const opts = {
      payment_id: config.payment_idA
    }
    return expect(walletClient.make_integrated_address(opts))
      .to.eventually.have.property('integrated_address', config.integratedTestAddressA)
  })
  it('split_integrated_address', () => {
    const opts = {
      integrated_address: config.integratedTestAddressA
    }
    return expect(walletClient.split_integrated_address(opts))
      .to.eventually.have.property('payment_id', config.payment_idA)
  })
  it('sweep_below', async () => {
    const opts = { 
                  address: config.integratedTestAddressA, 
                  mixin: 1, 
                  fee: 10000000000,
                  amount: 1000000000000
                }
    try {
      let actual = await walletClient.sweep_below(opts)
      return expect(actual).to.have.keys('amount_swept', 'amount_total', 'outs_swept', 'outs_total', 'tx_hash', 'tx_unsigned_hex')
    } catch (error) {
      return expect(error).to.have.property('code', -4)
    }
  })
  it('get_restore_info', () => {
    return expect(walletClient.get_restore_info({ seed_password: '123456'}))
      .to.eventually.have.property('seed_phrase', config.testNetSeedA)
  })
  it('get_seed_phrase_info', () => {
    return expect(walletClient.get_seed_phrase_info({seed_phrase: config.testNetSeedA, seed_password: '123456'}))
      .to.eventually.have.keys('hash_sum_matched', 'require_password', 'syntax_correct', 'tracking')
  })
})
