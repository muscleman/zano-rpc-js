'use strict'

const describe = require('mocha').describe
const it = require('mocha').it
const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const rpcDaemon = require('../../lib/rpcDaemon.js')

const config = require('./config')

describe('RPCDaemon tests functions', function () {
  const daemonClient = rpcDaemon.createDaemonClient({
    url: config.daemonAddress,
    username: config.daemonUsername,
    password: config.daemonPassword
  })

  daemonClient.sslRejectUnauthorized(false)
  it('getBlockCount should return a count gt 0', () => {
    return expect(daemonClient.getBlockCount())
      .to.eventually.have.keys('status', 'count')
      .to.eventually.have.property('count')
      .to.eventually.be.gt(0)
  })
  it('on_getBlockHash with height should return a matching hash', () => {
    const opts = {
      height: config.blockHeight
    }
    return expect(daemonClient.on_getBlockHash(opts))
      .to.eventually.equal(config.blockHash)
  })
  it('getBlockHeaderByHash with hash should return a block header with a matching height', () => {
    const opts = {
      hash: config.blockHash
    }
    return expect(daemonClient.getBlockHeaderByHash(opts))
    .to.eventually.have.property('block_header')
    .to.eventually.have.keys('depth', 'difficulty', 'hash', 'height', 'major_version', 'minor_version', 'nonce', 'orphan_status', 'prev_hash', 'reward', 'timestamp')
    .to.eventually.have.property('height', config.blockHeight)
  })
  it('getBlockHeaderByHeight with height should return a block header with a matching hash', () => {
    const opts = {
      height: config.blockHeight
    }
    return expect(daemonClient.getBlockHeaderByHeight(opts))
      .to.eventually.have.property('block_header')
      .to.eventually.have.keys('depth', 'difficulty', 'hash', 'height', 'major_version', 'minor_version', 'nonce', 'orphan_status', 'prev_hash', 'reward', 'timestamp')
      .to.eventually.have.property('hash', config.blockHash)
  })
  it('get_alias_details should return alias', () => {
    const opts = {
      alias: config.alias
    }
    return expect(daemonClient.get_alias_details(opts))
    // .to.eventually.have.property('status')
    // .to.eventually.have.keys('')
    .to.eventually.have.property('alias_details')
    .to.eventually.have.keys('address', 'comment', 'tracking_key')
  })
  it('get_alias_by_address should return alias name by address.', () => {
    const opts = {
      address: config.stagenetWalletAddress
    }
    return expect(daemonClient.get_alias_by_address(opts))
    // .to.eventually.have.property('status')
    // .to.eventually.have.keys('')
    .to.eventually.have.property('alias_info')
    .to.eventually.have.keys('address', 'alias', 'comment', 'tracking_key')
  })
  it('get_alias_reward should return current reward that must be paid to register an alias name.', () => {
    const opts = {
      alias: config.alias
    }
    return expect(daemonClient.get_alias_reward(opts))
    // .to.eventually.have.property('status')
    // .to.eventually.have.keys('')
    .to.eventually.have.property('reward')
    .to.eventually.equal(config.aliasFee)
  })
  it('get_blocks_details should return current reward that must be paid to register an alias name.', () => {
    const opts = {
      height_start: 100,
      count: 1
    }
    return expect(daemonClient.get_blocks_details(opts))
    // .to.eventually.have.property('status')
    // .to.eventually.have.keys('')
    .to.eventually.have.property('blocks')
    //.to.eventually.have.keys('actual_timestamp', 'already_generated_coins', 'base_reward', 'blob', 'block_cumulative_size', 'block_tself_size', 'cumulative_diff_adjusted', 'cumulative_diff_precise', 'difficulty', 'effective_fee_median', 'height', 'id', 'is_orphan','miner_text_info', 'object_in_json','penalty', 'pow_seed', 'prev_id', 'summary_reward','this_block_fee_median', 'timestamp', 'total_fee' ,'total_txs_size', 'transactions_details')
  })
  it('get_tx_details should  transaction details by specified transaction hash identifier.', () => {
    const opts = {
      tx_hash: '07edca07b935b23fef3bee741e73f4b63772a600dd37823b0293266323d12b82'
    }
    return expect(daemonClient.get_tx_details(opts))
    // .to.eventually.have.property('status')
    // .to.eventually.have.keys('')
    .to.eventually.have.property('tx_info')
  })
  it('search_by_id should  transaction details by specified transaction hash identifier.', () => {
    const opts = {
      id: '07edca07b935b23fef3bee741e73f4b63772a600dd37823b0293266323d12b82'
    }
    return expect(daemonClient.search_by_id(opts))
    .to.eventually.have.property('status', 'OK', 'types_found', ['tx'])
  })
  it('getBlockTemplate should return status OK', () => {
    const opts = {
      wallet_address: config.stagenetWalletAddress,
      extra_text: 'foobar'
    }
    return expect(daemonClient.getBlockTemplate(opts))
      .to.eventually.have.property('status', 'OK')
  })
  it('getInfo should Look up an output in the global outputs table by specified amount and output global index.', () => {
    const opts = {
      flags: 4294967295
    }
    return expect(daemonClient.getInfo(opts))
    .to.eventually.have.property('alias_count')
  })
  it('get_out_info should return various information and stats.', () => {
    const opts = {
      amount: 1000000000,
      i: 2
    }
    return expect(daemonClient.get_out_info(opts))
      .to.eventually.have.keys('out_no', 'tx_id', 'status')
  })
  it('get_multisig_info should return multisig output by specified identifier.', () => {
    const opts = {
      ms_id: '5698B701F989214770C2CFF71166408C13D97E907AA4654781DC05E6994E59A5'
    }
    return expect(daemonClient.get_multisig_info(opts))
      .to.eventually.have.keys('out_no', 'tx_id', 'status')
  })
  it('get_all_alias_details should return all registered aliases.', () => {
    return expect(daemonClient.get_all_alias_details())
      .to.eventually.have.keys('aliases', 'status')
  })
  it('get_aliases should return a specified range of aliases from the global list.all registered aliases.', () => {
    const opts = {
      offset: 0,
      count: 2
    }
    return expect(daemonClient.get_aliases(opts))
      .to.eventually.have.keys('aliases', 'status')
  })
  it('get_pool_txs_details should transactions that are currently in the pool.', () => {
    return expect(daemonClient.get_pool_txs_details())
      .to.eventually.have.keys('status')
  })
  it('get_pool_txs_brief_details should return brief information for transactions currently in the pool', () => {
    const opts = {
      ids: ['c99c2f9a53e4bab5d08f9820ee555d62059e0e9bf799fbe07a6137aac607f4e8']
    }
    return expect(daemonClient.get_pool_txs_brief_details(opts))
      .to.eventually.have.keys('status')
  })
  it('get_all_pool_tx_list should  return IDs for all txs in the pool.', () => {
    return expect(daemonClient.get_all_pool_tx_list())
      .to.eventually.have.keys('status')
  })
  it('get_main_block_details should return block details for a specified identifier. Only for main chain blocks.', () => {
    const opts = {
      id: '5698B701F989214770C2CFF71166408C13D97E907AA4654781DC05E6994E59A5'
    }
    return expect(daemonClient.get_main_block_details(opts))
      .to.eventually.have.keys('block_details', 'status')
  })
  it('get_alt_block_details should return block details for a specified identifier. Only for blocks in alternative chains.', () => {
    const opts = {
      id: '5698B701F989214770C2CFF71166408C13D97E907AA4654781DC05E6994E59A5'
    }
    return expect(daemonClient.get_alt_block_details(opts))
        .to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('code', -14)
  })
  it('get_alt_blocks_details should return alternative blocks details for a specified range.', () => {
    const opts = {
      offset: 0,
      count: 2
    }
    return expect(daemonClient.get_alt_blocks_details(opts))
    .to.eventually.have.property('status', 'OK')
  })
  it('reset_transaction_pool should Clear the transaction pool.', () => {
    return expect(daemonClient.reset_transaction_pool())
      .to.eventually.have.property('status', 'OK')
  })
  it('get_current_core_tx_expiration_median should return the median for timestamps of the last 20 blocks. Displayed as returned median value plus 600 seconds, this is used to check the expiration time of parameters.', () => {
    return expect(daemonClient.get_current_core_tx_expiration_median())
      .to.eventually.have.property('status', 'OK')
  })
  it('marketplace_global_get_offers_ex should return global market place offers.', () => {
    return expect(daemonClient.marketplace_global_get_offers_ex())
      .to.eventually.have.property('status', 'OK')
  })
  it('getheight should return the current blockchain height.', () => {
    return expect(daemonClient.getheight())
      .to.eventually.has.keys('height', 'status')
  })
  it('gettransactions should return transactions in serialized binary form by specified tx IDs.', () => {
    const opts = {
      txs_hashes: ['809f9656da9d0681ed6ae3c51d544834962750cc46d4c175ed32531c2fa293af']
    }
    return expect(daemonClient.gettransactions(opts))
      .to.eventually.has.keys('status')
  })
  it('sendrawtransaction should return send raw transaction (i.e., fully constructed and serialized beforehand) to the network.', () => {
    const opts = {
      tx_as_text: '809f9656da9d0681ed6ae3c51d544834962750cc46d4c175ed32531c2fa293af'
    }
    return expect(daemonClient.sendrawtransaction(opts))
      .to.eventually.has.keys('status')
  })
  it('force_relay should return broadcast specified transactions across the network.', () => {
    const opts = {
      tx_as_hex: ['809f9656da9d0681ed6ae3c51d544834962750cc46d4c175ed32531c2fa293af']
    }
    return expect(daemonClient.force_relay(opts))
      .to.eventually.has.keys('status')
  })
  it('start_mining should start mining in daemon.', () => {
    const opts = {
      miner_address: config.stagenetWalletAddress,
      thread_count: 1
    }
    return expect(daemonClient.start_mining(opts))
      .to.eventually.has.keys('status')
  })
  it('stop_mining should stop mining in daemon.', () => {
    return expect(daemonClient.stop_mining())
      .to.eventually.has.keys('status')
  })
  it('getInfoLegacy should return various information and stats.', () => {
    return expect(daemonClient.getInfoLegacy())
      .to.eventually.have.keys('alias_count', 
                              'alt_blocks_count', 
                              'block_reward', 
                              'current_blocks_median',
                              'current_max_allowed_block_size', 
                              'current_network_hashrate_350', 
                              'current_network_hashrate_50', 
                              'daemon_network_state', 
                              'default_fee', 
                              'expiration_median_timestamp', 
                              'grey_peerlist_size', 
                              'height', 
                              'incoming_connections_count', 
                              'last_block_hash', 
                              'last_block_size', 
                              'last_block_timestamp', 
                              'last_block_total_reward',
                              'last_pos_timestamp',
                              'last_pow_timestamp', 
                              'max_net_seen_height', 
                              'mi', 
                              'minimum_fee', 
                              'net_time_delta_median', 
                              'offers_count', 
                              'outgoing_connections_count', 
                              'outs_stat', 
                              'performance_data', 
                              'pos_allowed', 
                              'pos_block_ts_shift_vs_actual', 
                              'pos_diff_total_coins_rate', 
                              'pos_difficulty', 
                              'pos_sequence_factor', 
                              'pow_difficulty', 
                              'pow_sequence_factor', 
                              'seconds_for_10_blocks', 
                              'seconds_for_30_blocks', 
                              'status', 
                              'synchronization_start_height', 
                              'synchronized_connections_count',
                              'total_coins',
                              'transactions_cnt_per_day',
                              'transactions_volume_per_day',
                              'tx_count', 
                              'tx_count_in_last_block',
                              'tx_pool_performance_data',
                              'tx_pool_size',
                              'white_peerlist_size')
  })
  it('getLastBlockHeader should return a block header', () => {
    return expect(daemonClient.getLastBlockHeader())
    .to.eventually.have.property('block_header')
    .to.eventually.have.keys('depth', 'difficulty', 'hash', 'height', 'major_version', 'minor_version', 'nonce', 'orphan_status', 'prev_hash', 'reward', 'timestamp')
  })
  it('submitBlock with a blob should be rejected', () => {
    const opts = {
      blobs: ['0707e6bdfedc053771512f1bc27c62731ae9e8f2443db64ce742f4e57f5cf8d393de28551e441a0000000002fb830a01ffbf830a018cfe88bee283060274c0aae2ef5730e680308d9c00b6da59187ad0352efe3c71d36eeeb28782f29f2501bd56b952c3ddc3e350c2631d3a5086cac172c56893831228b17de296ff4669de020200000000']
    }
    return expect(daemonClient.submitBlock(opts))
      .to.eventually.be.rejected
      .and.be.an.instanceOf(Error)
      .and.have.property('code', -6)
  })
})
