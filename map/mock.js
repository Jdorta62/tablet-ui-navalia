/* ============================================================
   mock.js — datos de prueba que simulan envíos desde Unity
   Cambiar MOCK_ENABLED a false para desactivar en producción.
   ============================================================ */

var MOCK_ENABLED = true;

if (MOCK_ENABLED) {

    /* ----------------------------------------------------------
       Estado mutable del drone_1 para la simulación de movimiento
    ---------------------------------------------------------- */
    var _d1Lat     = 42.780;
    var _d1Lon     = -9.020;
    var _d1Heading = 45;

    /* ----------------------------------------------------------
       Drones
    ---------------------------------------------------------- */
    MapAPI.setMarker('drone', 'drone_1', _d1Lat, _d1Lon, {
        label: 'Drone 1', heading: _d1Heading
    });
    MapAPI.setMarker('drone', 'drone_2', 42.740, -8.970, {
        label: 'Drone 2', heading: 120
    });
    MapAPI.setMarker('drone', 'drone_3', 42.800, -8.950, {
        label: 'Drone 3', heading: 270
    });
    MapAPI.setMarker('drone', 'drone_4', 42.760, -9.010, {
        label: 'Drone 4', heading: 315
    });
    MapAPI.setMarker('drone', 'drone_5', 42.820, -8.980, {
        label: 'Drone 5', heading: 90
    });

    /* ----------------------------------------------------------
       Helicópteros
    ---------------------------------------------------------- */
    MapAPI.setMarker('helicopter', 'helo_1', 42.750, -9.050, {
        label: 'Helicóptero 1', heading: 200
    });
    MapAPI.setMarker('helicopter', 'helo_2', 42.730, -9.030, {
        label: 'Helicóptero 2', heading: 30
    });

    /* ----------------------------------------------------------
       Buques
    ---------------------------------------------------------- */
    MapAPI.setMarker('vessel', 'vessel_1', 42.720, -8.980, {
        label: 'Buque Referencia', heading: 285
    });
    MapAPI.setMarker('vessel', 'vessel_2', 42.700, -9.060, {
        label: 'Buque Escolta', heading: 100
    });
    MapAPI.setMarker('vessel', 'vessel_3', 42.710, -8.940, {
        label: 'Buque Apoyo', heading: 175
    });

    /* ----------------------------------------------------------
       Waypoints
    ---------------------------------------------------------- */
    MapAPI.setMarker('waypoint', 'wp_1', 42.770, -9.000, {
        label: 'Waypoint Alpha'
    });
    MapAPI.setMarker('waypoint', 'wp_2', 42.755, -8.965, {
        label: 'Waypoint Bravo'
    });
    MapAPI.setMarker('waypoint', 'wp_3', 42.790, -9.040, {
        label: 'Waypoint Charlie'
    });
    MapAPI.setMarker('waypoint', 'wp_4', 42.735, -8.990, {
        label: 'Waypoint Delta'
    });

    /* ----------------------------------------------------------
       Actualización periódica de drone_1 cada 3 s
       Verifica que setMarker() reposiciona sin duplicar.
    ---------------------------------------------------------- */
    setInterval(function () {

        _d1Lat += (Math.random() - 0.5) * 0.003;
        _d1Lon += (Math.random() - 0.5) * 0.003;

        _d1Lat = Math.max(42.52, Math.min(42.93, _d1Lat));
        _d1Lon = Math.max(-9.33, Math.min(-8.61, _d1Lon));

        _d1Heading = (_d1Heading + 15) % 360;

        MapAPI.setMarker('drone', 'drone_1', _d1Lat, _d1Lon, {
            label: 'Drone 1', heading: _d1Heading
        });

    }, 3000);
}
