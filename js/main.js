// main.js — Bootstrap file that starts everything
// This runs last, after all other scripts are loaded

(function() {
    // Wait for the page to fully load
    window.addEventListener("load", function() {
        // Grab the canvas from the HTML
        var canvas = document.getElementById("gameCanvas");

        // Initialize all game systems
        Game.Input.init();
        Game.Engine.init(canvas);
        Game.State.init();

        // Start the game loop!
        Game.Engine.start();

        console.log("GETAWAY - Game started!");
    });
})();
