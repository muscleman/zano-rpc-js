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
      console.log(json)
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
  //   /**
  //  * Flush tx ids from transaction pool.
  //  * @async
  //  * @param {Object} [opts]
  //  * @param {string[]} [opts.txids] - list of transactions IDs to flush from pool (all tx ids flushed if empty).
  //  * @returns {Promise<object>} Promise object.
  //  * @example <caption><b>Output</b></caption>
  //  * { status: 'OK' }
  //  */
  //   flushTxPool: async function (opts) {
  //     rpcHelpers.checkOptionalParametersType({ txids: 'ArrayOfHashes' }, opts)

  //     return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'flush_txpool', opts)
  //   },
  //   /**
  //   * Display alternative chains seen by the node.
  //   * @async
  //   * @example <caption><b>Output</b></caption>
  //   * { status: 'OK' }
  //   */
  //   getAlternateChains: async function () {
  //     return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_alternate_chains')
  //   },
    // /**
    // * Get list of banned IPs.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  bans:
    // *  [
    // *   { host: '192.168.1.50', ip: 838969536, seconds: 30 },
    // *   { host: '192.168.1.51', ip: 855746752, seconds: 30 }
    // *  ],
    // *  status: 'OK'
    // * }
    // */
    // getBans: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_bans')
    // },
    /**
    // * Full block information can be retrieved by either block height or hash.
    // * @async
    // * @param {Object} opts
    // * @param {number} [opts.height] -  The block's height.
    // * @param {string} [opts.hash] -  The block's hash.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  blob: '0a0ab294a0e305be9bcd157ff60f9b174217608a5b419c451afa1d9d76c49edf54ac829bf24e
    // *         743b62008002a6fc0601ff94fc0601a5a7a3bf4702f0f7be480164ced3d5d28c49dd9baeb5ab2bd3
    // *         29910838afd3e26cd85ad49b3e6101311398a1783551ba88c64c00135d0439d982fc4d70f48e1dff
    // *         cca8146454e84303210091abcad5e3b8bc208e5361ffeebbb68a35e102a5225f4865e3503cf7e76a
    // *         ff92021b000000000000000000000000005602009e000000000000000000000000',
    // *  block_header:
    // *  {
    // *   block_size: 147,
    // *   cumulative_difficulty: 16146009479722,
    // *   depth: 31535,
    // *   difficulty: 109000131,
    // *   hash: '5859dbfca776cc006f6bfd00a41363f8ffcc20e6f217c484df0b47ae8cc2458a',
    // *   height: 114196,
    // *   major_version: 10,
    // *   minor_version: 10,
    // *   nonce: 2147508795,
    // *   num_txes: 0,
    // *   orphan_status: false,
    // *   pow_hash: '',
    // *   prev_hash: 'be9bcd157ff60f9b174217608a5b419c451afa1d9d76c49edf54ac829bf24e74',
    // *   reward: 19191616421,
    // *   timestamp: 1550322226
    // *  },
    // *  json: '{\n  "major_version": 10, \n  "minor_version": 10, \n  "timestamp": 15503222
    // *  26, \n  "prev_id": "be9bcd157ff60f9b174217608a5b419c451afa1d9d76c49edf54ac829bf2
    // *  4e74", \n  "nonce": 2147508795, \n  "miner_tx": {\n    "version": 2, \n    "unlo
    // *  ck_time": 114214, \n    "vin": [ {\n        "gen": {\n          "height": 114196
    // *  \n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 19191616421, \
    // *  n        "target": {\n          "key": "f0f7be480164ced3d5d28c49dd9baeb5ab2bd329
    // *  910838afd3e26cd85ad49b3e"\n        }\n      }\n    ], \n    "extra": [ 1, 49, 19
    // *  , 152, 161, 120, 53, 81, 186, 136, 198, 76, 0, 19, 93, 4, 57, 217, 130, 252, 77,
    // *  112, 244, 142, 29, 255, 204, 168, 20, 100, 84, 232, 67, 3, 33, 0, 145, 171, 202
    // *  , 213, 227, 184, 188, 32, 142, 83, 97, 255, 238, 187, 182, 138, 53, 225, 2, 165,
    // *  34, 95, 72, 101, 227, 80, 60, 247, 231, 106, 255, 146, 2, 27, 0, 0, 0, 0, 0, 0,
    // *  0, 0, 0, 0, 0, 0, 0, 86, 2, 0, 158, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\n    ], \n
    // *  "rct_signatures": {\n      "type": 0\n    }\n  }, \n  "tx_hashes": [ ]\n}',
    // *  miner_tx_hash: '691e09ce198a2953c391a292ed79d7a239ec929740503400a0ab3e3ee8cfad84',
    // *  status: 'OK',
    // *  untrusted: false
    // * }
    // */
    // getBlock: async function (opts) {
    //   if ((typeof opts.height === 'undefined') && (typeof opts.hash === 'undefined')) {
    //     throw new Error('must specify height or hash')
    //   } else {
    //     rpcHelpers.checkOptionalParametersType({
    //       height: 'Integer',
    //       hash: 'Hash'
    //     }, opts)
    //   }
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_block', opts)
    // },
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
      // const res = await httpClient.post(jsonAddress, `{"jsonrpc":"2.0","id":"0","method":"on_get_block_hash","params":${JSON.stringify([opts.height])}}`)
      // if (res.status === 200) {
      //   if ('result' in res.data) {
      //     return res.data.result
      //   } else {
      //     const error = new Error('RPC Error!')
      //     error.code = res.data.error.code
      //     error.message = res.data.error.message
      //     throw error
      //   }
      // } else {
      //   const error = new Error('HTTP Error!')
      //   error.code = res.status
      //   error.message = res.data
      //   throw error
      // }
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
    // /**
    // * Similar to get_block_header_by_height above, but for a range of blocks.
    // * This method includes a starting block height and an ending block height as parameters.
    // * @async
    // * @param {Object} opts
    // * @param {number} opts.start_height - The starting block's height.
    // * @param {number} opts.end_height - The ending block's height.
    // * @returns {Promise<object>} Promise object
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  headers:
    // *  [
    // *   {
    // *    block_size: 147,
    // *    cumulative_difficulty: 16146009479722,
    // *    depth: 30831,
    // *    difficulty: 109000131,
    // *    hash: '5859dbfca776cc006f6bfd00a41363f8ffcc20e6f217c484df0b47ae8cc2458a',
    // *    height: 114196,
    // *    major_version: 10,
    // *    minor_version: 10,
    // *    nonce: 2147508795,
    // *    num_txes: 0,
    // *    orphan_status: false,
    // *    pow_hash: '',
    // *    prev_hash: 'be9bcd157ff60f9b174217608a5b419c451afa1d9d76c49edf54ac829bf24e74',
    // *    reward: 19191616421,
    // *    timestamp: 1550322226
    // *   },
    // *   {
    // *    block_size: 147,
    // *    cumulative_difficulty: 16146120479856,
    // *    depth: 30830,
    // *    difficulty: 111000134,
    // *    hash: 'c27c128325bb3f47d76816789995d376268ee25f3cdcfb714580e34fe5cc8e08',
    // *    height: 114197,
    // *    major_version: 10,
    // *    minor_version: 10,
    // *    nonce: 541065496,
    // *    num_txes: 0,
    // *    orphan_status: false,
    // *    pow_hash: '',
    // *    prev_hash: '5859dbfca776cc006f6bfd00a41363f8ffcc20e6f217c484df0b47ae8cc2458a',
    // *    reward: 19191607270,
    // *    timestamp: 1550322551
    // *   }
    // *  ],
    // *  status: 'OK',
    // *  untrusted: false
    // * }
    // */
    // getBlockHeadersRange: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({
    //     start_height: 'Integer',
    //     end_height: 'Integer'
    //   }, opts)

    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_block_headers_range', opts)
    // },
    // /**
    // * Return a range of blocks containing the block header and its attached transactions.
    // * The first transaction in block is the coinbase transaction.
    // * This method includes a starting block height and an ending block height as parameters.
    // * @async
    // * @param {Object} opts
    // * @param {number} opts.start_height - The starting block's height.
    // * @param {number} opts.end_height - The ending block's height.
    // * @returns {Promise<object>} Promise object
    // * @example <caption><b>Output</b></caption>
    // * { blocks:
    // *  [
    // *   { block_header: [Object], txs: [Array] },
    // *   { block_header: [Object], txs: [Array] }
    // *  ],
    // *  status: 'OK',
    // *  untrusted: false
    // * }
    // */
    // getBlocksRange: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({
    //     start_height: 'Integer',
    //     end_height: 'Integer'
    //   }, opts)

    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_blocks_range', opts)
    // },
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
    * Get the coinbase amount and the fees ammount for n last blocks starting at particular height.
    * @async
    * @param {Object} opts
    * @param {number} opts.height -  unsigned int; Block height from which getting the amounts.
    * @param {number} opts.count -  unsigned int; number of blocks to include in the sum
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  emission_amount: 7502006245466748,
    *  fee_amount: 0,
    *  status: 'OK'
    * }
    */
    // getCoinbaseTxSum: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({
    //     height: 'Integer',
    //     count: 'Integer'
    //   }, opts)

    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_coinbase_tx_sum', opts)
    // },
    // /**
    // * Retrieve information about incoming and outgoing connections to your node.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  connections:
    // *  [
    // *   {
    // *    address: '192.154.226.212:19993',
    // *    avg_download: 1,
    // *    avg_upload: 0,
    // *    connection_id: 'cb8f0270c5b740fa9eb7aa1aedddb5cb',
    // *    current_download: 2,
    // *    current_upload: 0,
    // *    height: 145745,
    // *    host: '192.154.226.212',
    // *    incoming: false,
    // *    ip: '192.154.226.212',
    // *    live_time: 20,
    // *    local_ip: false,
    // *    localhost: false,
    // *    peer_id: 'c7f323892fb18784',
    // *    port: '19993',
    // *    pruning_seed: 0,
    // *    recv_count: 22852,
    // *    recv_idle_time: 13,
    // *    send_count: 568,
    // *    send_idle_time: 13,
    // *    state: 'normal',
    // *    support_flags: 1
    // *   }, ...
    // *  ]
    // * }
    // */
    // getConnections: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_connections')
    // },
    // /**
    // * Gives an estimation on fees per kB.
    // * @async
    // * @param {Object} [opts]
    // * @param {number} [opts.grace_blocks] - unsigned int.
    // * @example <caption><b>Output</b></caption>
    // * { fee: 7560, status: 'OK', untrusted: false }
    // */
    // getFeeEstimate: async function (opts) {
    //   rpcHelpers.checkOptionalParametersType({ grace_blocks: 'Integer' }, opts)

    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_fee_estimate', opts)
    // },
    // /**
    // * Look up information regarding hard fork voting and readiness.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  earliest_height: 131650,
    // *  enabled: true,
    // *  state: 2,
    // *  status: 'OK',
    // *  threshold: 0,
    // *  untrusted: false,
    // *  version: 11,
    // *  votes: 10080,
    // *  voting: 11,
    // *  window: 10080
    // * }
    // */
    // getHardForkInfo: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'hard_fork_info')
    // },
    /**
    * Retrieve general information about the state of your node and the network.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * {
    *  alt_blocks_count: 0,
    *  block_size_limit: 600000,
    *  block_size_median: 147,
    *  bootstrap_daemon_address: '',
    *  cumulative_difficulty: 20431347989483,
    *  database_size: 0,
    *  difficulty: 75600102,
    *  free_space: 243485646848,
    *  grey_peerlist_size: 62,
    *  height: 145746,
    *  height_without_bootstrap: 145746,
    *  incoming_connections_count: 7,
    *  mainnet: true,
    *  nettype: 'mainnet',
    *  offline: false,
    *  outgoing_connections_count: 8,
    *  rpc_connections_count: 2,
    *  stagenet: false,
    *  start_time: 1554144733,
    *  status: 'OK',
    *  target: 120,
    *  target_height: 145732,
    *  testnet: false,
    *  top_block_hash: '9df96b39bb2ca8953cbf8f2fffc8f9896a74f430cbe29dc0ad356986ef93024c',
    *  tx_count: 179362,
    *  tx_pool_size: 10,
    *  untrusted: false,
    *  was_bootstrap_ever_used: false,
    *  white_peerlist_size: 38
    * }
    */
    getInfo: async function () {
      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_info')
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
    // /**
    // * Get Ouput Distribution.
    // * @async
    // * @param {Object} opts
    // * @param {number[]} opts.amounts -  list of amounts to look for.
    // * @param {boolean} [opts.cumulative] - (default is false) States if the result should be cumulative (true or false).
    // * @param {number} [opts.from_height] - (default is 0) - unsigned int.
    // * @param {number} [opts.to_height] - (default is 0) - unsigned int.
    // * @example <caption><b>Output</b></caption>
    // * { status: 'OK', untrusted: false }
    // */
    // getOutputDistribution: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ amounts: 'ArrayOfIntegers' }, opts)

    //   rpcHelpers.checkOptionalParametersType({
    //     cumulative: 'Boolean',
    //     from_height: 'Integer',
    //     to_height: 'Integer'
    //   }, opts)

    //   opts.binary = false

    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_output_distribution', opts)
    // },
    // /**
    // * Get a histogram of output amounts.
    // * @async
    // * @param {Object} [opts]
    // * @param {number[]} [opts.amounts] -  list of unsigned int.
    // * @param {number} [opts.min_count] -  unsigned int.
    // * @param {number} [opts.max_count] -  unsigned int.
    // * @param {boolean} [unlocked] -  boolean.
    // * @param {number} [recent_cutoff] -  unsigned int.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  histogram:
    // *  [
    // *   {
    // *    amount: 10000000,
    // *    recent_instances: 0,
    // *    total_instances: 1481,
    // *    unlocked_instances: 0
    // *   }
    // *  ],
    // *  status: 'OK',
    // *  untrusted: false
    // * }
    // */
    // getOutputHistogram: async function (opts) {
    //   rpcHelpers.checkOptionalParametersType({
    //     amounts: 'ArrayOfIntegers',
    //     min_count: 'Integer',
    //     max_count: 'Integer',
    //     unlocked: 'Boolean',
    //     recent_cutoff: 'Integer'
    //   }, opts)

    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_output_histogram', opts)
    // },
    // /**
    // * Give the node current version.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { status: 'OK', untrusted: false, version: 131077 }
    // */
    // getVersion: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_version')
    // },
    // /**
    // * Get the known blocks hashes which are not on the main chain.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // */
    // otherGetAltBlocksHashes: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_alt_blocks_hashes')
    // },
    // /**
    // * Get the node's current height.
    // * @async
    // * @example <caption><b>Output</b></caption>
    // * { height: 149045, status: 'OK', untrusted: false }
    // */
    // otherGetHeight: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_height')
    // },
    // /**
    // * Get daemon bandwidth limits.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  "limit_down": 8192,
    // *  "limit_up": 128,
    // *  "status": "OK",
    // *  "untrusted": false
    // * }
    // */
    // otherGetLimit: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_limit')
    // },
    // /**
    // * Get the known peers list.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  gray_list:
    // *  [
    // *   { host: '135790251',
    // *     id: 17703185689409910000,
    // *     ip: 135790251,
    // *     last_seen: 1551473999,
    // *     port: 19993,
    // *     pruning_seed: 0 }, ...
    // *  ]
    // *  status: 'OK',
    // *  white_list:
    // *  [
    // *   { host: '35263064',
    // *     id: 3764929947382960000,
    // *     ip: 35263064,
    // *     last_seen: 1554553579,
    // *     port: 19993,
    // *     pruning_seed: 0 }, ...
    // *  ]
    // * }
    // */
    // otherGetPeerList: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_peer_list')
    // },
    // /**
    // * Show information about valid transactions seen by the node but not yet mined into a block, as well as spent key image information for the txpool in the node's memory.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  spent_key_images:
    // *  [
    // *   { id_hash: '12f6051aea57b598e7aefe436545ab55f449b11d392fffd76e33eef53ad9b962',
    // *     txs_hashes: [Array] },
    //  *    ...
    //  * ],
    //  * status: 'OK',
    //  * transactions:
    //  * [
    //  *  { blob_size: 4384,
    //  *    do_not_relay: false,
    //  *    double_spend_seen: false,
    //  *    fee: 37750,
    //  *    id_hash:
    //  *    '3fa2745621696d4e87d997e32409469cc3d734fda186f37878b8db2972a99a41',
    //  *    kept_by_block: false,
    //  *    last_failed_height: 0,
    //  *    last_failed_id_hash:
    //  *    '0000000000000000000000000000000000000000000000000000000000000000',
    //  *    last_relayed_time: 1554589504,
    //  *    max_used_block_height: 149373,
    //  *    max_used_block_id_hash:
    //  *    '3ed0b7d1c294def73dda48c6b3f43d724525fcbc08672782ec3a1e4c5a1b2f01',
    //  *    receive_time: 1554589504,
    //  *    relayed: true,
    //  *    tx_blob: ... ,
    //  *    tx_json: ... ,
    //  *   }
    //  * ],
    //  * untrusted: false
    //  * }
    // */
    // otherGetTransactionPool: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_transaction_pool')
    // },
    // /**
    // * Get the transaction pool statistics.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  pool_stats:
    // *  {
    // *   bytes_max: 2785,
    // *   bytes_med: 2785,
    // *   bytes_min: 2785,
    // *   bytes_total: 2785,
    // *   fee_total: 22650,
    // *   histo_98pc: 0,
    // *   num_10m: 0,
    // *   num_double_spends: 0,
    // *   num_failing: 0,
    // *   num_not_relayed: 0,
    // *   oldest: 1554589922,
    // *   txs_total: 1
    // *  },
    // *  status: 'OK',
    // *  untrusted: false
    // * }
    // */
    // otherGetTransactionPoolStats: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_transaction_pool_stats')
    // },
    // /**
    // * Full block information can be retrieved by either block height or hash.
    // * @async
    // * @param {Object} opts
    // * @param {string[]} opts.tx_hashes -  List of transaction hashes to look up.
    // * @param {boolean} [opts.decode_as_json] - (false by default). If set true, the returned transaction information will be decoded rather than binary.
    // * @param {boolean} [opts.prune] - (false by default).
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  status: 'OK',
    // *  txs:
    // *  [
    // *   {
    // *    as_hex: '02000202 ... 0f',
    // *    as_json: '',
    // *    block_height: 140732,
    // *    block_timestamp: 1553537372,
    // *    double_spend_seen: false,
    // *    in_pool: false,
    // *    output_indices: [Array],
    // *    prunable_as_hex: '',
    // *    prunable_hash:
    // *    '79f87397ef265f27b32a659e0f3f73496527e2cb97228ee4a82f31ec972bd65b',
    // *    pruned_as_hex: '',
    // *    tx_hash: 'a43c51e3a216bb702e6be2746c02a366c8e3a05b08b50da5ada8e9481418e350'
    // *   }
    // *  ],
    // *  txs_as_hex: [ '02000202 ... 0f' ],
    // *  untrusted: false
    // * }
    // */
    // otherGetTransactions: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ txs_hashes: 'ArrayOfHashes' }, opts)

    //   rpcHelpers.checkOptionalParametersType({
    //     decode_as_json: 'Boolean',
    //     prune: 'Boolean'
    //   }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'get_transactions', opts)
    // },
    // /**
    // * Check if outputs have been spent using the key image associated with the output.
    // * @async
    // * @param {Object} opts
    // * @param {string[]} opts.key_images -  list of block blobs which have been mined.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { spent_status: [ 1 ], status: 'OK', untrusted: false }
    // */
    // otherIsKeyImageSpent: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ key_images: 'ArrayOfHashes' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'is_key_image_spent', opts)
    // },
    // /**
    // * Limit number of incoming peers.
    // * @async
    // * @param {Object} opts
    // * @param {number} opts.in_peers - Max number of incoming peers.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { status: 'OK' }
    // */
    // otherInPeers: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ in_peers: 'Integer' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'in_peers', opts)
    // },
    // /**
    // * Limit number of outgoing peers.
    // * @async
    // * @param {Object} opts
    // * @param {number} opts.out_peers - Max number of outgoing peers.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { status: 'OK' }
    // */
    // otherOutPeers: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ out_peers: 'Integer' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'out_peers', opts)
    // },
    // /**
    // * Get the mining status of the daemon.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  active: true,
    // *  address: 'ar4bfzwH4726kamvTg2wRNLkw16MR6DbbZMyuShYgKs58SknoAF8q7PBQ1XXAsGgH9feTWKKmYZNjaWphc7Wce1u33iKe2cL9',
    // *  is_background_mining_enabled: true,
    // *  speed: 2,
    // *  status: 'OK',
    // *  threads_count: 1
    // * }
    // */
    // otherMiningStatus: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'mining_status')
    // },
    // /**
    // * Save the blockchain. The blockchain does not need saving and is always saved when modified, however it does a sync to flush the filesystem cache onto the disk for safety purposes against Operating System or Hardware crashes.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { status: 'OK' }
    // */
    // otherSaveBc: async function () {
    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'save_bc')
    // },
    // /**
    // * Broadcast a raw transaction to the network.
    // * @async
    // * @param {Object} opts
    // * @param {string} opts.tx_as_hex -  Full transaction information as hexidecimal string.
    // * @param {boolean} [opts.do_not_relay] - (false by default). Stop relaying transaction to other nodes.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  double_spend: false,
    // *  fee_too_low: false,
    // *  invalid_input: false,
    // *  invalid_output: false,
    // *  low_mixin: false,
    // *  not_rct: false,
    // *  not_relayed: true,
    // *  overspend: false,
    // *  reason: 'Not relayed',
    // *  status: 'OK',
    // *  too_big: false,
    // *  untrusted: false
    // * }
    // */
    // otherSendRawTransaction: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ tx_as_hex: 'String' }, opts)

    //   rpcHelpers.checkOptionalParametersType({ do_not_relay: 'Boolean' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'send_raw_transaction', opts)
    // },
    // /**
    // * Set daemon bandwidth limits.
    // * @async
    // * @param {Object} opts
    // * @param {number} [opts.limit_down] - Download limit in kBytes per second (-1 reset to default, 0 don't change the current limit).
    // * @param {number} [opts.limit_up] - Upload limit in kBytes per second (-1 reset to default, 0 don't change the current limit).
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  limit_down: 16384,
    // *  limit_up: 4096,
    // *  status: 'OK'
    // * }
    // */
    // otherSetLimit: async function (opts) {
    //   rpcHelpers.checkOptionalParametersType({
    //     limit_down: 'Integer',
    //     limit_up: 'Integer'
    //   }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'set_limit', opts)
    // },
    // /**
    // * Set the daemon log categories.<br>
    // * Categories are represented as a comma separated list of <Category\>:<level\> (similarly to syslog standard <Facility\>:<Severity-level\>), where:
    // * <p><ul>
    // * Category is one of the following:
    // *   <li>\* - All facilities</li>
    // *   <li>default</li>
    // *   <li>net</li>
    // *   <li>net.http</li>
    // *   <li>net.p2p</li>
    // *   <li>logging</li>
    // *   <li>net.throttle</li>
    // *   <li>blockchain.db</li>
    // *   <li>blockchain.db.lmdb</li>
    // *   <li>bcutil</li>
    // *   <li>checkpoints</li>
    // *   <li>net.dns</li>
    // *   <li>net.dl</li>
    // *   <li>i18n</li>
    // *   <li>perf</li>
    // *   <li>stacktrace</li>
    // *   <li>updates</li>
    // *   <li>account</li>
    // *   <li>cn</li>
    // *   <li>difficulty</li>
    // *   <li>hardfork</li>
    // *   <li>miner</li>
    // *   <li>blockchain</li>
    // *   <li>txpool</li>
    // *   <li>cn.block_queue</li>
    // *   <li>net.cn</li>
    // *   <li>daemon</li>
    // *   <li>debugtools.deserialize</li>
    // *   <li>debugtools.objectsizes</li>
    // *   <li>device.ledger</li>
    // *   <li>wallet.gen_multisig</li>
    // *   <li>multisig</li>
    // *   <li>bulletproofs</li>
    // *   <li>ringct</li>
    // *   <li>daemon.rpc</li>
    // *   <li>wallet.simplewallet</li>
    // *   <li>WalletAPI</li>
    // *   <li>wallet.ringdb</li>
    // *   <li>wallet.wallet2</li>
    // *   <li>wallet.rpc</li>
    // *   <li>tests.core
    // *   </ul>
    // * <ul>
    // * Level is one of the following:
    // *   <li>FATAL - higher level</li>
    // *   <li>ERROR</li>
    // *   <li>WARNING</li>
    // *   <li>INFO</li>
    // *   <li>DEBUG</li>
    // *   <li>TRACE - lower level A level automatically includes higher level.</li>
    // *   </ul></p>
    // *   By default, categories are set to *:WARNING,net:FATAL,net.p2p:FATAL,net.cn:FATAL,global:INFO,verify:FATAL,stacktrace:INFO,logging:INFO,msgwriter:INFO.<br>
    // *   Setting the categories to "" prevent any logs to be outputed.
    // * @async
    // * @param {Object} opts
    // * @param {string} [opts.categories] - Daemon log categories to enable.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  "categories": "*:INFO",
    // *  "status": "OK"
    // * }
    // */
    // otherSetLogCategories: async function (opts) {
    //   rpcHelpers.checkOptionalParametersType({ categories: 'String' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'set_log_categories', opts)
    // },
    // /**
    // * Set the log hash rate display mode.
    // * @async
    // * @param {Object} opts
    // * @param {boolean} opts.visible - States if hash rate logs should be visible (true) or hidden (false)
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output while mining</b></caption>
    // * { "status": "OK" }
    // * @example <caption><b>Output while NOT mining. You need to catch it with promise.</b></caption>
    // * Error: NOT MINING
    // * at _request.then (C:\myDev\zano-rpc-js\src\rpcDaemon.js:1418:27)
    // * at process._tickCallback (internal/process/next_tick.js:68:7)
    // */
    // otherSetLogHashrate: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ visible: 'Boolean' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'set_log_hash_rate', opts)
    // },
    // /**
    // * Set the daemon log level. By default, log level is set to 0.
    // * @async
    // * @param {Object} opts
    // * @param {number} opts.level - Daemon log level to set from 0 (less verbose) to 4 (most verbose).
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { "status": "OK" }
    // */
    // otherSetLogLevel: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ level: 'Integer' }, opts)

    //   return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'set_log_level', opts)
    // },
    /**
    * Start mining on the daemon.
    * @async
    * @param {Object} opts
    * @param {boolean} opts.do_background_mining - States if the mining should run in background (true) or foreground (false).
    * @param {boolean} opts.ignore_battery - States if batery state (on laptop) should be ignored (true) or not (false).
    * @param {string} opts.miner_address - Account address to mine to.
    * @param {number} opts.threads_count - Number of mining thread to run.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * { status: 'OK' }
    */
    otherStartMining: async function (opts) {
      rpcHelpers.checkMandatoryParameters({
        do_background_mining: 'Boolean',
        ignore_battery: 'Boolean',
        miner_address: 'Address',
        threads_count: 'Integer'
      }, opts)

      return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'start_mining', opts)
    },
    /**
    * Stop mining on the daemon.
    * @async
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output</b></caption>
    * { status: 'OK' }
    */
    otherStopMining: async function () {
      return rpcHelpers.makeOtherQuery(httpClient, config.url, queue, parseDaemonResponse, 'stop_mining')
    },
    /**
    * Relay a list of transaction IDs.
    * @async
    * @param {Object} opts
    * @param {string[]} opts.txids - list of transaction IDs to relay.
    * @returns {Promise} Promise object.
    * @example <caption><b>Output</b></caption>
    * { status: 'OK' }
    */
    relayTx: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ txids: 'ArrayOfHashes' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'relay_tx', opts)
    },
    // /**
    // * Ban another node by IP.
    // * @async
    // * @param {Object} opts
    // * @param {Array} opts.bans
    // * @param {string} [opts.bans[].host] - Host to ban.
    // * @param {number} [opts.bans[].ip] - IP address to ban, in Int format.
    // * @param {boolean} opts.bans[].ban - Set true to ban.
    // * @param {number} opts.bans[].seconds - Number of seconds to ban node.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * { status: 'OK' }
    // */
    // setBans: async function (opts) {
    //   rpcHelpers.checkMandatoryParameters({ bans: 'ArrayOfBans' }, opts)
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'set_bans', opts)
    // },
    /**
    * Submits the given block, i.e., adds it to the local blockchain and broadcasts it to the network.
    * @async
    * @param {Object} opts
    * @param {string[]} opts.blobs -  array of a single string; block's blob.
    * @returns {Promise<object>} Promise object.
    * @example <caption><b>Output with error message when the block is not accepted. You need to catch it with promise.</b></caption>
    * { Error: Block not accepted
    *   at _request.then (C:\myDev\zano-rpc-js\src\rpcDaemon.js:761:25)
    *   at process._tickCallback (internal/process/next_tick.js:68:7) code: -7 }
    */
    submitBlock: async function (opts) {
      rpcHelpers.checkMandatoryParameters({ blobs: 'ArrayOfStrings' }, opts)

      return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'submitblock', opts.blobs)
    },
    // /**
    // * Get synchronisation informations.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  height: 149027,
    // *  next_needed_pruning_seed: 0,
    // *  overview: '[]',
    // *  peers:
    // *  [
    // *   { info: [Object] },
    // *   { info: [Object] },
    // *   ... ,
    // *   { info: [Object] }
    // *  ],
    // *  status: 'OK',
    // *  target_height: 149009
    // * }
    // */
    // syncInfo: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'sync_info')
    // },
    /**
    // * Get quorom state information.
    // * @async
    // * @param {Object} opts
    // * @param {number} [opts.height] -  0
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  quorom_nodes:
    // *  [
    // *   "foo",
    // *   "Foo"
    // *  ],
    // *  nodes_to_test:
    // *  [
    // *   "bar",
    // *   "Bar"
    // *  ]
    // *  status: 'OK',
    // *  untrusted: true
    // * }
    // */
    // getQuromState: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_quorom_state')
    // },
    // /**
    // * Get quorom state batched information.
    // * @async
    // * @param {Object} opts
    // * @param {number} [opts.height_begin] -  0
    // * @param {number} [opt.height_end] - 10
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  quorom_entries: 
    // *  [
    // *   {
    // *     height: 780000,
    // *     quorom_nodes:
    // *     [
    // *       "foo",
    // *       "Foo"
    // *     ],
    // *     nodes_to_test:
    // *     [
    // *       "bar",
    // *       "Bar"
    // *     ]
    // *   }
    // *  ],
    // *  untrusted: true
    // *  status: 'OK'
    // * }
    // */
    // getQuromStateBatched: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_quorum_state_batched')
    // },
    // /**
    // * Get service node registration command raw information.
    // * @async
    // * @param {Object} opts
    // * @param {string[]} [opts.args] -  ["foo", "bar"]
    // * @param {boolean} [opt.make_friendly] - true/false
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  registration_cmd: "",
    // *  status: 'OK'
    // * }
    // */
    // getServiceNodeRegistrationCmdRaw: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_service_node_registration_cmd_raw')
    // },
    // /**
    // * Get service node black listed key images information.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  blacklist: 
    // *  [
    // *   {
    // *     key_image: "",
    // *     unlock_height: 0
    // *   }
    // *  ]
    // *  status: 'OK'
    // * }
    // */
    // getServiceNodeBlacklistedKeyImages: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_service_node_blacklisted_key_images')
    // },
    // /**
    // * Get service node registration command information.
    // * @async
    // * @param {Object} opts
    // * @param {string} [opts.operator_cut] -  ""
    // * @param {contribs[]} [opts.contributions] - [{address: "", amount: 0}]
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  registration_cmd: "",
    // *  status: 'OK'
    // * }
    // */
    // getServiceNodeRegistrationCmd: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_service_node_registration_cmd')
    // },
    // /**
    // * Get service node key information.
    // * @async
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  service_node_pubkey: "blah",
    // *  status: 'OK'
    // * }
    // */
    // getServiceNodeKey: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_service_node_key')
    // },
    // /**
    // * Get service nodes information.
    // * @async
    // * @param {Object} opts
    // * @param {string[]} [opts.service_node_pubkeys] -  ["blah", "blah"]
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  service_node_states: 
    // *  [
    // *   {
    // *     service_node_pubkey: "",
    // *     registration_height: 0,
    // *     requested_unlock_height: 0,
    // *     last_reward_block_height: 0,
    // *     last_reward_transaction_index: 0,
    // *     last_uptime_proof: 0,
    // *     contributors: 
    // *     [
    // *       {
    // *         amount: 0,
    // *         reserved: 0,
    // *         address: "",
    // *         locked_contributions:
    // *         [
    // *           {
    // *             key_image: "",
    // *             key_image_pub_key: "",
    // *             amount: 0
    // *           }
    // *         ]
    // *       }
    // *     ],
    // *     total_contributed: 0,
    // *     total_reserved: 0,
    // *     staking_requirement: 0,
    // *     portions_for_operator: 0,
    // *     operator_address: ""
    // *   }
    // *  ]
    // *  status: 'OK'
    // * }
    // */
    // getServiceNodes: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_service_nodes')
    // },
    // /**
    // * Get all service nodes information.
    // * @async
    // * @param {Object} opts
    // * @param {string[]} [opts.service_node_pubkeys] -  ["blah", "blah"]
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  service_node_states: 
    // *  [
    // *   {
    // *     service_node_pubkey: "",
    // *     registration_height: 0,
    // *     requested_unlock_height: 0,
    // *     last_reward_block_height: 0,
    // *     last_reward_transaction_index: 0,
    // *     last_uptime_proof: 0,
    // *     contributors: 
    // *     [
    // *       {
    // *         amount: 0,
    // *         reserved: 0,
    // *         address: "",
    // *         locked_contributions:
    // *         [
    // *           {
    // *             key_image: "",
    // *             key_image_pub_key: "",
    // *             amount: 0
    // *           }
    // *         ]
    // *       }
    // *     ],
    // *     total_contributed: 0,
    // *     total_reserved: 0,
    // *     staking_requirement: 0,
    // *     portions_for_operator: 0,
    // *     operator_address: ""
    // *   }
    // *  ]
    // *  status: 'OK'
    // * }
    // */
    // getAllServiceNodes: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_all_service_nodes')
    // },
    // /**
    // * Get all service nodes keys.
    // * @async
    // * @param {Object} opts
    // * @param {boolean} [opts.fully_funded_nodes_only] -  true/false.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  keys: 
    // *  [
    // *     "foo",
    // *     "bar"
    // *  ]
    // * }
    // */
    // getAllServiceNodesKeys: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_all_service_nodes_keys')
    // },
    // /**
    // * Get staking requirement information.
    // * @async
    // * @param {Object} opts
    // * @param {number} [opts.height] -  780000.
    // * @returns {Promise<object>} Promise object.
    // * @example <caption><b>Output</b></caption>
    // * {
    // *  staking_requirement: 100000,
    // *  status: 'OK'
    // * }
    // */
    // getStakingRequirement: async function () {
    //   return rpcHelpers.makeJsonQuery(httpClient, jsonAddress, queue, parseDaemonResponse, 'get_staking_requirement')
    // }
  }
}

exports = module.exports = rpcDaemon
