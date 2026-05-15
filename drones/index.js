(function () {

    var _list   = document.getElementById('drone-list');
    var _drones = {};

    /* ------------------------------------------------------------------ */
    /* Status configuration                                                  */
    /* ------------------------------------------------------------------ */

    var STATUS_MAP = {
        0: { text: 'DESCONECTADO', dotCls: 'off',  cardCls: '',         signal: 0, sigCls: ''         },
        1: { text: 'PATRULLA',     dotCls: 'ok',   cardCls: 'status-1', signal: 4, sigCls: ''         },
        2: { text: 'RTL',          dotCls: 'warn', cardCls: 'status-2', signal: 2, sigCls: 'sig-warn' },
        3: { text: 'ENCUBIERTA',   dotCls: 'info', cardCls: 'status-3', signal: 1, sigCls: 'sig-low'  }
    };

    function getStatusInfo(d) {
        if (d.status !== undefined && STATUS_MAP[d.status]) return STATUS_MAP[d.status];
        return d.operative ? STATUS_MAP[1] : STATUS_MAP[0];
    }

    /* ------------------------------------------------------------------ */
    /* DOM helpers                                                           */
    /* ------------------------------------------------------------------ */

    function makeDetailRow(key) {
        var row = document.createElement('div');
        row.className = 'detail-row';
        var keyEl = document.createElement('span');
        keyEl.className = 'detail-key';
        keyEl.textContent = key;
        var valEl = document.createElement('span');
        valEl.className = 'detail-val';
        valEl.textContent = '—';
        row.appendChild(keyEl);
        row.appendChild(valEl);
        return { el: row, val: valEl };
    }

    function makeDetailGroup(title, rows) {
        var g = document.createElement('div');
        g.className = 'detail-group';
        var t = document.createElement('div');
        t.className = 'detail-group-title';
        t.textContent = title;
        g.appendChild(t);
        rows.forEach(function (r) { g.appendChild(r.el); });
        return g;
    }

    /* ------------------------------------------------------------------ */
    /* Card construction                                                     */
    /* ------------------------------------------------------------------ */

    function buildCard(id, data) {
        var card = document.createElement('div');
        card.className = 'drone-card';
        card.setAttribute('data-id', id);

        /* --- Header --- */
        var header = document.createElement('div');
        header.className = 'card-header';

        var img = document.createElement('img');
        img.className = 'drone-card__icon';
        img.src = '../assets/icons/drone.png';
        img.alt = 'drone';

        var main = document.createElement('div');
        main.className = 'card-header__main';

        var nameRow = document.createElement('div');
        nameRow.className = 'card-name-row';

        var nameEl = document.createElement('div');
        nameEl.className = 'drone-card__name';

        var rescueBadge = document.createElement('span');
        rescueBadge.className = 'rescue-badge';
        rescueBadge.textContent = 'RESCUE ASSIGNED';

        nameRow.appendChild(nameEl);
        nameRow.appendChild(rescueBadge);

        var statusRow = document.createElement('div');
        statusRow.className = 'card-status-row';
        var dot = document.createElement('span');
        dot.className = 'status-dot';
        var statusText = document.createElement('span');
        statusText.className = 'status-text';
        statusRow.appendChild(dot);
        statusRow.appendChild(statusText);

        main.appendChild(nameRow);
        main.appendChild(statusRow);

        /* --- Right indicators --- */
        var indicators = document.createElement('div');
        indicators.className = 'card-indicators';

        // Battery
        var batWrap = document.createElement('div');
        batWrap.className = 'battery-wrap';
        var batLabel = document.createElement('span');
        batLabel.className = 'battery-label';
        batLabel.textContent = 'BAT';
        var batTrack = document.createElement('div');
        batTrack.className = 'battery-track';
        var batFill = document.createElement('div');
        batFill.className = 'battery-fill';
        batTrack.appendChild(batFill);
        var batPct = document.createElement('span');
        batPct.className = 'battery-pct';
        batWrap.appendChild(batLabel);
        batWrap.appendChild(batTrack);
        batWrap.appendChild(batPct);

        // Signal
        var sigWrap = document.createElement('div');
        sigWrap.className = 'signal-wrap';
        var sigLabel = document.createElement('span');
        sigLabel.className = 'signal-label';
        sigLabel.textContent = 'SIG';
        var sigContainer = document.createElement('div');
        sigContainer.className = 'signal-bars';
        for (var i = 1; i <= 4; i++) {
            var bar = document.createElement('div');
            bar.className = 'signal-bar b' + i;
            sigContainer.appendChild(bar);
        }
        sigWrap.appendChild(sigLabel);
        sigWrap.appendChild(sigContainer);

        indicators.appendChild(batWrap);
        indicators.appendChild(sigWrap);

        header.appendChild(img);
        header.appendChild(main);
        header.appendChild(indicators);

        /* Chevron — in normal flex flow so it never overlaps indicators */
        var chevron = document.createElement('span');
        chevron.className = 'card-chevron';
        chevron.textContent = '▾';
        header.appendChild(chevron);

        /* --- Expandable detail --- */
        var detail = document.createElement('div');
        detail.className = 'card-detail';
        /* grid-clip: directo hijo del grid, sin padding para que 0fr→1fr funcione */
        var detailClip = document.createElement('div');
        detailClip.className = 'card-detail__clip';
        var detailInner = document.createElement('div');
        detailInner.className = 'detail-inner';

        var latRow   = makeDetailRow('LAT');
        var lonRow   = makeDetailRow('LON');
        var altRow   = makeDetailRow('ALT');
        var pitchRow = makeDetailRow('PITCH');
        var rollRow  = makeDetailRow('ROLL');
        var yawRow   = makeDetailRow('YAW');

        detailInner.appendChild(makeDetailGroup('POSICIÓN',   [latRow, lonRow, altRow]));
        detailInner.appendChild(makeDetailGroup('ORIENTACIÓN', [pitchRow, rollRow, yawRow]));

        var actions = document.createElement('div');
        actions.className = 'detail-actions';
        var btnSelect = document.createElement('button');
        btnSelect.className = 'btn-select';
        btnSelect.textContent = 'SELECCIONAR';
        actions.appendChild(btnSelect);
        detailInner.appendChild(actions);

        detailClip.appendChild(detailInner);
        detail.appendChild(detailClip);
        card.appendChild(header);
        card.appendChild(detail);

        var entry = {
            data:         data,
            el:           card,
            nameEl:       nameEl,
            rescueBadge:  rescueBadge,
            dotEl:        dot,
            statusTextEl: statusText,
            batFill:      batFill,
            batPct:       batPct,
            sigBars:      sigContainer.querySelectorAll('.signal-bar'),
            latVal:       latRow.val,
            lonVal:       lonRow.val,
            altVal:       altRow.val,
            pitchVal:     pitchRow.val,
            rollVal:       rollRow.val,
            yawVal:       yawRow.val,
            btnSelect:    btnSelect
        };

        refreshCard(entry);
        attachInteraction(id, entry);
        return entry;
    }

    /* ------------------------------------------------------------------ */
    /* Card refresh                                                          */
    /* ------------------------------------------------------------------ */

    function refreshCard(entry) {
        var d  = entry.data;
        var si = getStatusInfo(d);

        entry.nameEl.textContent = d.name;
        entry.rescueBadge.classList.toggle('visible', !!d.statusRescueArea);

        entry.dotEl.className         = 'status-dot ' + si.dotCls;
        entry.statusTextEl.className  = 'status-text ' + si.dotCls;
        entry.statusTextEl.textContent = si.text;

        var isExpanded = entry.el.classList.contains('expanded');
        var cls = 'drone-card';
        if (si.cardCls)    cls += ' ' + si.cardCls;
        if (!d.operative)  cls += ' inoperative';
        if (isExpanded)    cls += ' expanded';
        entry.el.className = cls;

        // Battery (accepts baterias or legacy battery field)
        var bat = d.baterias !== undefined ? d.baterias : (d.battery || 0);
        bat = Math.max(0, Math.min(100, bat));
        entry.batFill.style.width = bat + '%';
        entry.batFill.className   = 'battery-fill ' + (bat > 50 ? 'bat-ok' : bat > 20 ? 'bat-warn' : 'bat-crit');
        entry.batPct.textContent  = bat + '%';

        // Signal bars
        var bars = entry.sigBars;
        for (var i = 0; i < bars.length; i++) {
            var active = (i < si.signal);
            bars[i].className = 'signal-bar b' + (i + 1) + (active ? ' active ' + si.sigCls : '');
        }

        // Select button: only enabled when Status==3 (ENCUBIERTA) && !statusRescueArea
        var canSelect = (d.status === 3 && !d.statusRescueArea);
        entry.btnSelect.classList.toggle('disabled', !canSelect);
        entry.btnSelect.title = canSelect ? '' : (d.statusRescueArea ? 'Área ya asignada' : 'Drone no disponible');

        // Position (x=lat, y=lon, z=alt per Unity Vector3 convention)
        var pos = d.position || {};
        entry.latVal.textContent  = pos.x !== undefined ? pos.x.toFixed(4) : '—';
        entry.lonVal.textContent  = pos.y !== undefined ? pos.y.toFixed(4) : '—';
        entry.altVal.textContent  = pos.z !== undefined ? pos.z.toFixed(1) + ' m' : '—';

        // Orientation (x=pitch, y=roll, z=yaw per Unity Euler convention)
        var ori = d.orientation || {};
        entry.pitchVal.textContent = ori.x !== undefined ? ori.x.toFixed(1) + '°' : '—';
        entry.rollVal.textContent  = ori.y !== undefined ? ori.y.toFixed(1) + '°' : '—';
        entry.yawVal.textContent   = ori.z !== undefined ? ori.z.toFixed(1) + '°' : '—';
    }

    /* ------------------------------------------------------------------ */
    /* Interaction                                                           */
    /* ------------------------------------------------------------------ */

    function attachInteraction(id, entry) {
        entry.el.addEventListener('click', function () {
            if (!entry.data.operative) {
                triggerShake(entry.el);
                return;
            }
            var wasExpanded = entry.el.classList.contains('expanded');
            /* Accordion: collapse all before toggling this one */
            Object.keys(_drones).forEach(function (k) {
                _drones[k].el.classList.remove('expanded');
            });
            if (!wasExpanded) {
                entry.el.classList.add('expanded');
                setTimeout(function () {
                    entry.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400);
            }
        });

        entry.btnSelect.addEventListener('click', function (e) {
            e.stopPropagation();
            var d = entry.data;
            /* Operative condition: Status==3 (ENCUBIERTA) && !statusRescueArea */
            if (d.status !== 3 || d.statusRescueArea) return;
            window.location.href = 'mission.html?drone=' + encodeURIComponent(id);
        });
    }

    function triggerShake(el) {
        el.classList.remove('shake');
        void el.offsetWidth;
        el.classList.add('shake');
        el.addEventListener('animationend', function handler() {
            el.classList.remove('shake');
            el.removeEventListener('animationend', handler);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Public API                                                            */
    /* ------------------------------------------------------------------ */

    window.DroneSelectionAPI = {

        setDrone: function (id, data) {
            if (_drones[id]) {
                _drones[id].data = data;
                refreshCard(_drones[id]);
            } else {
                var entry = buildCard(id, data);
                _list.appendChild(entry.el);
                _drones[id] = entry;
            }
        },

        setOperative: function (id, operative) {
            if (_drones[id]) {
                _drones[id].data.operative = operative;
                refreshCard(_drones[id]);
            }
        },

        removeDrone: function (id) {
            if (_drones[id]) {
                _list.removeChild(_drones[id].el);
                delete _drones[id];
            }
        }
    };

}());
