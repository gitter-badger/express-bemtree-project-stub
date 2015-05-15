modules.define('router', ['template', 'config'], function(provide, template, config) {

var express = require('express');
var router = express.Router();

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

provide(router);

});
