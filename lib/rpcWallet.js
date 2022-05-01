'use strict'

const http = require('./httpClient')
const { default: PQueue } = require('p-queue')
const rpcHelpers = require('./rpcHelpers')

function parseWalletResponse (res) {
  if (res.status === 200) {
    if ('error' in res.data) {
      const error = new Error('HTTP Error!')
      error.code = res.data.error.code
      error.message = res.data.error.message
      throw error      
    }
    if ('result' in res.data) {
      return res.data.result
    } else {
      const error = new Error('RPC Error!')
      error.code = res.data.error.code
      error.message = res.data.error.message
      throw error
    }
  } else {
    const error = new Error('HTTP Error!')
    error.code = res.status
    error.message = res.data
    throw error
  }
}
/**
 * @module RPCWallet
 */
var rpcWallet = {}

/**
* Factory that creates a RPCWallet client object.
* @function module:RPCWallet.createWalletClient
* @param {Object} opts
* @param {string} opts.url - complete url with port 'http://127.0.0.1:20000' or 'https://127.0.0.1:20000'.
* @param {string} [opts.username='Mufasa'] - username.
* @param {string} [opts.password='Circle of Life'] - password.
* @return {RPCWallet} returns a new instance of RPCDaemon.
*/
rpcWallet.createWalletClient = function (config) {
  const queue = new PQueue({ concurrency: 1 })
  const httpClient = http.createHttpClient(config)
  const jsonAddress = config.url + '/json_rpc'

  httpClient.defaults.headers.post['Content-Type'] = 'application/json'

  return {
    /**
    *  Convenience Digest function to reset nc to '00000001' and generate a new cnonce
    */
    resetNonces: async function () {
      return httpClient.resetNonces()
    },
    /**
    *  If not false, the server certificate is verified against the list of supplied CAs.
    */
    sslRejectUnauthorized: function (value) {
      httpClient.defaults.httpAgent.options.rejectUnauthorized = value
      httpClient.defaults.httpsAgent.options.rejectUnauthorized = value
      return value
    },
    /**
    * Return the wallet's addresses for an account. Optionally filter for specific set of subaddresses.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  address: 'ZxBj1cQSiCfhQKHvZF8nFtM6dgEn2htg66p3Z9BUhVNmivASMwhX2dbN52gMLq9CKs38vTwMRJccRA4MeLqrQEGg1bWpjgQfQ',
    * }
    */
    getAddress: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'getaddress')
    },
    /**
    * Return the wallet's addresses for an account. Optionally filter for specific set of subaddresses.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  address: 'ZxBj1cQSiCfhQKHvZF8nFtM6dgEn2htg66p3Z9BUhVNmivASMwhX2dbN52gMLq9CKs38vTwMRJccRA4MeLqrQEGg1bWpjgQfQ',
    *  current_height: 481295,
    *  is_whatch_only: false,
    *  path: 'muscleman.test',
    *  transfer_entries_count: 722,
    *  transfers_count: 740,
    *  utxo_distribution: ['0.0003:1','0.002:1','0.005:1']
    * }
    */
     get_wallet_info: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'get_wallet_info')
    },
    /**
    * Return the wallet's addresses for an account. Optionally filter for specific set of subaddresses.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  last_item_index: 0,
    *  pi: {
    *   balance: 0,
    *   curent_height: 0,
    *   transfer_entries_count: 0,
    *   transfers_count: 0,
    *   unlocked_balance: 0,
    *  },
    *  total_transfers: 0
    * }
    */
     get_recent_txs_and_info: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'get_recent_txs_and_info')
    },
    /**
    * Return the wallet's balance.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  balance: 0,
    *  unlocked_balance: 0
    * }
    */
    getBalance: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'getbalance')
    },
    /**
    * Get a list of incoming payments using a given payment id, or a list of payments ids, from a given height. This method is the preferred method over get_payments because it has the same functionality but is more extendable. Either is fine for looking up transactions by a single payment ID.
    * @async
    * @param {Object} opts
    * @param {string[]} opts.payment_ids - Payment IDs used to find the payments (16 characters hex).
    * @param {number} opts.min_block_height - The block height at which to start looking for payments.
    * @param {bool} opts.allow_locked_transactions
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  payments:
    *  [
    *   {
    *    payment_id: '8ca523f5e9506fed',
    *    tx_hash: '577d8d53135d49b46238c37fe2429e38610b0fcc4f06799969a7b60c69388d53',
    *    amount: 1100000000,
    *    block_height: 8667,
    *    unlock_time: 0
    *   },
    *   ...
    *  ]
    * }
    */
     get_bulk_payments: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        payment_ids: 'ArrayOfPaymentIds',
        min_block_height: 'Integer'
      }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'get_bulk_payments', opts)
    },
    /**
    * Get a list of incoming payments using a given payment id.
    * @async
    * @param {Object} opts
    * @param {string} opts.payment_id - Payment ID used to find the payments (16 characters hex).
    * @param {bool} [opts.allow_locked_transactions]
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  payments:
    *  [
    *   {
    *    payment_id: '8ca523f5e9506fed',
    *    tx_hash: '577d8d53135d49b46238c37fe2429e38610b0fcc4f06799969a7b60c69388d53',
    *    amount: 1100000000,
    *    block_height: 8667,
    *    unlock_time: 0
    *   },
    *   ...
    *  ]
    * }
    */
    get_payments: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ payment_id: 'PaymentId' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'get_payments', opts)
    },
    /**
    * Make an integrated address from a payment id.
    * @async
    * @param {Object} [opts]
    * @param {string} [opts.payment_id] - Defaults to a random ID. 16 characters hex encoded.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  integrated_address: 'iZ1D8uVznFyhQKHvZF8nFtM6dgEn2htg66p3Z9BUhVNmivASMwhX2dbN52gMLq9CKs38vTwMRJccRA4MeLqrQEGgCbQFxcMALdu1xjgxYHxs',
    *  payment_id: '8ca523f5e9506fed'
    * }
    */
     make_integrated_address: async function (opts) {
      rpcHelpers.checkOptionalParametersType({
        payment_id: 'PaymentId'
      }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'make_integrated_address', opts)
    },
    /**
    * Set description for an account tag.
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_unsigned_hex - Set of unsigned tx returned by "transfer" or "transferSplit" methods.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  tx_signed_hex:'4172516d41207 ...',
    *  tx_hash: '11dc58c45e048cf4596ff4726b0130bf389933c55bc0b48f82d168980eca122e'
    * }
    */
     sign_transfer: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ tx_unsigned_hex: 'String' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'sign_transfer', opts)
    },
    /**
    * Retrieve the standard address and payment id corresponding to an integrated address.
    * @async
    * @param {Object} opts
    * @param {string} opts.integrated_address - Integrated address.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  standard_address: 'ZxBj1cQSiCfhQKHvZF8nFtM6dgEn2htg66p3Z9BUhVNmivASMwhX2dbN52gMLq9CKs38vTwMRJccRA4MeLqrQEGg1bWpjgQfQ'
    *  payment_id: '8ca523f5e9506fed',
    * }
    */
     split_integrated_address: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ integrated_address: 'Address' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'split_integrated_address', opts)
    },
    /**
    * Save the wallet file.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   wallet_file_size: 0
    * }
    */
    store: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'store')
    },
    /**
    * Set description for an account tag.
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_signed_hex - signed tx returned by "sign_transfer".
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  tx_hash: '11dc58c45e048cf4596ff4726b0130bf389933c55bc0b48f82d168980eca122e'
    * }
    */
     submit_transfer: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ tx_signed_hex: 'String' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'submit_transfer', opts)
    },
     /**
    * Get wallet restore info.
    * @async
    * @param {Object} opts
    * @param {string} opts.seed_password - seed password for wallet.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  seed_phrase: 'coffee rest stand said leg muse defense wild about mighty horse melt really hum sharp seek honest brush depress beyond hundred silly confusion inhale birthday frozen'
    * }
    */
      get_restore_info: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ seed_password: 'String' }, opts)

      let a = rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'get_restore_info', opts)
      return a
    },
    /**
    * Get wallet restore info.
    * @async
    * @param {Object} opts
    * @param {Object} opts.request
    * @param {string} opts.request.seed_phrase - seed phrase to validate
    * @param {string} opts.request.seed_password - seed password for wallet.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  hash_sum_matched: true,
    *  required_password: false,
    *  syntax_correct: false,
    *  tracking: false
    * }
    */
     get_seed_phrase_info: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ seed_password: 'String',
                                            seed_phrase: 'String' }, opts)

      let a = rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'get_seed_phrase_info', opts)
      return a
    },    
    /**
    * Send all unlocked balance to an address.
    * @async
    * @param {Object} opts
    * @param {number} opts.mixin - Number of outputs from the blockchain to mix with (0 means no mixing).
    * @param {string} opts.address - Destination public address.
    * @param {number} opts.amount - 
    * @param {string} [opts.payment_id_hex] - Random 32-byte/64-character hex string to identify a transaction.
    * @param {number} [opts.fee] - 
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  tx_hash: '',
    *  tx_unsigned_hex: '',
    *  outs_total: 0,
    *  outs_swept: 0,
    *  amount_swept: 0
    * }
    */
     sweep_below: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        mixin: 'Integer',
        address: 'Address',
        fee: 'Integer',
        amount: 'Integer'
      }, opts)

      rpcHelpers.checkOptionalParametersType({
        payment_id_hex: 'PaymentId',
      }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'sweep_below', opts)
    },
    /**
    * Search for transactions.
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_id - 
    * @param {boolean} opts.in - 
    * @param {boolean} opts.out - 
    * @param {boolean} [opts.pool] - Random 32-byte/64-character hex string to identify a transaction.
    * @param {boolean} [opts.filter_by_height] - 
    * @param {number} [opts.min_height] -
    * @param {number} [opts.max_height] -
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  in: {
    *       amount: 0,
    *       timestamp: 0,
    *       tx_hash: '',
    *       height: 0,
    *       unlock_time: 0,
    *       tx_blob_size: 0,
    *       payment_id: '',
    *       remote_addresses: ['', ''],
    *       recipient_addresses: ['', ''],
    *       comment: '',
    *       is_income: true,
    *       is_service: true,
    *       is_mixing: true,
    *       is_mining: true,
    *       tx_type: 2,
    *       td: {
    *             rcv: [0, 1],
    *             spn: [1, 0]
    *           },
    *       service_entries: [{service_id: '',
    *                         instruction: '',
    *                         body: '',
    *                         security: 0}],
    *       fee: 0,
    *       show_sender: true,
    *       contract: [{
    *                   contract_state: 1,
    *                   state: 1,
    *                   is_a: true,
    *                   private_detailes: {},
    *                   expiration_time: 0,
    *                   cancel_expiration_time: 0,
    *                   timestamp: 0,
    *                   height: 0,
    *                   payment_id: '',
    *                   proposal: {},
    *                   release_body: {},
    *                   cancel_body: {}],
    *       extra_flags: 1,
    *       transfer_internal_index: 1
    *       },
 *  out: {
    *       amount: 0,
    *       timestamp: 0,
    *       tx_hash: '',
    *       height: 0,
    *       unlock_time: 0,
    *       tx_blob_size: 0,
    *       payment_id: '',
    *       remote_addresses: ['', ''],
    *       recipient_addresses: ['', ''],
    *       comment: '',
    *       is_income: true,
    *       is_service: true,
    *       is_mixing: true,
    *       is_mining: true,
    *       tx_type: 2,
    *       td: {
    *             rcv: [0, 1],
    *             spn: [1, 0]
    *           },
    *       service_entries: [{service_id: '',
    *                         instruction: '',
    *                         body: '',
    *                         security: 0}],
    *       fee: 0,
    *       show_sender: true,
    *       contract: [{
    *                   contract_state: 1,
    *                   state: 1,
    *                   is_a: true,
    *                   private_detailes: {},
    *                   expiration_time: 0,
    *                   cancel_expiration_time: 0,
    *                   timestamp: 0,
    *                   height: 0,
    *                   payment_id: '',
    *                   proposal: {},
    *                   release_body: {},
    *                   cancel_body: {}],
    *       extra_flags: 1,
    *       transfer_internal_index: 1
    *       },
 *  pool: {
    *       amount: 0,
    *       timestamp: 0,
    *       tx_hash: '',
    *       height: 0,
    *       unlock_time: 0,
    *       tx_blob_size: 0,
    *       payment_id: '',
    *       remote_addresses: ['', ''],
    *       recipient_addresses: ['', ''],
    *       comment: '',
    *       is_income: true,
    *       is_service: true,
    *       is_mixing: true,
    *       is_mining: true,
    *       tx_type: 2,
    *       td: {
    *             rcv: [0, 1],
    *             spn: [1, 0]
    *           },
    *       service_entries: [{service_id: '',
    *                         instruction: '',
    *                         body: '',
    *                         security: 0}],
    *       fee: 0,
    *       show_sender: true,
    *       contract: [{
    *                   contract_state: 1,
    *                   state: 1,
    *                   is_a: true,
    *                   private_detailes: {},
    *                   expiration_time: 0,
    *                   cancel_expiration_time: 0,
    *                   timestamp: 0,
    *                   height: 0,
    *                   payment_id: '',
    *                   proposal: {},
    *                   release_body: {},
    *                   cancel_body: {}],
    *       extra_flags: 1,
    *       transfer_internal_index: 1
    *       },
    * }
    */
     searchForTransactions: async function (opts) {
      // rpcHelpers.checkMandatoryParameters({
      //   mixin: 'Integer',
      //   address: 'Address',
      //   fee: 'Integer'
      // }, opts)

      // rpcHelpers.checkOptionalParametersType({
      //   payment_id_hex: 'PaymentId',
      // }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'search_for_transactions', opts)
    },
    /**
    * Send Zano to a number of recipients.
    * @async
    * @param {Object} opts
    * @param {string[]} opts.destinations - Array of destinations to receive Zano.
    * @param {number} opts.destinations.amount - Amount to send to each destination, in atomic units.
    * @param {string} opts.destinations.address - Destination public address.
    * @param {number} opts.fee
    * @param {number} opts.mixin - Number of outputs from the blockchain to mix with (0 means no mixing).
    * @param {string} [opts.payment_id] - Random 32-byte/64-character hex string to identify a transaction.
    * @param {string} [opts.comment] - comment.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  tx_hash: '90796ef384f803d2aca1e32f0fce91a07b86ab8745cfaa1ebe60f7ae07c7e0d8',
    *  tx_unsigned_hex: '',
    *  tx_size: 0
    * }
    */
    transfer: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        destinations: 'ArrayOfAmountAddress',
        mixin: 'Integer',
        fee: 'Integer',
      }, opts)

      rpcHelpers.checkOptionalParametersType({
        payment_id: 'PaymentId',
        comment: 'String',
        push_payer: 'Boolean',
        hide_receiver: 'Boolean',
        service_entries_permanent: 'Boolean'
      }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'transfer', opts)
    },
    /**
    * Send a contract proposal.
    * @async
    * @param {Object} opts
    * @param {Object} opts.details - 
    * @param {string} opts.details.t -
    * @param {string} opts.details.c -
    * @param {string} opts.details.a_addr -
    * @param {string} opts.details.b_addr -
    * @param {string} opts.details.to_pay -
    * @param {string} opts.details.a_pledge -
    * @param {string} opts.details.b_pledge -
    * @param {string} [opts.payment_id] - 
    * @param {number} opts.expiration_period
    * @param {number} opts.fee
    * @param {number} opts.b_fee
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  status: 'OK' || 'UNCONFIRMED' || 'BAD' || 'SPENT' || 'INTERNAL_ERROR' || 'BAD_ADDRESS'
    * }
    */
     contracts_send_proposal: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        details: 'ContractPrivateDetails'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'contracts_send_proposal', opts)
    },
    /**
    * Send a accept proposal.
    * @async
    * @param {Object} opts
    * @param {string} opts.contract_id - 
    * @param {number} opts.acceptance_fee -
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    * }
    */
     contracts_accept_proposal: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        contract_id: 'String',
        // acceptance_fee: 'Integer'
      }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'contracts_accept_proposal', opts)
    },
    /**
    * Get all proposals.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   contracts: [
    *     {
    *       cancel_expiration_time: 0,
    *       contract_id: '474bb56ff629aa192da3ef3efe8abbf95845bd2d4c61530db371eead20e69848',
    *       expiration_time: 1651326727,
    *       height: 489582,
    *       is_a: true,
    *       payment_id: '',
    *       private_detailes: {
    *                            a_addr: 'ZxBj1cQSiCfhQKHvZF8nFtM6dgEn2htg66p3Z9BUhVNmivASMwhX2dbN52gMLq9CKs38vTwMRJccRA4MeLqrQEGg1bWpjgQfQ',
    *                            a_pledge: 100000000000,
    *                            b_addr: 'ZxCk67uvCdxYcrWpvnnuvkGHHLre4dub961SnbAfB9fx6khF389FgURLHE9VHYq3n12FvJQLcPJjm5VRbLsFZivX36QY1BGGp',
    *                            b_pledge: 100000000000,
    *                            c: "testproposal",
    *                            t: "foobar",
    *                            to_pay: 100000000000
    *                    },
    *       state: 1,
    *       timestamp: 1651326763
    *     }
    *   ]
    * }
    */
     contracts_get_all: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'contracts_get_all')
    },
    /**
    * Release contracts.
    * @async
    * @param {Object} opts
    * @param {string} opts.contract_id
    * @param {string} opts.release_type - 'normal' || 'burn'
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    * }
    */
     contracts_release: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        contract_id: 'String',
        release_type: 'String'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'contracts_release', opts)
    },
    /**
    * Contract request cancel.
    * @async
    * @param {Object} opts
    * @param {string} opts.contract_id
    * @param {number} opts.expiration_period
    * @param {number} opts.fee
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    * }
    */
     contracts_request_cancel: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        contract_id: 'String',
        expiration_period: 'Integer',
        fee: 'Integer'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'contracts_request_cancel', opts)
    },
    /**
    * Contract accept cancel.
    * @async
    * @param {Object} opts
    * @param {string} opts.contract_id
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    * }
    */
     contracts_accept_cancel: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        contract_id: 'String'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'contracts_accept_cancel', opts)
    }


    ,
    /**
    * Marketplace push offer.
    * @async
    * @param {Object} opts
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   status: '',
    *   total_offers: 0
    * }
    */
     marketplace_get_offers_ex: async function () {

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'marketplace_get_offers_ex')
    },
    /**
    * Marketplace push offer.
    * @async
    * @param {Object} opts
    * @param {number} opts.od.fee
    * @param {string} opts.od.ot
    * @param {string} opts.od.ap
    * @param {string} opts.od.at
    * @param {string} opts.od.t
    * @param {string} opts.od.lco
    * @param {string} opts.od.lci
    * @param {string} opts.od.cnt
    * @param {string} opts.od.com
    * @param {string} opts.od.pt
    * @param {string} opts.od.do
    * @param {string} opts.od.cat
    * @param {string} opts.od.et
    * @param {string} opts.od.url
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   tx_hash: '',
    *   tx_blob_size: 0
    * }
    */
     marketplace_push_offer: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        od: 'OfferStructure'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'marketplace_push_offer', opts)
    },
    /**
    * Update marketplace offer details.
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_id
    * @param {number} opts.no
    * @param {Object} opts.od
    * @param {number} opts.od.fee
    * @param {string} opts.od.ot
    * @param {string} opts.od.ap
    * @param {string} opts.od.at
    * @param {string} opts.od.t
    * @param {string} opts.od.lco
    * @param {string} opts.od.lci
    * @param {string} opts.od.cnt
    * @param {string} opts.od.com
    * @param {string} opts.od.pt
    * @param {string} opts.od.do
    * @param {string} opts.od.cat
    * @param {string} opts.od.et
    * @param {string} opts.od.url
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   tx_hash: '',
    *   tx_blob_size: 0
    * }
    */
     marketplace_push_update_offer: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        tx_id: 'String',
        od: 'OfferStructure'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'marketplace_push_update_offer', opts)
    },
    /**
    * Mark offer as not active
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_id
    * @param {Object} opts.fee
    * @param {number} [opts.no]
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   tx_hash: '',
    *   tx_blob_size: 0
    * }
    */
     marketplace_cancel_offer: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        tx_id: 'String',
        fee: 'Integer'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'marketplace_cancel_offer', opts)
    }


    ,
    /**
    * Atomics create htlc proposal.
    * @async
    * @param {Object} opts
    * @param {string} opts.amount - amount of the coins going into HTLC. Fee for redeem transaction will be withheld from this amount too.
    * @param {Object} opts.counterparty_address - an address of the other part of atomic swap process
    * @param {string} opts.counterparty_address.spend_public_key -
    * @param {string} opts.counterparty_address.view_public_key -
    * @param {number} opts.lock_blocks_count -  amount of blocks, which define a period of time, allotted for the redeem operation. 1 block - 1 minute, 1440 blocks is est 1 day.
    * @param {string} opts.htlc_hash - Hash of the secret, if this field specified, then HTLC created with this hash, if this is empty, then wallet will derive secret in deterministic way, and in response will be returned derived_origin_secret, which will be the key for redeem of this HTLC and, obviously, for HTLC created by counter-party in the other blockchain. 
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   result_tx_blob: '', - Created and broadcasted transaction itself.
    *   result_tx_id: '', - Created transaction id .
    *   derived_origin_secret: '' - If htlc_hash field in request was empty, then this field will keep secret, which was deterministically created by sender wallet(If wallet file was lost and recovered from backup with seed phrase, then secret for any particular HTLC created by this wallet will be possible to restore). This field is HEX-encoded, but sha256 supposed to be calculated from raw blob of this secret.
    * }
    */
     atomics_create_htlc_proposal: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        amount: 'Integer',
        counterparty_address: 'String',
        lock_blocks_count: 'Integer'
      }, opts)
      rpcHelpers.checkOptionalParametersType({
        htlc_hash: 'String'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'atomics_create_htlc_proposal', opts)
    },
    /**
    * Atomics create htlc proposal.
    * @async
    * @param {Object} opts
    * @param {boolean} opts.income_redeem_only -
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   htlcs: [{
    *             counterparty_address: {
    *                                     spend_public_key: '',
    *                                     view_public_key: ''
    *                                   },
    *             sha256_hash: '',
    *             tx_id: '',
    *             amount: 0,
    *             is_redeem: true
    *          }]
    * }
    */
     atomics_get_list_of_active_htlc: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        income_redeem_only: 'Boolean'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'atomics_get_list_of_active_htlc', opts)
    },
    /**
    * Atomics create htlc proposal.
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_id -
    * @param {string} opts.origin_secret -
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   result_tx_blob: '',
    *   result_tx_id: ''
    * }
    */
     atomics_redeem_htlc: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        tx_id: 'String',
        origin_secret_as_hex: 'String'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'atomics_redeem_htlc', opts)
    },
    /**
    * Atomics create htlc proposal.
    * @async
    * @param {Object} opts
    * @param {string} opts.htlc_tx_id -
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   origin_secrete_as_hex: '',
    *   redeem_tx_id: ''
    * }
    */
     atomics_check_htlc_redeemed: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        htlc_tx_id: 'String'
      }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseWalletResponse, 'atomics_check_htlc_redeemed', opts)
    }

  }
}
exports = module.exports = rpcWallet
