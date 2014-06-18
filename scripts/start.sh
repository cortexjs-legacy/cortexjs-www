#!/bin/bash

if [[ -z "$1" ]];then
    echo "Please provide env!"
    exit 1
fi


pwd=`pwd`
execDir=`dirname $0`
projectPath=`cd ${execDir};cd ..;pwd`

export NODE_PATH=$NODE_PATH:${projectPath}/modules

env=$1

if [ "${env}" = 'local' ] ;then
    export NODE_ENV=local
    "$projectPath/bin/server.js" --noauth --port 8010 | ./node_modules/.bin/bunyan
elif [ "${env}" = 'dev' ] ;then
    export NODE_ENV=development 
    "$projetPath/bin/server.js" | ./node_modules/.bin/bunyan
elif [ "${env}" = 'product' ] ;then
    export NODE_ENV=production
    "$projectPath/bin/server.js" | ./node_modules/.bin/bunyan
else
    echo "Wrong env provided!";
    exit 1
fi
