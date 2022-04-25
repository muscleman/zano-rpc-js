'use strict'

const digest = require('../../lib/httpDigest.js')

const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

// https://tools.ietf.org/html/rfc7616
// https://www.rfc-editor.org/errata/rfc7616

describe('HTTPDigest', function () {
  describe('generateResponseHash', function () {
    it('should match 8ca523f5e9506fed4657c9700eebdbec', function () {
      const httpDigest = digest.createHttpDigest({
        username: 'Mufasa',
        password: 'Circle of Life',
        nc: '00000001',
        cnonce: 'f2/wE4q74E6zIJEtWaHKaf5wv/H5QzzpXusqGemxURZJ'
      })
      const options = {
        path: '/dir/index.html',
        method: 'GET'
      }
      const wwwAuth = 'Digest qop="auth",realm="http-auth@example.org",algorithm=MD5,nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v",opaque="FQhe/qaU925kfnzjCev0ciny7QMkPqMAFRtzCUYo5tdS"'

      const header = httpDigest.handleResponse(options.method, options.path, wwwAuth)
      const pos = header.search('response="') + 10

      expect(header.substring(pos, pos + 32)).to.be.equal('8ca523f5e9506fed4657c9700eebdbec')
    })
  })
  describe('incNonce', function () {
    it('should increment nonce by 1', function () {
      const httpDigest = digest.createHttpDigest({
        username: 'Mufasa',
        password: 'Circle of Life',
        nc: '00000001',
        cnonce: 'f2/wE4q74E6zIJEtWaHKaf5wv/H5QzzpXusqGemxURZJ'
      })
      expect(httpDigest.incNonce()).to.be.equal('00000002')
    })
  })
  describe('Limit incNonce', function () {
    it('should increment nonce to 00000001', function () {
      const httpDigest = digest.createHttpDigest({
        username: 'Mufasa',
        password: 'Circle of Life',
        nc: 'ffffffff',
        cnonce: 'f2/wE4q74E6zIJEtWaHKaf5wv/H5QzzpXusqGemxURZJ'
      })
      expect(httpDigest.incNonce()).to.be.equal('00000001')
    })
    it('should increment nonce to 0000000a', function () {
      const httpDigest = digest.createHttpDigest({
        username: 'Mufasa',
        password: 'Circle of Life',
        nc: '00000009',
        cnonce: 'f2/wE4q74E6zIJEtWaHKaf5wv/H5QzzpXusqGemxURZJ'
      })
      expect(httpDigest.incNonce()).to.be.equal('0000000a')
    })
    it('should reset nonce to 00000001', function () {
      const httpDigest = digest.createHttpDigest({
        username: 'Mufasa',
        password: 'Circle of Life',
        nc: 'ffffffff',
        cnonce: 'f2/wE4q74E6zIJEtWaHKaf5wv/H5QzzpXusqGemxURZJ'
      })
      expect(httpDigest.resetNonces()).to.be.equal(true)
    })
  })
})
