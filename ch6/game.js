/*
Name: Canvas Ricochet
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
*/

// Immediately executes the data inside and prevents global namespace issues
(function() {
    // How to figure out what a user's computer can handle for frames with fallbacks
    // Original by Paul Irish: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame        ||
        window.webkitRequestAnimationFrame          ||
        window.mozRequestAnimationFrame             ||
        window.oRequestAnimationFrame               ||
        window.msRequestAnimationFrame              ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    // Residing place for our Canvas' context
    var ctx = null;

    var Game = {
        // Setup configuration
        canvas: document.getElementById('canvas'),
        setup: function() {
            if (this.canvas.getContext) {
                // Setup variables
                ctx = this.canvas.getContext('2d');

                // Cache width and height of the Canvas to save processing power
                this.width = this.canvas.width;
                this.height = this.canvas.height;

                // Run the game
                Screen.welcome();
                this.canvas.addEventListener('click', this.runGame, false);
                Ctrl.init();
            }
        },

        // Setup initial objects
        init: function() {
            Background.init();
            Hud.init();
            Bricks.init();
            Ball.init();
            Paddle.init();
        },

        // Run from the global space, so you must use Game instead of this to prevent a crash
        animate: function() {
            Game.play = requestAnimFrame(Game.animate);
            Game.draw();
        },

        draw: function() {
            ctx.clearRect(0, 0, this.width, this.height);

            // Draw objects
            Background.draw();
            Bricks.draw();
            Paddle.draw();
            Hud.draw();
            Ball.draw();
        },

        // Must reference as Game isntead of this due to when the listener is fired (outside of the object)
        runGame: function() {
            Game.canvas.removeEventListener('click', Game.runGame, false);
            Game.init();

            // Run animation
            Game.animate();
        },

        // Must reference as Game isntead of this due to when the listener is fired (outside of the object)
        restartGame: function() {
            Game.canvas.removeEventListener('click', Game.restartGame, false);
            Game.init();
        },

        // Leveling
        levelUp: function() {
            Hud.lv += 1;
            Bricks.init();
            Ball.init();
            Paddle.init();
        },

        levelLimit: function(lv) {
            return lv > 5 ? 5 : lv;
        }
    };

    var Screen = {
        welcome: function() {
            // Setup base values
            this.text = 'CANVAS RICOCHET';
            this.textSub = 'Click To Start';
            this.textColor = 'white';

            // Create screen
            this.create();
        },

        gameover: function() {
            this.text = 'Game Over';
            this.textSub = 'Click To Retry';
            this.textColor = 'red';

            this.create();
        },

        create: function() {
            // Background
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, Game.width, Game.height);

            // Main text
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.font = '40px helvetica, arial';
            ctx.fillText(this.text, Game.width / 2, Game.height / 2);

            // Sub text
            ctx.fillStyle = '#999999';
            ctx.font = '20px helvetica, arial';
            ctx.fillText(this.textSub, Game.width / 2, Game.height / 2 + 30);
        }
    };

    /***************************
    Game Objects
    ***************************/
    var Background = {
        init: function() {
            // Makes sure nothing is drawn until the image is fully loaded
            this.ready = false;

            // Createa a background image
            this.img = new Image();
            this.img.src = 'background.jpg';
            this.img.onload = function() {
                Background.ready = true;
            };
        },
        draw: function() {
            if (this.ready) {
                ctx.drawImage(this.img, 0, 0);
            }
        }
    };

    var Ball = {
        r: 10,

        init: function() {
            this.x = 120;
            this.y = 120;
            this.sx = 1 + (0.4 * Hud.lv);
            this.sy = -1.5 - (0.4 * Hud.lv);
        },

        draw: function() {
            // Edge detection
            this.edges();
            this.collide();
            this.move();

            // Create ball
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.closePath();

            ctx.fillStyle = '#eee';
            ctx.fill();
        },

        move: function() {
            this.x += this.sx;
            this.y += this.sy;
        },

        // Edge dectection
        edges: function() {
            // Top / bottom
            if (this.y < 1) {
                this.y = 1; // Prevents the ball from getting stuck at fast speeds
                this.sy = -this.sy;
            } else if (this.y > Game.height) { // Bottom
                // Stop the ball and hide it
                this.sy = this.sx = 0;
                this.y = this.x = 1000;

                // Shut down
                Screen.gameover();
                Game.canvas.addEventListener('click', Game.restartGame, false);
                return;
            }

            // Sides
            if (this.x < 1) {
                this.x = 1; // Prevents the ball from getting stuck at fast speeds
                this.sx = -this.sx;
            } else if (this.x > Game.width) { // Right
                this.x = Game.width - 1; // Prevents the ball from getting stuck at fast speeds
                this.sx = -this.sx;
            }
        },

        // Paddle to ball collision detection
        collide: function() {
            if (this.x >= Paddle.x &&
                this.x <= (Paddle.x + Paddle.w) &&
                this.y >= Paddle.y &&
                this.y <= (Paddle.y + Paddle.h)) {
                this.sx = 7 * ((this.x - (Paddle.x + Paddle.w / 2)) / Paddle.w);
                this.sy = -this.sy;
            }
        }
    };

    var Paddle = {
        w: 90,
        h: 20,
        r: 9,
        init: function() {
            this.x = 100;
            this.y = 210;
            this.speed = 4;
        },

        draw: function() {
            this.move();

            // Can be written much easier in newer browsers like this
            //ctx.beginPath();
            //ctx.moveTo(this.x, this.y);
            //ctx.arcTo(this.x + this.w, this.y, this.x + this.w, this.y + this.r, this.r);
            //ctx.arcTo(this.x + this.w, this.y + this.h, this.x + this.w - this.r, this.y + this.h, this.r);
            //ctx.arcTo(this.x, this.y + this.h, this.x, this.y + this.h - this.r, this.r);
            //ctx.arcTo(this.x, this.y, this.x + this.r, this.y, this.r);
            //ctx.closePath();
            //ctx.fillStyle = this.gradient();
            //ctx.fill();

            // Create paddle (only works in modern implementations of the Canvas W3C draft)
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.arcTo(this.x + this.w, this.y, this.x + this.w, this.y + this.r, this.r);
            ctx.lineTo(this.x + this.w, this.y + this.h - this.r);
            ctx.arcTo(this.x + this.w, this.y + this.h, this.x + this.w - this.r, this.y + this.h, this.r);
            ctx.lineTo(this.x + this.r, this.y + this.h);
            ctx.arcTo(this.x, this.y + this.h, this.x, this.y + this.h - this.r, this.r);
            ctx.lineTo(this.x, this.y + this.r);
            ctx.arcTo(this.x, this.y, this.x + this.r, this.y, this.r);
            ctx.closePath();

            ctx.fillStyle = this.gradient();
            ctx.fill();
        },

        move: function() {
            // Detect controller input
            if (Ctrl.left && (this.x < Game.width - (this.w / 2))) {
                this.x += this.speed;
            } else if (Ctrl.right && this.x > -this.w / 2) {
                this.x += -this.speed;
            }
        },

        gradient: function() {
            if (this.gradientCache) {
                return this.gradientCache;
            }

            this.gradientCache = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 20);
            this.gradientCache.addColorStop(0, '#eee');
            this.gradientCache.addColorStop(1, '#999');

            return this.gradientCache;
        }
    };

    var Bricks = {
        gap: 2,
        col: 5,
        w: 80,
        h: 15,
        init: function() {
            this.row = 2 + Game.levelLimit(Hud.lv);
            this.total = 0;

            // Create an updatable brick array = number of bricks
            this.count = [this.row];
            for (var i = this.row; i--;) {
                this.count[i] = [this.col];
            }
        },

        draw: function() {
            var i, j;
            for (i = this.row; i--;) {
                for (j = this.col; j--;) {
                    // Test in case we shouldn't draw a brick
                    if (this.count[i][j] !== false) {
                        // Delete overlapping bricks if present
                        if (Ball.x >= this.x(j) &&
                            Ball.x <= (this.x(j) + this.w) &&
                            Ball.y >= this.y(i) &&
                            Ball.y <= (this.y(i) + this.h)) {
                            this.collide(i, j);
                            continue;
                        }

                        ctx.fillStyle = this.gradient(i);
                        ctx.fillRect(this.x(j), this.y(i), this.w, this.h);
                    }
                }
            }

            if (this.total === (this.row * this.col)) {
                Game.levelUp();
            }
        },

        x: function(row) {
            return (row * this.w) + (row * this.gap);
        },

        y: function(col) {
            return (col * this.h) + (col * this.gap);
        },

        collide: function(i, j) {
            Hud.score += 1;
            this.total += 1;
            this.count[i][j] = false;
            Ball.sy = -Ball.sy;
        },

        gradient: function(row) {
            switch(row) {
                case 0: // purple
                    return this.gradientPurple ?
                        this.gradientPurple :
                        this.gradientPurple = this.makeGradient(row, '#bd06f9', '#9604c7');
                case 1: // red
                    return this.gradientRed ?
                        this.gradientRed :
                        this.gradientRed = this.makeGradient(row, '#F9064A', '#c7043b');
                case 2: // green
                    return this.gradientGreen ?
                        this.gradientGreen :
                        this.gradientGreen = this.makeGradient(row, '#05fa15', '#04c711');
                default: // orange
                    return this.gradientOrange ?
                        this.gradientOrange :
                        this.gradientOrange = this.makeGradient(row, '#faa105', '#c77f04');
            }
        },

        makeGradient: function(row, color1, color2) {
            var y = this.y(row);
            var grad = ctx.createLinearGradient(0, y, 0, y + this.h);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);

            return grad;
        }
    };

    var Hud = {
        init: function() {
            this.lv = 1;
            this.score = 0;
        },

        draw: function() {
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('Score: ' + this.score, 5, Game.height - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Lv: ' + this.lv, Game.width - 5, Game.height - 5);
        }
    };

    /***************************
    Game Controllers
    ***************************/
    var Ctrl = {
        init: function() {
            // Browser based events
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
            window.addEventListener('mousemove', this.movePaddle, true);

            // Events exclusive to touch devices
            Game.canvas.addEventListener('touchstart', this.movePaddle, false);
            Game.canvas.addEventListener('touchmove', this.movePaddle, false);

            // Disable scrolling on touch devices for the Canvas element, but still keep click event emulation
            Game.canvas.addEventListener('touchmove', this.stopTouchScroll, false);
        },

        keyDown: function(event) {
            switch(event.keyCode) {
                case 39: // Left
                    Ctrl.left = true;
                    break;
                case 37: // Right
                    Ctrl.right = true;
                    break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 39: // Left
                    Ctrl.left = false;
                    break;
                case 37: // Right
                    Ctrl.right = false;
                    break;
                default:
                    break;
            }
        },

        // Prevents default scrolling on touch devices
        stopTouchScroll: function(event) {
            event.preventDefault();
        },

        movePaddle: function(event) {
            var mouseX = event.pageX;
            var canvasX = Game.canvas.offsetLeft;
            var paddleMid = Paddle.w / 2;

            if (mouseX > canvasX &&
                mouseX < canvasX + Game.width) {
                var newX = mouseX - canvasX;
                newX -= paddleMid;
                Paddle.x = newX;
            }
        }
    };

    /***************************
    Run Game
    ***************************/
    window.onload = function() {
        Game.setup();
    };
}());