// minimap.js — Draws a small overview map in the corner of the screen
// Shows the player (blue), police (red), hideout (green), and camera view

(function() {
    Game.MiniMap = {
        // Draw the minimap on the screen
        draw: function(ctx, canvas, player, police, hideout, time) {
            var config = Game.Config;
            var mapW = Game.Map.getPixelWidth();
            var mapH = Game.Map.getPixelHeight();

            // Calculate scale to fit the map into the minimap box
            var mmSize = config.MINIMAP_SIZE;
            var scale = mmSize / Math.max(mapW, mapH);
            var mmW = mapW * scale;
            var mmH = mapH * scale;

            // Position in top-right corner
            var mmX = canvas.width - mmW - config.MINIMAP_MARGIN;
            var mmY = config.MINIMAP_MARGIN;

            // Draw semi-transparent background
            ctx.fillStyle = "rgba(0, 0, 0, " + config.MINIMAP_OPACITY + ")";
            ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);

            // Draw tiles (very small colored squares)
            var gridW = Game.Map.getGridWidth();
            var gridH = Game.Map.getGridHeight();
            var tileW = mmW / gridW;
            var tileH = mmH / gridH;

            for (var row = 0; row < gridH; row++) {
                for (var col = 0; col < gridW; col++) {
                    var tile = Game.Map.getTile(col, row);
                    if (tile === "#") {
                        ctx.fillStyle = "#555555";
                    } else if (tile === "H") {
                        var glow = 0.6 + 0.4 * Math.sin(time * 3);
                        ctx.fillStyle = "rgba(0, 255, 100, " + glow + ")";
                    } else {
                        ctx.fillStyle = "#2a2a2a";
                    }
                    ctx.fillRect(
                        mmX + col * tileW,
                        mmY + row * tileH,
                        tileW + 0.5,   // +0.5 to avoid tiny gaps between tiles
                        tileH + 0.5
                    );
                }
            }

            // Draw camera viewport rectangle
            var camX = Game.Camera.getX();
            var camY = Game.Camera.getY();
            var viewW = canvas.width * scale;
            var viewH = canvas.height * scale;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                mmX + (camX - canvas.width / 2) * scale,
                mmY + (camY - canvas.height / 2) * scale,
                viewW,
                viewH
            );

            // Draw hideout dot (green)
            if (hideout) {
                ctx.fillStyle = "#00ff66";
                ctx.beginPath();
                ctx.arc(mmX + hideout.x * scale, mmY + hideout.y * scale, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw police dots (red)
            for (var i = 0; i < police.length; i++) {
                ctx.fillStyle = "#ff2222";
                ctx.beginPath();
                ctx.arc(mmX + police[i].x * scale, mmY + police[i].y * scale, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw player dot (blue — drawn last so it's always on top)
            ctx.fillStyle = "#33aaff";
            ctx.beginPath();
            ctx.arc(mmX + player.x * scale, mmY + player.y * scale, 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 1;
            ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
        }
    };
})();
