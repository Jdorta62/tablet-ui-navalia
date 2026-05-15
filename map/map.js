(function () {

    /* ------------------------------------------------------------------ */
    /* 1. Leaflet default icon paths                                        */
    /* ------------------------------------------------------------------ */

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconUrl:       '../assets/libs/leaflet/images/marker-icon.png',
        iconRetinaUrl: '../assets/libs/leaflet/images/marker-icon-2x.png',
        shadowUrl:     '../assets/libs/leaflet/images/marker-shadow.png'
    });

    /* ------------------------------------------------------------------ */
    /* 2. Map initialisation                                                */
    /* ------------------------------------------------------------------ */

    /*
     * Geographic bounds of the available offline tile grid (zoom 11):
     * tiles x 971-974, y 753-755.  Calculated from OSM tile coordinates.
     * Used to (a) prevent panning into gray void and (b) compute minZoom.
     */
    var tileBounds = L.latLngBounds([42.50, -9.36], [42.95, -8.58]);

    var map = L.map('map', {
        center:             [42.757, -8.999],
        zoom:               13,
        minZoom:            11,   /* overridden dynamically in whenReady */
        maxZoom:            16,
        zoomControl:        false,
        scrollWheelZoom:    false,
        doubleClickZoom:    false,
        boxZoom:            false,
        keyboard:           false,
        dragging:           true,
        maxBounds:          tileBounds,
        maxBoundsViscosity: 1.0   /* solid wall — no elastic drag into gray */
    });

    /* Suppress context menu (no right-click in XR) */
    map.getContainer().addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    /* ------------------------------------------------------------------ */
    /* 3. Tile layer (offline)                                              */
    /* ------------------------------------------------------------------ */

    var TILE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, and the GIS User Community';
    var TILE_OPTIONS     = { minZoom: 11, maxZoom: 16, attribution: TILE_ATTRIBUTION };

    (function () {
        var base = (window.TILES_LOCAL_PATH || '').trim().replace(/\\/g, '/').replace(/\/$/, '');
        var url  = base ? 'file:///' + base + '/{z}/{x}/{y}.png'
                        : '../assets/tiles/{z}/{x}/{y}.png';
        L.tileLayer(url, TILE_OPTIONS).addTo(map);
    }());

    /* ------------------------------------------------------------------ */
    /* 4. Dynamic minimum zoom                                              */
    /*                                                                      */
    /* getBoundsZoom(bounds, true) returns the zoom at which the viewport   */
    /* is fully covered by tileBounds — no gray borders possible below it.  */
    /* ------------------------------------------------------------------ */

    map.whenReady(function () {
        var minZ = map.getBoundsZoom(tileBounds, true);
        minZ = Math.ceil(minZ);
        minZ = Math.max(11, Math.min(minZ, 16));
        map.setMinZoom(minZ);
        if (map.getZoom() < minZ) {
            map.setZoom(minZ);
        }
    });

    /* ------------------------------------------------------------------ */
    /* 5. Custom zoom buttons                                               */
    /* ------------------------------------------------------------------ */

    document.getElementById('zoom-in').addEventListener('click', function () {
        map.zoomIn(1);
    });

    document.getElementById('zoom-out').addEventListener('click', function () {
        map.zoomOut(1);
    });

    /* ------------------------------------------------------------------ */
    /* 6. Map marker icon helper                                            */
    /*                                                                      */
    /* Uses DivIcon with CSS background-image so a missing icon file        */
    /* degrades to a plain green circle instead of a broken image.          */
    /* ------------------------------------------------------------------ */

    function createMarkerIcon(type) {
        var iconUrl = '../assets/icons/' + type + '.png';
        return L.divIcon({
            className: 'map-marker-icon',
            html: '<div class="map-marker"><img class="map-marker-img" src="' + iconUrl + '" /></div>',
            iconSize:   [40, 40],
            iconAnchor: [20, 20]
        });
    }

    /* ------------------------------------------------------------------ */
    /* 7. Internal marker registry                                          */
    /* ------------------------------------------------------------------ */

    var _markers = {};   /* { id: L.Marker } */

    /* ------------------------------------------------------------------ */
    /* 8. Public API — called by Unity via ExecuteJavaScript                */
    /* ------------------------------------------------------------------ */

    window.MapAPI = {

        /**
         * Añade o actualiza un elemento en el mapa Y en el panel lateral.
         *
         * @param {string} type    "drone", "helicopter", "vessel", … (abierto a nuevos tipos)
         * @param {string} id      Identificador único: "drone_1", "vessel_01", …
         * @param {number} lat     Latitud decimal WGS84
         * @param {number} lon     Longitud decimal WGS84
         * @param {object} options { label: string, heading: number, … }
         */
        setMarker: function (type, id, lat, lon, options) {
            options = options || {};
            var icon = createMarkerIcon(type);

            if (_markers[id]) {
                /* Actualiza marcador existente */
                _markers[id].setLatLng([lat, lon]);
                _markers[id].setIcon(icon);
            } else {
                /* Crea marcador nuevo */
                var marker = L.marker([lat, lon], { icon: icon });
                marker.addTo(map);
                _markers[id] = marker;
            }

            /* Refleja el cambio en el panel */
            if (window.Panel) {
                Panel.setCard(type, id, lat, lon, options);
            }
        },

        /**
         * Elimina marcador del mapa y tarjeta del panel.
         * @param {string} id
         */
        removeMarker: function (id) {
            if (_markers[id]) {
                map.removeLayer(_markers[id]);
                delete _markers[id];
            }
            if (window.Panel) {
                Panel.removeCard(id);
            }
        },

        /**
         * Elimina todos los marcadores y limpia el panel.
         */
        clearMarkers: function () {
            for (var id in _markers) {
                if (_markers.hasOwnProperty(id)) {
                    map.removeLayer(_markers[id]);
                }
            }
            _markers = {};
            if (window.Panel) {
                Panel.clearCards();
            }
        },

        /**
         * Centra el mapa (sin cambiar zoom).
         */
        centerOn: function (lat, lon) {
            map.panTo([lat, lon]);
        },

        /**
         * Centra el mapa y fija zoom.
         */
        centerOnZoom: function (lat, lon, zoom) {
            map.setView([lat, lon], zoom);
        },

        /**
         * Vuela con animación suave hasta el punto dado.
         * Llamado desde panel.js cuando el usuario hace long press en una tarjeta.
         *
         * @param {number} lat
         * @param {number} lon
         * @param {number} [zoom]  Si se omite, mantiene el zoom actual.
         */
        flyTo: function (lat, lon, zoom) {
            map.flyTo(
                [lat, lon],
                zoom !== undefined ? zoom : map.getZoom(),
                { duration: 1.0, easeLinearity: 0.25 }
            );
        }
    };

}());
