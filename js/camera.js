// camera.js — Camera system that follows the player
// Smoothly tracks the player car and converts between world and screen coordinates

(function() {
    var camera = {
        x: 0,               // camera center position in the world
        y: 0,
        mapWidth: 0,         // total map size in pixels
        mapHeight: 0
    };

    Game.Camera = {
        // Set up the camera with the map size
        init: function(mapWidth, mapHeight) {
            camera.mapWidth = mapWidth;
            camera.mapHeight = mapHeight;
        },

        // Smoothly move the camera toward the player
        update: function(targetX, targetY, dt, canvas) {
            var lerp = Game.Config.CAMERA_LERP;

            // Smoothly move toward target
            camera.x = Game.Utils.lerp(camera.x, targetX, lerp);
            camera.y = Game.Utils.lerp(camera.y, targetY, lerp);

            // Clamp so camera doesn't show outside the map
            var halfW = canvas.width / 2;
            var halfH = canvas.height / 2;

            camera.x = Game.Utils.clamp(camera.x, halfW, camera.mapWidth - halfW);
            camera.y = Game.Utils.clamp(camera.y, halfH, camera.mapHeight - halfH);

            // Handle maps smaller than the screen
            if (camera.mapWidth < canvas.width) {
                camera.x = camera.mapWidth / 2;
            }
            if (camera.mapHeight < canvas.height) {
                camera.y = camera.mapHeight / 2;
            }
        },

        // Convert a world position to a screen position
        worldToScreen: function(worldX, worldY, canvas) {
            return {
                x: worldX - camera.x + canvas.width / 2,
                y: worldY - camera.y + canvas.height / 2
            };
        },

        // Check if a world position is visible on screen (with margin)
        isVisible: function(worldX, worldY, canvas, margin) {
            var screen = Game.Camera.worldToScreen(worldX, worldY, canvas);
            margin = margin || 100;
            return screen.x > -margin && screen.x < canvas.width + margin &&
                   screen.y > -margin && screen.y < canvas.height + margin;
        },

        // Get the camera's current position
        getX: function() { return camera.x; },
        getY: function() { return camera.y; },

        // Snap camera directly to a position (no smooth follow)
        snapTo: function(x, y) {
            camera.x = x;
            camera.y = y;
        }
    };
})();
