#!/bin/bash

if [[ -z "$1" ]];then
    echo "Please provide env!"
    exit 1
fi


pwd=`pwd`
execDir=`dirname $0`
projectPath=`cd ${execDir};cd ..;pwd`

env=$1

if [ "${env}" = 'dev' ] ;then
    export NODE_ENV=development
    "$projectPath/bin/server.js" | ./node_modules/.bin/bunyan
elif [ "${env}" = 'prod' ] ;then
    export NODE_ENV=production
    "$projectPath/bin/server.js" | ./node_modules/.bin/bunyan
else
    echo "Wrong env provided!";
    exit 1
fi
