// entity.js — Creates and draws all the cars in the game
// Player car, police cars, traffic cars, and roadblocks

(function() {
    var config = Game.Config;
    var lightTimer = 0; // for flashing police lights

    Game.Entity = {
        // Create a player car at a given position
        createPlayer: function(x, y) {
            return {
                x: x,
                y: y,
                prevX: x,
                prevY: y,
                angle: 0,          // facing right (0 radians)
                speed: 0,
                velocityX: 0,
                velocityY: 0,
                width: config.CAR_WIDTH,
                length: config.CAR_LENGTH,
                maxSpeed: config.PLAYER_MAX_SPEED,
                reverseSpeed: config.PLAYER_REVERSE_SPEED,
                accel: config.PLAYER_ACCEL,
                friction: config.PLAYER_FRICTION,
                driftFactor: config.PLAYER_DRIFT_FACTOR,
                turnSpeed: config.PLAYER_TURN_SPEED,
                turnInput: 0,      // -1 = left, 0 = none, 1 = right
                accelInput: 0,     // 1 = forward, -1 = brake/reverse, 0 = none
                color: config.PLAYER_COLOR,
                type: "player"
            };
        },

        // Create a police car at a given position
        createPolice: function(x, y) {
            return {
                x: x,
                y: y,
                prevX: x,
                prevY: y,
                angle: 0,
                speed: 0,
                velocityX: 0,
                velocityY: 0,
                width: config.CAR_WIDTH,
                length: config.CAR_LENGTH,
                maxSpeed: config.POLICE_MAX_SPEED,
                reverseSpeed: 80,
                accel: config.POLICE_ACCEL,
                friction: config.POLICE_FRICTION,
                driftFactor: config.POLICE_DRIFT_FACTOR,
                turnSpeed: config.POLICE_TURN_SPEED,
                turnInput: 0,
                accelInput: 0,
                color: config.POLICE_COLOR,
                type: "police",
                // AI-specific properties
                path: [],           // A* path (list of grid positions)
                pathIndex: 0,       // which waypoint we're heading to
                pathTimer: 0,       // countdown to next path recalculation
                mode: "chase"       // "chase" or "roadblock"
            };
        },

        // Create a traffic car that follows a preset route
        createTraffic: function(x, y, angle, route, speed) {
            var colorIndex = Math.floor(Math.random() * config.TRAFFIC_COLORS.length);
            return {
                x: x,
                y: y,
                prevX: x,
                prevY: y,
                angle: angle || 0,
                speed: speed || config.TRAFFIC_SPEED,
                velocityX: 0,
                velocityY: 0,
                width: config.CAR_WIDTH,
                length: config.CAR_LENGTH,
                maxSpeed: speed || config.TRAFFIC_SPEED,
                reverseSpeed: 0,
                accel: 100,
                friction: 0.98,
                driftFactor: 1.0,    // traffic doesn't drift — they drive carefully!
                turnSpeed: 2.0,
                turnInput: 0,
                accelInput: 0,
                color: config.TRAFFIC_COLORS[colorIndex],
                type: "traffic",
                route: route || [],   // list of {x, y} world positions to follow
                routeIndex: 0,        // which waypoint we're heading to
                stopped: false        // whether the car has stopped (e.g., at a roadblock)
            };
        },

        // Create a roadblock (stationary police car turned sideways)
        createRoadblock: function(x, y, angle) {
            return {
                x: x,
                y: y,
                prevX: x,
                prevY: y,
                angle: angle || 0,
                speed: 0,
                velocityX: 0,
                velocityY: 0,
                width: config.CAR_WIDTH,
                length: config.CAR_LENGTH,
                maxSpeed: 0,
                reverseSpeed: 0,
                accel: 0,
                friction: 1,
                driftFactor: 1,
                turnSpeed: 0,
                turnInput: 0,
                accelInput: 0,
                color: config.ROADBLOCK_COLOR,
                type: "roadblock"
            };
        },

        // Update the player car based on keyboard input
        updatePlayer: function(player, dt) {
            var keys = Game.Config.KEYS;

            // Read WASD input
            player.accelInput = 0;
            player.turnInput = 0;

            if (Game.Input.isDown(keys.UP)) player.accelInput = 1;
            if (Game.Input.isDown(keys.DOWN)) player.accelInput = -1;
            if (Game.Input.isDown(keys.LEFT)) player.turnInput = -1;
            if (Game.Input.isDown(keys.RIGHT)) player.turnInput = 1;

            // Apply physics
            Game.Physics.updateCar(player, dt);
        },

        // Update a traffic car to follow its route (delegates to AI module)
        updateTraffic: function(traffic, dt) {
            Game.AI.updateTrafficCar(traffic, dt);
        },

        // Update the flashing light timer
        updateLightTimer: function(dt) {
            lightTimer += dt;
        },

        // Draw a car on the canvas
        drawCar: function(ctx, car, canvas) {
            // Convert world position to screen position
            var screen = Game.Camera.worldToScreen(car.x, car.y, canvas);

            // Don't draw if off screen
            if (screen.x < -60 || screen.x > canvas.width + 60 ||
                screen.y < -60 || screen.y > canvas.height + 60) {
                return;
            }

            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(car.angle);

            // Draw car body (a rectangle centered on the car's position)
            ctx.fillStyle = car.color;
            ctx.fillRect(-car.length / 2, -car.width / 2, car.length, car.width);

            // Draw windshield area (front of car)
            if (car.type === "player") {
                ctx.fillStyle = config.PLAYER_WINDSHIELD;
                ctx.fillRect(car.length / 2 - 10, -car.width / 2 + 2, 8, car.width - 4);
            }

            // Draw flashing lights on police cars
            if (car.type === "police") {
                var lightOn = Math.floor(lightTimer * 4) % 2 === 0;
                // Left light
                ctx.fillStyle = lightOn ? config.POLICE_LIGHT_RED : config.POLICE_LIGHT_BLUE;
                ctx.fillRect(-4, -car.width / 2 - 1, 4, 4);
                // Right light (opposite color)
                ctx.fillStyle = lightOn ? config.POLICE_LIGHT_BLUE : config.POLICE_LIGHT_RED;
                ctx.fillRect(-4, car.width / 2 - 3, 4, 4);
            }

            // Draw an X on roadblocks so they stand out
            if (car.type === "roadblock") {
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-car.length / 2 + 4, -car.width / 2 + 4);
                ctx.lineTo(car.length / 2 - 4, car.width / 2 - 4);
                ctx.moveTo(car.length / 2 - 4, -car.width / 2 + 4);
                ctx.lineTo(-car.length / 2 + 4, car.width / 2 - 4);
                ctx.stroke();
            }

            ctx.restore();
        }
    };
})();
