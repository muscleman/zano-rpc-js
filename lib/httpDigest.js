
'use strict'

// adapted from https://gist.github.com/LPGhatguy/aa3a65bff58e0070d488
// https://tools.ietf.org/html/rfc7616

var crypto = require('crypto')

function generateCnonce () {
  const ha1 = crypto.createHash('MD5')
  ha1.update(crypto.randomBytes(16).toString('base64'))
  return ha1.digest('hex')
}

function generateResponseHash (method, path, challenge, username, password, nc, cnonce) {
  const ha1 = crypto.createHash('MD5')
  ha1.update([username, challenge.realm, password].join(':'))
  const ha2 = crypto.createHash('MD5')
  ha2.update([method, path].join(':'))

  const res = crypto.createHash('MD5')
  const joined = [ha1.digest('hex'), challenge.nonce, nc, cnonce, challenge.qop, ha2.digest('hex')].join(':')

  res.update(joined)

  return res.digest('hex')
}

function parseChallenge (header) {
  const prefix = 'Digest'
  const challenge = header.substr(header.indexOf(prefix) + prefix.length)
  const parts = challenge.split(',')
  const length = parts.length
  var params = {}
  for (let i = 0; i < length; i++) {
    const part = parts[i].match(/^\s*?([a-zA-Z0-0]+)="(.*)"\s*?$/)
    if (part && part.length > 2) {
      params[part[1]] = part[2]
    }
  }
  return params
}

function renderDigest (params) {
  var parts = []
  for (var i in params) {
    if (i === 'nc' || i === 'algorithm') {
      parts.push(i + '=' + params[i])
    } else {
      parts.push(i + '="' + params[i] + '"')
    }
  }
  return 'Digest ' + parts.join(',')
}

var digest = {}

digest.createHttpDigest = function (opts) {
  if (typeof opts.username === 'undefined' || typeof opts.password === 'undefined') {
    throw new Error('Missing user and/or password!')
  }
  const username = opts.username
  const password = opts.password
  var nc = opts.nc || '00000001'
  var cnonce = opts.cnonce || generateCnonce()
  return {
    handleResponse: function (method, path, authHeaders) {
      const challenge = parseChallenge(authHeaders)
      const requestParams = {
        username: username,
        realm: challenge.realm,
        nonce: challenge.nonce,
        uri: path,
        cnonce: cnonce,
        nc: nc,
        algorithm: 'MD5',
        response: generateResponseHash(method, path, challenge, username, password, nc, cnonce),
        qop: challenge.qop
      }
      return renderDigest(requestParams)
    },
    incNonce: function () {
      if (nc === 'ffffffff') {
        nc = '00000001'
      } else {
        const s = '00000000' + (parseInt(nc, 16) + 1).toString(16)
        nc = s.substr(s.length - 8)
      }
      return nc
    },
    resetNonces: function () {
      nc = '00000001'
      cnonce = generateCnonce()
      return true
    }
  }
}

exports = module.exports = digest
