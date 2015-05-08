// var bundles = ['client'];

var techs = {
    files : {
        provide : require('enb/techs/file-provider'),
        copy : require('enb/techs/file-copy'),
        merge : require('enb/techs/file-merge')
    },
    bem : require('enb-bem-techs'),
    css : {
        stylus : require('enb-stylus/techs/css-stylus'),
        stylusWithAutoprefixer : require('enb-stylus/techs/css-stylus-with-autoprefixer')
    },
    js : require('./techs/js-borschik-include'),
    ym : require('enb-modules/techs/prepend-modules'),
    engines : {
        bemtree: require('enb-bemxjst/techs/bemtree'),
        bemhtml : require('enb-bemxjst/techs/bemhtml')
    },
    html : {
        bemhtml : require('enb-bemxjst/techs/html-from-bemjson')
    },
    borschik : require('enb-borschik/techs/borschik')
};

var LIB_NAME = 'bem-components',
    fs = require('fs'),
    path = require('path'),
    PLATFORMS = {
        'desktop' : ['common', 'desktop']
    };

module.exports = function(config) {
    var platforms = Object.keys(PLATFORMS);

    configurePages(platforms);

    function configurePages(platforms) {
        platforms.forEach(function(platform) {
            var nodes = [platform + '.bundles/*'];

            config.nodes(nodes, function(nodeConfig) {
                nodeConfig.addTech([techs.files.provide, { target : '?.bemjson.js' }]);
            });

            configureNodes(platform, nodes);
        });
    }

    function configureNodes(platform, nodes) {
        configureLevels(platform, nodes);

        config.nodes(nodes, function(nodeConfig) {
            var langs = config.getLanguages();

            // Base techs
            nodeConfig.addTechs([
                [techs.bem.bemjsonToBemdecl],
                [techs.bem.depsOld],
                [techs.bem.files]
            ]);

            // Client techs
            nodeConfig.addTechs([
                [techs.css.stylusWithAutoprefixer, { browsers : getBrowsers(platform) }],
                [techs.css.stylus, { target : '?.ie.css', sourceSuffixes : ['styl', 'ie.styl'] }],
                [techs.js, {
                    filesTarget : '?.js.files'
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
                [techs.bem.depsOld, {
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
                [techs.bem.depsOld, {
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

            // Build htmls
            nodeConfig.addTechs([
                [techs.engines.bemhtml, { devMode : false }],
                [techs.html.bemhtml]
            ]);

            nodeConfig.addTargets([
                '_?.css', '_?.js', '?.html'
            ]);
        });

        config.mode('development', function() {
            config.nodes(nodes, function(nodeConfig) {
                nodeConfig.addTechs([
                    [techs.borschik, { source : '?.css', target : '_?.css', freeze : true, minify : false }],
                    [techs.borschik, { source : '?.js', target : '_?.js', freeze : true, minify : false }]
                ]);
            });
        });

        config.mode('production', function() {
            config.nodes(nodes, function(nodeConfig) {
                nodeConfig.addTechs([
                    [techs.borschik, { source : '?.css', target : '_?.css', freeze : true, tech : 'cleancss', minify : true }],
                    [techs.borschik, { source : '?.js', target : '_?.js', freeze : true, minify : true }]
                ]);
            });
        });
    }

    function configureLevels(platform, nodes) {
        config.nodes(nodes, function(nodeConfig) {
            var nodeDir = nodeConfig.getNodePath(),
                blockSublevelDir = path.join(nodeDir, '..', '.blocks'),
                sublevelDir = path.join(nodeDir, 'blocks'),
                extendedLevels = [].concat(getSourceLevels(platform));

            if(fs.existsSync(blockSublevelDir)) {
                extendedLevels.push(blockSublevelDir);
            }

            if(fs.existsSync(sublevelDir)) {
                extendedLevels.push(sublevelDir);
            }

            nodeConfig.addTech([techs.bem.levels, { levels : extendedLevels }]);
        });
    }

};

function getSourceLevels(platform) {
    var platformNames = (PLATFORMS[platform]),
        levels = [];

    platformNames.forEach(function(name) {
        levels.push({ path : path.join('libs', 'bem-core', name + '.blocks'), check : false });
    });

    platformNames.forEach(function(name) {
        levels.push({ path : path.join('libs', 'bem-components', name + '.blocks'), check : false });
    });

    platformNames.forEach(function(name) {
        levels.push({ path : name + '.blocks', check : true });
    });

    // platformNames.forEach(function(name) {
    //     levels.push({ path : path.join('design', name + '.blocks'), check : true });
    // });

    return levels;
}

function getBrowsers(platform) {
    switch(platform) {
        case 'desktop':
            return [
                'last 2 versions',
                'ie 10',
                'ff 24',
                'opera 12.16'
            ];
        case 'touch':
            return [
                'android 4',
                'ios >= 5',
                'ie 10'
            ];
        case 'touch-pad':
            return [
                'android 4',
                'ios 5'
            ];
        case 'touch-phone':
            return [
                'android 4',
                'ios 6',
                'ie 10'
            ];
    }
}

function wrapInPage(bemjson, meta) {
    var basename = '_' + path.basename(meta.filename, '.bemjson.js');
    return {
        block : 'page',
        title : 'title',
        head : [{ elem : 'css', url : basename + '.css' }],
        scripts : [{ elem : 'js', url : basename + '.js' }],
        mods : { theme : getThemeFromBemjson(bemjson) },
        content : bemjson
    };
}

function getThemeFromBemjson(bemjson) {
    if(typeof bemjson !== 'object') return;

    var theme, key;

    for(key in bemjson) {
        if(theme = key === 'mods'? bemjson.mods.theme :
            getThemeFromBemjson(bemjson[key])) return theme;
    }
}










/*
module.exports = function(config) {
    var isProd = process.env.YENV === 'production';

    bundles.forEach(function(bundle) {
        var levels = [
            { path: 'libs/bem-core/common.blocks', check: false },
            { path: 'libs/bem-core/desktop.blocks', check: false },
            { path: 'libs/bem-components/common.blocks', check: false },
            { path: 'libs/bem-components/desktop.blocks', check: false },
            { path: 'libs/bem-components/design/common.blocks', check: false },
            { path: 'libs/bem-components/design/desktop.blocks', check: false },
            'src/' + bundle + '.blocks'
        ];
        config.nodes('src/' + bundle + '.bundles/*', function(nodeConfig) {

            nodeConfig.addTechs([
                // essential
                [techs.bem.levels, { levels: levels }],
                [techs.files.provide, { target: '?.bemdecl.js' }],
                [techs.bem.deps],
                [techs.bem.files],

                // css
                [techs.css.stylus, { target: '?.noprefix.css' }],
                [techs.stylusWithAutoprefixer, {
                    sourceTarget: '?.noprefix.css',
                    destTarget: '?.css',
                    browserSupport: ['last 2 versions', 'ie 10', 'opera 12.16']
                }],

                // bemtree
                [techs.engines.bemtree, { devMode: process.env.BEMTREE_ENV === 'development' }],

                // bemhtml
                [techs.engines.bemhtml, { devMode: process.env.BEMHTML_ENV === 'development' }],
                // [techs.htmlFromBemjson],

                // client bemhtml
                [techs.bem.depsByTechToBemdecl, {
                    target: '?.bemhtml.bemdecl.js',
                    sourceTech: 'js',
                    destTech: 'bemhtml'
                }],
                [techs.bem.deps, {
                    target: '?.bemhtml.deps.js',
                    bemdeclFile: '?.bemhtml.bemdecl.js'
                }],
                [techs.bem.files, {
                    depsFile: '?.bemhtml.deps.js',
                    filesTarget: '?.bemhtml.files',
                    dirsTarget: '?.bemhtml.dirs'
                }],
                [techs.bemhtml, {
                    target: '?.browser.bemhtml.js',
                    filesTarget: '?.bemhtml.files',
                    devMode: process.env.BEMHTML_ENV === 'development'
                }],

                // js
                [techs.js],
                [techs.files.merge, {
                    target: '?.pre.js',
                    sources: ['?.browser.bemhtml.js', '?.browser.js']
                }],
                [techs.ym, { source: '?.pre.js' }],

                // borschik
                [techs.borschik, { sourceTarget: '?.bemtree.js', destTarget: '_?.bemtree.js', freeze: true, minify: isProd }],
                [techs.borschik, { sourceTarget: '?.bemhtml.js', destTarget: '_?.bemhtml.js', freeze: true, minify: isProd }],
                [techs.borschik, { sourceTarget: '?.js', destTarget: '_?.js', freeze: true, minify: isProd }],
                [techs.borschik, { sourceTarget: '?.css', destTarget: '_?.css', tech: 'cleancss', freeze: true, minify: isProd }]
            ]);

            nodeConfig.addTargets(['_?.bemtree.js', '_?.bemhtml.js', '_?.css', '_?.js']);
        });
    });
};
*/
