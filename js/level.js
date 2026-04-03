// level.js — Level system
// Levels are registered as data objects and loaded when the game starts
// Adding a new level is as simple as creating a new file and calling register()

(function() {
    var levels = {};  // store levels by ID

    Game.Level = {
        // Register a new level definition
        register: function(id, levelData) {
            levels[id] = levelData;
        },

        // Load a level and set up all game objects
        load: function(id) {
            var data = levels[id];
            if (!data) {
                console.error("Level " + id + " not found!");
                return null;
            }

            // Load the map grid
            Game.Map.load(data.mapGrid);

            // Set up the camera
            Game.Camera.init(Game.Map.getPixelWidth(), Game.Map.getPixelHeight());

            // Create the player car at the spawn point
            var playerSpawn = Game.Map.getPlayerSpawn();
            var player = Game.Entity.createPlayer(playerSpawn.x, playerSpawn.y);
            if (data.playerAngle !== undefined) {
                player.angle = data.playerAngle;
            }

            // Snap camera to player's starting position
            Game.Camera.snapTo(playerSpawn.x, playerSpawn.y);

            // Create police cars
            var police = [];
            var policeSpawns = Game.Map.getPoliceSpawns();
            for (var i = 0; i < policeSpawns.length; i++) {
                var cop = Game.Entity.createPolice(policeSpawns[i].x, policeSpawns[i].y);
                police.push(cop);
            }

            // Create traffic cars with routes
            var traffic = [];
            if (data.traffic) {
                for (var t = 0; t < data.traffic.length; t++) {
                    var trafficData = data.traffic[t];

                    // Convert grid route to world coordinates
                    var worldRoute = [];
                    for (var w = 0; w < trafficData.route.length; w++) {
                        var wp = trafficData.route[w];
                        var worldPos = Game.Map.gridToWorld(wp.col, wp.row);
                        worldRoute.push(worldPos);
                    }

                    var startPos = worldRoute[0];
                    var angle = 0;
                    if (worldRoute.length > 1) {
                        angle = Game.Utils.angleBetween(
                            startPos.x, startPos.y,
                            worldRoute[1].x, worldRoute[1].y
                        );
                    }

                    var trafficCar = Game.Entity.createTraffic(
                        startPos.x, startPos.y, angle, worldRoute,
                        trafficData.speed || Game.Config.TRAFFIC_SPEED
                    );
                    traffic.push(trafficCar);
                }
            }

            // Create roadblocks
            var roadblocks = [];
            if (data.roadblocks) {
                for (var r = 0; r < data.roadblocks.length; r++) {
                    var rbData = data.roadblocks[r];
                    var rbPos = Game.Map.gridToWorld(rbData.col, rbData.row);
                    var rb = Game.Entity.createRoadblock(rbPos.x, rbPos.y, rbData.angle);
                    roadblocks.push(rb);
                }
            }

            // Get hideout position
            var hideout = Game.Map.getHideoutPosition();

            // Return everything needed for the game state
            return {
                player: player,
                police: police,
                traffic: traffic,
                roadblocks: roadblocks,
                hideout: hideout,
                levelId: id,
                levelName: data.name || "Level " + id
            };
        },

        // Get a list of all registered level IDs
        getList: function() {
            return Object.keys(levels);
        }
    };
})();
