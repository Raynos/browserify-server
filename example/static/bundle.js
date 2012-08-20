(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",Function(['require','module','exports','__dirname','__filename','process'],"function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = '',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== 'string' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + '/' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === '/';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === '/',\n    trailingSlash = path.slice(-1) === '/';\n\n// Normalize the path\npath = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n  \n  return (isAbsolute ? '/' : '') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === 'string';\n  }).join('/'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || '';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return '.';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || '';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || '';\n};\n\n//@ sourceURL=path"));

require.define("__browserify_process",Function(['require','module','exports','__dirname','__filename','process'],"var process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var queue = [];\n    var canPost = typeof window !== 'undefined'\n        && window.postMessage && window.addEventListener\n    ;\n    \n    if (canPost) {\n        window.addEventListener('message', function (ev) {\n            if (ev.source === window && ev.data === 'browserify-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n    }\n    \n    return function (fn) {\n        if (canPost) {\n            queue.push(fn);\n            window.postMessage('browserify-tick', '*');\n        }\n        else setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nprocess.binding = function (name) {\n    if (name === 'evals') return (require)('vm')\n    else throw new Error('No such module. (Possibly not yet loaded)')\n};\n\n(function () {\n    var cwd = '/';\n    var path;\n    process.cwd = function () { return cwd };\n    process.chdir = function (dir) {\n        if (!path) path = require('path');\n        cwd = path.resolve(dir, cwd);\n    };\n})();\n//@ sourceURL=__browserify_process"));

require.define("vm",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = require(\"vm-browserify\")\n//@ sourceURL=vm"));

require.define("/node_modules/vm-browserify/package.json",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = {\"main\":\"index.js\"}\n//@ sourceURL=/node_modules/vm-browserify/package.json"));

require.define("/node_modules/vm-browserify/index.js",Function(['require','module','exports','__dirname','__filename','process'],"var Object_keys = function (obj) {\n    if (Object.keys) return Object.keys(obj)\n    else {\n        var res = [];\n        for (var key in obj) res.push(key)\n        return res;\n    }\n};\n\nvar forEach = function (xs, fn) {\n    if (xs.forEach) return xs.forEach(fn)\n    else for (var i = 0; i < xs.length; i++) {\n        fn(xs[i], i, xs);\n    }\n};\n\nvar Script = exports.Script = function NodeScript (code) {\n    if (!(this instanceof Script)) return new Script(code);\n    this.code = code;\n};\n\nScript.prototype.runInNewContext = function (context) {\n    if (!context) context = {};\n    \n    var iframe = document.createElement('iframe');\n    if (!iframe.style) iframe.style = {};\n    iframe.style.display = 'none';\n    \n    document.body.appendChild(iframe);\n    \n    var win = iframe.contentWindow;\n    \n    forEach(Object_keys(context), function (key) {\n        win[key] = context[key];\n    });\n     \n    if (!win.eval && win.execScript) {\n        // win.eval() magically appears when this is called in IE:\n        win.execScript('null');\n    }\n    \n    var res = win.eval(this.code);\n    \n    forEach(Object_keys(win), function (key) {\n        context[key] = win[key];\n    });\n    \n    document.body.removeChild(iframe);\n    \n    return res;\n};\n\nScript.prototype.runInThisContext = function () {\n    return eval(this.code); // maybe...\n};\n\nScript.prototype.runInContext = function (context) {\n    // seems to be just runInNewContext on magical context objects which are\n    // otherwise indistinguishable from objects except plain old objects\n    // for the parameter segfaults node\n    return this.runInNewContext(context);\n};\n\nforEach(Object_keys(Script.prototype), function (name) {\n    exports[name] = Script[name] = function (code) {\n        var s = Script(code);\n        return s[name].apply(s, [].slice.call(arguments, 1));\n    };\n});\n\nexports.createScript = function (code) {\n    return exports.Script(code);\n};\n\nexports.createContext = Script.createContext = function (context) {\n    // not really sure what this one does\n    // seems to just make a shallow copy\n    var copy = {};\n    if(typeof context === 'object') {\n        forEach(Object_keys(context), function (key) {\n            copy[key] = context[key];\n        });\n    }\n    return copy;\n};\n\n//@ sourceURL=/node_modules/vm-browserify/index.js"));

require.define("/example/winning/index.js",Function(['require','module','exports','__dirname','__filename','process'],"var yarn = require(\"./yarn\")\n\nmodule.exports = winning\n\nfunction winning(text) {\n    var elem = yarn('winning.html', ['winning.css'])\n    elem.firstChild.textContent = text\n\n    return {\n        appendTo: appendTo\n    }\n\n    function appendTo(parent) {\n        parent.appendChild(elem)\n    }\n}\n\nconsole.log(\"change???\")\n//@ sourceURL=/example/winning/index.js"));

require.define("/node_modules/yarnify/package.json",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = {\"main\":\"index.js\",\"browserify\":\"browser.js\"}\n//@ sourceURL=/node_modules/yarnify/package.json"));

require.define("/node_modules/yarnify/browser.js",Function(['require','module','exports','__dirname','__filename','process'],"var path = require('path');\nvar parse = require('./browser/parse');\nvar withPrefix = require('./browser/with_prefix');\n\nvar objectKeys = Object.keys || function (obj) {\n    var keys = [];\n    for (var key in obj) keys.push(key);\n    return keys;\n};\n\nvar isArray = Array.isArray || function (xs) {\n    return Object.prototype.toString.call(xs) === '[object Array]';\n};\n\nmodule.exports = function (prefix, files) {\n    var elems = {};\n    var cssElement = document.createElement('style');\n    \n    (function () {\n        var sources = [];\n        \n        var keys = objectKeys(files);\n        for (var i = 0; i < keys.length; i++) {\n            var key = keys[i];\n            if (/\\.css$/i.test(key)) {\n                sources.push(files[key][1]); \n            }\n            else {\n                elems[key] = parse(prefix, files[key]);\n            }\n        }\n        \n        var cssText = document.createTextNode(sources.join('\\n'));\n        cssElement.appendChild(cssText);\n    })();\n    \n    var insertedCss = false;\n    var y = function (file_, cssFiles) {\n        var file = path.resolve('/', file_);\n        if (!elems[file]) return undefined;\n        var elem = withPrefix(prefix, elems[file].cloneNode(true));\n        \n        if (!cssFiles) cssFiles = [];\n        if (!isArray(cssFiles)) cssFiles = [ cssFiles ];\n        for (var i = 0; i < cssFiles.length; i++) {\n            var cssFile = path.resolve('/', cssFiles[i])\n            if (files[cssFile]) {\n                var cssPrefix = files[cssFile][0];\n                elem.addClass(cssPrefix);\n            }\n        }\n        \n        if (!insertedCss) {\n            document.head.appendChild(cssElement);\n            insertedCss = true;\n        }\n        return elem;\n    };\n    \n    y.prefix = prefix;\n    \n    y.parse = function (src) {\n        return parse(prefix, src);\n    };\n    \n    y.files = objectKeys(files);\n    \n    return y;\n};\n\n//@ sourceURL=/node_modules/yarnify/browser.js"));

require.define("/node_modules/yarnify/browser/parse.js",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = function (prefix, src) {\n    var elem = document.createElement('div');\n    var className = prefix.slice(0, -1);\n    elem.setAttribute('class', prefix + '_container');\n    elem.innerHTML = src;\n    \n    var nodes = elem.querySelectorAll('*');\n    \n    for (var i = 0; i < nodes.length; i++) {\n        var node = nodes[i];\n        var c = node.getAttribute('class');\n        if (c) {\n            node.setAttribute('class', c.split(/\\s+/)\n                .map(function (x) { return  prefix + x })\n                .concat(className)\n                .join(' ')\n            );\n        }\n        else {\n            node.setAttribute('class', className);\n        }\n        \n        var id = node.getAttribute('id');\n        if (id) node.setAttribute('id', prefix + id);\n    }\n    \n    return elem;\n};\n\n//@ sourceURL=/node_modules/yarnify/browser/parse.js"));

require.define("/node_modules/yarnify/browser/with_prefix.js",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = function withPrefix (prefix, elem) {\n    function wrap (e) {\n        if (!e) return e\n        if (e && e.length) {\n            for (var i = 0; i < e.length; i++) {\n                e[i] = withPrefix(prefix, e[i]);\n            }\n        }\n        if (e._prefix === prefix) return e;\n        \n        return withPrefix(prefix, e);\n    }\n    \n    elem._prefix = prefix;\n    \n    var querySelector = elem.constructor.prototype.querySelector;\n    elem.querySelector = function (sel) {\n        var s = sel.replace(/([.#])([^.\\s])/g, function (_, op, c) {\n            return op + prefix + c;\n        });\n        return wrap(querySelector.call(this, s));\n    };\n    \n    var querySelectorAll = elem.constructor.prototype.querySelectorAll;\n    elem.querySelectorAll = function (sel) {\n        var s = sel.replace(/([.#])([^.\\s])/g, function (_, op, c) {\n            return op + prefix + c;\n        });\n        return wrap(querySelectorAll.call(this, s));\n    };\n    \n    elem.addClass = function (c) {\n        var ps = elem.className.split(/\\s+/);\n        if (ps.indexOf(prefix + c) < 0) {\n            ps.push(prefix + c);\n            elem.className = ps.join(' ');\n        }\n    };\n    \n    elem.removeClass = function (c) {\n        var ps = elem.className.split(/\\s+/);\n        var ix = ps.indexOf(prefix + c);\n        if (ix >= 0) {\n            ps.splice(ix, 1);\n            elem.className = ps.join(' ');\n        }\n    };\n    \n    elem.hasClass = function (c) {\n        var ps = elem.className.split(/\\s+/);\n        var ix = ps.indexOf(prefix + c) >= 0;\n        return ix >= 0;\n    };\n    \n    return elem;\n};\n\n//@ sourceURL=/node_modules/yarnify/browser/with_prefix.js"));

require.define("/example/winning/yarn",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = require(\"yarnify\")(\"_e3eb28f5-\",{\"/winning.html\":\"<div class=\\\"foo\\\">\\n    \\n</div>\",\"/winning.css\":[\"2658b1eb\",\"._e3eb28f5-2658b1eb ._e3eb28f5-foo {\\n    color: green;\\n}\"]});\n\n//@ sourceURL=/example/winning/yarn"));

require.define("/example/index.js",Function(['require','module','exports','__dirname','__filename','process'],"var winning = require(\"./winning\")\n    , body = document.body\n\nvar widget = winning('winning!')\nwidget.appendTo(body)\n\nconsole.log(\"hello???\")\n//@ sourceURL=/example/index.js"));
require("/example/index.js");

require.define("/example/winning/yarn",Function(['require','module','exports','__dirname','__filename','process'],"module.exports = require(\"yarnify\")(\"_ea6be7b2-\",{\"/winning.html\":\"<div class=\\\"foo\\\">\\n    \\n</div>\",\"/winning.css\":[\"ccea6662\",\"._ea6be7b2-ccea6662 ._ea6be7b2-foo {\\n    color: red;\\n}\"]});\n\n//@ sourceURL=/example/winning/yarn"));
require("/example/winning/yarn");
})();
