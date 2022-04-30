'use strict'

const http = require('./httpClient')
const { default: PQueue } = require('p-queue')
const rpcHelpers = require('./rpcHelpers')

function parseDaemonResponse (res) {
  if (res.status === 200) {
    var json
    if ('error' in res.data) {
      const error = new Error('HTTP Error!')
      error.code = res.data.error.code
      error.message = res.data.error.message
      throw error      
    }
    if ('result' in res.data) {
      json = res.data.result
    } else {
      json = res.data
    }
    if (json.status === 'OK' || json) {
      return json
    } else {
      const error = new Error('RPC Error!')
      error.code = json.error.code
      error.message = json.error.message
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
 * @module RPCDaemon
 */
/** @typedef {{ RPCDaemon}} */
var rpcDaemon = {}

/**
* Factory that creates a RPCDaemon client object.
* @function module:RPCDaemon.createDaemonClient
* @param {Object} opts
* @param {string} opts.url - complete url with port 'http://127.0.0.1:20000' or 'https://127.0.0.1:20000'.
* @param {string} [opts.username='Mufasa'] - username.
* @param {string} [opts.password='Circle of Life'] - password.
* @return {RPCDaemon} returns a new instance of RPCDaemon.
*/
rpcDaemon.createDaemonClient = function (config) {
  /**
 * @async
 * @param {Object} opts
 * @param {string} opts.url - complete url with port 'http://127.0.0.1:19994' or 'https://127.0.0.1:19994'.
 * @param {string} [opts.username='Mufasa'] - username.
 * @param {string} [opts.password='Circle of Life'] - password.
 * @return {RPCDaemon} returns a new instance of RPCDaemon.
 */
  const queue = new PQueue({ concurrency: 1 })
  const httpClient = http.createHttpClient(config)
  const jsonAddress = config.url + '/json_rpc'
  httpClient.defaults.headers.post['Content-Type'] = 'application/json'
  return {
    /**
    *  Convenience Digest function to reset nc to '00000001' and generate a new cnonce
    */
    resetNonces: function () {
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
    * Look up how many blocks are in the longest chain known to the node.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  count: 144188,
    *  status: 'OK'
    * }
    */
    getBlockCount: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'getblockcount')
    },
    /**
    * Look up a block's hash by its height.
    * @async
    * @param {Object} opts
    * @param {number} opts.height - block height.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * 6d420b6a27ac284a93b86b6bd52423adc29f63c958d641c12eced1cd523f12e9
    */
    on_getBlockHash: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ height: 'Integer' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'on_getblockhash', [opts.height])
    },
    /**
    * Returns a block header by the given hash identifier.
    * @async
    * @param {Object} opts
    * @param {string} opts.hash - The block's sha256 hash.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  block_header:
    *  {
    *   depth: 30823,
    *   difficulty: 109000131,
    *   hash: '5859dbfca776cc006f6bfd00a41363f8ffcc20e6f217c484df0b47ae8cc2458a',
    *   height: 114196,
    *   major_version: 10,
    *   minor_version: 10,
    *   nonce: 2147508795,
    *   orphan_status: false,
    *   prev_hash: 'be9bcd157ff60f9b174217608a5b419c451afa1d9d76c49edf54ac829bf24e74',
    *   reward: 19191616421,
    *   timestamp: 1550322226
    *  },
    *  status: 'OK'
    * }
    */
    getBlockHeaderByHash: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ hash: 'Hash' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'getblockheaderbyhash', opts)
    },
    /**
    * Returns a block header by the given block height.
    * @async
    * @param {Object} opts
    * @param {number} opts.height - The block's height.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  block_header:
    *  {
    *   depth: 30823,
    *   difficulty: 109000131,
    *   hash: '5859dbfca776cc006f6bfd00a41363f8ffcc20e6f217c484df0b47ae8cc2458a',
    *   height: 114196,
    *   major_version: 10,
    *   minor_version: 10,
    *   nonce: 2147508795,
    *   orphan_status: false,
    *   prev_hash: 'be9bcd157ff60f9b174217608a5b419c451afa1d9d76c49edf54ac829bf24e74',
    *   reward: 19191616421,
    *   timestamp: 1550322226
    *  },
    *  status: 'OK'
    * }
    */
    getBlockHeaderByHeight: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ height: 'Integer' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'getblockheaderbyheight', opts)
    },
    /**
    * Returns alias details by alias name.
    * @async
    * @param {Object} opts
    * @param {string} opts.alias - alias name (without "@")
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  alias_details: { 
    *   address: '', 
    *   comment: '', 
    *   tracking_key: '' },
    *  status: 'NOT_FOUND'
    *}
    */
    get_alias_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ alias: 'String' }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_alias_details', opts)
    },
    /**
    * Returns alias name by address.
    * @async
    * @param {Object} opts
    * @param {string} opts.address - a public address associated with an alias.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   alias_info: {
    *     address: '',
    *     alias: '',
    *     comment: '',
    *     tracking_key: ''
    *   },
      status: 'FAILED'
    */
    get_alias_by_address: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ address: 'Address' }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_alias_by_address', opts.address)
    },
    /**
    * Returns current reward that must be paid to register an alias name.
    * @async
    * @param {Object} opts
    * @param {string} opts.alias - alias name
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   alias_info: {
    *     address: '',
    *     alias: '',
    *     comment: '',
    *     tracking_key: ''
    *   },
    *  status: 'FAILED'
    * }
    */
    get_alias_reward: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ alias: 'String' }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_alias_reward', opts)
    },
    /**
    * Returns a block header by the given block height.
    * @async
    * @param {Object} opts
    * @param {number} opts.height_start - starting height.
    * @param {number} opts.count - number of blocks to be requested.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  blocks:[
    *  {
    *   actual_timestamp: 1620413829,
    *   already_generated_coins: '17517303000000000000',
    *   base_reward: 1000000000000,
    *   blob: '',
    *   block_cumulative_size: 0,
    *   block_tself_size: 0,
    *   cumulative_diff_adjusted: '43499994',
    *   cumulative_diff_precise: '2314',
    *   difficulty: '587',
    *   effective_fee_median: 10000,
    *   height: 100,
    *   id: '6d420b6a27ac284a93b86b6bd52423adc29f63c958d641c12eced1cd523f12e9',
    *   is_orphan: false,
    *   miner_text_info: '1.2.0.121[2e34f21]',
    *   object_in_json: '',
    *   penalty: 0,
    *   pow_seed: "",
    *   prev_id: 8485ee77b53f3b93fecc8a31ee414b66fdf82a1d9263e8d51eed4f7717e1093e',
    *   summary_reward: 1000000000000,
    *   this_block_fee_median: 0,
    *   timestamp: 1620413835,
    *   total_fee: 0,
    *   total_txs_size: 0,
    *   transactions_details: [{
    *      amount: 2000000000000,
    *      blob: '',
    *      blob_size: 203,
    *      fee: 0,
    *      id: '07edca07b935b23fef3bee741e73f4b63772a600dd37823b0293266323d12b82',
    *      keeper_block: 100,
    *      object_in_json: '',
    *      pub_key: 'e6b488b7b3d9ce81ef29766fb1e2d8b829e5a7d706d491d95af74fdef051862a',
    *      timestamp: 1620413829
    *     }],
    *   type: 0
    *  }],
    *  status: 'OK'
    * }
    */
    get_blocks_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ height_start: 'Integer',
                                            count: 'Integer' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_blocks_details', opts)
    },
    /**
    * Returns tx_info — object; a tx_rpc_extended_info object.
    * @async
    * @param {Object} opts
    * @param {string} opts.tx_hash - hash identifier of a transaction
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   tx_info: {
    *     amount: 2000000000000,
    *     blob: '',
    *     blob_size: 203,
    *     extra: [{
    *       datails_view': '',
    *       short_view: 'e6b488b7b3d9ce81ef29766fb1e2d8b829e5a7d706d491d95af74fdef051862a',
    *       type: 'pub_key'
    *     },
    *     fee: 0,
    *     id: '07edca07b935b23fef3bee741e73f4b63772a600dd37823b0293266323d12b82',
    *     ins: [{
    *         amount: 0,
    *         htlc_origin: '',
    *         kimage_or_ms_id': '',
    *         multisig_count: 0
    *       },{
    *         amount: 1000000000000,
    *         global_indexes: [93],
    *         htlc_origin: '',
    *         kimage_or_ms_id: 'fbf9eb08df6e805cc0e3606e3cb6e4a75ba86b3dea83b32a9d643ad540a1fc3a',
    *         multisig_count: 0
    *       }],
    *     keeper_block: 100,
    *     object_in_json: '',
    *     outs: [{
    *         amount: 1000000000000,
    *         global_index: 152,
    *         is_spent: true,
    *         minimum_sigs: 0,
    *         pub_keys: ['9546c8d2af75c7698197ce7ba1029d362b43e2b82148d715c951f55b95e822cb']
    *       },{
    *         amount: 1000000000000,
    *         global_index: 153,
    *         is_spent: true,
    *         minimum_sigs: 0,
    *         pub_keys: ['2d45f1f0877a808f0eb47d60e304e282a8b56c2b7639bf64b59347ad9fd776b7']
    *       }],
    *     pub_key: 'e6b488b7b3d9ce81ef29766fb1e2d8b829e5a7d706d491d95af74fdef051862a',
    *     timestamp: 1620413829
    *   }
    *   status: 'OK'
    * }
    */
    get_tx_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ tx_hash: 'String' }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_tx_details', opts)
    },
    /**
    * Returns type of an entity by specified hash identifier.
    * @async
    * @param {Object} opts
    * @param {string} opts.id - hash identifier of a block, transaction, key image, or multisig output.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * { 
    *   types_found: [ 'tx' ] 
    *   status: 'OK', 
    * }
    */
    search_by_id: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ id: 'String' }, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'search_by_id', opts)
    },
    /**
    * Creates a template for the next block.
    * @async
    * @param {Object} opts
    * @param {string} opts.wallet_address - miner's address for receiving newly generated coins.
    * @param {string} [opts.extra_text] - additional text included into miner transaction. Cannot exceed 255 bytes.
    * @param {boolean} [opts.pos_block] - specify type of block template to be created: PoS (true) or PoW (false). Default: false.
    * @param {string} [stakeholder_address] - specify miner's address to which the stake coins used in PoS block generation will be returned.
    * @param {number} [pos_amount] - amount of an output used as a stake.
    * @param {number} [pos_index] - global index of an output used as a stake.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  blocktemplate_blob: '020000000000000000fded159f2aa9e8e105a1fab9a419abb4718062a7e5248e98c4354d821ba77f280089b2a793060001010098d41d0180a094a58d1d03c8acde5ae6f153f4884504e7c44c6549672c0eead723c2e73b10737ec0fcb294000416228290a796b9967c821c48ddb67fe247c3acfb49ca2e67a55658ee7013ec743615000b025d1a0ea2d41d000000',
    *  difficulty: 1472918,
    *  height: 485912,
    *  prev_hash: 'fded159f2aa9e8e105a1fab9a419abb4718062a7e5248e98c4354d821ba77f28',
    *  seed: 'f1af2c862779f5efe4ec2ba0c3982e07c705fd93f1ce622b03681128c04f6aa2',
    *  status: 'OK'
    * }
    */
    getBlockTemplate: async function (opts) {
      let fields = {wallet_address: 'Address'}
      if (opts.pos_block) {
        fields['pos_block'] = 'Boolean'
        fields['stakeholder_address'] = 'String'
      }
      rpcHelpers.checkMandatoryParameters(fields, opts)

      rpcHelpers.checkOptionalParametersType({ extra_text: 'Max255Bytes'}, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'getblocktemplate', opts)
    },
    /**
    * Retrieve general information about the state of your node and the network.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   alias_count: 2,
    *   alt_blocks_count: 0,
    *   block_reward: 1000000000000,
    *   current_blocks_median: 125000,
    *   current_max_allowed_block_size: 250000,
    *   current_network_hashrate_350: 12244,
    *   current_network_hashrate_50: 16368,
    *   daemon_network_state: 2,
    *   default_fee: 10000000000,
    *   expiration_median_timestamp: 1651117727,
    *   grey_peerlist_size: 4,
    *   height: 486155,
    *   incoming_connections_count: 0,
    *   last_block_hash: '70e3e89667210dfc1a6a75e118014ab63afa5c2413516e21c7d052b85ac616a1',
    *   last_block_size: 0,
    *   last_block_timestamp: 1651117680,
    *   last_block_total_reward: 1000000000000,
    *   last_pos_timestamp: 1651117680,
    *   last_pow_timestamp: 1651118450,
    *   max_net_seen_height: 0,
    *   mi: {
    *     build_no: 0,
    *     mode: 0,
    *     ver_major: 0,
    *     ver_minor: 0,
    *     ver_revision: 0
    *   },
    *   minimum_fee: 10000000000,
    *   net_time_delta_median: 0,
    *   offers_count: 0,
    *   outgoing_connections_count: 8,
    *   outs_stat: {
    *     amount_0_001: 25,
    *     amount_0_01: 2697,
    *     amount_0_1: 29,
    *     amount_1: 486894,
    *     amount_10: 9,
    *     amount_100: 240325,
    *     amount_1000: 1,
    *     amount_10000: 1,
    *     amount_100000: 0,
    *     amount_1000000: 0
    *   },
    *   performance_data: {
    *     all_txs_insert_time_5: 252,
    *     block_processing_time_0: 16000,
    *     block_processing_time_1: 16380,
    *     etc_stuff_6: 1344,
    *     insert_time_4: 33,
    *     longhash_calculating_time_3: 4322,
    *     map_size: 137438953472,
    *     raise_block_core_event: 0,
    *     target_calculating_calc: 37,
    *     target_calculating_enum_blocks: 9838,
    *     target_calculating_time_2: 9883,
    *     tx_add_one_tx_time: 88256,
    *     tx_append_is_expired: 8,
    *     tx_append_rl_wait: 0,
    *     tx_append_time: 10547,
    *     tx_check_exist: 17,
    *     tx_check_inputs_attachment_check: 1,
    *     tx_check_inputs_loop: 77686,
    *     tx_check_inputs_loop_ch_in_val_sig: 704,
    *     tx_check_inputs_loop_kimage_check: 30,
    *     tx_check_inputs_loop_scan_outputkeys_get_item_size: 9,
    *     tx_check_inputs_loop_scan_outputkeys_loop: 54,
    *     tx_check_inputs_loop_scan_outputkeys_loop_find_tx: 27,
    *     tx_check_inputs_loop_scan_outputkeys_loop_get_subitem: 19,
    *     tx_check_inputs_loop_scan_outputkeys_loop_handle_output: 1,
    *     tx_check_inputs_loop_scan_outputkeys_relative_to_absolute: 0,
    *     tx_check_inputs_prefix_hash: 0,
    *     tx_check_inputs_time: 77689,
    *     tx_count: 0,
    *     tx_mixin_count: 1,
    *     tx_prapare_append: 0,
    *     tx_print_log: 0,
    *     tx_process_attachment: 0,
    *     tx_process_extra: 0,
    *     tx_process_inputs: 10206,
    *     tx_push_global_index: 139,
    *     tx_store_db: 106,
    *     writer_tx_count: 0
    *   },
    *   pos_allowed: true,
    *   pos_block_ts_shift_vs_actual: -785,
    *   pos_diff_total_coins_rate: 147,
    *   pos_difficulty: '71933044594361262346',
    *   pos_sequence_factor: 2,
    *   pow_difficulty: 1492462,
    *   pow_sequence_factor: 0,
    *   seconds_for_10_blocks: 243,
    *   seconds_for_30_blocks: 1119,
    *   status: 'OK',
    *   synchronization_start_height: 0,
    *   synchronized_connections_count: 8,
    *   total_coins: '18003356780000000000',
    *   transactions_cnt_per_day: 8,
    *   transactions_volume_per_day: 808000000000000,
    *   tx_count: 2684,
    *   tx_count_in_last_block: 0,
    *   tx_pool_performance_data: {
    *     begin_tx_time: 0,
    *     check_inputs_time: 0,
    *     check_inputs_types_supported_time: 0,
    *     check_keyimages_ws_ms_time: 0,
    *     db_commit_time: 0,
    *     expiration_validate_time: 0,
    *     tx_processing_time: 0,
    *     update_db_time: 0,
    *     validate_alias_time: 0,
    *     validate_amount_time: 0
    *   },
    *   tx_pool_size: 0,
    *   white_peerlist_size: 8
    * }
    */
    getInfo: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'flags': 'Integer'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'getinfo')
    },
    /**
    * Returns an output in the global outputs table by specified amount and output global index.
    * @async
    * @param {number} amount - output amount
    * @param {number} i - output global index
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   out_no: 0,
    *   status: 'OK',
    *   tx_id: '0cdb4d14ed23700941d148c38b83a76249250d36c35bc2db6f764df7e9ae9d51'
    * }
    */
     get_out_info: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'amount': 'Integer',
                                           'i': 'Integer'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_out_info', opts)
    },
    /**
    * Returns an output in the global outputs table by specified amount and output global index.
    * @async
    * @param {string} ms_id - hash identifier of a multisig output
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   out_no: 0,
    *   status: 'OK',
    *   tx_id: '0cdb4d14ed23700941d148c38b83a76249250d36c35bc2db6f764df7e9ae9d51'
    * }
    */
     get_multisig_info: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'ms_id': 'String'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_multisig_info', opts)
    },
    /**
    * Returns all registered aliases.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   aliases: [
    *     {
    *       address: 'ZxCNAYmgih6Cd1pScKY8gxQgbT2UzBFmE67cx9fLRuK693rYG9X5UNQgY8cHQWBr9UVwTFufTMumvUvTtPGd8yKK2czQ3SPQ6',
    *       alias: 'buyer1',
    *       comment: '',
    *       tracking_key: ''
    *     },
    *     {
    *       address: 'ZxDYfNdqzvrKVaSj6JuYFKNt9hTUnHCeB5ZgDPsNrLZeXpy89ik6WSg6nU4gisHnoNS2GHBzZc5pbUTF3broWCXz1ZAWY47dB',
    *       alias: 'vendor1',
    *       comment: '',
    *       tracking_key: ''
    *     }
    *   ],
    *   status: 'OK'
    * }
    */
     get_all_alias_details: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_all_alias_details')
    },
    /**
    * Returns all registered aliases.
    * @async
    * @param {number} offset - starting offset in global alias list
    * @param {number} count - how many elements to retrieve
    * @example <caption><b>Output</b></caption>
    * {
    *   aliases: [
    *     {
    *       address: 'ZxCNAYmgih6Cd1pScKY8gxQgbT2UzBFmE67cx9fLRuK693rYG9X5UNQgY8cHQWBr9UVwTFufTMumvUvTtPGd8yKK2czQ3SPQ6',
    *       alias: 'buyer1',
    *       comment: '',
    *       tracking_key: ''
    *     },
    *     {
    *       address: 'ZxDYfNdqzvrKVaSj6JuYFKNt9hTUnHCeB5ZgDPsNrLZeXpy89ik6WSg6nU4gisHnoNS2GHBzZc5pbUTF3broWCXz1ZAWY47dB',
    *       alias: 'vendor1',
    *       comment: '',
    *       tracking_key: ''
    *     }
    *   ],
    *   status: 'OK'
    * }
    */
    get_aliases: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'offset': 'Integer',
                                           'count': 'Integer'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_aliases', opts)
    },
    /**
    * Returns transactions that are currently in the pool.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     get_pool_txs_details: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_pool_txs_details')
    },
    /**
    * Returns transactions that are currently in the pool.
    * @async
    * @param {string[]} ids - ids. list of transaction hash identifiers for which information is requested. All transactions from the pool will be returned if ids is empty or if this parameter is omitted.
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     get_pool_txs_brief_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'ids': 'ArrayOfStrings'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_pool_txs_brief_details', opts)
    },
    /**
    * Returns IDs for all txs in the pool.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     get_all_pool_tx_list: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_all_pool_tx_list')
    },
    /**
    * Returns transactions that are currently in the pool.
    * @async
    * @param {string} id - hash identifier for a block.
    * @example <caption><b>Output</b></caption>
    * {
    *   block_details: {
    *     actual_timestamp: 1651149095,
    *     already_generated_coins: '18003869780000000000',
    *     base_reward: 1000000000000,
    *     blob: '',
    *     block_cumulative_size: 0,
    *     block_tself_size: 0,
    *     cumulative_diff_adjusted: '798800990099',
    *     cumulative_diff_precise: '7776149227365067248357954',
    *     difficulty: '72053983116412224867',
    *     effective_fee_median: 10000000000,
    *     height: 486667,
    *     id: '5698b701f989214770c2cff71166408c13d97e907aa4654781dc05e6994e59a5',
    *     is_orphan: false,
    *     miner_text_info: '1.4.1.142[c565653-dirty]',
    *     object_in_json: '{\n' +
    *       '  "major_version": 2, \n' +
    *       '  "nonce": 0, \n' +
    *       '  "prev_id": "2cfcebbbc16fb510fdb6112c17fe0223e01e2d65909705d1cfeea8b604aa9aeb", \n' +
    *       '  "minor_version": 0, \n' +
    *       '  "timestamp": 1651150185, \n' +
    *       '  "flags": 1, \n' +
    *       '  "miner_tx": {\n' +
    *       '    "version": 1, \n' +
    *       '    "vin": [ {\n' +
    *       '        "gen": {\n' +
    *       '          "height": 486667\n' +
    *       '        }\n' +
    *       '      }, {\n' +
    *       '        "key": {\n' +
    *       '          "amount": 100000000000000, \n' +
    *       '          "key_offsets": [ {\n' +
    *       '              "uint64_t": 239457\n' +
    *       '            }\n' +
    *       '          ], \n' +
    *       '          "k_image": "cf0aa7f033ad6ce9f696441894b0b76f70338f508f74a335bacd1de67becce4b", \n' +
    *       '          "etc_details": [ ]\n' +
    *       '        }\n' +
    *       '      }], \n' +
    *       '    "vout": [ {\n' +
    *       '        "amount": 1000000000000, \n' +
    *       '        "target": {\n' +
    *       '          "key": "09740fa9d5757f9c5e27bec79c222117e6b4061dadbed31bc092ddad73aef09100"\n' +
    *       '        }\n' +
    *       '      }, {\n' +
    *       '        "amount": 100000000000000, \n' +
    *       '        "target": {\n' +
    *       '          "key": "5235b5aa50a36b2a72bc454a99c3d10e2d1691a9f50ef1ebec7e65515e81e77d00"\n' +
    *       '        }\n' +
    *       '      }\n' +
    *       '    ], \n' +
    *       '    "extra": [ {\n' +
    *       '        "pub_key": "9c8bed5dae58418701b190771a7178cd93995fb3017ce20f91bd3a4000b267e3"\n' +
    *       '      }, {\n' +
    *       '        "user_data": , \n' +
    *       '        "buff": 24"312e342e312e3134325b633536353635332d64697274795d"\n' +
    *       '      }, {\n' +
    *       '        "extra_padding": , \n' +
    *       '        "buff": [ ]\n' +
    *       '      }, {\n' +
    *       '        "derivation_hint": , \n' +
    *       '        "msg": 2"8908"\n' +
    *       '      }, {\n' +
    *       '        "unlock_time": , \n' +
    *       '        "v": 486677\n' +
    *       '      }, {\n' +
    *       '        "attachment": , \n' +
    *       '        "service_id": 1"64", \n' +
    *       '        "instruction": 0"", \n' +
    *       '        "body": 8"27896a6200000000", \n' +
    *       '        "security": [ ], \n' +
    *       '        "flags": 0\n' +
    *       '      }], \n' +
    *       '    "signatures": [ [ "9e3b7093120804223653cd821808d0262a982c0d503a25cbb7389bc9df9c220069ed7c223758e2bc5cc91f0a81acd8065bdb4be2cdf89c152620237b4dcf0202"\n' +
    *       '      ]\n' +
    *       '    ], \n' +
    *       '    "attachment": [ ]\n' +
    *       '  }, \n' +
    *       '  "tx_hashes": [ ]\n' +
    *       '}',
    *     penalty: 0,
    *     pow_seed: '',
    *     prev_id: '2cfcebbbc16fb510fdb6112c17fe0223e01e2d65909705d1cfeea8b604aa9aeb',
    *     summary_reward: 1000000000000,
    *     this_block_fee_median: 0,
    *     timestamp: 1651150185,
    *     total_fee: 0,
    *     total_txs_size: 0,
    *     transactions_details: [],
    *     type: 0
    *   },
    *   status: 'OK'
    * }
    */
     get_main_block_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'id': 'String'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_main_block_details', opts)
    },
    /**
    * Returns block details for a specified identifier. Only for blocks in alternative chains.
    * @async
    * @param {string} id - hash identifier for a block.
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     get_alt_block_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'id': 'String'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_alt_block_details', opts)
    },
    /**
    * Returns alternative blocks details for a specified range.
    * @async
    * @param {number} offset - starting offset in the global list of alternative blocks
    * @param {number} count - number of blocks to be requested
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     get_alt_blocks_details: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'offset': 'Integer',
                                           'count': 'Integer'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_alt_blocks_details', opts)
    },
    /**
    * Clears the transaction pool.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     reset_transaction_pool: async function (opts) {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'reset_transaction_pool')
    },
    /**
    * Returns the median for timestamps of the last 20 blocks. Displayed as returned median value plus 600 seconds, this is used to check the expiration time of parameters.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   expiration_median: 1651151040,
    *   status: 'OK'
    * }
    */
     get_current_core_tx_expiration_median: async function (opts) {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_current_core_tx_expiration_median')
    },
    /**
    * This main marketplace API, which lets to read "offers" from Zano blockchain. It has diverse filters, which let specify particular parameters of the request and help organize effective communication on production.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   total_offers: 0,
    *   status: 'OK'
    * }
    */
     marketplace_global_get_offers_ex: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'marketplace_global_get_offers_ex')
    },
    /**
    * Returns the current blockchain height.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   height: 486706
    *   status: 'OK'
    * }
    */
     getheight: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'getheight'), queue, parseDaemonResponse)
    },
    /**
    * Returns the current blockchain height.
    * @async
    * @param {string[]} txs_hashes - hex-encoded transactions identifiers to be retrieved
    * @example <caption><b>Output</b></caption>
    * {
    *   missed: [],
    *   txs_as_hex: [],
    *   status: 'OK'
    * }
    */
     gettransactions: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'txs_hashes': 'ArrayOfStrings'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'gettransactions'), queue, parseDaemonResponse, null, opts)
    },
    /**
    * Returns the current blockchain height.
    * @async
    * @param {string} tx_as_text - hex-encoded serialized transaction.
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     sendrawtransaction: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'tx_as_text': 'String'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'sendrawtransaction'), queue, parseDaemonResponse, null, opts)
    },
    /**
    * Broadcasts specified transactions across the network.
    * @async
    * @param {string[]} tx_as_hex - hex-encoded serialized transactions to be broadcasted
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     force_relay: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'tx_as_hex': 'ArrayOfStrings'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'force_relay'), queue, parseDaemonResponse, null, opts)
    },
    /**
    * Starts mining in daemon.
    * @async
    * @param {string} miner_address - address for receiving mined coins
    * @param {number} thread_count - number of threads allocated for the miner
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     start_mining: async function (opts) {
      rpcHelpers.checkMandatoryParameters({'miner_address': 'Address',
                                           'thread_count': 'Integer'}, opts)
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'start_mining'), queue, parseDaemonResponse, null, opts)
    },
    /**
    * Stops mining in daemon.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK'
    * }
    */
     stop_mining: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'stop_mining'), queue, parseDaemonResponse, null)
    },
    /**
    * Returns various information and stats.
    * @async
    * @example <caption><b>Output</b></caption>
    * {
    *   alias_count: 2,
    *   alt_blocks_count: 0,
    *   block_reward: 0,
    *   current_blocks_median: 125000,
    *   current_max_allowed_block_size: 250000,
    *   current_network_hashrate_350: 0,
    *   current_network_hashrate_50: 0,
    *   daemon_network_state: 2,
    *   default_fee: 10000000000,
    *   expiration_median_timestamp: 0,
    *   grey_peerlist_size: 4,
    *   height: 486973,
    *   incoming_connections_count: 0,
    *   last_block_hash: '',
    *   last_block_size: 0,
    *   last_block_timestamp: 0,
    *   last_block_total_reward: 0,
    *   last_pos_timestamp: 0,
    *   last_pow_timestamp: 0,
    *   max_net_seen_height: 486900,
    *   mi: { build_no: 0, mode: 0, ver_major: 0, ver_minor: 0, ver_revision: 0 },
    *   minimum_fee: 10000000000,
    *   net_time_delta_median: 0,
    *   offers_count: 0,
    *   outgoing_connections_count: 8,
    *   outs_stat: {
    *     amount_0_001: 0,
    *     amount_0_01: 0,
    *     amount_0_1: 0,
    *     amount_1: 0,
    *     amount_10: 0,
    *     amount_100: 0,
    *     amount_1000: 0,
    *     amount_10000: 0,
    *     amount_100000: 0,
    *     amount_1000000: 0
    *   },
    *   performance_data: {
    *     all_txs_insert_time_5: 0,
    *     block_processing_time_0: 0,
    *     block_processing_time_1: 0,
    *     etc_stuff_6: 0,
    *     insert_time_4: 0,
    *     longhash_calculating_time_3: 0,
    *     map_size: 0,
    *     raise_block_core_event: 0,
    *     target_calculating_calc: 0,
    *     target_calculating_enum_blocks: 0,
    *     target_calculating_time_2: 0,
    *     tx_add_one_tx_time: 0,
    *     tx_append_is_expired: 0,
    *     tx_append_rl_wait: 0,
    *     tx_append_time: 0,
    *     tx_check_exist: 0,
    *     tx_check_inputs_attachment_check: 0,
    *     tx_check_inputs_loop: 0,
    *     tx_check_inputs_loop_ch_in_val_sig: 0,
    *     tx_check_inputs_loop_kimage_check: 0,
    *     tx_check_inputs_loop_scan_outputkeys_get_item_size: 0,
    *     tx_check_inputs_loop_scan_outputkeys_loop: 0,
    *     tx_check_inputs_loop_scan_outputkeys_loop_find_tx: 0,
    *     tx_check_inputs_loop_scan_outputkeys_loop_get_subitem: 0,
    *     tx_check_inputs_loop_scan_outputkeys_loop_handle_output: 0,
    *     tx_check_inputs_loop_scan_outputkeys_relative_to_absolute: 0,
    *     tx_check_inputs_prefix_hash: 0,
    *     tx_check_inputs_time: 0,
    *     tx_count: 0,
    *     tx_mixin_count: 0,
    *     tx_prapare_append: 0,
    *     tx_print_log: 0,
    *     tx_process_attachment: 0,
    *     tx_process_extra: 0,
    *     tx_process_inputs: 0,
    *     tx_push_global_index: 0,
    *     tx_store_db: 0,
    *     writer_tx_count: 0
    *   },
    *   pos_allowed: true,
    *   pos_block_ts_shift_vs_actual: 0,
    *   pos_diff_total_coins_rate: 0,
    *   pos_difficulty: '75266705035560375685',
    *   pos_sequence_factor: 0,
    *   pow_difficulty: 1396252,
    *   pow_sequence_factor: 0,
    *   seconds_for_10_blocks: 0,
    *   seconds_for_30_blocks: 0,
    *   status: 'OK',
    *   synchronization_start_height: 486532,
    *   synchronized_connections_count: 8,
    *   total_coins: '',
    *   transactions_cnt_per_day: 0,
    *   transactions_volume_per_day: 0,
    *   tx_count: 2688,
    *   tx_count_in_last_block: 0,
    *   tx_pool_performance_data: {
    *     begin_tx_time: 0,
    *     check_inputs_time: 0,
    *     check_inputs_types_supported_time: 0,
    *     check_keyimages_ws_ms_time: 0,
    *     db_commit_time: 0,
    *     expiration_validate_time: 0,
    *     tx_processing_time: 0,
    *     update_db_time: 0,
    *     validate_alias_time: 0,
    *     validate_amount_time: 0
    *   },
    *   tx_pool_size: 0,
    *   white_peerlist_size: 8
    * }
    */
     getInfoLegacy: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress.replace('json_rpc', 'getinfo'), queue, parseDaemonResponse, null)
    },
    /**
    * Returns the header of the last block in the blockchain.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  block_header:
    *  {
    *    depth: 0,
    *    difficulty: 61400097,
    *    hash: 'c99c2f9a53e4bab5d08f9820ee555d62059e0e9bf799fbe07a6137aac607f4e8',
    *    height: 145009,
    *    major_version: 11,
    *    minor_version: 11,
    *    nonce: 3441194797,
    *    orphan_status: false,
    *    prev_hash: '53d6437ac32fc49e0ee8b24f63046c6e1e6e0491f6d1b6797b025b66ad1b4a40',
    *    reward: 18911700042,
    *    timestamp: 1554058920 
    *  }
    *  status: 'OK'
    * }
    */
    getLastBlockHeader: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'getlastblockheader')
    },
    /**
    * Submits the given block, i.e., adds it to the local blockchain and broadcasts it to the network.
    * @async
    * @param {Object} opts
    * @param {string[]} opts.blobs -  array of a single string; block's blob.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *   status: 'OK' 
    * }
    */
    submitBlock: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ blobs: 'ArrayOfStrings' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'submitblock', opts.blobs)
    }
  }
}

exports = module.exports = rpcDaemon
