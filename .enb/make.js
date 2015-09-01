var path = require('path'),
    techs = {
        files : {
            provide : require('enb/techs/file-provider'),
            copy : require('enb/techs/file-copy'),
            merge : require('enb/techs/file-merge')
        },
        bem : require('enb-bem-techs'),
        stylus : require('enb-stylus/techs/stylus'),
        js : require('enb-borschik/techs/js-borschik-include'),
        nodejs : require('enb-diverse-js/techs/node-js'),
        ym : require('enb-modules/techs/prepend-modules'),
        engines : {
            bemtree : require('enb-bemxjst/techs/bemtree'),
            bemhtml : require('enb-bemxjst/techs/bemhtml')
        },
        borschik : require('enb-borschik/techs/borschik')
    },
    isProd = process.env.NODE_ENV === 'production';

module.exports = function(config) {

    /**
     * CLIENT CONFIG
     */
    config.nodes(['desktop.bundles/*'], function(nodeConfig) {

        // Configure Levels
        nodeConfig.addTech([techs.bem.levels, { levels : [
            { path : path.join('libs', 'bem-core', 'common.blocks'), check : false },
            { path : path.join('libs', 'bem-core', 'desktop.blocks'), check : false },
            { path : path.join('libs', 'bem-components', 'common.blocks'), check : false },
            { path : path.join('libs', 'bem-components', 'desktop.blocks'), check : false },
            { path : path.join('libs', 'bem-components', 'design', 'common.blocks'), check : false },
            { path : path.join('libs', 'bem-components', 'design', 'desktop.blocks'), check : false },
            { path : 'common.blocks', check : true },
            { path : 'desktop.blocks', check : true }
        ] }]);

        // Client techs
        nodeConfig.addTechs([
            [techs.stylus, {
                target : '?.css',
                autoprefixer : {
                    browsers : ['ie >= 10', 'last 2 versions', 'opera 12.1', '> 2%']
                }
            }],
            [techs.js, {
                filesTarget : '?.js.files',
                target : '?.browser.js',
            }],
            [techs.files.merge, {
                target : '?.pre.js',
                sources : ['?.browser.bemhtml.js', '?.browser.js']
            }],
            [techs.ym, {
                source : '?.pre.js',
                target : '?.js'
            }]
        ]);

        // js techs
        nodeConfig.addTechs([
            [techs.bem.depsByTechToBemdecl, {
                target : '?.js-js.bemdecl.js',
                sourceTech : 'js',
                destTech : 'js'
            }],
            [techs.bem.mergeBemdecl, {
                sources : ['?.bemdecl.js', '?.js-js.bemdecl.js'],
                target : '?.js.bemdecl.js'
            }],
            [techs.bem.deps, {
                target : '?.js.deps.js',
                bemdeclFile : '?.js.bemdecl.js'
            }],
            [techs.bem.files, {
                depsFile : '?.js.deps.js',
                filesTarget : '?.js.files',
                dirsTarget : '?.js.dirs'
            }]
        ]);

        // Client Template Engine
        nodeConfig.addTechs([
            [techs.bem.depsByTechToBemdecl, {
                target : '?.template.bemdecl.js',
                sourceTech : 'js',
                destTech : 'bemhtml'
            }],
            [techs.bem.deps, {
                target : '?.template.deps.js',
                bemdeclFile : '?.template.bemdecl.js'
            }],
            [techs.bem.files, {
                depsFile : '?.template.deps.js',
                filesTarget : '?.template.files',
                dirsTarget : '?.template.dirs'
            }],
            [techs.engines.bemhtml, {
                target : '?.browser.bemhtml.js',
                filesTarget : '?.template.files',
                devMode : false
            }]
        ]);

        // Build templates
        nodeConfig.addTechs([
            [techs.engines.bemtree, { devMode : false }],
            [techs.engines.bemhtml, { devMode : false }]
        ]);

        nodeConfig.addTargets([
            '_?.css', '_?.js', '_?.bemhtml.js', '_?.bemtree.js'
        ]);

        // Start file
        nodeConfig.addTech([techs.files.provide, { target : '?.bemdecl.js' }]);
        // Base techs
        nodeConfig.addTechs([
            [techs.bem.deps],
            [techs.bem.files]
        ]);

        nodeConfig.addTechs([
            [techs.borschik, { sourceTarget : '?.bemtree.js', destTarget : '_?.bemtree.js', freeze : true, minify : isProd }],
            [techs.borschik, { sourceTarget : '?.bemhtml.js', destTarget : '_?.bemhtml.js', freeze : true, minify : isProd }],
            [techs.borschik, { source : '?.css', target : '_?.css', freeze : true, minify : isProd }],
            [techs.borschik, { source : '?.js', target : '_?.js', freeze : true, minify : isProd }]
        ]);
    });
};
