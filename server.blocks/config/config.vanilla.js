modules.define('config', function(provide) {

provide({
    express : {
        port : '3000'
    },
    bem : {
        bundles : ['desktop']
    },
    settings : {
        baseUrl : 'http://examples.com'
    }
});

});
