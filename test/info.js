'use strict'

const Reset = '\x1b[0m'
const Blink = '\x1b[5m'

const FgBlack = '\x1b[30m'
const FgGreen = '\x1b[32m'
const FgYellow = '\x1b[33m'
const FgWhite = '\x1b[37m'

const BgBlack = '\x1b[40m'
const BgWhite = '\x1b[47m'

console.log(BgWhite + FgBlack + Blink + '%s' + Reset, 'Several test scripts are available! ')
console.log(FgWhite + BgBlack + 'Use ' + FgGreen + 'npm run' + FgWhite + BgBlack + ' followed by the ' + FgGreen + 'test name.' + Reset)
console.log(BgBlack + FgGreen + 'test-http-digest' + FgWhite + BgBlack + ' to test ' + FgYellow + 'HTTPDigest library' + Reset)
console.log(BgBlack + FgGreen + 'test-daemon-functions' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCDaemon library' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-account' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet account functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-creation' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet creation functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-hot-cold' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet hot-cold functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-mining' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet mining functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-multisig-creation' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet multisig creation functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-multisig-transfer' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet multisig transfer functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-proofs' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet proofs functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-relay' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet relay functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-restore' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet restore functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-sweep-all' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet sweep all functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-sweep-dust' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet sweep dust functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-sweep-single' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet sweep single functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-transaction-key' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet transaction key functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-transfer' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet transfer functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-transfer-split' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet transfer split functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-validate-address' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet validate address functions' + Reset)
console.log(BgBlack + FgGreen + 'test-helper-checkmandatory-parameters' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCHelpers validate mandatory parameters' + Reset)
console.log(BgBlack + FgGreen + 'test-helper-checkoptional-parameters' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCHelpers validate optional parameters' + Reset)
console.log(BgBlack + FgGreen + 'generate-docs' + FgWhite + BgBlack + ' to generate ' + FgYellow + 'the docs' + Reset)
