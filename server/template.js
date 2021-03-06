var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    vow = require('../libs/bem-core/common.blocks/vow/vow.vanilla.js'),
    config = require('./config.js');

// Готовим бандлы
var bundles = config.bem.bundles,
    bundlesTemplates = {};

bundles.forEach(function(bundle) {
    var pathToBundle = path.resolve('./bundles', bundle),
        bemtreeTemplate = fs.readFileSync(path.join(pathToBundle, '_' + bundle + '.bemtree.js'), 'utf-8'),
        context = vm.createContext({
            console : console,
            Vow : vow,
            setImmediate : setImmediate,
            borschik : {
                link : function(i) {
                    return i;
                }
            }
        });

    vm.runInContext(bemtreeTemplate, context);

    bundlesTemplates[bundle] = {
        BEMHTML : require(path.join(pathToBundle, '_' + bundle + '.bemhtml.js')).BEMHTML,
        BEMTREE : context.BEMTREE
    };
});

function template(bundle, data, context) {
    return bundlesTemplates[bundle].BEMTREE.apply({ block : 'root', data : data, context : context })
        .then(function(bemjson) {

            var html;

            try {
                html = bundlesTemplates[bundle].BEMHTML.apply(bemjson);
            } catch(e) {
                throw new Error(e);
            }

            return html;

        });
}

module.exports = template;
