var redis = require('redis');

var config = require('config').Redis;

module.exports = redis.createClient(config.port || 6379, config.address || '127.0.0.1');