module.exports = {
    express : {
        port : '3000',
        simlinks : [
            {
                src  : '../bundles/index/_index.css',
                dest : '../public/_index.css'
            },
            {
                src  : '../bundles/index/_index.js',
                dest : '../public/_index.js'
            }
        ]
    },
    bem : {
        bundles : ['index']
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
