modules.define('app',
['config', 'morgan', 'router'],
function(provide, config, morgan, router) {

var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();

// Парсим формы
var multer  = require('multer');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var cookieParser = require('cookie-parser');
var session = require('express-session');

/*
 * SET
 */
app.set('handle', process.env.PORT || config.express.port);

/**
 * USE
 */
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended : true })); // for parsing application/x-www-form-urlencoded
app.use(multer({
    dest : path.resolve(__dirname, '../../public/uploads/'),
    includeEmptyFields : true
}));
app.use(methodOverride(function(req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(cookieParser());
app.use(session({
    secret : 'ololo',
    resave : false,
    saveUninitialized : true
}));

var logsAccessPath = path.resolve(__dirname, '../../logs/access.log');

if(!fs.existsSync(logsAccessPath)) {
    fs.closeSync(fs.openSync(logsAccessPath, 'w'));
}

var accessLogStream = fs.createWriteStream(logsAccessPath, { flag : 'a' });

app.use(morgan('short', { stream : accessLogStream }));

app.use('/', express.static(path.resolve(__dirname, '../../public')));
app.use(router);

provide(app);

});
