// ui.js — Menu screens, game over, and win screens
// All drawn on the canvas (no HTML elements needed)

(function() {
    Game.UI = {
        // Draw the main menu / title screen
        drawMenu: function(ctx, canvas, time) {
            // Dark background
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Title
            ctx.textAlign = "center";
            ctx.fillStyle = "#3399ff";
            ctx.font = "bold 72px monospace";
            ctx.fillText("GETAWAY", canvas.width / 2, canvas.height / 2 - 80);

            // Subtitle
            ctx.fillStyle = "#999999";
            ctx.font = "20px monospace";
            ctx.fillText("Outrun the police. Reach the hideout.", canvas.width / 2, canvas.height / 2 - 30);

            // Pulsing "press space" prompt
            var pulse = 0.5 + 0.5 * Math.sin(time * 3);
            ctx.fillStyle = "rgba(255, 255, 255, " + pulse + ")";
            ctx.font = "24px monospace";
            ctx.fillText("Press SPACE to start", canvas.width / 2, canvas.height / 2 + 40);

            // Controls info
            ctx.fillStyle = "#666666";
            ctx.font = "16px monospace";
            ctx.fillText("WASD to drive", canvas.width / 2, canvas.height / 2 + 100);

            // Police car decoration (simple colored rectangles)
            var carY = canvas.height / 2 + 160;
            var lightOn = Math.floor(time * 4) % 2 === 0;

            // Left police car
            ctx.fillStyle = "#111111";
            ctx.fillRect(canvas.width / 2 - 120, carY, 40, 20);
            ctx.fillStyle = lightOn ? "#ff0000" : "#0044ff";
            ctx.fillRect(canvas.width / 2 - 108, carY - 2, 4, 4);
            ctx.fillStyle = lightOn ? "#0044ff" : "#ff0000";
            ctx.fillRect(canvas.width / 2 - 108, carY + 18, 4, 4);

            // Right police car
            ctx.fillStyle = "#111111";
            ctx.fillRect(canvas.width / 2 + 80, carY, 40, 20);
            ctx.fillStyle = lightOn ? "#0044ff" : "#ff0000";
            ctx.fillRect(canvas.width / 2 + 92, carY - 2, 4, 4);
            ctx.fillStyle = lightOn ? "#ff0000" : "#0044ff";
            ctx.fillRect(canvas.width / 2 + 92, carY + 18, 4, 4);

            ctx.textAlign = "left";
        },

        // Draw the "BUSTED" game over screen
        drawGameOver: function(ctx, canvas, time) {
            // Red tint overlay
            ctx.fillStyle = "rgba(180, 0, 0, 0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // "BUSTED" text with slight shake
            var shakeX = (Math.random() - 0.5) * 4;
            var shakeY = (Math.random() - 0.5) * 4;

            ctx.textAlign = "center";
            ctx.fillStyle = "#ff0000";
            ctx.font = "bold 80px monospace";
            ctx.fillText("BUSTED!", canvas.width / 2 + shakeX, canvas.height / 2 - 20 + shakeY);

            // Prompt
            var pulse = 0.5 + 0.5 * Math.sin(time * 3);
            ctx.fillStyle = "rgba(255, 255, 255, " + pulse + ")";
            ctx.font = "24px monospace";
            ctx.fillText("Press SPACE to try again", canvas.width / 2, canvas.height / 2 + 50);

            ctx.textAlign = "left";
        },

        // Draw the "YOU ESCAPED" win screen
        drawWin: function(ctx, canvas, time) {
            // Green tint overlay
            ctx.fillStyle = "rgba(0, 100, 0, 0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.textAlign = "center";
            ctx.fillStyle = "#00ff66";
            ctx.font = "bold 72px monospace";
            ctx.fillText("YOU ESCAPED!", canvas.width / 2, canvas.height / 2 - 20);

            // Prompt
            var pulse = 0.5 + 0.5 * Math.sin(time * 3);
            ctx.fillStyle = "rgba(255, 255, 255, " + pulse + ")";
            ctx.font = "24px monospace";
            ctx.fillText("Press SPACE to play again", canvas.width / 2, canvas.height / 2 + 50);

            ctx.textAlign = "left";
        }
    };
})();
