;(function () {
    // cross-browser replacement for $(document).ready()
    // https://raw.githubusercontent.com/jfriend00/docReady/master/docready.js
    (function (funcName, baseObj) {
        // The public function name defaults to window.docReady
        // but you can pass in your own object and own function name and those will be used
        // if you want to put them in a different namespace
        funcName = funcName || "docReady";
        baseObj = baseObj || window;
        var readyList = [];
        var readyFired = false;
        var readyEventHandlersInstalled = false;

        // call this when the document is ready
        // this function protects itself against being called more than once
        function ready() {
            if (!readyFired) {
                // this must be set to true before we start calling callbacks
                readyFired = true;
                for (var i = 0; i < readyList.length; i++) {
                    // if a callback here happens to add new ready handlers,
                    // the docReady() function will see that it already fired
                    // and will schedule the callback to run right after
                    // this event loop finishes so all handlers will still execute
                    // in order and no new ones will be added to the readyList
                    // while we are processing the list
                    readyList[i].fn.call(window, readyList[i].ctx);
                }
                // allow any closures held by these functions to free
                readyList = [];
            }
        }

        function readyStateChange() {
            if (document.readyState === "complete") {
                ready();
            }
        }

        // This is the one public interface
        // docReady(fn, context);
        // the context argument is optional - if present, it will be passed
        // as an argument to the callback
        baseObj[funcName] = function (callback, context) {
            // if ready has already fired, then just schedule the callback
            // to fire asynchronously, but right away
            if (readyFired) {
                setTimeout(function () {
                    callback(context);
                }, 1);
                return;
            } else {
                // add the function and context to the list
                readyList.push({fn: callback, ctx: context});
            }
            // if document already ready to go, schedule the ready function to run
            if (document.readyState === "complete") {
                setTimeout(ready, 1);
            } else if (!readyEventHandlersInstalled) {
                // otherwise if we don't have event handlers installed, install them
                if (document.addEventListener) {
                    // first choice is DOMContentLoaded event
                    document.addEventListener("DOMContentLoaded", ready, false);
                    // backup is window load event
                    window.addEventListener("load", ready, false);
                } else {
                    // must be IE
                    document.attachEvent("onreadystatechange", readyStateChange);
                    window.attachEvent("onload", ready);
                }
                readyEventHandlersInstalled = true;
            }
        }
    })("docReady", window);

    function jsBundle() {
        if (typeof jQuery !== 'undefined') {
            if (window.postMessage) {
                var iframe = jQuery(window.document).find("iframe#myIframe");
                var onScroll = function() {
                    if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.postMessage) {
                        iframe[0].contentWindow.postMessage({
                            scrollTop: jQuery(window.document).scrollTop(),
                            iframeOffset: iframe.offset()
                        }, '*');
                    } else {
                        console.log("Stopped to monitor scrolling");
                        jQuery(window.document).off('scroll', onScroll);
                    }
                };

                jQuery(window.document).on('scroll', onScroll);
            } else {
                console.log("window.postMessage isn't supported. Can't monitor scrolling");
            }
        }



        /*! jQuery ResponsiveIframe - v0.0.3 - 2013-09-05
         * https://github.com/npr/responsiveiframe
         * Copyright (c) 2013 Irakli Nadareishvili; Licensed MIT, GPL */
        if (typeof jQuery !== 'undefined') {
            (function ($) {
                var settings = {
                    xdomain: '*',
                    iframeId: null,
                    ie: navigator.userAgent.toLowerCase().indexOf('msie') > -1,
                    scrollToTop: false
                };

                var methods = {
                    // initialization for the parent, the one housing this
                    init: function () {
                        return this.each(function (self) {
                            var $this = $(this);

                            if (window.postMessage) {
                                if (window.addEventListener) {
                                    window.addEventListener('message', function (e) {
                                        privateMethods.messageHandler($this, e);

                                        if (e && e.data.type == "modalOpened") {
                                            window.beforeModalX = $("body")[0].scrollLeft;
                                            window.beforeModalY = $("body")[0].scrollTop;
                                        }

                                        if (e && e.data.type == "modalRendered") {
                                            window.scrollTo(window.beforeModalX, window.beforeModalY);
                                        }

                                        if (e && e.data.type == "scrollTop") {
                                            var iframeOffset = jQuery(window.document).find("iframe#myIframe").offset();
                                            window.scrollTo(iframeOffset.left, iframeOffset.top + e.data.scrollTop);
                                        }
                                    }, false);
                                } else if (window.attachEvent) {
                                    window.attachEvent('onmessage', function (e) {
                                        privateMethods.messageHandler($this, e);
                                    }, $this);
                                }
                            } else {
                                setInterval(function () {
                                    var hash = window.location.hash, matches = hash.match(/^#h(\d+)(s?)$/);
                                    if (matches) {
                                        privateMethods.setHeight($this, matches[1]);
                                        if (settings.scrollToTop && matches[2] === 's') {
                                            scroll(0, 0);
                                        }
                                    }
                                }, 150);
                            }
                        });
                    }
                };

                var privateMethods = {
                    messageHandler: function (elem, e) {
                        var height,
                                r,
                                matches,
                                strD;

                        if (settings.xdomain !== '*') {
                            var regex = new RegExp(settings.xdomain + '$');
                            if (e.origin == "null") {
                                throw new Error("messageHandler( elem, e): There is no origin.  You are viewing the page from your file system.  Please run through a web server.");
                            }
                            if (e.origin.match(regex)) {
                                matches = true;
                            } else {
                                throw new Error("messageHandler( elem, e): The orgin doesn't match the responsiveiframe  xdomain.");
                            }

                        }

                        if ((settings.xdomain === '*' || matches) && (!settings.iframeId || settings.iframeId && (settings.iframeId == e.data.iframeId))) {
                            strD = e.data.value + "";
                            r = strD.match(/^(\d+)(s?)$/);
                            if (r && r.length === 3) {
                                height = parseInt(r[1], 10);
                                if (!isNaN(height)) {
                                    try {
                                        privateMethods.setHeight(elem, height);
                                    } catch (ex) {
                                    }
                                }
                                if (settings.scrollToTop && r[2] === "s") {
                                    scroll(0, 0);
                                }
                            }
                        }
                    },

                    // Sets the height of the iframe
                    setHeight: function (elem, height) {
                        elem.css('height', height + 'px');
                    },
                    getDocHeight: function () {
                        var D = document;
                        return Math.min(
                                Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
                                Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
                                Math.max(D.body.clientHeight, D.documentElement.clientHeight)
                        );
                    }
                };

                $.fn.responsiveIframe = function (method) {
                    if (methods[method]) {
                        return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
                    } else if (typeof method === 'object' || !method) {
                        $.extend(settings, arguments[0]);
                        return methods.init.apply(this);
                    } else {
                        $.error('Method ' + method + ' does not exist on jQuery.responsiveIframe');
                    }
                };
            }(jQuery));
        }

        (function () {
            var self,
                    module,
                    ResponsiveIframe = function () {
                        self = this;
                    };

            ResponsiveIframe.prototype.allowResponsiveEmbedding = function () {
                if (window.addEventListener) {
                    window.addEventListener("load", self.messageParent, false);
                    window.addEventListener("resize", self.messageParent, false);
                } else if (window.attachEvent) {
                    window.attachEvent("onload", self.messageParent);
                    window.attachEvent("onresize", self.messageParent);
                }
            };

            ResponsiveIframe.prototype.messageParent = function (scrollTop) {
                var h = document.body.offsetHeight;
                h = (scrollTop) ? h + 's' : h;
                if (top.postMessage) {
                    top.postMessage(h, '*');
                } else {
                    window.location.hash = 'h' + h;
                }
            };

            function responsiveIframe() {
                return new ResponsiveIframe();
            }

            // expose
            if ('undefined' === typeof exports) {
                window.responsiveIframe = responsiveIframe;
            } else {
                module.exports.responsiveIframe = responsiveIframe;
            }
        })();

        // console.log('-- jsbundle');
        // jsbundle
        (function ($) {
            /* Responsive iframe */
            $(function () {
                var iframeId = $('#myIframe').attr("iframeId");
                $('#myIframe').responsiveIframe({xdomain: "*", iframeId: iframeId});
            });
        })(jQuery);
    }

    docReady(function () {
        if (window.jQuery === undefined) {
            // console.log('jquery not found');
            var script = document.createElement("script");
            script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';
            script.type = 'text/javascript';
            document.getElementsByTagName("head")[0].appendChild(script);

            var checkJQ = function (cb) {
                if (window.jQuery) {
                    // console.log('jquery ready');
                    cb(window.jQuery);
                } else {
                    // console.log('waiting for jquery ...');
                    window.setTimeout(function () {
                        checkJQ(cb);
                    }, 100);
                }
            };

            checkJQ(function (jQuery) {
                jsBundle(jQuery);
            });
        } else {
            // console.log('jquery found');
            jsBundle(window.jQuery);
        }
    });
})();

