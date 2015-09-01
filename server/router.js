var express = require('express'),
    router = express.Router(),
    template = require('./template.js'),
    config = require('./config.js');

router.get('/', function(req, res, next) {
    template('desktop', { view : 'index', settings : config.settings })
        .then(function(html) {
            res.send(html);
        })
        .fail(function(err) {
            res.send(403, err);
        });
});

router.get('/error', function(req, res, next) {
    template('desktop', { view : 'error', settings : config.settings })
            .then(function(html) {
                res.send(html);
            })
            .fail(function(err) {
                res.send(403, err);
            });
});

router.get('/context', function(req, res, next) {
    template('desktop', { test : 'test' }, {
        block : 'test',
        content : 'block'
    }).then(function(html) {
        res.send(html);
    }).fail(function(err) {
        res.send(403, err);
    });
});

module.exports = router;
