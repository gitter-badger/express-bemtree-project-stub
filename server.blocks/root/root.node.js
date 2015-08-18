modules.require(['app', 'log'], function (app, log) {
    app.listen(app.get('handle'), function() {
        log.info('start worker: ' + process.env.WORKER_ID);
        log.info('start PID: ' + process.pid);
        log.verbose('Express server listening on port ' + app.get('handle'));
    });
});
