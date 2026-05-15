/* ============================================================
   mock.js — datos de prueba compartidos por index.html y mission.html
   Cambiar MOCK_ENABLED a false para desactivar en producción.
   ============================================================ */

var MOCK_ENABLED = false;

var MOCK_DRONES = {
    drone_1: {
        name:            'Drone Alpha',
        baterias:        87,
        status:          1,          /* 1=PATRULLA */
        statusRescueArea: true,
        position:        { x: 42.7574, y: -8.9990, z: 120.0 },
        orientation:     { x: 2.3, y: -1.1, z: 45.0 },
        operative:       true
    },
    drone_5: {
        name:            'Drone Omega',
        baterias:        1,
        status:          3,          /* 3=ENCUBIERTA */
        statusRescueArea: false,
        position:        { x: 0, y: 0, z: 0 },
        orientation:     { x: 0, y: 0, z: 0 },
        operative:       true
    },
    drone_2: {
        name:            'Drone Beta',
        baterias:        23,
        status:          2,          /* 2=RTL */
        statusRescueArea: false,
        position:        { x: 42.7401, y: -8.9703, z: 85.5 },
        orientation:     { x: -0.5, y: 1.2, z: 120.0 },
        operative:       true
    },
    drone_4: {
        name:            'Drone Delta',
        baterias:        0,
        status:          0,          /* 0=DESCONECTADO */
        statusRescueArea: false,
        position:        { x: 0, y: 0, z: 0 },
        orientation:     { x: 0, y: 0, z: 0 },
        operative:       false
    },
    drone_3: {
        name:            'Drone Gamma',
        baterias:        8,
        status:          3,          /* 3=ENCUBIERTA */
        statusRescueArea: false,
        position:        { x: 42.7800, y: -9.0200, z: 200.0 },
        orientation:     { x: 0.0, y: 0.0, z: 270.0 },
        operative:       true
    }
};

if (MOCK_ENABLED) {

    /* --- index.html: inicializar lista de drones --- */
    if (window.DroneSelectionAPI) {
        for (var _id in MOCK_DRONES) {
            if (MOCK_DRONES.hasOwnProperty(_id)) {
                DroneSelectionAPI.setDrone(_id, MOCK_DRONES[_id]);
            }
        }
    }

    /* --- mission.html: aportar nombre del drone leído de la URL --- */
    if (window.MissionAPI) {
        var _droneId = '';
        var _search  = window.location.search.slice(1).split('&');
        for (var _i = 0; _i < _search.length; _i++) {
            var _kv = _search[_i].split('=');
            if (decodeURIComponent(_kv[0]) === 'drone') {
                _droneId = decodeURIComponent(_kv[1] || '');
                break;
            }
        }
        if (_droneId && MOCK_DRONES[_droneId]) {
            MissionAPI.setDroneName(MOCK_DRONES[_droneId].name);
        }
    }
}
