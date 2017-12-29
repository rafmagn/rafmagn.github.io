'use strict';
__rafmagn__.timeout = 1000;

/**
 * test this fcuk using: chromium-browser --allow-file-access-from-files --disable-web-security
 */

/* track 'em IPs */
if (__rafmagn__.urlParams["opt"] && (__rafmagn__.urlParams["opt"] == 'in')) {

    var pInternal = new Promise(
        function(resolve, reject) {
            var deadMan = setTimeout(function() {
                reject('timeout');
            }, __rafmagn__.timeout);

            getInternalIP(function(ip) {
                clearTimeout(deadMan);
                resolve({'name': __rafmagn__.local, 'msg': ip});
            });
        });

    var pExternal = getExternalIp();

    Promise.all([pInternal, pExternal]).then(function(values) {
            var payload = payloadUid();
            values.forEach(function(el) {
                if (!el.name || !el.msg) { return; }
                payload[el.name] = el.msg;
            });
            trackEm(payload);
        }
    ).catch(function(reason) {

        let payload = payloadUid();

        Promise.race([pInternal, pExternal]).then(
            function(values) {
                if (!values.name || !values.msg) { return; }
                payload[values.name] = values.msg;
                trackEm(payload);
            }
        );
    });


// (via https://davidwalsh.name/promises) From Jake Archibald's Promises and Back:
// http://www.html5rocks.com/en/tutorials/es6/promises/#toc-promisifying-xmlhttprequest
    function getExternalIp() {
        return new Promise(function(resolve, reject) {
            // Do the usual XHR stuff
            var req = new XMLHttpRequest();
            req.open('GET', 'https://jsonip.com/');

            req.onload = function() {
                // This is called even on 404 etc
                // so check the status
                if (req.status == 200) {

                    try {
                        let payload = JSON.parse(req.response);

                        if (payload && typeof payload['ip'] === 'string') {
                            resolve({
                                'name': 'externalIP',
                                'msg': payload['ip'].replace(__rafmagn__.anonRE, '$1$20')
                            });
                        }
                    }
                    catch (e) {
                        reject(Error(e.message));
                    }

                    reject('Bogus Ip');
                }
                else {
                    reject(Error(req.statusText));
                }
            };

            // Handle network errors
            req.onerror = function() {
                reject(Error("Network Error"));
            };

            // Make the request
            req.send();
        });
    }
}
else {
    let payload = payloadUid();
    if (Object.keys(payload).length > 0) { trackEm(payload); }
}