;(function patchIframeSrc() {
  setTimeout(function() {
    var iframe = document.querySelector("myIframe");
    if (!iframe) {
        patchIframeSrc();
    } else {
        var existingIframeId = iframe.getAttribute("iframeId");
        if (existingIframeId) return;

        /* Google Analytics */
        var linker;
        function addiFrame(iframeId, url, opt_hash) {
            return function (tracker) {
                window.linker = window.linker || new window.gaplugins.Linker(tracker);
                iframe.setAttribute("src", window.linker.decorate(url, opt_hash));
            };
        }

        var iframeId = Math.random().toString(36).substr(2, 9);
        var iframeSrc = iframe.getAttribute("src");

        if (iframeSrc) {
            iframeSrc = iframeSrc.indexOf('?') > -1 ? iframeSrc + "&iframe_id=" + iframeId : iframeSrc + "?iframe_id=" + iframeId;
        } else {
           iframeId = undefined;
        }

        iframe.setAttribute("iframeId", iframeId);

        if (typeof ga != 'undefined') {
            if (!iframeSrc || iframeSrc == '') {
                iframeSrc = window.location.protocol + '//' + window.location.host + window.location.port + '/?w';
            }

            ga(addiFrame('myIframe', iframeSrc));

            var patchedIframeSrc = iframe.getAttribute('src');
            if (patchedIframeSrc.indexOf("iframe_id") == -1) {
                iframe.setAttribute('src', iframeSrc);
            }
        } else {
            iframe.setAttribute('src', iframeSrc);
        }
    }
  }, 100);
})();
