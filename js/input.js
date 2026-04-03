// input.js — Tracks which keyboard keys are currently pressed
// Uses a Set to remember which keys are held down right now

(function() {
    var keysDown = {};

    Game.Input = {
        // Start listening for keyboard events
        init: function() {
            window.addEventListener("keydown", function(event) {
                keysDown[event.key.toLowerCase()] = true;
            });

            window.addEventListener("keyup", function(event) {
                keysDown[event.key.toLowerCase()] = false;
            });

            // Clear all keys when the window loses focus (prevents stuck keys)
            window.addEventListener("blur", function() {
                keysDown = {};
            });
        },

        // Check if a specific key is currently held down
        isDown: function(key) {
            return keysDown[key] === true;
        },

        // Clear all key states
        reset: function() {
            keysDown = {};
        }
    };
})();
