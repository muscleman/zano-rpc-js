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

console.log(BgBlack + FgGreen + 'test-wallet-contracts' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet contract functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-market-place' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet marketplace functions' + Reset)
console.log(BgBlack + FgGreen + 'test-wallet-atomics' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet atomics functions' + Reset)
console.log(BgBlack + FgGreen + 'test-cold-signing' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCWallet cold signing functions' + Reset)

console.log(BgBlack + FgGreen + 'test-helper-checkmandatory-parameters' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCHelpers validate mandatory parameters' + Reset)
console.log(BgBlack + FgGreen + 'test-helper-checkoptional-parameters' + FgWhite + BgBlack + ' to test ' + FgYellow + 'RPCHelpers validate optional parameters' + Reset)
console.log(BgBlack + FgGreen + 'generate-docs' + FgWhite + BgBlack + ' to generate ' + FgYellow + 'the docs' + Reset)
