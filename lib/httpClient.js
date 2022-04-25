'use strict'

const axios = require('axios')
const http = require('http')
const https = require('https')
const digest = require('./httpDigest')

var httpClient = {}

httpClient.createHttpClient = function (opts) {
  const instance = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
  })
  instance.defaults.digestHandlerEnabled = false
  if (typeof opts.username !== 'undefined' && typeof opts.password !== 'undefined') {
    var httpDigest = digest.createHttpDigest(opts)
    var wwwAuth = ''
    instance.defaults.digestHandlerEnabled = true
    instance.defaults._retry = false
  }

  instance.interceptors.response.use(function (response) {
    if (instance.defaults.digestHandlerEnabled) {
      instance.defaults.headers.Authorization = httpDigest.handleResponse(response.request.method, response.request.path, wwwAuth)
      httpDigest.incNonce()
    }
    return response
  }, function (error) {
    if (instance.defaults.digestHandlerEnabled && error.response.status === 401 && instance.defaults._retry === false) {
      wwwAuth = error.response.headers['www-authenticate']
      instance.defaults.headers.Authorization = httpDigest.handleResponse(error.request.method, error.request.path, wwwAuth)
      httpDigest.incNonce()
      instance.defaults._retry = true
      return instance(error.config)
    }
    return Promise.reject(error)
  })
  instance.resetNonces = function () {
    return httpDigest.resetNonces()
  }
  return instance
}

exports = module.exports = httpClient
