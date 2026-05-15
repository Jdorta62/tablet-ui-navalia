(function () {

    /* ------------------------------------------------------------------ */
    /* Constantes                                                           */
    /* ------------------------------------------------------------------ */

    var LONG_PRESS_MS = 500;

    /*
     * SVG inline como fallback cuando la imagen del tipo no existe.
     * Verde militar oscuro con "?" en verde brillante.
     */
    var ICON_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'" +
        " width='48' height='48'%3E%3Crect width='48' height='48' fill='%231a2a1a'/%3E" +
        "%3Ctext x='24' y='33' font-size='22' text-anchor='middle' fill='%234ea844'" +
        " font-family='monospace'%3E%3F%3C/text%3E%3C/svg%3E";

    /* ------------------------------------------------------------------ */
    /* Registro interno                                                     */
    /* ------------------------------------------------------------------ */

    var _panelList = document.getElementById('panel-list');

    /*
     * _cards[id] = {
     *   el:          HTMLElement  raíz de la tarjeta,
     *   nameEl:      HTMLElement  div del nombre,
     *   latEl:       HTMLElement  span lat (vista compacta),
     *   lonEl:       HTMLElement  span lon (vista compacta),
     *   detailLatEl: HTMLElement  span lat (vista expandida),
     *   detailLonEl: HTMLElement  span lon (vista expandida),
     *   lat:         number       última latitud conocida,
     *   lon:         number       última longitud conocida
     * }
     */
    var _cards = {};

    /* ------------------------------------------------------------------ */
    /* Construcción de tarjeta                                              */
    /* ------------------------------------------------------------------ */

    function buildIconUrl(type) {
        return '../assets/icons/' + type + '.png';
    }

    function createCard(type, id, lat, lon, options) {
        var label = (options && options.label) ? options.label : id;

        /* --- raíz --- */
        var el = document.createElement('div');
        el.className = 'panel-card';
        el.setAttribute('data-id', id);

        /* --- fila principal --- */
        var mainDiv = document.createElement('div');
        mainDiv.className = 'card-main';

        /* icono */
        var iconWrap = document.createElement('div');
        iconWrap.className = 'card-icon-wrap';

        var img = document.createElement('img');
        img.className = 'card-icon';
        img.src = buildIconUrl(type);
        img.alt = type;
        img.addEventListener('error', function () {
            this.src = ICON_FALLBACK;
        });
        iconWrap.appendChild(img);

        /* cuerpo de texto */
        var bodyDiv = document.createElement('div');
        bodyDiv.className = 'card-body';

        var nameEl = document.createElement('div');
        nameEl.className = 'card-name';
        nameEl.textContent = label;

        var coordsDiv = document.createElement('div');
        coordsDiv.className = 'card-coords-brief';

        var latEl = document.createElement('span');
        latEl.className = 'coord-lat';
        latEl.textContent = lat.toFixed(3);

        var lonEl = document.createElement('span');
        lonEl.className = 'coord-lon';
        lonEl.textContent = lon.toFixed(3);

        coordsDiv.appendChild(latEl);
        coordsDiv.appendChild(lonEl);
        bodyDiv.appendChild(nameEl);
        bodyDiv.appendChild(coordsDiv);

        mainDiv.appendChild(iconWrap);
        mainDiv.appendChild(bodyDiv);

        /* --- sección expandida --- */
        var detailDiv = document.createElement('div');
        detailDiv.className = 'card-detail';

        var detailLatEl = makeDetailRow(detailDiv, 'LAT', lat.toFixed(6));
        var detailLonEl = makeDetailRow(detailDiv, 'LON', lon.toFixed(6));

        el.appendChild(mainDiv);
        el.appendChild(detailDiv);

        return {
            el: el,
            nameEl: nameEl,
            latEl: latEl,
            lonEl: lonEl,
            detailLatEl: detailLatEl,
            detailLonEl: detailLonEl,
            lat: lat,
            lon: lon
        };
    }

    function makeDetailRow(parent, labelText, valueText) {
        var row = document.createElement('div');
        row.className = 'card-detail-row';

        var labelEl = document.createElement('span');
        labelEl.className = 'detail-label';
        labelEl.textContent = labelText;

        var valEl = document.createElement('span');
        valEl.className = 'detail-val';
        valEl.textContent = valueText;

        row.appendChild(labelEl);
        row.appendChild(valEl);
        parent.appendChild(row);

        return valEl;   /* devuelve el span del valor para actualizarlo después */
    }

    /* ------------------------------------------------------------------ */
    /* Interacción: tap (expand/collapse) y long press (flyTo)             */
    /* ------------------------------------------------------------------ */

    /* Inyecta la duración del long-press como variable CSS para que la
       animación de la barra quede sincronizada con el temporizador JS. */
    document.documentElement.style.setProperty(
        '--press-duration', (LONG_PRESS_MS / 1000) + 's'
    );

    function setupInteraction(cardData) {
        var el = cardData.el;
        var pressTimer = null;
        var longPressFired = false;

        function cancelPress() {
            if (!pressTimer) return;
            clearTimeout(pressTimer);
            pressTimer = null;
            el.classList.remove('pressing');
            document.removeEventListener('mouseup', onDocMouseUp);
        }

        function onDocMouseUp() {
            cancelPress();
        }

        el.addEventListener('mousedown', function () {
            longPressFired = false;
            el.classList.add('pressing');
            /* Escuchar el release a nivel de documento para no perderlo
               si el cursor sale del elemento o de un hijo durante el hold */
            document.addEventListener('mouseup', onDocMouseUp);
            pressTimer = setTimeout(function () {
                pressTimer = null;
                document.removeEventListener('mouseup', onDocMouseUp);
                longPressFired = true;
                el.classList.remove('pressing');
                if (window.MapAPI) {
                    MapAPI.flyTo(cardData.lat, cardData.lon);
                }
            }, LONG_PRESS_MS);
        });

        /* Tap corto: expandir / colapsar */
        el.addEventListener('click', function () {
            if (longPressFired) {
                longPressFired = false;
                return;
            }
            el.classList.toggle('expanded');
        });
    }

    /* ------------------------------------------------------------------ */
    /* API pública                                                          */
    /* ------------------------------------------------------------------ */

    window.Panel = {

        /**
         * Crea una tarjeta nueva o actualiza una existente.
         * Llamado desde MapAPI.setMarker() en map.js.
         */
        setCard: function (type, id, lat, lon, options) {
            options = options || {};

            if (_cards[id]) {
                /* --- actualizar tarjeta existente --- */
                var c = _cards[id];
                c.lat = lat;
                c.lon = lon;
                c.latEl.textContent       = lat.toFixed(3);
                c.lonEl.textContent       = lon.toFixed(3);
                c.detailLatEl.textContent = lat.toFixed(6);
                c.detailLonEl.textContent = lon.toFixed(6);
                if (options.label) {
                    c.nameEl.textContent = options.label;
                }
            } else {
                /* --- tarjeta nueva --- */
                var cardData = createCard(type, id, lat, lon, options);
                setupInteraction(cardData);
                _panelList.appendChild(cardData.el);
                _cards[id] = cardData;
            }
        },

        /**
         * Elimina la tarjeta del panel.
         * Llamado desde MapAPI.removeMarker().
         */
        removeCard: function (id) {
            if (_cards[id]) {
                _panelList.removeChild(_cards[id].el);
                delete _cards[id];
            }
        },

        /**
         * Elimina todas las tarjetas.
         * Llamado desde MapAPI.clearMarkers().
         */
        clearCards: function () {
            for (var id in _cards) {
                if (_cards.hasOwnProperty(id)) {
                    _panelList.removeChild(_cards[id].el);
                }
            }
            _cards = {};
        }
    };

}());
