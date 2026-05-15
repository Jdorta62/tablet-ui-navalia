(function () {

    /* ------------------------------------------------------------------ */
    /* 1. Leaflet — configuración idéntica a map/map.js                     */
    /* ------------------------------------------------------------------ */

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl:       '../assets/libs/leaflet/images/marker-icon.png',
        iconRetinaUrl: '../assets/libs/leaflet/images/marker-icon-2x.png',
        shadowUrl:     '../assets/libs/leaflet/images/marker-shadow.png'
    });

    var tileBounds = L.latLngBounds([42.50, -9.36], [42.95, -8.58]);

    var map = L.map('map', {
        center:             [42.757, -8.999],
        zoom:               13,
        minZoom:            11,
        maxZoom:            16,
        zoomControl:        false,
        scrollWheelZoom:    false,
        doubleClickZoom:    false,
        boxZoom:            false,
        keyboard:           false,
        dragging:           true,
        maxBounds:          tileBounds,
        maxBoundsViscosity: 1.0
    });

    map.getContainer().addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    var TILE_OPTIONS = { minZoom: 11, maxZoom: 16, attribution: '' };

    (function () {
        var base = (window.TILES_LOCAL_PATH || '').trim().replace(/\\/g, '/').replace(/\/$/, '');
        var url  = base ? base + '/{z}/{x}/{y}.png'
                        : '../assets/tiles/{z}/{x}/{y}.png';
        L.tileLayer(url, TILE_OPTIONS).addTo(map);
    }());

    map.whenReady(function () {
        var minZ = Math.ceil(map.getBoundsZoom(tileBounds, true));
        minZ = Math.max(11, Math.min(minZ, 16));
        map.setMinZoom(minZ);
        if (map.getZoom() < minZ) map.setZoom(minZ);
    });

    /* Zoom buttons — stopPropagation para no disparar map click */
    var zoomControlsEl = document.getElementById('zoom-controls');
    L.DomEvent.disableClickPropagation(zoomControlsEl);

    document.getElementById('zoom-in').addEventListener('click', function () {
        map.zoomIn(1);
    });
    document.getElementById('zoom-out').addEventListener('click', function () {
        map.zoomOut(1);
    });

    /* ------------------------------------------------------------------ */
    /* 2. Marcador de centro + rectángulo                                   */
    /* ------------------------------------------------------------------ */

    var _marker    = null;
    var _rectangle = null;
    var _center    = null;   /* { lat, lon } */
    var _areaWidth  = 500;   /* metros */
    var _areaHeight = 500;

    var centerIcon = L.divIcon({
        className:  'mission-center-icon',
        html:       '<div class="mission-center-marker"></div>',
        iconSize:   [44, 44],
        iconAnchor: [22, 22]
    });

    function mToLatDeg(m) {
        return m / 111000;
    }

    function mToLonDeg(m, lat) {
        return m / (111000 * Math.cos(lat * Math.PI / 180));
    }

    function redrawRectangle() {
        if (!_center) return;

        var dLat = mToLatDeg(_areaHeight / 2);
        var dLon = mToLonDeg(_areaWidth  / 2, _center.lat);
        var bounds = [
            [_center.lat - dLat, _center.lon - dLon],
            [_center.lat + dLat, _center.lon + dLon]
        ];

        if (_rectangle) {
            _rectangle.setBounds(bounds);
        } else {
            _rectangle = L.rectangle(bounds, {
                color:       '#4ea844',
                weight:      2,
                fill:        true,
                fillColor:   '#4ea844',
                fillOpacity: 0.07,
                dashArray:   '6 4',
                interactive: false
            }).addTo(map);
        }
    }

    function updatePanelCoords() {
        if (!_center) return;
        document.getElementById('center-lat').textContent = _center.lat.toFixed(5);
        document.getElementById('center-lon').textContent = _center.lon.toFixed(5);
        document.getElementById('center-hint').style.display = 'none';
        if (!_missionPending) document.getElementById('btn-launch').disabled = false;
    }

    function placeMarker(lat, lon) {
        _center = { lat: lat, lon: lon };

        if (_marker) {
            _marker.setLatLng([lat, lon]);
        } else {
            _marker = L.marker([lat, lon], {
                icon:      centerIcon,
                draggable: true
            }).addTo(map);

            _marker.on('drag', function (e) {
                var ll = e.target.getLatLng();
                _center = { lat: ll.lat, lon: ll.lng };
                updatePanelCoords();
                redrawRectangle();
            });
        }

        updatePanelCoords();
        redrawRectangle();
    }

    /* ------------------------------------------------------------------ */
    /* Modo Move / Pin                                                      */
    /* ------------------------------------------------------------------ */

    var _pinMode      = false;
    var _btnMode      = document.getElementById('btn-mode');
    var _btnModeImg   = document.getElementById('btn-mode-icon');
    var _mapEl        = document.getElementById('map');
    var _modeLabelVal = document.getElementById('mode-label-value');

    function setPinMode(active) {
        _pinMode = active;
        if (active) {
            map.dragging.disable();
            _mapEl.classList.add('pin-mode');
            _btnMode.classList.add('pin-active');
            _btnModeImg.src    = '../assets/images/Drags.png';
            _btnModeImg.alt    = 'Mover';
            _btnMode.title     = 'Desactivar modo Pin';
            _modeLabelVal.textContent = 'PINNING';
        } else {
            map.dragging.enable();
            _mapEl.classList.remove('pin-mode');
            _btnMode.classList.remove('pin-active');
            _btnModeImg.src    = '../assets/images/Pin.png';
            _btnModeImg.alt    = 'Pin';
            _btnMode.title     = 'Activar modo Pin';
            _modeLabelVal.textContent = 'DRAGGING';
        }
    }

    _btnMode.addEventListener('click', function () {
        setPinMode(!_pinMode);
    });

    map.on('click', function (e) {
        if (!_pinMode) return;
        placeMarker(e.latlng.lat, e.latlng.lng);
    });

    /* ------------------------------------------------------------------ */
    /* 3. Sliders                                                            */
    /* ------------------------------------------------------------------ */

    var sliderW = document.getElementById('slider-width');
    var sliderH = document.getElementById('slider-height');
    var valW    = document.getElementById('val-width');
    var valH    = document.getElementById('val-height');

    sliderW.addEventListener('input', function () {
        _areaWidth = parseInt(this.value, 10);
        valW.textContent = _areaWidth + ' m';
        redrawRectangle();
    });

    sliderH.addEventListener('input', function () {
        _areaHeight = parseInt(this.value, 10);
        valH.textContent = _areaHeight + ' m';
        redrawRectangle();
    });

    /* ------------------------------------------------------------------ */
    /* 4. Parámetro drone= de la URL                                        */
    /* ------------------------------------------------------------------ */

    var _droneId   = '';
    var _droneName = '';

    (function () {
        var search = window.location.search.slice(1);
        var pairs  = search.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var kv = pairs[i].split('=');
            if (decodeURIComponent(kv[0]) === 'drone') {
                _droneId = decodeURIComponent(kv[1] || '');
                break;
            }
        }
        /* Mostrar el id hasta que mock.js aporte el nombre real */
        document.getElementById('drone-name').textContent = _droneId;
    }());

    /* ------------------------------------------------------------------ */
    /* 5. Botón volver                                                       */
    /* ------------------------------------------------------------------ */

    document.getElementById('btn-back').addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    /* ------------------------------------------------------------------ */
    /* 6. Modal                                                              */
    /* ------------------------------------------------------------------ */

    var _modal      = document.getElementById('modal');
    var _modalBody  = document.getElementById('modal-body');
    var _btnLaunch  = document.getElementById('btn-launch');
    var _btnCancel  = document.getElementById('modal-cancel');
    var _btnConfirm = document.getElementById('modal-confirm');

    var _statusBar  = document.getElementById('mission-status-bar');
    var _statusText = document.getElementById('mission-status-text');

    var _missionPending = false;
    var _timeoutId      = null;
    var MISSION_TIMEOUT = 60000;

    function showMissionStatus(state, message) {
        _statusBar.className = 'mission-status-bar ' + state;
        _statusText.innerHTML = '<span class="mission-status-text-inner">' + message + '</span>';
    }

    function clearPendingTimer() {
        _missionPending = false;
        if (_timeoutId !== null) { clearTimeout(_timeoutId); _timeoutId = null; }
    }

    function resetMissionState() {
        clearPendingTimer();
        if (_center) _btnLaunch.disabled = false;
    }

    _btnLaunch.addEventListener('click', function () {
        if (!_center) return;
        var label = _droneName || _droneId;
        _modalBody.innerHTML =
            '<strong>Drone:</strong> '  + label + '<br>' +
            '<strong>Centro:</strong> ' + _center.lat.toFixed(5) +
            ', '                        + _center.lon.toFixed(5) + '<br>' +
            '<strong>Área:</strong> '   + _areaWidth + ' m × ' + _areaHeight + ' m';
        _modal.classList.add('visible');
    });

    _btnCancel.addEventListener('click', function () {
        _modal.classList.remove('visible');
    });

    _btnConfirm.addEventListener('click', function () {
        _modal.classList.remove('visible');
        window.MissionAPI.launchMission(_droneId, _center, _areaWidth, _areaHeight);
        _missionPending = true;
        _btnLaunch.disabled = true;
        showMissionStatus('pending', 'Misión enviada — esperando confirmación del drone...');
        _timeoutId = setTimeout(function () {
            _timeoutId = null;
            _missionPending = false;
            showMissionStatus('timeout', 'Sin respuesta del drone — comprueba el estado e inténtalo de nuevo');
            if (_center) _btnLaunch.disabled = false;
        }, MISSION_TIMEOUT);
    });

    /* ------------------------------------------------------------------ */
    /* 7. API pública                                                        */
    /* ------------------------------------------------------------------ */

    window.MissionAPI = {

        launchMission: function (droneId, center, width, height) {
            console.log('[MissionAPI] launchMission', JSON.stringify({
                droneId: droneId,
                center:  center,
                width:   width,
                height:  height
            }));
        },

        onMissionConfirmed: function () {
            clearPendingTimer();
            showMissionStatus('confirmed', 'Misión activa — drone en vuelo');
            // Botón permanece desactivado hasta que onTelemetry indique operative=true.
        },

        onTelemetry: function (droneId, operative) {
            if (droneId !== _droneId) return;
            if (operative && _center && !_missionPending) {
                _btnLaunch.disabled = false;
                if (_statusBar.className.indexOf('confirmed') !== -1)
                    _statusBar.className = 'mission-status-bar hidden';
            } else if (!operative && !_missionPending) {
                _btnLaunch.disabled = true;
            }
        },

        setCenter: function (lat, lon) {
            placeMarker(lat, lon);
        },

        setDimensions: function (width, height) {
            _areaWidth  = width;
            _areaHeight = height;
            sliderW.value        = width;
            sliderH.value        = height;
            valW.textContent     = width  + ' m';
            valH.textContent     = height + ' m';
            redrawRectangle();
        },

        setDroneName: function (name) {
            _droneName = name;
            document.getElementById('drone-name').textContent = name;
        }
    };

}());
