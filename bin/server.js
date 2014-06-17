#!/usr/bin/env node

var fs = require('fs');
var domain = require('domain');
var path = require('path');
var ctxs = require('../');
var env = process.env.NODE_ENV || 'development';


var cmd = process.argv[1];

var argv = require('minimist')(process.argv.slice(2));


if (argv.h || argv.help) {
    console.log('Usage ' + cmd + ' [-p|--port <port>] [--cluster]');
    console.log('\t-p, --port specify running port');
    console.log('\t--cluster whether running clustered');
    process.exit(1);
}


var config = require('config').Server;

// load config, the config should be set first

var app = ctxs();

app.set('noauth', argv.noauth);
app.set('avoid-rewrite', argv.norewrite);

var cluster = require('cluster'),
    numCPUs = require('os').cpus().length;

if (argv.cluster || require('config').Server.cluster) {
    if (cluster.isMaster) {
        // Fork workers.
        for (var i = 0; i < numCPUs; i++)
            cluster.fork();

        cluster.on('exit', function(worker, code, signal) {
            console.error('worker ' + worker.process.pid + ' crashed');
        });
    } else {
        app.listen(argv.port || config.port || 8010);

        app.on('close', function() {
            console.error('cortex server crashed, it will be restart in 5 seconds...');
            var i = 5;
            setTimeout(function() {
                --i;
                console.error(i + '...');
                if (i === 0)
                    app.listen(argv.port || config.port || 8010);
            }, 1000);
        });
    }
} else {
    var d = domain.create();

    d.on('error', function(e) {
        console.error('server encounter error: ', e);
    });

    d.run(function() {
        app.listen(argv.port || config.port || 8010);
    });
}