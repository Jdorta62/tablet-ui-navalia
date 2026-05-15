/* ============================================================
   mock.js — datos de prueba que simulan envíos desde Unity
   Cambiar MOCK_ENABLED a false para desactivar en producción.

   Límites del mapa en Unity units:
     SW: (-10324, 0, -12107)
     NE: ( 13246, 0,  13202)
   ============================================================ */

var MOCK_ENABLED = false;

if (MOCK_ENABLED) {

    /* ----------------------------------------------------------
       Estado mutable del drone_1 para la simulación de movimiento
    ---------------------------------------------------------- */
    var _d1X     =  2400;
    var _d1Z     =  1800;
    var _d1Heading = 45;

    /* ----------------------------------------------------------
       Drones
    ---------------------------------------------------------- */
    MapAPI.setMarkerUnity('drone', 'drone_1',  2400,   1800, { label: 'Drone 1', heading:  45 });
    MapAPI.setMarkerUnity('drone', 'drone_2', -3200,   5500, { label: 'Drone 2', heading: 120 });
    MapAPI.setMarkerUnity('drone', 'drone_3',  7800,  -2600, { label: 'Drone 3', heading: 270 });
    MapAPI.setMarkerUnity('drone', 'drone_4', -1400,  -7300, { label: 'Drone 4', heading: 315 });
    MapAPI.setMarkerUnity('drone', 'drone_5',  5100,   9600, { label: 'Drone 5', heading:  90 });

    /* ----------------------------------------------------------
       Helicópteros
    ---------------------------------------------------------- */
    MapAPI.setMarkerUnity('helicopter', 'helo_1', -8200,  3100, { label: 'Helicóptero 1', heading: 200 });
    MapAPI.setMarkerUnity('helicopter', 'helo_2',  9500, -5400, { label: 'Helicóptero 2', heading:  30 });

    /* ----------------------------------------------------------
       Buques
    ---------------------------------------------------------- */
    MapAPI.setMarkerUnity('vessel', 'vessel_1',  -500, -10200, { label: 'Buque Referencia', heading: 285 });
    MapAPI.setMarkerUnity('vessel', 'vessel_2', 11400,   6300, { label: 'Buque Escolta',    heading: 100 });
    MapAPI.setMarkerUnity('vessel', 'vessel_3', -7600,  11800, { label: 'Buque Apoyo',      heading: 175 });

    /* ----------------------------------------------------------
       Waypoints
    ---------------------------------------------------------- */
    MapAPI.setMarkerUnity('waypoint', 'wp_1',  1919.103, -12892.1, { label: 'Waypoint 1' });
    MapAPI.setMarkerUnity('waypoint', 'wp_2', -5332,      8065,   { label: 'Waypoint 2' });

    /* ----------------------------------------------------------
       Puntos de referencia de calibración (debug)
       RefA → lat 42.806084 / lon -8.850377
       RefB → lat 42.668775 / lon -9.01752
    ---------------------------------------------------------- */
    MapAPI.setMarkerUnity('waypoint', 'ref_a',  13290,   6033, { label: 'REF A' });
    MapAPI.setMarkerUnity('waypoint', 'ref_b',  -1618, -10659, { label: 'REF B' });

    /* ----------------------------------------------------------
       Actualización periódica de drone_1 cada 3 s
       Verifica que setMarkerUnity() reposiciona sin duplicar.
    ---------------------------------------------------------- */
    setInterval(function () {

        _d1X += (Math.random() - 0.5) * 400;
        _d1Z += (Math.random() - 0.5) * 400;

        /* Mantener dentro de los límites del mapa */
        _d1X = Math.max(-10324, Math.min(13246, _d1X));
        _d1Z = Math.max(-12107, Math.min(13202, _d1Z));

        _d1Heading = (_d1Heading + 15) % 360;

        MapAPI.setMarkerUnity('drone', 'drone_1', _d1X, _d1Z, {
            label: 'Drone 1', heading: _d1Heading
        });

    }, 3000);
}
