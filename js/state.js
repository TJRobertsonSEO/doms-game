// state.js — Game state machine
// Manages which screen is showing and handles transitions between them
// States: MENU -> PLAYING -> WIN or GAME_OVER -> MENU

(function() {
    var state = {
        current: "MENU",     // what screen is active right now
        player: null,
        police: [],
        traffic: [],
        roadblocks: [],
        hideout: null,
        levelId: 1,
        playTime: 0,         // how long the current attempt has lasted
        totalTime: 0,        // total elapsed time (for animations)
        spaceWasDown: false   // prevents space from triggering twice
    };

    Game.State = {
        // Initialize the game state
        init: function() {
            state.current = "MENU";
            state.totalTime = 0;
        },

        // Update game logic based on current state
        update: function(dt) {
            state.totalTime += dt;

            if (state.current === "MENU") {
                updateMenu(dt);
            } else if (state.current === "PLAYING") {
                updatePlaying(dt);
            } else if (state.current === "GAME_OVER") {
                updateGameOver(dt);
            } else if (state.current === "WIN") {
                updateWin(dt);
            }
        },

        // Draw based on current state
        draw: function(ctx, canvas) {
            if (state.current === "MENU") {
                Game.UI.drawMenu(ctx, canvas, state.totalTime);
            } else if (state.current === "PLAYING") {
                Game.Renderer.drawFrame(ctx, canvas, state, state.totalTime);
            } else if (state.current === "GAME_OVER") {
                Game.Renderer.drawFrame(ctx, canvas, state, state.totalTime);
                Game.UI.drawGameOver(ctx, canvas, state.totalTime);
            } else if (state.current === "WIN") {
                Game.Renderer.drawFrame(ctx, canvas, state, state.totalTime);
                Game.UI.drawWin(ctx, canvas, state.totalTime);
            }
        },

        // Get current state name
        getCurrent: function() { return state.current; },

        // Get the full game state object
        getState: function() { return state; }
    };

    // --- State update functions ---

    function updateMenu(dt) {
        // Wait for space to start the game
        if (Game.Input.isDown(" ") && !state.spaceWasDown) {
            startLevel(state.levelId);
        }
        state.spaceWasDown = Game.Input.isDown(" ");
    }

    function updatePlaying(dt) {
        state.playTime += dt;

        // Update the flashing police lights timer
        Game.Entity.updateLightTimer(dt);

        // Update player car
        Game.Entity.updatePlayer(state.player, dt);

        // Check player collision with buildings
        if (Game.Utils.carHitsBuilding(state.player)) {
            Game.Physics.resolveWallCollision(state.player);
        }

        // Update camera to follow player
        Game.Camera.update(
            state.player.x, state.player.y,
            dt, Game.Engine.canvas
        );

        // Update police cars
        for (var p = 0; p < state.police.length; p++) {
            Game.AI.updatePolice(state.police[p], state.player, dt);

            // Check if police caught the player!
            if (Game.Utils.carsColliding(state.police[p], state.player)) {
                state.current = "GAME_OVER";
                return;
            }
        }

        // Update traffic cars
        for (var t = 0; t < state.traffic.length; t++) {
            Game.Entity.updateTraffic(state.traffic[t], dt);

            // Check traffic collision with buildings
            if (Game.Utils.carHitsBuilding(state.traffic[t])) {
                Game.Physics.resolveWallCollision(state.traffic[t]);
            }

            // Bounce player off traffic cars
            if (Game.Utils.carsColliding(state.traffic[t], state.player)) {
                Game.Physics.resolveCarCollision(state.player, state.traffic[t]);
            }
        }

        // Check player collision with roadblocks (bounce off)
        for (var r = 0; r < state.roadblocks.length; r++) {
            if (Game.Utils.carsColliding(state.roadblocks[r], state.player)) {
                Game.Physics.resolveCarCollision(state.player, state.roadblocks[r]);
            }
        }

        // Check if player reached the hideout!
        if (state.hideout) {
            var distToHideout = Game.Utils.distance(
                state.player.x, state.player.y,
                state.hideout.x, state.hideout.y
            );
            if (distToHideout < Game.Config.TILE_SIZE * 0.6) {
                state.current = "WIN";
                return;
            }
        }

        // Update space tracking
        state.spaceWasDown = Game.Input.isDown(" ");
    }

    function updateGameOver(dt) {
        // Wait for space to return to menu
        if (Game.Input.isDown(" ") && !state.spaceWasDown) {
            state.current = "MENU";
        }
        state.spaceWasDown = Game.Input.isDown(" ");
    }

    function updateWin(dt) {
        // Wait for space to return to menu
        if (Game.Input.isDown(" ") && !state.spaceWasDown) {
            state.current = "MENU";
        }
        state.spaceWasDown = Game.Input.isDown(" ");
    }

    // Load and start a level
    function startLevel(id) {
        var levelData = Game.Level.load(id);
        if (!levelData) return;

        state.player = levelData.player;
        state.police = levelData.police;
        state.traffic = levelData.traffic;
        state.roadblocks = levelData.roadblocks;
        state.hideout = levelData.hideout;
        state.levelId = levelData.levelId;
        state.playTime = 0;
        state.current = "PLAYING";
    }
})();
