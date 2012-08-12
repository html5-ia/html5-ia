/*
Name: SVG Aliens
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
*/

/**
 * @todo Re-enable self-executing function
 */
//(function() {
    /********
    Animation Functions
    ********/
    // How to figure out what a user's computer can handle for frames with fallbacks
    // Original by Paul Irish: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // Clear interval version here created by Jerome Etienne http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html
    window.cancelRequestAnimFrame = ( function() {
        return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelAnimationFrame              ||
        window.oCancelRequestAnimationFrame         ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
    })();

    window.requestAnimFrame = (function(){
        return window.requestAnimationFrame         ||
        window.webkitRequestAnimationFrame          ||
        window.mozRequestAnimationFrame             ||
        window.oRequestAnimationFrame               ||
        window.msRequestAnimationFrame              ||
        function(/* function */ callback, /* DOMElement */ element){
            return window.setTimeout(callback, 1000 / 60);
        };
    })();

    // From "A better setTimeout() / setInterval()" by Joe Lambert
    // Makes intervals run in unison with request anmation frame
    // http://blog.joelambert.co.uk/2011/06/01/a-better-settimeoutsetinterval/
    window.requestInterval = function(fn, delay) {
        if( !window.requestAnimationFrame   &&
        !window.webkitRequestAnimationFrame &&
        !window.mozRequestAnimationFrame    &&
        !window.oRequestAnimationFrame      &&
        !window.msRequestAnimationFrame)
        return window.setInterval(fn, delay);

        var start = new Date().getTime(),
        handle = new Object();

        function loop() {
                var current = new Date().getTime(),
                delta = current - start;

                if(delta >= delay) {
                        fn.call();
                        start = new Date().getTime();
                }

                handle.value = requestAnimFrame(loop);
        };

        handle.value = requestAnimFrame(loop);
        return handle;
    }

    window.clearRequestInterval = function(handle) {
        window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
        window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) :
        window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
        window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
        window.msCancelRequestAnimationFrame ? msCancelRequestAnimationFrame(handle.value) :
        clearInterval(handle);
    };

    /********
    Setup
    ********/
    var Game = {
        // organize random vars a bit better
        svg: document.getElementById('svg'),
        welcome: document.getElementById('screenWelcome'),
        restart: document.getElementById('screenGameover'),
        support: document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1"),
        width: 500,
        height: 500,
        ns: 'http://www.w3.org/2000/svg',
        xlink: 'http://www.w3.org/1999/xlink',

        run: function() {
            if (this.support && Boolean(window.chrome)) {
                this.svg.addEventListener('click', this.runGame, false);
            } else if (this.support) {
                alert('This game is specifically designed for the latest version of Google Chrome. You may proceed, but no gurantee that everything will run smoothly.');
                this.svg.addEventListener('click', this.runGame, false);
            } else {
                alert('Your browser doesn\'t support SVG, please download Google Chrome on a desktop.');
            }
        },

        init: function() {
            // Setup initial objects
            Hud.init();
            Shield.init();
            Ufo.init();
            Ship.init();
            UfoBig.init();

            // Run animation only if this.play isn't set
            if (!this.play) this.animate();
        },

        animate: function() {
            // Self-referring object, so you must use Game instead of this to prevent a crash
            Game.update();
            Game.play = requestAnimFrame(Game.animate);
        },

        update: function() {
            Ship.update();
            UfoBig.update();
            Laser.update();
        },

        // Starts the game up after the user clicks start
        runGame: function() {
            // Update DOM
            Game.svg.removeEventListener('click', Game.runGame, false);
            Game.svg.removeChild(Game.welcome);

            // Fire controls and activate the game elements
            Ctrl.init();
            Game.init();
        },

        // Resets all the game data, should occure after clicking a game over screen
        restartGame: function() {
            // Update DOM
            Game.svg.removeEventListener('click', Game.restartGame, false);
            Game.restart.setAttribute('style', 'display: none');

            // Fire game
            Game.init();
        },

        endGame: function() {
            clearRequestInterval(UfoBig.timer);

            this.elRemove('.shield .player .life .laser #flock #invShip #textScore #textLives');

            this.restart.setAttribute('style', 'display: inline');
            this.svg.addEventListener('click', this.restartGame, false);
        },

        elRemove: function(name) {
            var items = name.split(' '),
            type,
            string,
            el;

            // Loop through exploded string
            for (var i = items.length; i--;) {
                type = items[i].charAt(0);
                string = items[i].slice(1);

                // Set element based upon class or id
                el = (type === '.') ?
                    document.getElementsByClassName(string) :
                    document.getElementById(string);

                // Remove depending upon class or id
                if (type === '.') {
                    while(el[0])
                        el[0].parentNode.removeChild(el[0]);
                } else {
                    if (typeof el === 'object' && el !== null)
                        this.svg.removeChild(el);
                }
            }
        }
    };

    /********
     Objects
    ********/
    var Shield = {
        x: 64,
        y: 390,
        hp: 3,
        size: 15, // Piece size

        init: function() {
            // Create a shield array to store the pieces
            for (var block = 4; block--;) {
                for (var piece = 8; piece--;) {
                    this.build(block, piece);
                }
            }
        },

        // Designed to build individual shield pieces based upon their location in an array
        build: function(loc, piece) {
            var x = this.x + (loc * this.x) + (loc * (this.size * 3));

            var el = document.createElementNS(Game.ns, 'rect');
            el.setAttribute('x', this.locX(piece, x));
            el.setAttribute('y', this.locY(piece));
            el.setAttribute('class', 'shield active');
            el.setAttribute('hp', this.hp);
            el.setAttribute('width', this.size);
            el.setAttribute('height', this.size);
            Game.svg.appendChild(el);
        },

        // Determines a shields location based upon passed data
        locX: function(piece, x) {
            switch(piece) {
                case 0: return x;
                case 1: return x;
                case 2: return x;
                case 3: return x + this.size;
                case 4: return x + this.size;
                case 5: return x + (this.size * 2);
                case 6: return x + (this.size * 2);
                case 7: return x + (this.size * 2);
            }
        },
        // Only needs one param as y coordinate is the same across all piece sections
        locY: function(piece) {
            switch(piece) {
                case 0: return this.y;
                case 1: return this.y + this.size;
                case 2: return this.y + (this.size * 2);
                case 3: return this.y;
                case 4: return this.y + this.size;
                case 5: return this.y;
                case 6: return this.y + this.size;
                case 7: return this.y + (this.size * 2);
            }
        },

        // Accepts a passed shield element and modifies its health
        collide: function(el) {
            // Get and modify the hp attribute
            var hp = parseInt(el.getAttribute('hp'), 10) - 1;

            // Determine what to do based upon the current HP
            switch(hp) {
                case 1: var opacity = 0.33; break;
                case 2: var opacity = 0.66; break;
                default: return Game.svg.removeChild(el); // Exits this function early
            }

            // Adjust attributes if the element wasn't deleted
            el.setAttribute('hp', hp);
            el.setAttribute('fill-opacity', opacity);
        }
    };

    var Laser = {
        speed: 6,
        width: 2,
        height: 10,

        build: function(x, y, negative) {
            var el = document.createElementNS(Game.ns,'rect');

            // Determine laser direction
            negative ?
                el.setAttribute('class', 'laser negative') :
                el.setAttribute('class', 'laser');

            el.setAttribute('x', x);
            el.setAttribute('y', y);
            el.setAttribute('width', this.width);
            el.setAttribute('height', this.height);
            Game.svg.appendChild(el);
        },

        update: function() {
            var lasers = document.getElementsByClassName('laser');

            if (lasers.length) {
                // Get all active items
                var active = document.getElementsByClassName('active');

                // Keep vars out of the loop
                var laserX, laserY, cur, num, activeClass, activeX, activeY, activeW, activeH;

                for (cur = lasers.length; cur--;) {
                    // collect vars for current laser object
                    laserX = parseInt(lasers[cur].getAttribute('x'), 10);
                    laserY = parseInt(lasers[cur].getAttribute('y'), 10);

                    // Remove laser if its out of bounds
                    if (laserY < 0 || laserY > Game.height) {
                        this.collide(lasers[cur]);
                        continue;
                    // Otherwise move it on the cartesian graph and update the y coordinate
                    } else {
                        laserY = this.direction(laserY, lasers[cur].getAttribute('class'));
                        lasers[cur].setAttribute('y', laserY);
                    }

                    // Check against active elements
                    for (num = active.length; num--;) {
                        if (active[num] === undefined) return; // Force exit in-case gameover fires while loop is running

                        // Get active element properties
                        activeX = parseInt(active[num].getAttribute('x'), 10) || Ship.x;
                        activeY = parseInt(active[num].getAttribute('y'), 10) || Ship.y;
                        activeW = parseInt(active[num].getAttribute('width'), 10) || Ship.width;
                        activeH = parseInt(active[num].getAttribute('height'), 10) || Ship.height;

                        // Laser and active element collision test
                        if (laserX + this.width >= activeX &&
                            laserX <= (activeX + activeW) &&
                            laserY + this.height >= activeY &&
                            laserY <= (activeY + activeH)) {

                            // Remove laser
                            this.collide(lasers[cur]);

                            // Use active's class to determine what was hit
                            activeClass = active[num].getAttribute('class');
                            if (activeClass === 'ufo active') { // regular minion
                                Ufo.collide(active[num]);
                            } else if (activeClass === 'shield active') { // shield
                                Shield.collide(active[num]);
                            } else if (activeClass === 'invShip active') { // big ufo ship
                                UfoBig.collide(active[num]);
                            } else if (Ship.player[0]) { // Ship
                                Ship.collide();
                            }
                        }
                    }
                }
            }
        },

        direction: function(y, laserClass) {
            var speed = laserClass === 'laser negative' ? -this.speed : this.speed;
            return y += speed;
        },

        collide: function(laser) {
            if (laser !== undefined) Game.svg.removeChild(laser);
        }
    };

    var Ship = {
        width: 35,
        height: 12,
        speed: 3,
        // path only contains the shape, not the x and y information (limitation of SVG paths)
        path: 'm 0 15 l 9 5 h 17 l 9 -5 l -2 -5 l -10 3 l -6 -15 l -6 15 l -10 -3 l -2 5',

        init: function() {
            // Change player x and y to the default
            this.x = 220;
            this.y = 460;

            // Create the main player
            this.build(this.x, this.y, 'player active');
        },

        // We need to make the build function take parameters so its re-usable to draw lives
        build: function(x, y , shipClass) {
            var el = document.createElementNS(Game.ns,'path');

            var pathNew = 'M' + x + ' ' + (y + 8) + this.path;

            el.setAttribute('class', shipClass);
            el.setAttribute('d', pathNew);
            Game.svg.appendChild(el);

            // Store the player in memory for easy reference
            this.player = document.getElementsByClassName('player');
        },

        update: function() {
            // Move the ship if keyboard input is detected and the ship is against the container walls
            if (Ctrl.left && this.x >= 0) {
                this.x -= this.speed;
            } else if (Ctrl.right && this.x <= (Game.width - this.width)) {
                this.x += this.speed;
            }

            // Create a new path to implement the movement
            var pathNew = 'M' + this.x + ' ' + (this.y + 8) + this.path;
            // Doulbe check the player exists before trying to update it
            if (this.player[0]) this.player[0].setAttribute('d', pathNew);
        },

        collide: function() {
            Hud.lives -= 1;

            Game.svg.removeChild(this.player[0]);
            Game.svg.removeChild(this.lives[Hud.lives]);

            if (Hud.lives > 0) {
                // Recreates the player with a delay timer
                window.setTimeout(function() {
                    Ship.build(Ship.x, Ship.y, 'player active');
                }, 1000);
            } else {
                return Game.endGame();
            }
        }
    };

    var UfoBig = {
        width: 45,
        height: 20,
        x: -46,
        y: 50,
        speed: 1,
        delay: 30000,
        init: function() {
            // ufo ships have their own separate spawning timer
            this.timer = requestInterval(this.build, this.delay);
        },

        /**
         * @todo Change class name to something more accurate
         */
        // Fires from window, no this
        build: function() {
            // create ufo ship element
            var el = document.createElementNS(Game.ns, 'image');
            el.setAttribute('id', 'invShip'); // Can be targeted by ID since only 1 will ever be present
            el.setAttribute('class', 'invShip active');
            el.setAttribute('x', UfoBig.x);
            el.setAttribute('y', UfoBig.y);
            el.setAttribute('width', UfoBig.width);
            el.setAttribute('height', UfoBig.height);
            el.setAttributeNS(Game.xlink, 'xlink:href', 'mothership.svg');
            Game.svg.appendChild(el);
        },

        /**
         * @todo Logic kind of crappy re-write
         */
        update: function() {
            var el = document.getElementById('invShip');
            if (el) {
                var x = parseInt(el.getAttribute('x'), 10);

                if (x > Game.width) {
                    Game.svg.removeChild(el);
                } else {
                    el.setAttribute('x', x + this.speed);
                }
            }
        },

        collide: function(el) {
            Hud.update.score(30);
            Game.svg.removeChild(el);
        }
    };

    /**
     * @todo Left off here
     */
    var Ufo = {
        width: 25,
        height: 19,
        x: 64,
        y: 90,
        gap: 10,
        row: 5,
        col: 11,

        // ufo paths retrieved from Inkscape or Illustrator via SVG save
        pathA: 'M6.5,8.8c1.1,1.6,3.2,2.5,6.2,2.5c3.3,0,4.9-1.4,5.6-2.6c0.9-1.5,0.9-3.4,0.5-4.4c0,0,0,0,0,0 c0,0-1.9-3.4-6.5-3.4c-4.3,0-5.9,2.8-6.1,3.2l0,0C5.7,5.3,5.5,7.2,6.5,8.8z M19.2,4.4c0.4,1.2,0.4,2.9-0.4,4.6 c-0.6,1.3-2.5,3.6-6.1,3.6c-4.1,0-5.9-2.2-6.7-3.5C5.4,8,5.3,6.9,5.5,5.8C5.4,5.9,5.2,6,4.9,6C4.5,6,4.2,5.8,4.2,5.6 c0-0.2,0.3-0.3,0.7-0.3c0.3,0,0.6,0.1,0.6,0.3c0.1-0.5,0.2-0.9,0.4-1.3C2.4,5.6,0,7.4,0,10.1c0,4.2,5.5,7.6,12.4,7.6 c6.8,0,12.4-3.4,12.4-7.6C24.7,7.4,22.7,5.7,19.2,4.4z M6.9,13.9c-0.8,0-1.5-0.4-1.5-0.9c0-0.5,0.7-0.9,1.5-0.9 c0.8,0,1.5,0.4,1.5,0.9C8.4,13.5,7.7,13.9,6.9,13.9z M21.2,10.7c-0.7,0-1.3-0.3-1.3-0.7c0-0.4,0.6-0.7,1.3-0.7s1.3,0.3,1.3,0.7 C22.4,10.4,21.9,10.7,21.2,10.7z',
        pathB: 'M6.5,8.8c1.1,1.6,3.2,2.5,6.3,2.5c3.4,0,4.9-1.4,5.7-2.6c0.9-1.5,0.9-3.4,0.5-4.4c0,0,0,0,0,0 c0,0-1.9-3.4-6.5-3.4C8.1,1,6.5,3.7,6.3,4.1l0,0C5.8,5.3,5.5,7.2,6.5,8.8z M19.3,4.4c0.4,1.2,0.4,2.9-0.4,4.6 c-0.6,1.3-2.5,3.6-6.1,3.6c-4.1,0-5.9-2.2-6.8-3.5C5,7.5,5.4,5.6,5.9,4.3C2.4,5.6,0,7.4,0,10.1c0,4.2,5.6,7.6,12.4,7.6 c6.9,0,12.4-3.4,12.4-7.6C24.8,7.4,22.8,5.7,19.3,4.4z M3.5,9.2c-0.6,0-1.1-0.3-1.1-0.6C2.4,8.2,2.9,8,3.5,8 c0.6,0,1.1,0.3,1.1,0.6C4.6,8.9,4.2,9.2,3.5,9.2z M16.5,14.6c-0.9,0-1.7-0.4-1.7-0.9c0-0.5,0.8-0.9,1.7-0.9s1.7,0.4,1.7,0.9 C18.2,14.2,17.5,14.6,16.5,14.6z M20.2,5.6c-0.4,0-0.6-0.1-0.6-0.3c0-0.2,0.3-0.3,0.6-0.3c0.4,0,0.6,0.1,0.6,0.3 C20.8,5.5,20.5,5.6,20.2,5.6z',

        init: function() {
            /**
             * @todo ySpeed probably doesn't need to be set/reset like this or a param, just local to where its used
             */
            // Reset necessary values
            this.speed = 10;
            this.ySpeed = 0;
            this.counter = 0;

            // Create ufos
            this.build();

            // ufos run on their own separate time gauge
            // Delay dynamically changes so reset it
            this.delay = 800 - (20 * Hud.level);

            if (this.timer)
                clearRequestInterval(Ufo.timer);
            this.timer = requestInterval(this.update, this.delay); // Must use self since it fires from the global scale
        },

        build: function() {
            // Create group for storing ufo array output
            var group = document.createElementNS(Game.ns, 'g');
            group.setAttribute('class', 'open');
            group.setAttribute('id', 'flock');

            // Create the ufo array
            /**
             * @todo Reverse loop, fucked up arrays need fixing
             */
            var invArray = [this.row];
            for (var row = 0; row < this.row; row++) {
                invArray[row] = new Array(this.col);
            }

            // Loop through ufo array data you just created
            /**
             * @todo Fix vars in loop
             * @todo Reverse loops
             */
            for (var row = 0; row < this.row; row++) {
                for (var col=0; col < this.col; col++) {
                    // Setup the ufo's output
                    var el = document.createElementNS(Game.ns, 'svg');
                    el.setAttribute('x', this.locX(col));
                    el.setAttribute('y', this.locY(row));
                    el.setAttribute('class', 'ufo active');
                    el.setAttribute('row', row);
                    el.setAttribute('col', col);
                    el.setAttribute('width', this.width);
                    el.setAttribute('height', this.height);
                    el.setAttribute('viewBox', '0 0 25 19'); // Controls viewport of individual ufo

                    var imageA = document.createElementNS(Game.ns, 'path');
                    var imageB = document.createElementNS(Game.ns, 'path');
                    imageA.setAttribute('d', this.pathA);
                    imageA.setAttribute('class','anim1 ' + this.type(row));
                    imageB.setAttribute('d', this.pathB);
                    imageB.setAttribute('class','anim2 ' + this.type(row));
                    el.appendChild(imageA);
                    el.appendChild(imageB);

                    group.appendChild(el);
                }
            }

            // Add the created ufo flock to the DOM
            Game.svg.appendChild(group);

            // Store the ufo flock for manipulation later
            this.flock = document.getElementById('flock');
        },

        type: function(row) {
            switch(row) {
                case 0: return 'a';
                case 1: return 'b';
                case 2: return 'b';
                case 3: return 'c';
                case 4: return 'c';
            }
        },

        locX: function(col) {
            return this.x + (col * this.width) + (col * this.gap);
        },

        locY: function(row) {
            return this.y + (row * this.height) + (row * this.gap);
        },

        // Fired from DOM window, cannot use this
        update: function() {
            var invs = document.getElementsByClassName('ufo');

            /**
             * @todo this whole thing is a mess re-write it better
             */
            if (invs.length > 0) {
                // Find the first and last ufo in the flock
                var xFirst = Game.width;
                var xLast = 0;
                for (var count = 0; count < invs.length; count++) {
                    var x = parseInt(invs[count].getAttribute('x'));
                    xFirst = Math.min(xFirst, x);
                    xLast = Math.max(xLast, x);
                }

                // Set speed based upon first and last ufo results
                if ((xLast >= (Game.width - 20 - Ufo.width) &&
                    Ufo.ySpeed === 0) ||
                    (xFirst < 21 && Ufo.ySpeed === 0))
                        Ufo.ySpeed = Math.abs(Ufo.speed);
                else if ((xLast >= (Game.width - 20 - Ufo.width)) ||
                    (xFirst < 21) ||
                    Ufo.ySpeed > 0) {
                        Ufo.speed = -Ufo.speed;
                        Ufo.ySpeed = 0;
                }

                // Update ufo positions
                for (var count = 0; count < invs.length; count++) {
                    // Increment x and y counters
                    var x = parseInt(invs[count].getAttribute('x'));
                    var y = parseInt(invs[count].getAttribute('y'));
                    var xNew = x + Ufo.speed;
                    var yNew = y + Ufo.ySpeed;

                    // Set direction (left, right, down)
                    if (Ufo.ySpeed > 0) {
                        invs[count].setAttribute('y', yNew);
                    } else {
                        invs[count].setAttribute('x', xNew);
                    }

                    // Test if ufos have pushed far enough to beat the player
                    if (y > Shield.y - 20 - Ufo.height) {
                        return Game.endGame(); // Exit everything and shut down the game
                    }
                }

                Ufo.animate();
                Ufo.shoot(invs);
            }
        },

        /**
         * @todo Why var c? Seems useless
         */
        animate: function() {
            var c = this.flock.getAttribute('class');
            if (c == 'open') {
                this.flock.setAttribute('class','closed');
            } else {
                this.flock.setAttribute('class','open');
            }
        },

        /**
         * @todo Another mess, can this be made better
         */
        shoot: function(invs) {
            // Test a random number to see if the ufos fire
            var test = Math.floor(Math.random() * 5);

            if (test === 1) {
                // Choose a random ufo to fire
                var invRandom = Math.floor(Math.random() * invs.length);
                var invX = parseInt(invs[invRandom].getAttribute('x'));
                var y = 0;

                // Find current column and shoot with it
                for (var count = 0; count < invs.length; count++) {
                    var currentX = parseInt(invs[count].getAttribute('x'));

                    // If in the same column find the bottom most ufo
                    if (invX === currentX) {
                        var yVal = parseInt(invs[count].getAttribute('y'));
                        var y = Math.max(y, yVal);
                    }
                }

                // Shoot from bottom column
                Laser.build(invX + (this.width / 2), y + 20, false);
            }
        },

        /**
         * @todo why is it returning?
         */
        collide: function(el) {
            Hud.update.score(1);
            Hud.update.level();
            // Must call from parent due to flock structure
            return el.parentNode.removeChild(el);
        }
    };

    var Hud = {
        livesX: 360,
        livesY: 10,
        livesGap: 10,
        init: function() {
            this.score = 0;
            this.bonus = 0;
            this.lives = 3;
            this.level = 1;

            // Create life counter
            /**
             * @todo Reverse loop, or maybe not...
             */
            for (var life = 0; life < Hud.lives; life++) {
                var x = this.livesX + (Ship.width * life) + (this.livesGap * life);
                Ship.build(x, this.livesY, 'life');
            }

            // Text creation
            this.build('Lives:', 310, 30, 'textLives');
            this.build('Score: 0', 20, 30, 'textScore');

            // Store lives (throw them back into the ship to prevent confusion with naming)
            Ship.lives = document.getElementsByClassName('life');
        },

        // Creates text output
        build: function(text, x, y, classText) {
            var el = document.createElementNS(Game.ns, 'text');
            el.setAttribute('x', x);
            el.setAttribute('y', y);
            el.setAttribute('id', classText);
            el.appendChild(document.createTextNode(text));
            Game.svg.appendChild(el);
        },

        /**
         * @todo Update should be update.score and update.level should just be levelUp
         */
        update: {
            /**
             * @todo Include lifePlus logic where its reference here
             */
            score: function(pts) {
                // Update scores
                Hud.score += pts;
                Hud.bonus += pts;

                Hud.lifePlus();

                // Inject new score text
                el = document.getElementById('textScore');
                el.replaceChild(
                    document.createTextNode('Score: ' + Hud.score),
                    el.firstChild);
            },

            level: function() {
                // count ufo kills
                Ufo.counter += 1;
                var invTotal = Ufo.col * Ufo.row;

                // Test to level
                if (Ufo.counter === invTotal) {
                    Hud.level += 1;
                    Ufo.counter = 0;

                    clearRequestInterval(Ufo.timer);
                    Game.svg.removeChild(Ufo.flock);

                    // Wait a brief moment to spawn next wave
                    setTimeout(function() {
                        Ufo.init();
                    }, 300);

                } else if (Ufo.counter === Math.round(invTotal / 2)) { // Increase ufo speed
                    Ufo.delay -= 250;

                    clearRequestInterval(Ufo.timer);
                    Ufo.timer = requestInterval(Ufo.update, Ufo.delay);
                } else if (Ufo.counter === (Ufo.col * Ufo.row) - 3) {
                    Ufo.delay -= 300;

                    clearRequestInterval(Ufo.timer);
                    Ufo.timer = requestInterval(Ufo.update, Ufo.delay);
                }
            }
        },

        /**
         * @todo Remove else surrounding this.bonus = 0
         */
        lifePlus: function() {
            if (this.bonus >= 100) {
                // Add an extra life
                if (this.lives < 3) {
                    var x = this.livesX + (Ship.width * this.lives) + (this.livesGap * this.lives);
                    Ship.build(x, this.livesY, 'life');

                    this.lives += 1;
                    this.bonus = 0;
                } else { // Incase 3 lives are already present set the counter to 0
                    this.bonus = 0;
                }
            }
        }
    };

    /***************************
    Game Controllers
    ***************************/
    var Ctrl = {
        init: function() {
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
            window.addEventListener('mousemove', this.mouse, true);
            window.addEventListener('click', this.click, true);
        },

        keyDown: function(event) {
            switch(event.keyCode) {
                case 32: // Spacebar
                    var laser = document.getElementsByClassName('negative');
                    var player = document.getElementsByClassName('player');
                    if (!laser.length && player.length)
                        Laser.build(Ship.x + (Ship.width / 2) - Laser.width, Ship.y - Laser.height, true);
                    break;
                case 39: // Left
                    Ctrl.right = true;
                    break;
                case 37: // Right
                    Ctrl.left = true;
                    break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 39: // Left
                    Ctrl.right = false;
                    break;
                case 37: // Right
                    Ctrl.left = false;
                    break;
                default:
                    break;
            }
        },

        mouse: function(event) {
            var mouseX = event.pageX;
            var xNew = mouseX - Ship.xPrev + Ship.x;

            if (xNew > 0 && xNew < Game.width - Ship.width) {
                Ship.x = xNew;
            }

            Ship.xPrev = mouseX;
        },

        click: function(event) {
            var laser = document.getElementsByClassName('negative');
            var player = document.getElementsByClassName('player');

            if (event.button === 0 &&
                player.length &&
                !laser.length)
                Laser.build(Ship.x + (Ship.width / 2) - Laser.width, Ship.y - Laser.height, true);
        }
    };

    /***************************
     Execute the game
    ***************************/
    window.onload = function() {
        Game.run();
    };
//}());