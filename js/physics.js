// physics.js — Car physics engine
// Handles acceleration, friction, steering, and the DRIFT mechanic
// The drift works by blending the car's actual movement direction
// with where it's pointing — creating that satisfying slide on turns

(function() {
    Game.Physics = {
        // Update a car's position and velocity for one physics step
        updateCar: function(car, dt) {
            var config = Game.Config;

            // --- Steering ---
            // Turn rate depends on speed, but ALWAYS allow some turning
            // so the player can steer out of walls
            var speedFactor = Math.abs(car.speed) / car.maxSpeed;
            var turnMultiplier = 0.15; // minimum turn ability even when stopped

            if (Math.abs(car.speed) > 5) {
                // Turn faster at medium speeds, slower at very high speeds
                var speedTurn = Math.sin(speedFactor * Math.PI);
                speedTurn = Math.max(speedTurn, 0.3);
                turnMultiplier = Math.max(turnMultiplier, speedTurn);
            }

            car.angle += car.turnInput * car.turnSpeed * turnMultiplier * dt;
            car.angle = Game.Utils.normalizeAngle(car.angle);

            // --- Acceleration ---
            car.speed += car.accelInput * car.accel * dt;

            // Clamp speed to max (forward and reverse)
            if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
            if (car.speed < -car.reverseSpeed) car.speed = -car.reverseSpeed;

            // --- Friction (slows car when not accelerating) ---
            if (car.accelInput === 0) {
                car.speed *= car.friction;

                // Stop completely if very slow (prevents endless creeping)
                if (Math.abs(car.speed) < 2) {
                    car.speed = 0;
                }
            }

            // --- Velocity Blending (THE DRIFT MECHANIC) ---
            // Step 1: Calculate where the car WANTS to go (based on facing direction)
            var desiredVelocity = Game.Utils.vectorFromAngle(car.angle, car.speed);

            // Step 2: Blend actual velocity toward desired velocity
            // driftFactor controls how much: 1.0 = instant (no drift), 0.8 = lots of drift
            car.velocityX = Game.Utils.lerp(car.velocityX, desiredVelocity.x, car.driftFactor);
            car.velocityY = Game.Utils.lerp(car.velocityY, desiredVelocity.y, car.driftFactor);

            // --- Save position before moving (for collision rollback) ---
            car.prevX = car.x;
            car.prevY = car.y;

            // --- Move the car ---
            car.x += car.velocityX * dt;
            car.y += car.velocityY * dt;
        },

        // Resolve wall collision by trying to slide along the wall
        // instead of just stopping dead
        resolveWallCollision: function(car) {
            // Try moving only in X (slide along horizontal walls)
            var slideX = car.prevX;
            var slideY = car.prevY;

            // Test X-only movement
            var testCar = { x: car.x, y: car.prevY, length: car.length, width: car.width, angle: car.angle };
            var canSlideX = !Game.Utils.carHitsBuilding(testCar);

            // Test Y-only movement
            testCar.x = car.prevX;
            testCar.y = car.y;
            var canSlideY = !Game.Utils.carHitsBuilding(testCar);

            if (canSlideX && canSlideY) {
                // Both axes are fine individually — keep the one with more movement
                if (Math.abs(car.velocityX) > Math.abs(car.velocityY)) {
                    car.y = car.prevY;
                    car.velocityY *= -0.3;
                } else {
                    car.x = car.prevX;
                    car.velocityX *= -0.3;
                }
                car.speed *= 0.7;
            } else if (canSlideX) {
                // Can slide along X axis (horizontal wall)
                car.y = car.prevY;
                car.velocityY *= -0.3;
                car.speed *= 0.7;
            } else if (canSlideY) {
                // Can slide along Y axis (vertical wall)
                car.x = car.prevX;
                car.velocityX *= -0.3;
                car.speed *= 0.7;
            } else {
                // Stuck in a corner — push back fully
                car.x = car.prevX;
                car.y = car.prevY;
                car.speed *= 0.5;
                car.velocityX *= 0.5;
                car.velocityY *= 0.5;
            }
        },

        // Bounce a car off another car (push them apart)
        resolveCarCollision: function(car, otherCar) {
            // Push the car away from the other car
            var angle = Game.Utils.angleBetween(otherCar.x, otherCar.y, car.x, car.y);
            var pushForce = 80;

            car.x += Math.cos(angle) * 3;
            car.y += Math.sin(angle) * 3;
            car.velocityX = Math.cos(angle) * pushForce;
            car.velocityY = Math.sin(angle) * pushForce;
            car.speed *= 0.4;
        }
    };
})();
