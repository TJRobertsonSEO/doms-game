// engine.js — The main game loop
// Uses requestAnimationFrame with a fixed timestep for smooth, consistent physics

(function() {
    var lastTimestamp = 0;
    var accumulator = 0;
    var FIXED_DT = Game.Config.FIXED_TIMESTEP;

    // Called once per animation frame by the browser
    function gameLoop(timestamp) {
        // Calculate how much real time passed since last frame
        var frameTime = (timestamp - lastTimestamp) / 1000; // convert ms to seconds
        lastTimestamp = timestamp;

        // Cap frame time to prevent spiral of death (e.g. if tab was in background)
        if (frameTime > 0.1) {
            frameTime = 0.1;
        }

        accumulator += frameTime;

        // Run physics updates at a fixed rate, no matter the frame rate
        while (accumulator >= FIXED_DT) {
            Game.Engine.update(FIXED_DT);
            accumulator -= FIXED_DT;
        }

        // Draw everything once per frame
        Game.Engine.draw();

        // Request the next frame
        requestAnimationFrame(gameLoop);
    }

    Game.Engine = {
        canvas: null,
        ctx: null,

        // Set up the engine with a canvas
        init: function(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
            this.resizeCanvas();

            // Resize canvas when the window size changes
            window.addEventListener("resize", function() {
                Game.Engine.resizeCanvas();
            });
        },

        // Make the canvas fill the whole window
        resizeCanvas: function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        // Start the game loop
        start: function() {
            lastTimestamp = performance.now();
            // Try requestAnimationFrame first, fall back to setInterval
            // (rAF doesn't fire in some headless/background environments)
            var rafWorking = false;
            requestAnimationFrame(function(ts) {
                rafWorking = true;
                gameLoop(ts);
            });
            setTimeout(function() {
                if (!rafWorking) {
                    console.log("rAF not firing — using setInterval fallback");
                    setInterval(function() {
                        gameLoop(performance.now());
                    }, 16);
                }
            }, 100);
        },

        // Update game logic (called at fixed intervals)
        update: function(dt) {
            Game.State.update(dt);
        },

        // Draw everything to the screen (called once per frame)
        draw: function() {
            var ctx = this.ctx;
            var canvas = this.canvas;

            // Clear the screen
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            Game.State.draw(ctx, canvas);
        }
    };
})();
