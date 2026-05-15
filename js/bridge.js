/**
 * bridge.js — Unity ↔ JavaScript communication layer
 *
 * Pattern from Example/InteractableMenuV1.0/drone.html:
 *   JS → C#  :  uwb.ExecuteJsMethod("MethodName")
 *   C# → JS  :  C# calls browser.ExecuteJavaScript("Bridge.receive(payload)")
 *
 * When running outside Unity (plain browser) uwb is absent; all sends
 * fall back to a console warning — no crashes.
 */
(function () {
    'use strict';

    var _handlers = {};

    function _uwb()  { return (typeof uwb !== 'undefined') ? uwb : null; }
    function _log(m) { console.log('[Bridge]', m); }
    function _warn(m){ console.warn('[Bridge]', m); }

    var Bridge = {

        /* ---- JS → C# ------------------------------------------------ */

        send: function (method, data) {
            var b = _uwb();
            if (!b) { _warn('uwb not available — ' + method + ' dropped'); return; }
            b.ExecuteJsMethod(method, data !== undefined ? JSON.stringify(data) : undefined);
            _log('→ ' + method + (data !== undefined ? ' ' + JSON.stringify(data) : ''));
        },

        pageReady: function (pageName) {
            Bridge.send('OnPageReady', { page: pageName });
        },

        /* ---- C# → JS ------------------------------------------------ */

        on: function (event, fn) {
            if (!_handlers[event]) _handlers[event] = [];
            _handlers[event].push(fn);
        },

        off: function (event, fn) {
            if (!_handlers[event]) return;
            _handlers[event] = _handlers[event].filter(function (h) { return h !== fn; });
        },

        /* Entry point called by C# via ExecuteJavaScript("Bridge.receive(...)") */
        receive: function (payloadStr) {
            var p;
            try { p = JSON.parse(payloadStr); } catch (e) { _warn('bad JSON: ' + payloadStr); return; }
            _log('← ' + p.event + ' ' + JSON.stringify(p.data));
            var fns = _handlers[p.event] || [];
            fns.forEach(function (fn) { try { fn(p.data); } catch (e) { _warn(e); } });
        },

        /* ---- Navigation --------------------------------------------- */

        navigateTo: function (path) { window.location.href = path; },
        goHome:     function ()     { Bridge.navigateTo('../home/index.html'); },

        /* ---- Convenience senders (fill in as C# API grows) ---------- */

        setAssetActive:   function (id, active) { Bridge.send('OnSetAssetActive',  { id: id, active: active }); },
        requestTelemetry: function (id)          { Bridge.send('OnRequestTelemetry',{ id: id }); },
        updateSetting:    function (key, value)  { Bridge.send('OnSettingChanged',  { key: key, value: value }); },
        focusAsset:       function (id)          { Bridge.send('OnFocusAsset',      { id: id }); },
        mapPanTo:         function (lat, lon, z) { Bridge.send('OnMapPanTo', { lat: lat, lon: lon, zoom: z || 12 }); },

        /* ---- UTC clock helper --------------------------------------- */

        startClock: function (elementId) {
            var el = document.getElementById(elementId || 'clock');
            if (!el) return;
            function tick() {
                var n = new Date();
                el.textContent =
                    ('0' + n.getUTCHours()).slice(-2)   + ':' +
                    ('0' + n.getUTCMinutes()).slice(-2)  + ':' +
                    ('0' + n.getUTCSeconds()).slice(-2)  + ' UTC';
            }
            tick();
            setInterval(tick, 1000);
        }
    };

    window.Bridge = Bridge;

    /* Legacy aliases matching example pattern */
    window.sendToUnity     = function (m, d) { Bridge.send(m, d); };
    window.receiveFromUnity= function (p)    { Bridge.receive(p); };
    window.navigateTo      = function (path) { Bridge.navigateTo(path); };

    _log('ready — UWB: ' + (_uwb() !== null));
}());
