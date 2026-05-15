/**
 * geoconv.js — Conversión bidireccional Unity ↔ WGS84
 *
 * Replica la lógica de GeolocalizationSystem.cs.
 * Convenciones del mundo:
 *   Norte = +Z de Unity,  Este = +X,  sin rotación entre sistemas.
 *
 * Uso desde Unity (C#):
 *   browserClient.ExecuteJs("GeoConv.configure(" +
 *       "{x:13290,z:6033,lat:42.806084,lon:-8.850377}," +
 *       "{x:-1618,z:-10659,lat:42.668775,lon:-9.01752})");
 *
 * Uso en JS:
 *   var geo = GeoConv.unityToLatLon(x, z);   // → { lat, lon }
 *   var pos = GeoConv.latLonToUnity(lat, lon); // → { x, z }
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /* Constante geodésica                                                  */
    /* ------------------------------------------------------------------ */

    var METROS_POR_GRADO_LAT = 111320;

    /* ------------------------------------------------------------------ */
    /* Valores por defecto — Reference1 y Reference2 del Inspector         */
    /* ------------------------------------------------------------------ */

    var _refA = { x: 13290,  z:  6033,  lat: 42.806084, lon: -8.850377 };
    var _refB = { x: -1618,  z: -10659, lat: 42.668775, lon: -9.01752  };

    /* ------------------------------------------------------------------ */
    /* Estado interno calculado por calibrar()                              */
    /* ------------------------------------------------------------------ */

    var _latMedia;
    var _metrosPorGradoLon;
    var _unidadesPorMetroX;   /* u/m en el eje X (longitud) */
    var _unidadesPorMetroZ;   /* u/m en el eje Z (latitud)  */
    var _calibrado = false;

    /* ------------------------------------------------------------------ */
    /* Calibración                                                          */
    /* ------------------------------------------------------------------ */

    function calibrar() {
        _latMedia          = (_refA.lat + _refB.lat) / 2;
        _metrosPorGradoLon = METROS_POR_GRADO_LAT * Math.cos(_latMedia * Math.PI / 180);

        var deltaLatMetros = (_refB.lat - _refA.lat) * METROS_POR_GRADO_LAT;
        var deltaLonMetros = (_refB.lon - _refA.lon) * _metrosPorGradoLon;
        var deltaUnityX    = _refB.x   - _refA.x;
        var deltaUnityZ    = _refB.z   - _refA.z;

        if (Math.abs(deltaLatMetros) < 0.0001 || Math.abs(deltaLonMetros) < 0.0001) {
            console.error('[GeoConv] Los puntos de referencia tienen la misma lat/lon. Calibración fallida.');
            _calibrado = false;
            return;
        }
        if (Math.abs(deltaUnityX) < 0.0001 || Math.abs(deltaUnityZ) < 0.0001) {
            console.error('[GeoConv] Los puntos de referencia tienen la misma posición Unity. Calibración fallida.');
            _calibrado = false;
            return;
        }

        _unidadesPorMetroX = deltaUnityX / deltaLonMetros;
        _unidadesPorMetroZ = deltaUnityZ / deltaLatMetros;
        _calibrado         = true;

        console.log('[GeoConv] Calibrado. escX=' + _unidadesPorMetroX.toFixed(6) +
                    ' u/m  escZ=' + _unidadesPorMetroZ.toFixed(6) + ' u/m  latMedia=' + _latMedia.toFixed(5) + '°');
    }

    /* Calibración inmediata con los valores por defecto */
    calibrar();

    /* ------------------------------------------------------------------ */
    /* API pública                                                          */
    /* ------------------------------------------------------------------ */

    window.GeoConv = {

        /**
         * Reconfigura el sistema con nuevos puntos de referencia.
         * Llamar desde Unity antes de enviar cualquier coordenada.
         *
         * @param {{ x:number, z:number, lat:number, lon:number }} refA
         * @param {{ x:number, z:number, lat:number, lon:number }} refB
         */
        configure: function (refA, refB) {
            _refA = refA;
            _refB = refB;
            calibrar();
        },

        /**
         * Convierte posición Unity (X, Z) a coordenadas WGS84.
         *
         * @param {number} x   Eje X de Unity (Este)
         * @param {number} z   Eje Z de Unity (Norte)
         * @returns {{ lat: number, lon: number }}
         */
        unityToLatLon: function (x, z) {
            if (!_calibrado) {
                console.error('[GeoConv] No calibrado — devolviendo (0, 0).');
                return { lat: 0, lon: 0 };
            }
            var deltaLonMetros = (x - _refA.x) / _unidadesPorMetroX;
            var deltaLatMetros = (z - _refA.z) / _unidadesPorMetroZ;
            return {
                lat: _refA.lat + deltaLatMetros / METROS_POR_GRADO_LAT,
                lon: _refA.lon + deltaLonMetros / _metrosPorGradoLon
            };
        },

        /**
         * Convierte coordenadas WGS84 a posición Unity (X, Z).
         *
         * @param {number} lat  Latitud decimal
         * @param {number} lon  Longitud decimal
         * @returns {{ x: number, z: number }}
         */
        latLonToUnity: function (lat, lon) {
            if (!_calibrado) {
                console.error('[GeoConv] No calibrado — devolviendo (0, 0).');
                return { x: 0, z: 0 };
            }
            var deltaLatMetros = (lat  - _refA.lat) * METROS_POR_GRADO_LAT;
            var deltaLonMetros = (lon  - _refA.lon) * _metrosPorGradoLon;
            return {
                x: _refA.x + deltaLonMetros * _unidadesPorMetroX,
                z: _refA.z + deltaLatMetros * _unidadesPorMetroZ
            };
        },

        /** Devuelve true si la calibración es válida. */
        isReady: function () { return _calibrado; }
    };

}());
