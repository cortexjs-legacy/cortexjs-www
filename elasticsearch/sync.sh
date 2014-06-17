curl -XPUT 'localhost:9200/_river/cortex/_meta' -d '{
    "type" : "couchdb",
    "couchdb" : {
        "host" : "localhost",
        "port" : 15984,
        "db" : "registry",
        "user": "admin",
        "password": "admin",
        "ignore_attachments": true,
        "filter" : null
    },
    "index" : {
        "index" : "cortex",
        "type" : "package",
        "bulk_size" : "100",
        "bulk_timeout" : "10ms"
    }
}'
