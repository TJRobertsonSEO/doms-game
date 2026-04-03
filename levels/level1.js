// level1.js — First level: "Downtown Escape"
// Roads are wide and open so cars can drive without clipping building corners.
//
// Map legend:
//   # = Building (wall)    . = Road
//   S = Player start       H = Hideout (goal)
//   C = Police spawn

(function() {
    // Each row is exactly 30 characters
    // Rows 1, 7, 13, 19 are fully open E-W roads
    // Col 1 and col 28 are fully open N-S roads
    var map = [
        "##############################",
        "#............................#",
        "#..####..####....####..####..#",
        "#..#..#..#..#....#..#..#..#..#",
        "#..#..#..#..#....#..#..#..#..#",
        "#..####..####....####..####..#",
        "#............................#",
        "#............................#",
        "#..####..####....####..####..#",
        "#..#..#..#..#.C..#..#..#..#..#",
        "#..#..#..#..#....#..#..#..#..#",
        "#..####..####....####..####..#",
        "#............................#",
        "#............................#",
        "#..####..####....####..####..#",
        "#..#..#..#..#....#..#..#..#..#",
        "#..#..#..#..#....#..#..#..#..#",
        "#..####..####....####..####..#",
        "#............................#",
        "#S.................C......H..#",
        "##############################"
    ];

    // Verify every row is 30 characters (safety check during development)
    for (var i = 0; i < map.length; i++) {
        if (map[i].length !== 30) {
            console.error("Level 1 map row " + i + " is " + map[i].length + " chars (expected 30)!");
        }
    }

    Game.Level.register(1, {
        name: "Downtown Escape",
        mapGrid: map,
        playerAngle: 0,

        // Traffic routes — only along fully open road rows/columns
        traffic: [
            // East-west on row 1 (top road)
            {
                route: [
                    { col: 1, row: 1 },
                    { col: 28, row: 1 },
                    { col: 1, row: 1 }
                ],
                speed: 90
            },
            // East-west on row 7 (middle road)
            {
                route: [
                    { col: 28, row: 7 },
                    { col: 1, row: 7 },
                    { col: 28, row: 7 }
                ],
                speed: 100
            },
            // East-west on row 13
            {
                route: [
                    { col: 1, row: 13 },
                    { col: 28, row: 13 },
                    { col: 1, row: 13 }
                ],
                speed: 85
            },
            // North-south on col 1 (left side)
            {
                route: [
                    { col: 1, row: 1 },
                    { col: 1, row: 19 },
                    { col: 1, row: 1 }
                ],
                speed: 80
            }
        ],

        // Roadblocks on open roads
        roadblocks: [
            { col: 14, row: 13, angle: Math.PI / 2 },
            { col: 20, row: 7, angle: 0 }
        ]
    });
})();
