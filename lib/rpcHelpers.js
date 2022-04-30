'use strict'

const ADDRESS_LENGTH = 97
const INTEGRATED_ADDRESS_LENGTH = 108
const HASH_LENGTH = 64
const SIGNATURE_LENGTH = 128

function isAddress (value) {
  return (isString(value) && (value.length === ADDRESS_LENGTH || value.length === INTEGRATED_ADDRESS_LENGTH))
}
function isBan (value) {
  return ((isString(value.host) || Number.isInteger(value.ip)) && isBoolean(value.ban) && Number.isInteger(value.seconds))
}
function isBoolean (value) {
  return typeof value === 'boolean'
}
function isDestination (value) {
  return (Number.isInteger(value.amount) && isAddress(value.address))
}
function isContractPrivateDetails (value) {
  return (isString(value.t) 
          && isString(value.c) 
          && isAddress(value.a_addr)
          && isAddress(value.b_addr)
          && Number.isInteger(value.to_pay)
          && Number.isInteger(value.a_pledge)
          && Number.isInteger(value.b_pledge))
}
function isOfferStructure (value) {
  return (isString(value.ap) 
         && isString(value.at) 
         && isString(value.cat)
         && isString(value.cnt)
         && isString(value.com)
         && isString(value.do)
         && Number.isInteger(value.et)
         && Number.isInteger(value.fee)
         && isString(value.lci)
         && isString(value.lco)
         && Number.isInteger(value.ot)
         && isString(value.pt)
         && isString(value.t)
         )
}
function isHash (value) {
  return (isString(value) && value.length === HASH_LENGTH)
}
function isPaymentId (value) {
  return (isString(value) && (value.length === 16 || value.length === 64))
}
function isSignature (value) {
  return (isString(value) && value.length === SIGNATURE_LENGTH)
}
function isSignedKeyImage (value) {
  return isHash(value.key_image) && isSignature(value.signature)
}
function isString (value) {
  return (typeof value === 'string' || value instanceof String)
}
function validBytes (value, length) {
  return (isString(value) && Buffer.from(value).length <= length)
}


var rpcHelpers = {
  checkParameterType: function (opts, checks, key) {
    if (checks[key] === 'Address') {
      if (isAddress(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfAddresses') {
      if (Array.isArray(opts[key]) && opts[key].some(isAddress)) return true
    }
    if (checks[key] === 'ArrayOfAmountAddress') {
      if (Array.isArray(opts[key])) {
        if (opts[key].length === 0)
          throw new Error(`Parameter ${key} should be of type: ${checks[key]}!`)
        for (const destination of opts[key]) {
            if (Object.keys(destination).length === 0)
                throw new Error(`Parameter ${opts[key]} should be of type: ${Object}!`)
            for (const [key, value] of Object.entries(destination)) {
                if (key === 'address' && !isAddress(value))
                    throw new Error(`Parameter ${key} should be of type: ${String}!`)
                if (key === 'amount' && !Number.isInteger(value))
                    throw new Error(`Parameter ${key} should be of type: ${Number}!`)              
            }
        }
        return true
      }
    }
    if (checks[key] === 'Ban') {
      if (isBan(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfBans') {
      if (Array.isArray(opts[key]) && opts[key].some(isBan)) return true
    }
    if (checks[key] === 'Destination') {
      if (isDestination(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfDestinations') {
      if (Array.isArray(opts[key]) && opts[key].some(isDestination)) return true
    }
    if (checks[key] === 'Boolean') {
      if (isBoolean(opts[key])) return true
    }
    if (checks[key] === 'Hash') {
      if (isHash(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfHashes') {
      if (Array.isArray(opts[key]) && opts[key].some(isHash)) return true
    }
    if (checks[key] === 'Integer') {
      if (Number.isInteger(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfIntegers') {
      if (Array.isArray(opts[key]) && opts[key].some(Number.isInteger)) return true
    }
    if (checks[key] === 'PaymentId') {
      if (isPaymentId(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfPaymentIds') {
      if (Array.isArray(opts[key]) && opts[key].some(isPaymentId)) return true
    }
    if (checks[key] === 'SignedKeyImage') {
      if (isSignedKeyImage(opts[key])) return true
    }
    if (checks[key] === 'ArrayOfSignedKeyImages') {
      if (Array.isArray(opts[key]) && opts[key].some(isSignedKeyImage)) return true
    }
    if (checks[key] === 'String') {
      if (isString(opts[key])) return true
    }
    if (checks[key] === 'Max255Bytes') {
      if (validBytes(opts[key], 255)) return true
    }
    if (checks[key] === 'ArrayOfStrings') {
      if (Array.isArray(opts[key]) && opts[key].some(isString)) return true
    }
    if (checks[key] === 'ContractPrivateDetails') {
      if (isContractPrivateDetails(opts[key])) return true
    }
    if (checks[key] === 'OfferStructure') {
      if (isOfferStructure(opts[key])) return true
    }
    throw new Error(`Parameter ${key} should be of type: ${checks[key]}!`)
  },
  checkMandatoryParameters: function (mandatoryChecks, opts) {
    opts = opts || ''
    const keysChecks = Object.keys(mandatoryChecks)
    if (opts === '') {
      throw new Error(`Missing mandatory parameter ${keysChecks[0]}!`)
    }
    for (const key of keysChecks) {
      if (key in opts === false) {
        throw new Error(`Missing mandatory parameter ${key}!`)
      } else {
        this.checkParameterType(opts, mandatoryChecks, key)
      }
    }
    return true
  },
  checkOptionalParametersType: function (optionalChecks, opts) {
    if (typeof opts !== 'undefined' && typeof optionalChecks !== 'undefined') {
      const optionalKeys = Object.keys(optionalChecks)
      for (const key of optionalKeys) {
        if (key in opts) {
          this.checkParameterType(opts, optionalChecks, key)
        }
      }
    }
    return true
  },
  createJsonData: function (method, opts) {
    if (typeof opts !== 'undefined') {
      return `{"jsonrpc":"2.0","id":"0","method":"${method}","params":${JSON.stringify(opts)}}`
    } else {
      return `{"jsonrpc":"2.0","id":"0","method":"${method}"}`
    }
  },
  makeJsonQuery: async function (httpClient, address, queue, parseResponse, command, opts) {
    opts = opts || ''
    return queue.add(async () => {
      if (!!opts) {
        const res = await httpClient.post(address, this.createJsonData(command, opts))
        return parseResponse(res)
      } else {
        const res = await httpClient.post(address, this.createJsonData(command))
        return parseResponse(res)
      }
    })
  },
  makeOtherQuery: async function (httpClient, address, queue, parseResponse, command, opts) {
    opts = opts || ''
    return queue.add(async () => {
      if (opts === '') {
        const res = await httpClient.post(address + '/' + command)
        return parseResponse(res)
      } else {
        const res = await httpClient.post(address + '/' + command, JSON.stringify(opts))
        return parseResponse(res)
      }
    })
  }
}

exports = module.exports = rpcHelpers
