// ai.js — Police and traffic AI logic
//
// Police use GRID-BASED movement: they glide smoothly along their A* path,
// snapping to tile centers at intersections. No physics, no drift, no wall
// collisions needed — they follow the road perfectly. Think Pac-Man ghosts.
//
// This makes them predictable but relentless — the fun is in finding a route
// they can't cut off, not in exploiting their bad driving.

(function() {
    Game.AI = {
        // Update a single police car using grid-based movement
        updatePolice: function(cop, player, dt) {
            cop.pathTimer -= dt;

            // Get grid positions
            var copGrid = Game.Map.worldToGrid(cop.x, cop.y);
            var playerGrid = Game.Map.worldToGrid(player.x, player.y);

            // Recalculate A* path periodically
            if (cop.pathTimer <= 0 || cop.path.length === 0) {
                cop.path = Game.Map.findPath(
                    copGrid.col, copGrid.row,
                    playerGrid.col, playerGrid.row
                ) || [];
                cop.pathIndex = 1; // skip current position
                cop.pathTimer = Game.Config.POLICE_PATH_RECALC;
            }

            // Determine the target point to move toward
            var targetX = cop.x;
            var targetY = cop.y;

            if (cop.path.length > 0 && cop.pathIndex < cop.path.length) {
                var waypoint = cop.path[cop.pathIndex];
                var wpWorld = Game.Map.gridToWorld(waypoint.col, waypoint.row);
                targetX = wpWorld.x;
                targetY = wpWorld.y;

                // If we reached this waypoint, advance to the next one
                var distToWaypoint = Game.Utils.distance(cop.x, cop.y, targetX, targetY);
                if (distToWaypoint < 8) {
                    cop.pathIndex++;
                    // Get next waypoint if available
                    if (cop.pathIndex < cop.path.length) {
                        waypoint = cop.path[cop.pathIndex];
                        wpWorld = Game.Map.gridToWorld(waypoint.col, waypoint.row);
                        targetX = wpWorld.x;
                        targetY = wpWorld.y;
                    }
                }
            }

            // When very close to the player, chase their exact position
            // (so the cop doesn't orbit the player's tile center)
            var distToPlayer = Game.Utils.distance(cop.x, cop.y, player.x, player.y);
            if (distToPlayer < 150) {
                targetX = player.x;
                targetY = player.y;
            }

            // --- Move directly toward the target at a fixed speed ---
            var dx = targetX - cop.x;
            var dy = targetY - cop.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                // Normalize direction and move at police speed
                var moveSpeed = cop.maxSpeed * dt;
                if (moveSpeed > dist) moveSpeed = dist; // don't overshoot

                cop.x += (dx / dist) * moveSpeed;
                cop.y += (dy / dist) * moveSpeed;

                // Face the direction of movement (smooth rotation for visuals)
                var targetAngle = Math.atan2(dy, dx);
                var angleDiff = Game.Utils.angleDifference(cop.angle, targetAngle);
                // Rotate quickly but not instantly — looks smooth
                cop.angle += angleDiff * 0.2;
                cop.angle = Game.Utils.normalizeAngle(cop.angle);
            }

            // Update velocity for collision detection purposes
            cop.speed = cop.maxSpeed;
            cop.velocityX = Math.cos(cop.angle) * cop.speed;
            cop.velocityY = Math.sin(cop.angle) * cop.speed;
        },

        // Update a traffic car to follow its route
        updateTrafficCar: function(traffic, dt) {
            if (traffic.stopped || traffic.route.length === 0) return;

            var target = traffic.route[traffic.routeIndex];
            var dist = Game.Utils.distance(traffic.x, traffic.y, target.x, target.y);

            // If we reached this waypoint, move to the next one
            if (dist < 40) {
                traffic.routeIndex = (traffic.routeIndex + 1) % traffic.route.length;
                target = traffic.route[traffic.routeIndex];
            }

            // Steer toward the target waypoint
            var targetAngle = Game.Utils.angleBetween(traffic.x, traffic.y, target.x, target.y);
            var angleDiff = Game.Utils.angleDifference(traffic.angle, targetAngle);

            if (angleDiff > 0.05) {
                traffic.turnInput = 1;
            } else if (angleDiff < -0.05) {
                traffic.turnInput = -1;
            } else {
                traffic.turnInput = 0;
            }

            // Slow down for turns
            if (Math.abs(angleDiff) > 0.8) {
                traffic.accelInput = 0.3;
            } else {
                traffic.accelInput = 1;
            }

            Game.Physics.updateCar(traffic, dt);

            // If stuck on a wall, skip to next waypoint
            if (Game.Utils.carHitsBuilding(traffic)) {
                Game.Physics.resolveWallCollision(traffic);
                traffic.routeIndex = (traffic.routeIndex + 1) % traffic.route.length;
            }
        }
    };
})();
