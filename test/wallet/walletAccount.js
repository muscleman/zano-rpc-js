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

  xit('getbalance', () => {
    return expect(walletClient.getBalance())
                .to.eventually.have.keys('balance', 'unlocked_balance')
  })
  xit('getaddress', () => {
    return expect(walletClient.getAddress())
      .to.eventually.have.keys('address')
  })
  xit('getwalletinfo', () => {
    return expect(walletClient.getWalletInfo())
      .to.eventually.have.keys('address', 'current_height', 'is_whatch_only', 'path', 'transfer_entries_count', 'transfers_count', 'utxo_distribution')
  })
  xit('get_recent_txs_and_info', () => {
    return expect(walletClient.getRecentTXsAndInfo())
      .to.eventually.have.keys('last_item_index', 'pi', 'total_transfers') //, 'transfers')
      .to.eventually.have.property('pi')
      .that.eventually.have.keys('balance', 'curent_height', 'transfer_entries_count', 'transfers_count', 'unlocked_balance')
  })
  xit('transfer', () => {
    let opts = { destinations: [{amount: 1 * config.units, address: config.integratedTestAddressB}], payment_id: config.payment_id, mixin: 1, fee: 10000000000, comment: 'woot woot'}
    return expect(walletClient.transfer(opts))
      .to.eventually.have.keys('tx_hash', 'tx_unsigned_hex', 'tx_size')
  })
  xit('store', () => {
    return expect(walletClient.store())
      .to.eventually.have.keys('wallet_file_size')
  })
  xit('getPayments', () => {
    return expect(walletClient.getPayments({ payment_id: config.payment_id }))
      .to.eventually.have.nested.property('payments[0].payment_id')
  })
  xit('getBulkPayments', () => {
    return expect(walletClient.getBulkPayments({ payment_ids: [config.payment_id], min_block_height: 1 }))
      .to.eventually.have.nested.property('payments[0].payment_id')
  })
  xit('make_integrated_address', () => {
    return expect(walletClient.makeIntegratedAddress({ payment_id: config.payment_id }))
      .to.eventually.have.property('integrated_address', config.integratedTestAddressA)
  })
  xit('splitIntegratedAddress', () => {
    return expect(walletClient.splitIntegratedAddress({ integrated_address: config.integratedTestAddressA }))
      .to.eventually.have.property('payment_id', config.payment_id)
  })
  // it('sweep_below', () => {
  //   return expect(walletClient.sweepBelow({ address: config.integratedTestAddressA, mixin: 1, fee: 10000000000 }))
  //     .to.eventually.have.keys('tx_hash', 'tx_unsigned_hex', 'outs_total', 'outs_swept', 'amount_swept')
  // })
  xit('sign_transfer', () => {
    return expect(walletClient.signTransfer({ tx_unsigned_hex: ''}))
      .to.eventually.have.keys('tx_signed_hex', 'tx_hash')
  })
  xit('submit_transfer', () => {
    return expect(walletClient.submitTransfer({ tx_signed_hex: ''}))
      .to.eventually.have.keys('tx_hash')
  })
  xit('get_restore_info', () => {
    return expect(walletClient.getRestoreInfo({ seed_password: '123456'}))
      .to.eventually.have.property('seed_phrase', config.testNetSeedA)
  })
  xit('get_seed_phrase_info', () => {
    return expect(walletClient.getSeedPhraseInfo({seed_phrase: config.testNetSeedA, seed_password: '123456'}))
      .to.eventually.have.keys('hash_sum_matched', 'require_password', 'syntax_correct', 'tracking')
  })

  xit('contracts_send_proposal', () => {
    const opts = {
      details: {
                title: 'foobar',
                comment: 'testproposal',
                a_addr: config.integratedTestAddressB
              },
      payment_id: config.payment_id,
      expiration_period: 5,
      fee: config.fee,
      b_fee: config.fee,
      fake_outputs_count: 1,
      unlock_time: 0
    }
    return expect(walletClient.contractsSendProposal(opts))
      .to.eventually.be.an('object').that.is.empty
  })
  xit('contracts_accept_proposal', () => {
    const opts = {
      contract_id: '',
      acceptance_fee: 1
    }
    return expect(walletClient.contractsAcceptProposal(opts))
      .to.eventually.be.an('object').that.is.empty
  })
  it('contracts_get_all', () => {
    return expect(walletClient.contractsGetAll())
      .to.eventually.be.an('object').that.is.empty
  })
  xit('contracts_release', () => {
    const opts = {
      contract_id: '', 
      release_type: ''
    }
    return expect(walletClient.contractsRelease(opts))
      .to.eventually.be.an('object').that.is.empty
  })
  xit('contracts_request_cancel', () => {
    const opts = {
      contract_id: '', 
      expiration_period: 1, 
      fee: 10000000000
    }
    return expect(walletClient.contractsRequestCancel(opts))
      .to.eventually.be.an('object').that.is.empty
  })
  xit('contracts_accept_cancel', () => {
    const opts = {
      contract_id: ''
    }
    return expect(walletClient.contractsAcceptCancel(opts))
      .to.eventually.be.an('object').that.is.empty
  })
  xit('marketplace_get_offers_ex', () => {
    const opts = {
      od: {

      }
    }
    return expect(walletClient.marketplaceGetOffersEx(opts))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })
  xit('marketplace_push_offer', () => {
    return expect(walletClient.marketplacePushOffer({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })
  xit('marketplace_push_update_offer', () => {
    return expect(walletClient.marketplacePushUpdateOffer({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })
  xit('marketplace_cancel_offer', () => {
    return expect(walletClient.marketplaceCancelOffer({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })

  xit('atomics_create_htlc_proposal', () => {
    return expect(walletClient.atomicsCreateHtlcProposal({}))
      .to.eventually.have.keys('result_tx_blob', 'result_tx_id', 'derived_origin_secret')
  })
  xit('atomics_get_list_of_active_htlc', () => {
    return expect(walletClient.atomicsGetListOfActiveHtlc({}))
      .to.eventually.have.property('htlcs')
      .to.eventually.have.keys('counterparty_address', 'sha256_hash', 'tx_id', 'amount', 'is_redeem')
      .to.eventually.have.property('counterparty_address')
      .that.eventually.have.keys('spend_public_key', 'view_public_key')
  })
  xit('atomics_redeem_htlc', ({}) => {
    return expect(walletClient.atomicsRedeemHtlc({}))
      .to.eventually.have.keys('result_tx_blob', 'result_tx_id')
  })
  xit('atomics_check_htlc_redeemed', ({}) => {
    return expect(walletClient.atomicsCheckHtlcRedeemed({}))
      .to.eventually.have.keys('origin_secrete', 'redeem_tx_id')
  })
})
