'use strict'

const describe = require('mocha').describe
const it = require('mocha').it
const before = require('mocha').before
const after = require('mocha').after
const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
// chai.use(chaiAsPromised)

const rpcHelpers = require('../../lib/rpcHelpers.js')


describe('rpcHelpers', function () {
    describe('checkMandatoryParameters', () => {
        it('ArrayOfAmountAddress should pass when invoked with a single destination', () => {

            let opts = {"destinations": [
                {
                        "amount": 5000000000,
                        "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
                }
            ]}
            var actual = rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts)
            expect(actual).true
        })

        it('ArrayOfAmountAddress should pass when invoked with multiple destinations', () => {

            let opts = {"destinations": [
                {
                        "amount": 5000000000,
                        "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
                },
                {
                    "amount": 51000000000,
                    "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
            }
            ]}
            var actual = rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts)
            expect(actual).true
        })

        it('ArrayOfAmountAddress should fail when invoked with invalid destination object', () => {

            let opts = {"destinations": [
                {
                }
            ]}

            expect(() => rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts))
                .to.throw('Parameter [object Object] should be of type: function Object()')
        })

        it('ArrayOfAmountAddress should pass when invoked with a bad destination', () => {

            let opts = {"destinations": [
                {
                        "amount": 5000000000,
                        "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
                },
                {
                    "amount": null,
                    "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
            }
            ]}
            expect(() => rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts))
                .to.throw('Parameter amount should be of type: function Number()')
        })

        it('ArrayOfAmountAddress should fail when invoked with string amount', () => {

            let opts = {"destinations": [
                {
                        "amount": "",
                        "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
                }
            ]}

            expect(() => rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts))
                .to.throw('Parameter amount should be of type: function Number()')
        })

        it('ArrayOfAmountAddress should fail when invoked with null amount', () => {

            let opts = {"destinations": [
                {
                        "amount": null,
                        "address": "as2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
                }
            ]}

            expect(() => rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts))
                .to.throw('Parameter amount should be of type: function Number()')
        })

        it('ArrayOfAmountAddress should fail when invoked with no destinations', () => {

            let opts = {"destinations": [
            ]}

            expect(() => rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts))
                .to.throw('Parameter destinations should be of type: ArrayOfAmountAddress')
        })

        it('ArrayOfAmountAddress should fail when invoked with invalid address', () => {

            let opts = {"destinations": [
                {
                    "amount": 5000000000,
                    "address": "s2cq3JcDQf5KddTXnEMTFFcXq5FJG5HgjDTDaSBhbG9ZXBYBUgDV6qMX2ES2NfuAcbS3S1ybpHYfgaa7jZRndv917i4VHRL4"
                }
            ]}

            expect(() => rpcHelpers.checkMandatoryParameters({destinations: 'ArrayOfAmountAddress'}, opts))
                .to.throw('Parameter address should be of type: function String()')
        })
    })
})