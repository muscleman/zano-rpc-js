'use strict'

const config = require('./config')



let utils = {

    waitForConfirmations: async function waitForConfirmations(daemon_client, numberOfConfirmations) {
        let response = await daemon_client.getheight()
        const inclusiveLimit = response.height + numberOfConfirmations
        while (response.height < inclusiveLimit) {
            response = await daemon_client.getheight()
            await utils.delay(config.seconds * 10)
        }
    },
    delay: function delay(ms){
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

exports = module.exports = utils