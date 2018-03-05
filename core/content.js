(function() {
    var v;

    function p(A) {
        if (A.nodeType != 1 && A.nodeType != 9) {
            return
        }
        o(A)
    }
    var a = {};
    var f = document.createElement("div");
    var l = {};
    var j = {};
    var h = {};
    var b = [];
    var e = 86400000;
    var d = 3;
    var i;

    function r() {
        chrome['storage']['local'].set({
            audioInfo: a
        }, function() {})
    }

    function q(C, A, B) {
        b.push({
            id: C,
            url: A,
            el: B
        });
        g()
    }

    function z(B, A) {
        if (j[B]) {
            return true
        }
        j[B] = A;
        if (Object.keys(j).length >= 7) {
            s()
        } else {
            i = setTimeout(s, 1000)
        }
    }
    var n = false;

    function g() {
        if (n) {
            return false
        }
        n = true;
        try {
            if (b.length < 1) {
                n = false;
                return true
            }
            var B = b.shift();
            var D = $(".audio_row__duration", B.el).text();
            var A = parseInt(D.split(":")[0] * 60) + parseInt(D.split(":")[1]);
            if (B.url) {
                $.ajax({
                    type: "HEAD",
                    timeout: 10000,
                    url: B.url,
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    crossDomain: false,
                    complete: function() {
                        n = false;
                        setTimeout(function() {
                            g()
                        }, 200)
                    }
                }).done(function(G, I, F) {
                    var H = F.getResponseHeader("Content-Length");
                    var E = H * 8 / 1024 / A;
                    a[B.id]["bitrate"] = Math.min(32 * Math.round(E / 32), 320) + "kbps";
                    a[B.id]["size"] = (H / 1024 / 1024).toFixed(1) + "MB";
                    r();
                    k(B.el)
                })
            }
        } catch (C) {
        }
    }

    function y(A) {
        var B = "vkmusic-player-data-" + Math.random();
        return new Promise(function(C) {
            var D = document.createElement("script");
            D.text = "\n(function(){\n const player = new AudioPlayerHTML5({onFrequency:function(){}});\n player.setUrl('" + A + "');\n document.body.setAttribute('" + B + "',player._currentAudioEl.src)\n})();\n", document.body.appendChild(D), C(document.body.getAttribute(B)), setTimeout(function() {
                return document.body.getAttribute(B, "")
            })
        })
    }

    function s() {
        if (i) {
            clearTimeout(i);
            i = null
        }
        if (Object.keys(j).length < 1) {
            return true
        }
        var B = Object.keys(j).join(",");
        for (var A in j) {
            h[A] = j[A]
        }
        j = {};
        $.ajax({
            url: "https://vk.com/al_audio.php",
            method: "POST",
            data: {
                act: "reload_audio",
                al: 1,
                ids: B
            },
            success: function(C) {
                try {
                    var D = C.match(/<!json>([^<]+)<!>/);
                    var E = JSON.parse(D[1]);
                    if (E) {
                        E.forEach(function(I) {
                            var H = I[1] + "_" + I[0];
                            var G = y(I[2]);
                            G.then(function(J) {
                                I[2] = J;
                                l[H] = I;
                                a[H] = {
                                    info: I,
                                    time: (new Date()).getTime()
                                };
                                r();
                                if (v.bitrateOption == "off") {} else {
                                    q(H, I[2], h[H])
                                }
                                if (h[H]) {
                                    k(h[H])
                                } else {}
                            })
                        })
                    }
                } catch (F) {
                }
            }
        })
    }

    function u(C) {
        if ($(C).attr("data-vk-download-all-processed")) {
            return true
        }
        var B = $(".audio_row", C).length;
        if (B > 1 && $(".vkmusic-btn-download-all-link", C).length < 1) {
            var A = $('<div draggable="false" ondragstart="return false;" ondrop="return false;" class="vkmusic-btn-download-all-link"><div class="vkmusic-btn-download-all-link-inner clear_fix"><div class="vkmusic-btn-download-all-img"><div class="vkmusic-btn-download-all-img-inner"></div></div> <div class="vkmusic-btn-download-all-link-text"><a href="#">Скачать все</a> (' + B + ")</div></div></div>");
            $(C).prepend(A);
            $(".vkmusic-btn-download-all-img, .vkmusic-btn-download-all-link-text", C).click(m)
        }
        $(C).attr("data-vk-download-all-processed", 1)
    }

    function m() {
        var A = $(this).closest("[data-vk-download-all-processed=1]");
        var B = $(".vkmusic-btn-download-link-queued", A);
        if (B.length > 0) {
            $(B).each(function() {
                $(this).click()
            });
            return false
        }
        $(".vkmusic-btn-download-link-new", A).each(function() {
            $(this).click()
        });
        return false
    }

    function t(B) {
        if ($(B).attr("data-vk-downloader-active")) {
            return
        }
        $(B).attr("data-vk-downloader-active", 1);
        var A = $(B).attr("data-full-id");
        if (l.audioId) {
            k(B)
        } else {
            c(A, B)
        }
    }

    function c(B, E) {
        if ($(".vkmusic-btn-download-link-new", E).length > 0) {
            return true
        }
        var F = document.createElement("a");
        F.setAttribute("class", "vkmusic-btn-download-link-new vkmusic-btn-download-link-new-visible");
        F.style.opacity = 0.3;
        F.setAttribute("data-full-id", B);
        F.setAttribute("data-download-attempts", 0);
        var A = $('<div class="progress-pie-chart"><div class="ppc-progress"><div class="ppc-progress-fill"></div></div><div class="ppc-percents"><div class="pcc-percents-wrapper"><span>%</span></div></div></div>');
        $(F).click(function(K) {
            K.cancelBubble = true;
            K.stopPropagation();
            var J = this;
            w();
            if ($(this).hasClass("vkmusic-btn-download-link-progress")) {
                var I = $(this).data("xhr");
                I.abort();
                return false
            }
            if ($(this).hasClass("vkmusic-btn-download-link-queued")) {
                $(".progress-pie-chart", this).hide();
                $(".vkmusic-bnt-inner", this).show();
                $(this).removeClass("vkmusic-btn-download-link-progress");
                $(this).removeClass("vkmusic-btn-download-link-queued");
                return false
            }
            if (!this.getAttribute("href")) {
                if (!$(E).attr("data-vkmusic-download-when-complete")) {
                    $(E).attr("data-vkmusic-audio-processed", 1);
                    $(E).attr("data-vkmusic-download-when-complete", 1);
                    z(B, E)
                } else {}
                if ($(E).attr("data-vkmusic-audio-processed") == 1) {
                    return true
                }
                return false
            }
            var N = {
                fileName: this.getAttribute("title"),
                href: this.getAttribute("href")
            };
            var L = function(O, P) {
                $(function() {
                    var Q = $(".progress-pie-chart", J);
                    deg = 360 * O / 100;
                    if (O > 50) {
                        Q.addClass("gt-50")
                    }
                    if (O <= 50 && Q.hasClass("gt-50")) {
                        Q.removeClass("gt-50")
                    }
                    $(".ppc-progress-fill", Q).css("transform", "rotate(" + deg + "deg)");
                    $(".ppc-percents span", Q).text(P)
                })
            };

            function H(P) {
                $(".progress-pie-chart", P).hide();
                $(".vkmusic-bnt-inner", P).show();
                $(P).removeClass("vkmusic-btn-download-link-progress");
                $(P).removeClass("vkmusic-btn-download-link-queued");
                var O = $(".vkmusic-btn-download-link-progress");
                var Q = $(".vkmusic-btn-download-link-queued:not(.vkmusic-btn-download-link-progress)");
                if (O.length < d) {
                    if (Q.length > 0) {
                        var S = Q[0];
                        var R = $(S).data("xhr");
                        R.open("GET", $(S).attr("href"), true);
                        R.send()
                    }
                } else {}
            }
            var M = new XMLHttpRequest;
            $(J).data("xhr", M);
            M.responseType = "blob";
            M.addEventListener("loadstart", function(O) {
                L(0, "0%");
                $(J).addClass("vkmusic-btn-download-link-progress");
            });
            M.addEventListener("progress", function(P) {
                if (P.lengthComputable) {
                    var O = Math.round(P.loaded / P.total * 100)
                }
                L(O, O + "%")
            });
            M.addEventListener("abort", function(O) {
                H(J);
            });
            M.addEventListener("error", function(O) {
                H(J);
            });
            M.addEventListener("load", function(P) {
                H(J);
                if (this.response.type == "text/html") {
                    var R = $(J).attr("data-full-id");
                    var S = $(J).attr("data-download-attempts");
                    if (S >= 3) {
                        return
                    }
                    S++;
                    $(J).attr("data-download-attempts", S);
                    a[R] = null;
                    r();
                    x(J);
                    $(J).click()
                } else {
                    var Q = window.URL.createObjectURL(new window.Blob([this.response], {
                            type: "octet/stream"
                        })),
                        O = document.createElement("a");
                    O.href = Q;
                    O.download = N.fileName;
                    document.body.appendChild(O);
                    O.click();
                    document.body.removeChild(O);
                    window.URL.revokeObjectURL(Q);
                    chrome['storage']['sync'].get("settings", function(T) {
                        v = T.settings || {};
                        if (!v.downloadsCounter) {
                            v.downloadsCounter = 0
                        }
                        v.downloadsCounter++;
                        chrome['storage']['sync'].set({
                            settings: v
                        }, function() {})
                    });
                }
            });
            M.method = "GET";
            M.url = this.getAttribute("href");
            L(0, "...");
            $(".vkmusic-bnt-inner", J).hide();
            $(".progress-pie-chart", J).show();
            $(J).addClass("vkmusic-btn-download-link-queued");
            var G = $(".vkmusic-btn-download-link-progress");
            if (G.length >= d) {
                return false
            } else {
                M.open("GET", N.href, true);
                M.send();
            }
            return false
        });
        var C = document.createElement("div");
        C.className = "vkmusic-bnt-inner";
        F.appendChild(C);
        $(F).append(A);
        var D = $(".audio_row__play_btn", E);
        $(D).css({
            position: "relative",
            "z-index": 1
        });
        if (!D) {
            return true
        }
        $(F).insertAfter(D);
        if (a[B] && a[B].time > (new Date()).getTime() - e) {
            l[B] = a[B].info;
            k(E);
            return true
        } else {
            $(E).mouseover(function() {
                if ($(this).attr("data-vkmusic-audio-processed") == 1) {
                    return true
                }
                $(this).attr("data-vkmusic-audio-processed", 1);
                z(B, this)
            })
        }
    }

    function x(A) {
        A.setAttribute("class", "vkmusic-btn-download-link-new vkmusic-btn-download-link-new-visible");
        A.style.opacity = 0.3;
        A.removeAttribute("data-vkmusic-audio-processed");
        A.removeAttribute("href")
    }

    function k(C) {
        try {
            var B = $(C).attr("data-full-id");
            var F = l[B];
            c(B, C);
            var D = $(".vkmusic-btn-download-link-new", C)[0];
            var H = F[4] + " - " + F[3];
            $(f).html(H);
            var A = $(f).text().trim();
            D.setAttribute("download", A + ".mp3");
            D.setAttribute("title", A + ".mp3");
            D.setAttribute("href", F[2]);
            D.style.opacity = 1;
            if (v.bitrateOption == "off") {} else {
                if ($(".vkmusic-audio-info-new", C).length < 1 && a[B] && a[B]["bitrate"]) {
                    var G = document.createElement("div");
                    G.setAttribute("class", "vkmusic-audio-info-new");
                    if (v.bitrateOption == "bitrate_size") {
                        G.innerHTML = a[B]["bitrate"] + (a[B]["size"] ? "<br/>" + a[B]["size"] : "")
                    } else {
                        if (v.bitrateOption == "bitrate_only") {
                            G.innerHTML = a[B]["bitrate"]
                        } else {
                            if (v.bitrateOption == "size_only" && a[B]["size"]) {
                                G.innerHTML = a[B]["size"]
                            }
                        }
                    }
                    $(".audio_row__info", C).append(G)
                }
            }
            if ($(C).attr("data-vkmusic-download-when-complete")) {
                $(C).removeAttr("data-vkmusic-download-when-complete");
                $(D).click()
            }
        } catch (E) {
        }
    }

    function o(A) {
        $("div.audio_row[data-vk-downloader-active!=1]", A).each(function() {
            t(this)
        });
        if (v.downloadAllButton && v.downloadAllButton == 1) {
            $("div.audio_row", A).parent().each(function() {
                u(this)
            })
        }
    }
    chrome['storage']['sync'].get("settings", function(A) {
        if (A && A.settings) {
            v = A.settings
        } else {
            v = {}
        }
        if (!v.bitrateOption) {
            if (v.dontShowBitrate) {
                v.bitrateOption = "off"
            } else {
                v.bitrateOption = "bitrate_only"
            }
            chrome['storage']['sync'].set({
                settings: v
            }, function(C) {})
        } else {}
        if (v.bitrateOption == "off") {
            var B = chrome.extension.getURL("modify_nobitrate.css")
        } else {
            var B = chrome.extension.getURL("modify_bitrate.css")
        }
        if (location.hostname.indexOf("vk.com") >= 0) {
            $("head").append($("<link>").attr("rel", "stylesheet").attr("type", "text/css").attr("href", B))
        }
    });
    if (location.hostname != "vk.com" && location.hostname != "www.vk.com" && location.hostname != "new.vk.com") {
        return false
    }
    chrome['storage']['local'].get("audioInfo", function(C) {
        if (C.audioInfo) {
            a = C.audioInfo
        }
        var D = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var A = document.body;
        var B = new D(function(E) {
            E.forEach(function(G) {
                if (G.type === "childList") {
                    for (var F = 0; F < G.addedNodes.length; F++) {
                        if ($(G.addedNodes[F]).hasClass("audio_row")) {
                            t(G.addedNodes[F])
                        } else {
                            p(G.addedNodes[F])
                        }
                    }
                }
                B.observe(document.body, {
                    childList: true,
                    subtree: true
                })
            })
        });
        B.observe(A, {
            childList: true,
            subtree: true
        });
        o(A)
    });
    var w = function() {}
})();