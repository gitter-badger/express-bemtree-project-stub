module.exports = {
    express : {
        port : '3000',
        simlinks : [
            {
                src  : '../desktop.bundles/index/_index.css',
                dest : '../public/_index.css'
            },
            {
                src  : '../desktop.bundles/index/_index.js',
                dest : '../public/_index.js'
            }
        ]
    },
    bem : {
        bundles : ['desktop']
    },
    settings : {
        baseUrl : 'http://examples.com'
    },
    log : {
        server : {
            transport : 'Console',
            view : {
                level       : 'verbose',
                prettyPrint : true,
                colorize    : true,
                timestamp   : true,
                label       : 'server'
            }
        },
        browser : {
            transport : 'Console',
            view : {
                level       : 'verbose',
                prettyPrint : true,
                colorize    : true,
                timestamp   : true,
                label       : 'browser'
            }
        }
    }
};
