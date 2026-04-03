// config.js — All game constants live here
// Change these numbers to tweak how the game feels!

window.Game = {};

Game.Config = {
    // --- Tile Grid ---
    TILE_SIZE: 64,          // pixels per grid square

    // --- Colors ---
    ROAD_COLOR: "#3a3a3a",
    BUILDING_COLOR: "#6b6b6b",
    BUILDING_TOP_COLOR: "#888888",
    SIDEWALK_COLOR: "#999966",
    HIDEOUT_COLOR: "#00ff66",
    PLAYER_COLOR: "#3399ff",
    PLAYER_WINDSHIELD: "#66ccff",
    POLICE_COLOR: "#111111",
    POLICE_LIGHT_RED: "#ff0000",
    POLICE_LIGHT_BLUE: "#0044ff",
    TRAFFIC_COLORS: ["#cc0000", "#00cc00", "#cccc00", "#cc6600", "#cc00cc", "#ffffff"],
    ROADBLOCK_COLOR: "#222222",

    // --- Player Car ---
    PLAYER_ACCEL: 300,          // pixels per second squared
    PLAYER_MAX_SPEED: 380,      // pixels per second
    PLAYER_FRICTION: 0.97,      // speed multiplier each frame (lower = more drag)
    PLAYER_TURN_SPEED: 3.2,     // radians per second
    PLAYER_DRIFT_FACTOR: 0.91,  // 1.0 = no drift, lower = more slide
    PLAYER_REVERSE_SPEED: 120,  // max reverse speed

    // --- Police Car ---
    POLICE_ACCEL: 260,
    POLICE_MAX_SPEED: 340,
    POLICE_FRICTION: 0.97,
    POLICE_TURN_SPEED: 3.0,
    POLICE_DRIFT_FACTOR: 0.93,
    POLICE_PATH_RECALC: 0.5,   // seconds between A* recalculations

    // --- Traffic Car ---
    TRAFFIC_SPEED: 100,         // pixels per second (steady pace)

    // --- Car Dimensions ---
    CAR_WIDTH: 20,              // pixels
    CAR_LENGTH: 40,             // pixels

    // --- Camera ---
    CAMERA_LERP: 0.08,         // how smoothly camera follows (0-1, lower = smoother)

    // --- Mini-Map ---
    MINIMAP_SIZE: 180,          // pixels (width and height)
    MINIMAP_MARGIN: 15,         // pixels from screen edge
    MINIMAP_OPACITY: 0.85,

    // --- Physics ---
    FIXED_TIMESTEP: 1 / 60,    // seconds per physics tick

    // --- Controls ---
    KEYS: {
        UP: "w",
        DOWN: "s",
        LEFT: "a",
        RIGHT: "d"
    }
};
