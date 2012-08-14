/*
Name: SVG Aliens
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
*/

(function() {
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
            this.svg.addEventListener('click', this.runGame, false);
        },

        init: function() {
            // Setup initial objects
            Hud.init();
            Shield.init();
            Ufo.init();
            Ship.init();
            UfoBig.init();

            if (!this.play) {
                // NOTE: Don't use requestAnimationFrame, its meant for data that refreshes
                // the system's window such as Canvas
                this.play = window.setInterval(Game.update, 20);
            }
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
            window.clearInterval(UfoBig.timer);
            window.clearInterval(Ufo.timer);

            this.elRemove('.shield .player .life .laser #flock #ufoShip #textScore #textLives');

            this.restart.setAttribute('style', 'display: inline');
            this.svg.addEventListener('click', this.restartGame, false);
        },

        elRemove: function(name) {
            // Loop through exploded string
            var items = name.split(' '), type, string, el;
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
        speed: 8,
        width: 2,
        height: 10,

        build: function(x, y, negative) {
            var el = document.createElementNS(Game.ns,'rect');

            // Determine laser direction
            if (negative) {
                el.setAttribute('class', 'laser negative');
            } else {
                el.setAttribute('class', 'laser');
            }

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
                            } else if (activeClass === 'ufoShip active') { // big ufo ship
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
            this.timer = window.setInterval(this.build, this.delay);
        },

        // Fires from window, no this
        build: function() {
            // create ufo ship element
            var el = document.createElementNS(Game.ns, 'image');
            el.setAttribute('id', 'ufoShip'); // Can be targeted by ID since only 1 will ever be present
            el.setAttribute('class', 'ufoShip active');
            el.setAttribute('x', UfoBig.x);
            el.setAttribute('y', UfoBig.y);
            el.setAttribute('width', UfoBig.width);
            el.setAttribute('height', UfoBig.height);
            el.setAttributeNS(Game.xlink, 'xlink:href', 'mothership.svg');
            Game.svg.appendChild(el);
        },

        update: function() {
            var el = document.getElementById('ufoShip');
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
            Hud.updateScore(30);
            Game.svg.removeChild(el);
        }
    };

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
            // Reset necessary values
            this.speed = 10;
            this.counter = 0;

            // Create ufos
            this.build();

            // ufos run on their own separate time gauge
            this.delay = 800 - (20 * Hud.level);

            if (this.timer)
                window.clearInterval(Ufo.timer);

            this.timer = window.setInterval(this.update, this.delay);
        },

        build: function() {
            // Create group for storing ufo array output
            var group = document.createElementNS(Game.ns, 'g');
            group.setAttribute('class', 'open');
            group.setAttribute('id', 'flock');

            // Loop through ufo array data you just created
            var col, el, imageA, imageB;
            for (var row = this.row; row--;) {
                for (col = this.col; col--;) {
                    // Setup the ufo's output
                    el = document.createElementNS(Game.ns, 'svg');
                    el.setAttribute('x', this.locX(col));
                    el.setAttribute('y', this.locY(row));
                    el.setAttribute('class', 'ufo active');
                    el.setAttribute('row', row);
                    el.setAttribute('col', col);
                    el.setAttribute('width', this.width);
                    el.setAttribute('height', this.height);
                    el.setAttribute('viewBox', '0 0 25 19'); // Controls viewport of individual ufo

                    imageA = document.createElementNS(Game.ns, 'path');
                    imageB = document.createElementNS(Game.ns, 'path');
                    imageA.setAttribute('d', this.pathA);
                    imageB.setAttribute('d', this.pathB);
                    imageA.setAttribute('class','anim1 ' + this.type(row));
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

        update: function() {
            var invs = document.getElementsByClassName('ufo');

            if (invs.length === 0) return;

            // Get the current flock data and set variables as necesasry
            var flockData = Ufo.flock.getBBox(),
            flockWidth = Math.round(flockData.width),
            flockHeight = Math.round(flockData.height),
            flockX = Math.round(flockData.x),
            flockY = Math.round(flockData.y),
            moveX = 0,
            moveY = 0;

            // Decide direction based upon current Ufo flock position
            if (flockWidth + flockX + Ufo.speed >= Game.width ||
                flockX + Ufo.speed <= 0) {
                moveY = Math.abs(Ufo.speed);
                Ufo.speed = Ufo.speed * -1; // reverse speed
            } else {
                moveX = Ufo.speed;
            }

            // Update all UFOs
            var newX, newY;
            for (var i = invs.length; i--;) {
                newX = parseInt(invs[i].getAttribute('x'), 10) + moveX;
                newY = parseInt(invs[i].getAttribute('y'), 10) + moveY;

                invs[i].setAttribute('x', newX);
                invs[i].setAttribute('y', newY);
            }

            // Return immediately if UFOs have pushed too far
            if (flockY + flockHeight >= Shield.y) {
                return Game.endGame(); // Exit everything and shut down the game
            }

            Ufo.animate();
            Ufo.shoot(invs, flockY + flockHeight - Ufo.height);
        },

        animate: function() {
            if (this.flock.getAttribute('class') === 'open') {
                this.flock.setAttribute('class','closed');
            } else {
                this.flock.setAttribute('class','open');
            }
        },

        shoot: function(invs, lastRowY) {
            // Test a random number to see if the ufos fire
            if (Math.floor(Math.random() * 5) !== 1) return;

            // Get invaders only from the last row
            var stack = [], currentY;
            for (var i = invs.length; i--;) {
                currentY = parseInt(invs[i].getAttribute('y'), 10);
                if (currentY >= lastRowY)
                    stack.push(invs[i]);
            }

            // Choose a random invader from the stack and shoot from it
            var invRandom = Math.floor(Math.random() * stack.length);
            Laser.build(parseInt(stack[invRandom].getAttribute('x'), 10) + (this.width / 2), lastRowY + this.height + 10, false);
        },

        collide: function(el) {
            Hud.updateScore(1);
            Hud.levelUp();
            el.parentNode.removeChild(el);
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
            var x;
            for (var life = 0; life < Hud.lives; life++) {
                x = this.livesX + (Ship.width * life) + (this.livesGap * life);
                Ship.build(x, this.livesY, 'life');
            }

            // Text creation
            this.build('Lives:', 310, 30, 'textLives');
            this.build('Score: 0', 20, 30, 'textScore');

            // Store lives
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

        updateScore: function(pts) {
            // Update scores
            this.score += pts;
            this.bonus += pts;

            // Inject new score text
            var el = document.getElementById('textScore');
            el.replaceChild(document.createTextNode('Score: ' + this.score), el.firstChild);

            // Add new life if necessary
            if (this.bonus < 100 || this.lives === 3) return;

            // Add an extra life
            var x = this.livesX + (Ship.width * this.lives) + (this.livesGap * this.lives);
            Ship.build(x, this.livesY, 'life');
            this.lives += 1;
            this.bonus = 0;
        },

        levelUp: function() {
            // count ufo kills
            Ufo.counter += 1;
            var invTotal = Ufo.col * Ufo.row;

            // Test to level
            if (Ufo.counter === invTotal) {
                this.level += 1;
                Ufo.counter = 0;

                window.clearInterval(Ufo.timer);
                Game.svg.removeChild(Ufo.flock);

                // Wait a brief moment to spawn next wave
                setTimeout(function() {
                    Ufo.init();
                }, 300);

            } else if (Ufo.counter === Math.round(invTotal / 2)) { // Increase ufo speed
                Ufo.delay -= 250;

                window.clearInterval(Ufo.timer);
                Ufo.timer = window.setInterval(Ufo.update, Ufo.delay);
            } else if (Ufo.counter === (Ufo.col * Ufo.row) - 3) {
                Ufo.delay -= 300;

                window.clearInterval(Ufo.timer);
                Ufo.timer = window.setInterval(Ufo.update, Ufo.delay);
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
}());