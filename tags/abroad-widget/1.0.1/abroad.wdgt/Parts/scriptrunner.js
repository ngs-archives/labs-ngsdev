//ScriptRunner
//http://d.hatena.ne.jp/holidays-l/
//http://svn.coderepos.org/share/lang/javascript/misc/loader.js.inc
var ScriptRunner = function(entries) {
	var retryCount = 0;
	var retryLimit = 50;
    function defined(prop) {
        try{
            return window[prop] != undefined || prop == "window";
        } catch(e) {
        }
        return false;
    }

    function loadScript(src) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = src;
        (document.body || document.documentElement).appendChild(script);
    }

    var onComplete;
    function doNextEntry() {
    	retryCount++;
        var entry = entries.shift();
        if (!entry||retryCount==retryLimit) {
            return onComplete && onComplete();
        }

        if (typeof entry == 'string' || entry instanceof String) {
            entry = {'window':entry};
        }
        for (var prop in entry) {
            if (prop == 'window' || !defined(prop)) {
                loadScript(entry[prop]);
            }
        }
        var timer = setInterval(function() {
            for (var prop in entry) {
                if (!defined(prop)) return;
            }
            clearInterval(timer);
            doNextEntry();
        }, 99);
    }
    doNextEntry();
    
    return function(callback) {
        return function() {
            var args = arguments;
            onComplete = function() {
            	callback.apply(callback, args);
            };
        }
    };
};

// SYNOPSIS
//
// (function(entries) {
//    ... script above. You can use loader-min.js.inc instead of.
// })
// ([
//     {'jQuery':'http://example.com/js/jquery.js'}, // 1st
//
//     {'jQuery.iUtil':'http://example.com/js/iutil.js',  //
//      'jQuery.iDrag':'http://example.com/js/idrag.js',  // 2nd
//      'jQuery.iDrop':'http://example.com/js/idrop.js'}, //
//      // iutil.js, idrag.js and idrop.js are loaded at the same time.
//
//     {'jQuery.iSort':'http://example.com/js/isortables.js'}, // 3rd
//
//     'http://example.com/myutil.js' // 4th
//     // It is loaded without property check.
// ])
// (function() {
//     // Now, these has been correct and ensured.
//     console.info([jQuery, jQuery.iUtil, jQuery.iDrag, jQuery.iDrop, jQuery.iSort]);
// })();
