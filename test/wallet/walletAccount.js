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
  it('getwalletinfo', () => {
    return expect(walletClient.getWalletInfo())
      .to.eventually.have.keys('address', 'current_height', 'is_whatch_only', 'path', 'transfer_entries_count', 'transfers_count', 'utxo_distribution')
  })
  it('get_recent_txs_and_info', () => {
    return expect(walletClient.getRecentTXsAndInfo())
      .to.eventually.have.keys('last_item_index', 'pi', 'total_transfers')
      .to.eventually.have.property('pi')
      .that.eventually.have.keys('balance', 'curent_height', 'transfer_entries_count', 'transfers_count', 'unlocked_balance')
  })
  it('transfer', () => {
    return expect(walletClient.transfer({ destinations: [{amount: 1, address: 'ZxBj1cQSiCfhQKHvZF8nFtM6dgEn2htg66p3Z9BUhVNmivASMwhX2dbN52gMLq9CKs38vTwMRJccRA4MeLqrQEGg1bWpjgQfQ'}], mixin: 1, fee: 10000000000, comment: 'woot woot'}))
      .to.eventually.have.keys('tx_hash', 'tx_unsigned_hex', 'tx_size')
  })
  it('store', () => {
    return expect(walletClient.store())
      .to.eventually.have.keys('wallet_file_size')
  })
  it('getPayments', () => {
    return expect(walletClient.getPayments({ payment_id: config.payment_id }))
      .to.eventually.have.nested.property('payments[0].payment_id')
  })
  it('getBulkPayments', () => {
    return expect(walletClient.getBulkPayments({ payment_ids: [config.payment_id], min_block_height: 1 }))
      .to.eventually.have.nested.property('payments[0].payment_id')
  })
  it('make_integrated_address', () => {
    return expect(walletClient.makeIntegratedAddress({ payment_id: config.payment_id }))
      .to.eventually.have.property('integrated_address', config.stagenetWalletIntegratedAddressA)
  })
  it('splitIntegratedAddress', () => {
    return expect(walletClient.splitIntegratedAddress({ integrated_address: config.stagenetWalletIntegratedAddressA }))
      .to.eventually.have.property('payment_id', config.payment_id)
  })
  it('sweep_below', () => {
    return expect(walletClient.sweepBelow({ address: config.stagenetWalletIntegratedAddressA, mixin: 1, fee: 10000000000 }))
      .to.eventually.have.keys('tx_hash', 'tx_unsigned_hex', 'outs_total', 'outs_swept', 'amount_swept')
  })
  it('sign_transfer', () => {
    return expect(walletClient.signTransfer({ tx_unsigned_hex: ''}))
      .to.eventually.have.keys('tx_signed_hex', 'tx_hash')
  })
  it('submit_transfer', () => {
    return expect(walletClient.submitTransfer({ tx_signed_hex: ''}))
      .to.eventually.have.keys('tx_hash')
  })
  it('get_restore_info', () => {
    return expect(walletClient.getRestoreInfo({ seed_password: '123456'}))
      .to.eventually.have.property('seed_phrase', config.stagenetSeedA)
  })
  it('get_seed_phrase_info', () => {
    return expect(walletClient.getSeedPhraseInfo({seed_phrase: config.stagenetSeedA, seed_password: '123456'}))
      .to.eventually.have.keys('hash_sum_matched', 'require_password', 'syntax_correct', 'tracking')
  })

  it('contracts_send_proposal', () => {
    return expect(walletClient.contractsSendProposal())
      .to.eventually.be.an('object').that.is.empty
  })
  it('contracts_accept_proposal', () => {
    return expect(walletClient.contractsAcceptProposal())
      .to.eventually.be.an('object').that.is.empty
  })
  it('contracts_get_all', () => {
    return expect(walletClient.contractsGetAll())
      .to.eventually.be.an('object').that.is.empty
  })
  it('contracts_release', () => {
    return expect(walletClient.contractsRelease({contract_id: '', release_type: ''}))
      .to.eventually.be.an('object').that.is.empty
  })
  it('contracts_request_cancel', () => {
    return expect(walletClient.contractsRequestCancel({contract_id: '', expiration_period: 1, fee: 10000000000}))
      .to.eventually.be.an('object').that.is.empty
  })
  it('contracts_accept_cancel', () => {
    return expect(walletClient.contractsAcceptCancel({contract_id: ''}))
      .to.eventually.be.an('object').that.is.empty
  })
  it('marketplace_get_offers_ex', () => {
    return expect(walletClient.marketplaceGetOffersEx({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })
  it('marketplace_push_offer', () => {
    return expect(walletClient.marketplacePushOffer({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })
  it('marketplace_push_update_offer', () => {
    return expect(walletClient.marketplacePushUpdateOffer({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })
  it('marketplace_cancel_offer', () => {
    return expect(walletClient.marketplaceCancelOffer({}))
      .to.eventually.have.keys('tx_hash', 'tx_blob_size')
  })

  it('atomics_create_htlc_proposal', () => {
    return expect(walletClient.atomicsCreateHtlcProposal({}))
      .to.eventually.have.keys('result_tx_blob', 'result_tx_id', 'derived_origin_secret')
  })
  it('atomics_get_list_of_active_htlc', () => {
    return expect(walletClient.atomicsGetListOfActiveHtlc({}))
      .to.eventually.have.property('htlcs')
      .to.eventually.have.keys('counterparty_address', 'sha256_hash', 'tx_id', 'amount', 'is_redeem')
      .to.eventually.have.property('counterparty_address')
      .that.eventually.have.keys('spend_public_key', 'view_public_key')
  })
  it('atomics_redeem_htlc', ({}) => {
    return expect(walletClient.atomicsRedeemHtlc({}))
      .to.eventually.have.keys('result_tx_blob', 'result_tx_id')
  })
  it('atomics_check_htlc_redeemed', ({}) => {
    return expect(walletClient.atomicsCheckHtlcRedeemed({}))
      .to.eventually.have.keys('origin_secrete', 'redeem_tx_id')
  })
})
