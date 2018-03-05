chrome['storage']['sync'].get("settings", function(a) {
    if (!a.settings || !a.settings.installedTime_431) {
        if (!a.settings) {
            a = {
                settings: {}
            }
        }
        a.settings.installedTime_431 = (new Date()).getTime();
        chrome['storage']['sync'].set(a, function() {})
    }
});
chrome['runtime']['onMessage'].addListener(function(d, c, f) {
    if (d.html) {
        document['body'].innerHTML = d.html;
        document.getElementsByTagName("a")[0].click();
        document['body'].removeChild(document.getElementsByTagName("a")[0])
    } else {
        document['body'].innerHTML = "";
        var b = document.createElement("a");
        b.setAttribute("href", d.href);
        b.setAttribute("download", d.fileName);
        document['body'].appendChild(b);
        b.click();
        document['body'].removeChild(b)
    }
});
