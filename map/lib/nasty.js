/**
 * doing some nasty stuff
 */

/** enabling bootstrap tooltips */
if (false && (typeof $ === 'function')) {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
}

/** @type {Array} ensure datalayer.push() */
window.dataLayer = window.dataLayer || [];


var __rafmagn__ = {
    'urlParams': null,
    'fragment': (window.location.hash)? window.location.hash.substring(1) : null,
    'anonRE': /^([0-9]{1,3}(?:\.[0-9]{1,3}){2}|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){1})([:.])?.*/,
    'local' : 'localIP',
    'anonymizeLocal' : true,
    'dryRun' : true
};

if (___probeES6()) {
    var s = document.createElement('script');
    s.src = "map/lib/promising.js";
    document.head.appendChild(s);
}
else {
    // no promisses… try RTC and check later…
    getInternalIP(function(ip) {
        var payload = payloadUid();
        if (__rafmagn__ && __rafmagn__.urlParams && __rafmagn__.urlParams["opt"] && (__rafmagn__.urlParams["opt"] == 'in')) {
            payload[__rafmagn__.local] = ip;
        }
        if (Object.keys(payload).length > 0) { trackEm(payload); }
    });
}


/**
 * #####################################################################################################################
 * #####################################################################################################################
 * #####################################################################################################################
 */

function ___probeES6() {
    "use strict";

    if (typeof Promise == "undefined") return false;
    try {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    } catch (e) { return false; }

    return true;
}

/** get query parameters: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#2880929 */
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    __rafmagn__.urlParams = {};
    while (match = search.exec(query))
        __rafmagn__.urlParams[decode(match[1])] = decode(match[2]);
})();

/**
 * get internal IP
 * https://stackoverflow.com/questions/20194722/can-you-get-a-users-local-lan-ip-address-via-javascript
 * originally: https://github.com/diafygi/webrtc-ips/blob/master/LICENSE
 */
function getInternalIP(callback) {
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers: []}), noop = function() {}, localIPs = {},
        ipRegex = /(?:[0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})/g;
    pc.createDataChannel('');    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description

    function iterateIP(ip) {
        if (!localIPs[ip]) {
            localIPs[ip] = ip;
            if (__rafmagn__.anonymizeLocal && !ip.startsWith('10.')) { // force no anonymization on ex. Class A
                localIPs[ip] = ip.replace(__rafmagn__.anonRE, '$1$20');
            }
            if (typeof callback === 'function') {
                callback(localIPs[ip]);
            }
        }
    }

    pc.onicecandidate = function(ice) {  //listen for candidate events
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
        pc.onicecandidate = noop;
    };
}

function trackEm(payload, event) {
    event = event || 'userDataReady';
    payload['event'] = event;

    if (__rafmagn__.dryRun) {
        console.log('TRACK: ' + JSON.stringify(payload));
    }
    else {
        window.dataLayer.push(payload);
    }
}

/**
 * @param payload
 * @returns {{}}
 */
function payloadUid(payload) {
    payload = payload || {};
    if (__rafmagn__.urlParams === null) {
        return payload;
    }
    if (__rafmagn__.urlParams["uid"] && (typeof __rafmagn__.urlParams["uid"] == 'string') && (__rafmagn__.urlParams["uid"] !== '')) {
        payload['userId'] = __rafmagn__.urlParams["uid"];
    }
    if (__rafmagn__.fragment !== null) {
        payload['fragment'] = __rafmagn__.fragment;
    }
    return payload;
}