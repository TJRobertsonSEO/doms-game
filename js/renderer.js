// renderer.js — Master drawing coordinator
// Draws everything in the correct order: map -> cars -> HUD -> minimap

(function() {
    Game.Renderer = {
        // Draw one complete frame of the game
        drawFrame: function(ctx, canvas, state, time) {
            // 1. Draw the city map (roads, buildings, hideout)
            Game.Map.draw(ctx, canvas, time);

            // 2. Draw roadblocks
            for (var r = 0; r < state.roadblocks.length; r++) {
                Game.Entity.drawCar(ctx, state.roadblocks[r], canvas);
            }

            // 3. Draw traffic cars
            for (var t = 0; t < state.traffic.length; t++) {
                Game.Entity.drawCar(ctx, state.traffic[t], canvas);
            }

            // 4. Draw police cars
            for (var p = 0; p < state.police.length; p++) {
                Game.Entity.drawCar(ctx, state.police[p], canvas);
            }

            // 5. Draw the player car (on top of everything else)
            Game.Entity.drawCar(ctx, state.player, canvas);

            // 6. Draw the HUD (speed, hints)
            Game.Renderer.drawHUD(ctx, canvas, state);

            // 7. Draw the mini-map
            Game.MiniMap.draw(
                ctx, canvas,
                state.player,
                state.police,
                state.hideout,
                time
            );
        },

        // Draw the heads-up display (speed and hint text)
        drawHUD: function(ctx, canvas, state) {
            var speed = Math.abs(Math.round(state.player.speed));

            // Speed display in bottom-left
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(15, canvas.height - 50, 120, 35);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px monospace";
            ctx.fillText(speed + " mph", 25, canvas.height - 25);

            // Hint text that fades after a few seconds
            if (state.playTime < 4) {
                var alpha = Math.max(0, 1 - state.playTime / 4);
                ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
                ctx.font = "20px monospace";
                ctx.textAlign = "center";
                ctx.fillText("Reach the hideout! (green on minimap)", canvas.width / 2, 50);
                ctx.textAlign = "left";
            }
        }
    };
})();
