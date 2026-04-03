// map.js — City grid system
// The city is made of tiles: roads, buildings, the hideout, etc.
// Also contains A* pathfinding for police AI

(function() {
    var grid = [];         // 2D array of tile characters
    var gridWidth = 0;     // number of columns
    var gridHeight = 0;    // number of rows
    var tileSize = 0;
    var spawns = {
        player: null,      // {x, y} world coords
        hideout: null,     // {x, y} world coords
        police: [],        // [{x, y}, ...] world coords
        traffic: []        // [{x, y, route}, ...] world coords
    };

    Game.Map = {
        // Load a map from an array of strings
        load: function(gridData) {
            tileSize = Game.Config.TILE_SIZE;
            grid = [];
            spawns.player = null;
            spawns.hideout = null;
            spawns.police = [];
            spawns.traffic = [];

            gridHeight = gridData.length;
            gridWidth = gridData[0].length;

            for (var row = 0; row < gridHeight; row++) {
                grid[row] = [];
                for (var col = 0; col < gridWidth; col++) {
                    var tile = gridData[row][col];
                    grid[row][col] = tile;

                    // Extract spawn positions (store as world coordinates at tile center)
                    var worldX = col * tileSize + tileSize / 2;
                    var worldY = row * tileSize + tileSize / 2;

                    if (tile === "S") {
                        spawns.player = { x: worldX, y: worldY };
                    } else if (tile === "H") {
                        spawns.hideout = { x: worldX, y: worldY };
                    } else if (tile === "C") {
                        spawns.police.push({ x: worldX, y: worldY });
                    } else if (tile === "T") {
                        spawns.traffic.push({ x: worldX, y: worldY });
                    }
                }
            }
        },

        // Get tile type at grid coordinates
        getTile: function(col, row) {
            if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) {
                return "#"; // out of bounds = wall
            }
            return grid[row][col];
        },

        // Get tile type at a world position
        getTileAtWorld: function(worldX, worldY) {
            var col = Math.floor(worldX / tileSize);
            var row = Math.floor(worldY / tileSize);
            return Game.Map.getTile(col, row);
        },

        // Check if a tile is solid (not drivable)
        isSolid: function(worldX, worldY) {
            var tile = Game.Map.getTileAtWorld(worldX, worldY);
            return tile === "#";
        },

        // Check if a grid tile is drivable (road, spawn, hideout, etc.)
        isWalkable: function(col, row) {
            var tile = Game.Map.getTile(col, row);
            return tile !== "#";
        },

        // Get map dimensions in pixels
        getPixelWidth: function() { return gridWidth * tileSize; },
        getPixelHeight: function() { return gridHeight * tileSize; },

        // Get grid dimensions
        getGridWidth: function() { return gridWidth; },
        getGridHeight: function() { return gridHeight; },

        // Get spawn positions
        getPlayerSpawn: function() { return spawns.player; },
        getHideoutPosition: function() { return spawns.hideout; },
        getPoliceSpawns: function() { return spawns.police; },
        getTrafficSpawns: function() { return spawns.traffic; },

        // Convert world coords to grid coords
        worldToGrid: function(worldX, worldY) {
            return {
                col: Math.floor(worldX / tileSize),
                row: Math.floor(worldY / tileSize)
            };
        },

        // Convert grid coords to world coords (center of tile)
        gridToWorld: function(col, row) {
            return {
                x: col * tileSize + tileSize / 2,
                y: row * tileSize + tileSize / 2
            };
        },

        // Draw the map (only tiles visible on screen)
        draw: function(ctx, canvas, time) {
            var camX = Game.Camera.getX();
            var camY = Game.Camera.getY();

            // Calculate which tiles are visible
            var startCol = Math.floor((camX - canvas.width / 2) / tileSize) - 1;
            var endCol = Math.ceil((camX + canvas.width / 2) / tileSize) + 1;
            var startRow = Math.floor((camY - canvas.height / 2) / tileSize) - 1;
            var endRow = Math.ceil((camY + canvas.height / 2) / tileSize) + 1;

            // Clamp to map bounds
            startCol = Math.max(0, startCol);
            endCol = Math.min(gridWidth, endCol);
            startRow = Math.max(0, startRow);
            endRow = Math.min(gridHeight, endRow);

            var config = Game.Config;

            for (var row = startRow; row < endRow; row++) {
                for (var col = startCol; col < endCol; col++) {
                    var tile = grid[row][col];
                    var screen = Game.Camera.worldToScreen(
                        col * tileSize, row * tileSize, canvas
                    );

                    // Pick color based on tile type
                    if (tile === "#") {
                        // Building — draw with a slightly lighter top for 3D effect
                        ctx.fillStyle = config.BUILDING_COLOR;
                        ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
                        ctx.fillStyle = config.BUILDING_TOP_COLOR;
                        ctx.fillRect(screen.x + 4, screen.y + 4, tileSize - 8, tileSize - 8);
                    } else if (tile === "H") {
                        // Hideout — pulsing green glow
                        ctx.fillStyle = config.ROAD_COLOR;
                        ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
                        var glow = 0.4 + 0.4 * Math.sin(time * 3);
                        ctx.fillStyle = "rgba(0, 255, 100, " + glow + ")";
                        ctx.fillRect(screen.x, screen.y, tileSize, tileSize);
                        // Draw a small house icon
                        ctx.fillStyle = "#00cc55";
                        ctx.fillRect(screen.x + 16, screen.y + 20, 32, 28);
                        ctx.fillStyle = "#008833";
                        // Roof triangle
                        ctx.beginPath();
                        ctx.moveTo(screen.x + 12, screen.y + 22);
                        ctx.lineTo(screen.x + 32, screen.y + 6);
                        ctx.lineTo(screen.x + 52, screen.y + 22);
                        ctx.fill();
                    } else {
                        // Road
                        ctx.fillStyle = config.ROAD_COLOR;
                        ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

                        // Draw road lane markings (dashed center lines)
                        ctx.strokeStyle = "#555555";
                        ctx.lineWidth = 1;
                        ctx.setLineDash([8, 12]);

                        // Horizontal line
                        ctx.beginPath();
                        ctx.moveTo(screen.x, screen.y + tileSize / 2);
                        ctx.lineTo(screen.x + tileSize, screen.y + tileSize / 2);
                        ctx.stroke();

                        // Vertical line
                        ctx.beginPath();
                        ctx.moveTo(screen.x + tileSize / 2, screen.y);
                        ctx.lineTo(screen.x + tileSize / 2, screen.y + tileSize);
                        ctx.stroke();

                        ctx.setLineDash([]); // reset dashes
                    }
                }
            }
        },

        // --- A* Pathfinding ---
        // Find the shortest path between two grid positions on the road

        findPath: function(startCol, startRow, endCol, endRow) {
            // Quick checks
            if (!Game.Map.isWalkable(startCol, startRow)) return null;
            if (!Game.Map.isWalkable(endCol, endRow)) return null;

            // A* uses two sets: open (to explore) and closed (already explored)
            var openList = [];
            var closedSet = {};

            // Each node stores: grid position, cost so far (g), estimated total cost (f), and parent
            var startNode = {
                col: startCol,
                row: startRow,
                g: 0,
                f: 0,
                parent: null
            };
            startNode.f = heuristic(startCol, startRow, endCol, endRow);
            openList.push(startNode);

            var maxIterations = 2000; // safety limit to prevent freezing
            var iterations = 0;

            while (openList.length > 0 && iterations < maxIterations) {
                iterations++;

                // Find the node with the lowest f score
                var bestIndex = 0;
                for (var i = 1; i < openList.length; i++) {
                    if (openList[i].f < openList[bestIndex].f) {
                        bestIndex = i;
                    }
                }
                var current = openList[bestIndex];

                // Did we reach the goal?
                if (current.col === endCol && current.row === endRow) {
                    return reconstructPath(current);
                }

                // Move current from open to closed
                openList.splice(bestIndex, 1);
                var key = current.col + "," + current.row;
                closedSet[key] = true;

                // Check all 4 neighboring tiles (up, down, left, right)
                var neighbors = [
                    { col: current.col, row: current.row - 1 },     // up
                    { col: current.col, row: current.row + 1 },     // down
                    { col: current.col - 1, row: current.row },     // left
                    { col: current.col + 1, row: current.row }      // right
                ];

                for (var n = 0; n < neighbors.length; n++) {
                    var neighbor = neighbors[n];
                    var nKey = neighbor.col + "," + neighbor.row;

                    // Skip if already explored or not walkable
                    if (closedSet[nKey]) continue;
                    if (!Game.Map.isWalkable(neighbor.col, neighbor.row)) continue;

                    var tentativeG = current.g + 1;

                    // Check if this neighbor is already in the open list
                    var existingIndex = -1;
                    for (var j = 0; j < openList.length; j++) {
                        if (openList[j].col === neighbor.col && openList[j].row === neighbor.row) {
                            existingIndex = j;
                            break;
                        }
                    }

                    if (existingIndex === -1) {
                        // New node — add to open list
                        openList.push({
                            col: neighbor.col,
                            row: neighbor.row,
                            g: tentativeG,
                            f: tentativeG + heuristic(neighbor.col, neighbor.row, endCol, endRow),
                            parent: current
                        });
                    } else if (tentativeG < openList[existingIndex].g) {
                        // Found a better path to this node — update it
                        openList[existingIndex].g = tentativeG;
                        openList[existingIndex].f = tentativeG + heuristic(neighbor.col, neighbor.row, endCol, endRow);
                        openList[existingIndex].parent = current;
                    }
                }
            }

            return null; // No path found
        }
    };

    // Heuristic: Manhattan distance (good for grid-based movement)
    function heuristic(col1, row1, col2, row2) {
        return Math.abs(col2 - col1) + Math.abs(row2 - row1);
    }

    // Walk backwards from the goal to reconstruct the path
    function reconstructPath(node) {
        var path = [];
        while (node !== null) {
            path.push({ col: node.col, row: node.row });
            node = node.parent;
        }
        path.reverse();
        return path;
    }
})();
