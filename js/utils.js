// utils.js — Math helper functions used throughout the game
// Things like distance, angles, collision detection, etc.

(function() {
    Game.Utils = {
        // Keep a value between a minimum and maximum
        clamp: function(value, min, max) {
            if (value < min) return min;
            if (value > max) return max;
            return value;
        },

        // Smoothly blend between two values (t = 0 returns a, t = 1 returns b)
        lerp: function(a, b, t) {
            return a + (b - a) * t;
        },

        // Calculate the distance between two points
        distance: function(x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        },

        // Calculate the angle from point 1 to point 2 (in radians)
        angleBetween: function(x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1);
        },

        // Create an x,y vector from an angle and length
        vectorFromAngle: function(angle, magnitude) {
            return {
                x: Math.cos(angle) * magnitude,
                y: Math.sin(angle) * magnitude
            };
        },

        // Keep an angle between -PI and PI
        normalizeAngle: function(angle) {
            while (angle > Math.PI) angle -= Math.PI * 2;
            while (angle < -Math.PI) angle += Math.PI * 2;
            return angle;
        },

        // Find the shortest rotation from one angle to another
        angleDifference: function(from, to) {
            return Game.Utils.normalizeAngle(to - from);
        },

        // Get the 4 corner points of a rotated rectangle
        // cx, cy = center position, w = width, h = height, angle = rotation
        rotatedRectCorners: function(cx, cy, w, h, angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var hw = w / 2;   // half width
            var hh = h / 2;   // half height

            // Calculate each corner by rotating around the center
            return [
                { x: cx + cos * hw - sin * hh, y: cy + sin * hw + cos * hh },   // front-right
                { x: cx - cos * hw - sin * hh, y: cy - sin * hw + cos * hh },   // rear-right
                { x: cx - cos * hw + sin * hh, y: cy - sin * hw - cos * hh },   // rear-left
                { x: cx + cos * hw + sin * hh, y: cy + sin * hw - cos * hh }    // front-left
            ];
        },

        // --- Separating Axis Theorem (SAT) collision detection ---
        // This checks if two rotated rectangles are overlapping
        // It works by projecting both shapes onto different axes
        // If we find ANY axis where they don't overlap, they are NOT colliding

        // Project all corners onto an axis and return the min and max values
        projectOntoAxis: function(corners, axis) {
            var min = corners[0].x * axis.x + corners[0].y * axis.y;
            var max = min;

            for (var i = 1; i < corners.length; i++) {
                var projection = corners[i].x * axis.x + corners[i].y * axis.y;
                if (projection < min) min = projection;
                if (projection > max) max = projection;
            }

            return { min: min, max: max };
        },

        // Get the two unique edge normals (axes) of a rectangle's corners
        getAxes: function(corners) {
            // Only need 2 axes since opposite edges are parallel
            var edge1x = corners[1].x - corners[0].x;
            var edge1y = corners[1].y - corners[0].y;
            var edge2x = corners[2].x - corners[1].x;
            var edge2y = corners[2].y - corners[1].y;

            // Normal is perpendicular to edge (rotate 90 degrees)
            // We don't need to normalize for overlap testing
            return [
                { x: -edge1y, y: edge1x },
                { x: -edge2y, y: edge2x }
            ];
        },

        // Check if two rotated rectangles are colliding using SAT
        satCollision: function(corners1, corners2) {
            // Get all 4 axes to test (2 from each rectangle)
            var axes1 = Game.Utils.getAxes(corners1);
            var axes2 = Game.Utils.getAxes(corners2);
            var allAxes = [axes1[0], axes1[1], axes2[0], axes2[1]];

            // Test each axis — if ANY axis has no overlap, no collision
            for (var i = 0; i < allAxes.length; i++) {
                var proj1 = Game.Utils.projectOntoAxis(corners1, allAxes[i]);
                var proj2 = Game.Utils.projectOntoAxis(corners2, allAxes[i]);

                // Check if projections overlap
                if (proj1.max < proj2.min || proj2.max < proj1.min) {
                    return false; // Found a gap — no collision!
                }
            }

            return true; // All axes overlap — collision!
        },

        // Check if two car objects are colliding
        carsColliding: function(car1, car2) {
            var corners1 = Game.Utils.rotatedRectCorners(
                car1.x, car1.y, car1.length, car1.width, car1.angle
            );
            var corners2 = Game.Utils.rotatedRectCorners(
                car2.x, car2.y, car2.length, car2.width, car2.angle
            );
            return Game.Utils.satCollision(corners1, corners2);
        },

        // Check if a car overlaps any building tile
        // Tests corners, edge midpoints, and center for thorough detection
        carHitsBuilding: function(car) {
            var corners = Game.Utils.rotatedRectCorners(
                car.x, car.y, car.length, car.width, car.angle
            );

            // Check all 4 corners
            for (var i = 0; i < corners.length; i++) {
                if (Game.Map.isSolid(corners[i].x, corners[i].y)) {
                    return true;
                }
            }

            // Check midpoints of all 4 edges
            for (var i = 0; i < corners.length; i++) {
                var next = (i + 1) % corners.length;
                var midX = (corners[i].x + corners[next].x) / 2;
                var midY = (corners[i].y + corners[next].y) / 2;
                if (Game.Map.isSolid(midX, midY)) {
                    return true;
                }
            }

            // Check center
            if (Game.Map.isSolid(car.x, car.y)) {
                return true;
            }

            return false;
        }
    };
})();
