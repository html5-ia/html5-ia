/*
Name: SVG Invaders
Version: .4
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Publisher: Manning

Note: to see to-dos and notes search note
*/

/********
Animation Functions
********/
// How to figure out what a user's computer can handle for frames with fallbacks
// Original by Paul Irish: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// Clear interval version here created by Jerome Etienne http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html
window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
    window.webkitCancelRequestAnimationFrame    ||
    window.mozCancelRequestAnimationFrame       ||
    window.oCancelRequestAnimationFrame         ||
    window.msCancelRequestAnimationFrame        ||
    clearTimeout
} )();

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
    support: document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1"),
    chrome: Boolean(window.chrome),
    width: svg.width,
    height: svg.height,
    ns: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    
    // Needs to be moved into the laser (probably removed completely)
    good: 'laserGood',
    evil: 'laserEvil',
    
    run: function() {
        if (this.support && this.chrome) {
            this.svg.addEventListener('click', this.listen.start, false);
        }
        else if (this.support) {
            alert('This game is specifically designed for the latest version of Google Chrome. You may proceed, but no gurantee that everything will run smoothly.');
            this.svg.addEventListener('click', this.listen.start, false);
        }
        else {
            alert('Your browser doesn\'t support SVG, please download Google Chrome on a desktop.');
        }
    },
    
    init: function() { 
        // Setup initial objects
        Hud.init();
        Shield.init();
        Inv.init();
        Ship.init();
        InvShip.init();
        
        // Run animation
        this.animate();
    },
    
    animate: function() {
        // Self-referring object, so you must use Game instead of this to prevent a crash
        Game.update();
        Game.timer = requestAnimFrame(Game.animate);
    },
    
    update: function() {
        Ship.update();
        InvShip.update();
        Laser.update();
    },
    
    // Must reference as Game instead of this due to when the listener is fired (outside of the object)
    listen: {
        // Literally starts the game up from after the user clicks to start
        start: function() {
            // Update DOM
            Game.svg.removeEventListener('click', Game.listen.start, false);
            Game.svg.removeChild(Screen.welcome);
            
            // Fire controls and activate the game elements
            Ctrl.init();
            Game.init();
        },
        restart: function() {
            // Update DOM
            Game.svg.removeEventListener('click', Game.listen.restart, false);
            Screen.restart.setAttribute('style', 'display: none');
            
            // Fire game
            Game.init();
        }
    },

    level: {

    },
    
    gameOver: function() {
        clearRequestInterval(InvShip.spawn, InvShip.delay);
        clearRequestInterval(Inv.update, Inv.delay);
        cancelRequestAnimFrame(Game.timer);
        
        $('.shield, #redShip, .life, #flock, .player, #textScore, #textLives, .laserEvil, .laserGood').detach();

        overlay.restart.setAttribute('style', 'display: inline');
        Game.svg.addEventListener('click', restartGame, false);
    }
};



/********
 Objects
********/
var Shield = {
    x: 64,
    y: 390,
    hp: 3,
    num: 4,
    p: 8, // Pieces
    pSize: 15, // Piece size
    
    init: function() {
        // Create a two tier shield array to store the pieces
        this.shields = new Array(this.num);
        for (i=0; i<this.num; i++) {
            this.shields[i] = new Array(this.p);
        }
        
        // Build the shields
        for (i=0; i<this.num; i++) {
            for (j=0; j<this.p; j++) {
                this.build(i,j);
            }
        }
    },
    
    // Designed to build individual shield pieces based upon their location in an array
    build: function(loc, piece) {
        var el = document.createElementNS(Game.ns,'rect');
        var x = this.x + (loc * this.x) + (loc * (this.pSize * 3));
        
        el.setAttribute('x', locX(piece, x));
        el.setAttribute('y', locY(piece));
        el.setAttribute('class', 'shield active');
        el.setAttribute('hp', this.hp);
        el.setAttribute('width', this.pSize);
        el.setAttribute('height', this.pSize);
        svg.id.appendChild(el);
    },
    
    // Determines a shields location based upon passed data
    locX: function(piece, x) {
        switch(piece) {
            case 0: return x;
            case 1: return x;
            case 2: return x;
            case 3: return x + this.pSize;
            case 4: return x + this.pSize;
            case 5: return x + (this.pSize * 2);
            case 6: return x + (this.pSize * 2);
            case 7: return x + (this.pSize * 2);
        }
    },
    // Only needs one param as y coordinate is the same across all piece sections
    locY: function(piece) {
        switch(piece) {
            case 0: return this.y;
            case 1: return this.y + this.pSize;
            case 2: return this.y + (this.pSize * 2);
            case 3: return this.y;
            case 4: return this.y + this.pSize;
            case 5: return this.y;
            case 6: return this.y + this.pSize;
            case 7: return this.y + (this.pSize * 2);
        }
    },
    
    // Accepts a passed shield element and modifies its helath
    hit: function(el) {
        // Get and modify the hp attribute
        var hp = parseInt(el.getAttribute('hp'));
        hp -= 1;
        
        // Determine what to do based upon the current HP
        switch(hp) {
            case 1: var opacity = .33; break;
            case 2: var opacity = .66; break;
            default: return Game.svg.removeChild(el); // Exits this function
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
        this.el = document.createElementNS(Game.ns,'rect');
        
        // Determine laser direction
        if (negative)
            this.el.setAttribute('class', 'laser negative');
        else
            this.el.setAttribute('class', 'laser');
        
        this.el.setAttribute('x', x);
        this.el.setAttribute('y', y);
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        Game.svg.appendChild(this.el);
    },
    
    update: function() {
        var lasers = document.getElementsByClassName('laser');
        
        if (lasers.length) {
            for (n = 0; n < lasers.length; n++) {
                // collect vars for current laser object
                var laserX = parseInt(lasers[n].getAttribute('x'));
                var laserY = parseInt(lasers[n].getAttribute('y'));
                var laserClass = lasers[n].getAttribute('class');
                
                // Remove laser if its out of bounds
                if (laserX < 0 || laserY > Game.height)
                    Game.svg.removeChild(lasers[n]);
                // Otherwise move it on the cartesian graph and update the y coordinate
                else {
                    laserY = this.direction(laserY, laserClass);
                    lasers[n].setAttribute('y', laserY);
                }
                
                // Check against active elements
                var active = document.getElementsByClassName('active');
                for (j=0; j < active.length; j++) {
                    // Get active element properties
                    activeX = parseInt(active[j].getAttribute('x'));
                    activeY = parseInt(active[j].getAttribute('y'));
                    activeW = parseInt(active[j].getAttribute('width'));
                    activeH = parseInt(active[j].getAttribute('height'));
                    
                    // Laser and active element collision test
                    if (laserX + activeW >= activeX &&
                        laserX <= (activeX + activeW) &&
                        laserY + this.height >= activeY &&
                        laserY <= (activeY + activeH)) {
                        
                        // Use active's class to determine what was hit
                        activeClass = active[j].getAttribute('class');
                        if (activeClass === 'shield active')
                            Shield.hit(active[j]);
                        else if (objClass === 'invShip active')
                            InvShip.hit(active[j]);
                        else { // hit an invader
                            Inv.hit(active[j]);
                        }
                        
                        // Remove laser
                        this.hit(lasers[n]);
                    }
                    // Note: Should see if this can't be integrated with the normal collision test
                    else if (
                        (laserX >= Ship.x && laserX <= (Ship.x + Ship.w) &&
                        laserY >= Ship.y &&
                        laserY <= (Ship.y + Ship.h)) &&
                        Ship.el[0]) {
                        
                        Player.hit();
                        this.hit(lasers[n]);
                    }
                }
            }
        }
    },
    
    direction: function(y, laserClass) {
        if (laserClass == 'laser negative')
            y -= this.speed;
        else
            y += this.speed;
        
        return y;
    }
    
    hit: function(laser) {
        if (laser != null) svg.id.removeChild(laser);
    }
};

var Ship = {
    width: 35,
    height: 15,
    speed: 3,
    // path only contains the shape, not the x and y information
    path: 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0',
    
    // Note: Move this block into the HUD init
    livesX: 360,
    livesY: 10,
    livesGap: 10,
    
    init: function() {
        // Change player x and y to the default
        this.x = 220;
        this.y = 460;
        
        // Create the main player
        this.build(this.x, this.y, 'player');
        
        // Note: move this crap into the HUD
        // Re-use the ship object to create a life counter
        for (i=0; i < Hud.lives; i++) {
            x = this.livesX + (this.width * i) + (this.livesGap * i);
            shipCreate(x, this.livesY, 'life');
        }
        
        // Store the lives and player in memory for easy reference
        this.lives = document.getElementsByClassName('life'); // Note, move to HUD
        this.player = document.getElementsByClassName('player');
    },
    
    // We need to make the build function take parameters so its re-usable to draw lives
    build: function(x, y , shipClass) {
        var el = document.createElementNS(Game.ns,'path');
        var pathNew = 'M' + x + ' ' + (y + 8) + this.path;
        
        el.setAttribute('class', shipClass);
        el.setAttribute('d', pathNew);
        Game.svg.appendChild(el);
    },
    
    update: function() {
        // Move the ship if keyboard input is detected and the ship is against the container walls
        if (Ctrl.keyLeft && this.x >= 0) {
            this.x -= this.speed;
        }
        else if (Ctrl.keyRight &&
            this.x <= (Game.svg.width - this.w)) {
            ship.x += ship.speed;
        }
        
        // Create a new path to implement the movement
        var pathNew = 'M' + this.x + ' ' + (this.y + 8) + this.path;
        // Doulbe check the player exists before trying to update it
        if (this.player[0]) this.player[0].setAttribute('d', pathNew);
    },
    
    hit: function() {
        Hud.lives -= 1;
        
        Game.svg.removeChild(this.player[0]);
        Game.svg.removeChild(this.lives[Hud.lives]);
        
        if (Hud.lives > 0) {
            // Recreates the player with a delay timer
            setTimeout('Ship.build(ship.x, ship.y, \'player\')', 1000);
        }
        else {
            return gameOver();
        } 
    }
};

var InvShip = {
    width: 45,
    height: 20,
    x: -this.width,
    y: 50,
    speed: 1,
    delay: 30000,
    init: function() {
        // Invader ships have their own separate spawning timer
        this.timer = requestInterval(this.spawn, this.delay);
    },
    
    build: function() {
        // create invader ship element
        var el = document.createElementNS(Game.ns, 'image');
        el.setAttribute('id', 'invShip'); // Can be targeted by ID since only 1 will ever be present
        el.setAttribute('class', 'active');
        el.setAttribute('x', this.x);
        el.setAttribute('y', this.y);
        el.setAttribute('width', this.width);
        el.setAttribute('height', this.height);
        el.setAttributeNS(Game.xlink, 'xlink:href', 'redship.svg');
        Game.svg.appendChild(el);
    },
    
    update: function() {
        // Get ship in DOM
        el = document.getElementById('invShip');
        
        if (el) {
            var x = parseInt(el.getAttribute('x'));
            
            if (x > Game.width)
                Game.svg.removeChild(el);
            else
                Game.svg.setAttribute('x', x + this.speed);
        }
    }
};

var Inv = {
    width: 25,
    height: 19,
    x: 64,
    y: 90,
    gap: 10,
    
    // Invader paths retrieved from Inkscape with SVG files saved from Adobe Illustrator
    // In Inkscape use the XML DOM view to get your path data
    // Download Inkscape now at http://inkscape.org/
    pathA1 = 'M-0.174,18.136h2.437v-2.436h-2.437V18.136z M16.575,13.307h-2.395v-2.393h4.786V6.129h-2.305V3.87h-2.481    V1.431h-2.348v-2.437h-4.83v2.437H4.612V3.87H2.261v2.259h-2.349v4.786H4.61v2.349H2.259v2.438H4.61v2.348h2.438v-2.438H4.698 v-2.26h2.349v-2.438h4.697v2.438h2.392v2.304h-2.348v2.437h2.437v-2.348h2.352L16.575,13.307L16.575,13.307z M7.049,8.962H4.612 V6.525h2.438V8.962z M13.679,8.962h-2.438V6.525h2.438V8.962z M16.575,15.745v2.437h2.437v-2.437H16.575z';
    pathA2 = 'M2.181,18.17h2.442V15.73H2.181V18.17z M2.236,13.286h-2.442v2.443h2.442V13.286z M14.275,18.215h2.44 v-2.441h-2.44V18.215L14.275,18.215z M19.018,10.932V6.136h-2.309V3.873h-2.487V1.429h-2.354V-1.01h-4.84v2.439H4.631v2.443     H2.279v2.264h-2.354v4.795h2.324v2.442h2.442v-2.441h9.525v2.441h2.354v2.397h2.438V13.33h-2.351v-2.398L19.018,10.932 L19.018,10.932z M7.073,8.973H4.631V6.534h2.442V8.973z M13.717,8.973h-2.439V6.534h2.439V8.973z';
    pathB1 = 'M3.453,17.283h2.271V15.01H3.453V17.283z M5.724-0.901v2.273h2.272v-2.273H5.724z M23.909,17.283V15.01 h-2.271v2.273H23.909z M21.636-0.901h-2.272v2.273h2.272V-0.901z M23.909,1.373v4.545h-2.271V3.645h-2.273V1.373h-2.273v2.272 h-6.817V1.373H8.001v2.272H5.728v2.272H3.458V1.373H1.183v9.09h2.274v2.273h2.271v2.272h2.273v-2.272h11.366v2.272h2.272v-2.272 h2.271v-2.273h2.271v-9.09H23.909z M10.271,8.191H7.999V5.917h2.272V8.191z M19.364,8.191h-2.274V5.917h2.274V8.191z';
    pathB2 = 'M21.636-0.901h-2.272v2.273h2.272V-0.901z M12.544,17.283V15.01H7.999v2.273H12.544z M5.724-0.901v2.273 h2.272v-2.273H5.724z M23.909,8.191V5.917h-2.271V3.645h-2.273V1.373h-2.273v2.272h-6.817V1.373H8.001v2.272H5.728v2.272H3.458     v2.274H1.183v6.817h2.274v-2.272h2.271v2.272h2.273v-2.272h11.366v2.272h2.272v-2.272h2.271v2.272h2.271V8.191H23.909z  M10.271,8.191H7.999V5.917h2.272V8.191z M19.364,8.191h-2.274V5.917h2.274V8.191z M14.817,17.283h4.546V15.01h-4.546V17.283z';
    pathC1 = 'M25.313,16.102v-2.086h-2.086v2.086H25.313z M10.705,14.016h4.174v-2.09h-4.174V14.016z M0.274,16.102 H2.36v-2.086H0.274V16.102z M25.313,9.842v-6.26h-2.086V1.496h-6.26v-2.088H8.618v2.088h-6.26v2.086H0.272v6.26h6.26v2.086H2.358  v2.088h2.088v2.086h2.086v-2.086h2.086v-2.088h2.087V9.842h4.174v2.086h2.088v2.088h2.084v2.086h2.088v-2.086h2.088v-2.088 h-4.176V9.842H25.313z M10.705,7.756H6.532V5.668h4.173V7.756z M14.879,7.756V5.668h4.172v2.088H14.879z';
    pathC2 = 'M10.705,13.994h4.174V11.91h-4.174V13.994z M25.313,9.82V3.561h-2.086V1.476h-6.26v-2.087H8.618v2.087     h-6.26v2.085H0.272V9.82h4.174v2.09H2.358v2.084h2.088v2.086h4.172v-2.086H6.532V11.91h4.173V9.82h4.174v2.09h4.172v2.084h-2.084 v2.086h4.172v-2.086h2.088V11.91h-2.088V9.82H25.313z M10.705,7.735H6.532V5.65h4.173V7.735z M19.051,7.735h-4.172V5.65h4.172 V7.735z';
    
    init: function() {
        // Reset necessary values
        this.row = 5;
        this.col = 11;
        this.speed = 10;
        this.counter = 0;
        
        // Invaders run on their own separate time gauge
        this.delay = 800; // Delay dynamically changes so reset it
        this.timer = requestInterval(this.update, this.delay);
    },
    
    build: function() {
        
    },
    
    hit: function(el) {
        svg.id.removeChild(collide[j]);
        scoreDraw(10);
    }
};

var Screen = {
    welcome: document.getElementById('screenWelcome'),
    restart: document.getElementById('screenGameover')
};

var Hud = {
    init: function() {
        this.score = 0;
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
    
    mouse: function(event) {
        var canvas = Game.canvas;
        var mouseX = event.pageX;
        var canvasX = canvas.offsetLeft;
        var paddleMid = Paddle.w / 2;
        
        if (mouseX - paddleMid > canvasX && mouseX + paddleMid < canvasX + canvas.width) {
            var newX = mouseX - canvasX;
            newX -= paddleMid;
            Paddle.x = newX;
        }
    }
};

/***************************
 Execute the game
***************************/
window.onload = function() {
    Game.run();  
};

/********
Previous Code (re-factoring)
********/

/********
Global variables and objects
********/
// Core elements
var svg = {};
var overlay = {};
var timer = {};
var hud = {};
var control = {};

// Entities
var shield = {};
var laser = {};
var ship = {};
var rship = {};
var inv = {};


/********
Core Logic
********/
/* Check if the browser can run the game */
window.onload = function() {
        svg.support = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1");
        svg.chrome = Boolean(window.chrome);
        if (svg.support && svg.chrome){
                setup();
                svg.id.addEventListener('click', runGame, false);
        }
        else if (svg.support){
                alert('This game is specifically designed for the latest version of Google Chrome. You may proceed, but no gurantee that everything will run smoothly.');
                setup();
                svg.id.addEventListener('click', runGame, false);
        }
        else {
                alert('Your browser doesn\'t support SVG, please download Google Chrome.');
        }
}

/* Store variables here that stay consistent throughout the game. Makes them easy to reference in multiple places. */
function setup() {
        svg.id = document.getElementById('svg');
        svg.width = svg.height = 500;
        svg.ns = 'http://www.w3.org/2000/svg';
        svg.xlink = 'http://www.w3.org/1999/xlink';
        
        laser.good = 'laserGood';
        laser.evil = 'laserEvil';
}

function runGame() {
        overlay.welcome = document.getElementById('screenWelcome');
        overlay.restart = document.getElementById('screenGameover');
        
        svg.id.removeEventListener('click', runGame, false);
        svg.id.removeChild(overlay.welcome);
        
        control.keys();
        control.mouse();
        
        init();
}

function restartGame() {
        svg.id.removeEventListener('click', restartGame, false);
        overlay.restart.setAttribute('style', 'display: none');
        
        init();
}

function init() {
        // Set these to reset stats upon game over
        inv.update = 800;
        inv.counter = 0; 
        
        hudInit();
        shieldInit();
        invInit();
        shipInit();
        
        animate();
        timer.inv = requestInterval(invDraw, inv.update);
        timer.rship = requestInterval(rshipInit, 30000);
}

function animate() {
        draw();
        timer.svg = requestAnimFrame(animate);
}

function draw() {
        shipDraw();
        rshipDraw();
        laserDraw();
}


/********
Function Library
********/
// Shield
function shieldInit() {
        shield.x = 64;
        shield.y = 390;
        shield.hp = 3;
        shield.num = 4;
        shield.p = 8;
        shield.pSize = 15;
        
        // Create a shield array
        shieldArray = new Array(shield.num);
        for (i=0; i<shield.num; i++) {
                shieldArray[i] = new Array(shield.p);
        }
        
        // Build the shields
        for (i=0; i<shield.num; i++) {
                for (j=0; j<shield.p; j++) {
                        shieldBuild(i,j);
                }
        }
}

function shieldBuild(buildLoc, buildPiece) {
        shield.create = document.createElementNS(svg.ns,'rect');
        shield.pX = shield.x + (buildLoc * shield.x) + (buildLoc * (shield.pSize * 3));
        
        shieldBuildXY(buildPiece);
        
        shield.create.setAttribute('x', shield.pX);
        shield.create.setAttribute('y', shield.pY);
        shield.create.setAttribute('class', 'shield active');
        shield.create.setAttribute('hp', shield.hp);
        shield.create.setAttribute('width', shield.pSize);
        shield.create.setAttribute('height', shield.pSize);
        shield.create.setAttribute('fill-opacity', 1);
        svg.id.appendChild(shield.create);
}

function shieldBuildXY(piece) {
        switch(piece) {
                case 0: shield.pX = shield.pX; shield.pY = shield.y; break;
                case 1: shield.pX = shield.pX; shield.pY = shield.y + shield.pSize; break;
                case 2: shield.pX = shield.pX; shield.pY = shield.y + (shield.pSize * 2); break;
                case 3: shield.pX = shield.pX + shield.pSize; shield.pY = shield.y; break;
                case 4: shield.pX = shield.pX + shield.pSize; shield.pY = shield.y + shield.pSize; break;
                case 5: shield.pX = shield.pX + (shield.pSize * 2); shield.pY = shield.y; break;
                case 6: shield.pX = shield.pX + (shield.pSize * 2); shield.pY = shield.y + shield.pSize; break;
                case 7: shield.pX = shield.pX + (shield.pSize * 2); shield.pY = shield.y + (shield.pSize * 2); break;
        }
}

function shieldHit(piece) {
        hp = parseInt(piece.getAttribute('hp'));
        hp -= 1;
        
        switch(hp) {
                case 1: opacity = .33; break;
                case 2: opacity = .66; break;
                default: return svg.id.removeChild(piece);
        }
        
        piece.setAttribute('hp', hp);
        piece.setAttribute('fill-opacity', opacity);
}


// Laser
function laserInit(x, y, laserName) {
        laser.create = document.createElementNS(svg.ns,'rect');
        laser.speed = 6;
        laser.width = 2;
        laser.height = 10;
        
        laser.create.setAttribute('class', laserName + ' laser');
        laser.create.setAttribute('x', x);
        laser.create.setAttribute('y', y);
        laser.create.setAttribute('width', laser.width);
        laser.create.setAttribute('height', laser.height);
        svg.id.appendChild(laser.create);
}

function laserDraw() {
        lasers = document.getElementsByClassName('laser');
        
        if (lasers.length){
                for (n=0; n<lasers.length; n++) {
                        x1 = parseInt(lasers[n].getAttribute('x'));
                        y1 = parseInt(lasers[n].getAttribute('y'));
                        side = lasers[n].getAttribute('class');
                        
                        if (y1 < 0 || y1 > svg.height) {
                                svg.id.removeChild(lasers[n]);
                        }
                        else {
                                // Laser travels along
                                if (side == laser.evil + ' laser') y1 += laser.speed;
                                else y1 -= laser.speed;
                                lasers[n].setAttribute('y',y1);
                        }
                        
                        // Collision detection with laser
                        collide = document.getElementsByClassName('active');
                        for (j=0; j<collide.length; j++) {
                                // Get collision object properties
                                x2 = parseInt(collide[j].getAttribute('x'));
                                y2 = parseInt(collide[j].getAttribute('y'));
                                width = parseInt(collide[j].getAttribute('width'));
                                height = parseInt(collide[j].getAttribute('height'));
                                
                                if (x1 + laser.width >= x2 && x1 <= (x2 + width) && y1 + laser.height >= y2 && y1 <= (y2 + height)) {
                                        objClass = collide[j].getAttribute('class');
                                        
                                        // test if shield
                                        if (objClass === 'shield active') {
                                                if (lasers[n] != null) svg.id.removeChild(lasers[n]);
                                                shieldHit(collide[j]);
                                        }
                                        // test if redship
                                        else if (objClass === 'active') {
                                                if (lasers[n] != null) svg.id.removeChild(lasers[n]);
                                                svg.id.removeChild(collide[j]);
                                                scoreDraw(10);
                                        }
                                        // else normal points and remove
                                        else {
                                                if (lasers[n] != null) svg.id.removeChild(lasers[n]);
                                                inv.flock.removeChild(collide[j]);
                                                scoreDraw(1);
                                                levelUp();
                                        }
                                }
                                else if ((x1 >= ship.x && x1 <= (ship.x + ship.w) && y1 >= ship.y && y1 <= (ship.y + ship.h)) && ship.player[0]) {
                                                if (lasers[n] != null) svg.id.removeChild(lasers[n]);
                                                lifeDraw();
                                }
                        }
                } 
        }
}


// Ship
function shipInit() {
        ship.w = 35;
        ship.h = 15;
        ship.x = 220;
        ship.y = 460;
        ship.speed = 3;
        ship.livesX = 360;
        ship.livesY = 10;
        ship.livesGap = 10;
        ship.pathCreate = 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0';
        
        shipCreate(ship.x, ship.y, 'player');
        
        for (i=0; i<hud.lives; i++) {
                x = ship.livesX + (ship.w * i) + (ship.livesGap * i);
                
                shipCreate(x, ship.livesY, 'life');
        }
        ship.lives = document.getElementsByClassName('life');
        ship.player = document.getElementsByClassName('player');
}

function shipDraw() {
        if (control.keyL && ship.x >= 0) {
                ship.x -= ship.speed;
        }
        else if (control.keyR && ship.x <= (svg.width - ship.w)) {
                ship.x += ship.speed;
        }
        
        ship.path = 'M' + ship.x + ' ' + (ship.y + 8) + ship.pathCreate;
        if (ship.player[0]) ship.player[0].setAttribute('d', ship.path);
}

function shipCreate(x,y,shipName) {
        ship.create = document.createElementNS('http://www.w3.org/2000/svg','path');
        ship.path = 'M' + x + ' ' + (y + 8) + ship.pathCreate;
        
        ship.create.setAttribute('class', shipName);
        ship.create.setAttribute('d', ship.path);
        svg.id.appendChild(ship.create);
}


// Red Ship
function rshipInit() {
        rship.create = document.createElementNS(svg.ns,'image');
        rship.w = 45;
        rship.h = 20;
        rship.x = -rship.w;
        rship.y = 50;
        
        rship.create.setAttribute('id', 'redShip');
        rship.create.setAttribute('class', 'active');
        rship.create.setAttribute('x', rship.x);
        rship.create.setAttribute('y', rship.y);
        rship.create.setAttribute('width', rship.w);
        rship.create.setAttribute('height', rship.h);
        rship.create.setAttributeNS(svg.xlink,'xlink:href', 'redship.svg');
        svg.id.appendChild(rship.create);
}

function rshipDraw() {
        rship.id = document.getElementById('redShip');

        if (rship.id) {
                x = parseInt(rship.id.getAttribute('x'));
                
                if (x > svg.width) {                
                        svg.id.removeChild(rship.id);
                }
                else {
                        rship.id.setAttribute('x', x + 1);
                }
        }
}


// Invaders
function invInit() {
        inv.row = 5; // default 5
        inv.col = 11; // default 11
        inv.gap = 10;
        inv.w = 25;
        inv.h = 19;
        inv.x = 64;
        inv.y = 90;
        inv.speed = 10;
        inv.speedX = 0;
        inv.speedY = 0;
        inv.flock = 'flock';
        
        // Invader paths retrieved from Inkscape with SVG files saved from Adobe Illustrator
        // In Inkscape use the XML DOM view to get your path data
        // Download Inkscape now at http://inkscape.org/
        inv.a1 = 'M-0.174,18.136h2.437v-2.436h-2.437V18.136z M16.575,13.307h-2.395v-2.393h4.786V6.129h-2.305V3.87h-2.481    V1.431h-2.348v-2.437h-4.83v2.437H4.612V3.87H2.261v2.259h-2.349v4.786H4.61v2.349H2.259v2.438H4.61v2.348h2.438v-2.438H4.698 v-2.26h2.349v-2.438h4.697v2.438h2.392v2.304h-2.348v2.437h2.437v-2.348h2.352L16.575,13.307L16.575,13.307z M7.049,8.962H4.612 V6.525h2.438V8.962z M13.679,8.962h-2.438V6.525h2.438V8.962z M16.575,15.745v2.437h2.437v-2.437H16.575z';
        inv.a2 = 'M2.181,18.17h2.442V15.73H2.181V18.17z M2.236,13.286h-2.442v2.443h2.442V13.286z M14.275,18.215h2.44 v-2.441h-2.44V18.215L14.275,18.215z M19.018,10.932V6.136h-2.309V3.873h-2.487V1.429h-2.354V-1.01h-4.84v2.439H4.631v2.443     H2.279v2.264h-2.354v4.795h2.324v2.442h2.442v-2.441h9.525v2.441h2.354v2.397h2.438V13.33h-2.351v-2.398L19.018,10.932  L19.018,10.932z M7.073,8.973H4.631V6.534h2.442V8.973z M13.717,8.973h-2.439V6.534h2.439V8.973z';
        inv.b1 = 'M3.453,17.283h2.271V15.01H3.453V17.283z M5.724-0.901v2.273h2.272v-2.273H5.724z M23.909,17.283V15.01 h-2.271v2.273H23.909z M21.636-0.901h-2.272v2.273h2.272V-0.901z M23.909,1.373v4.545h-2.271V3.645h-2.273V1.373h-2.273v2.272     h-6.817V1.373H8.001v2.272H5.728v2.272H3.458V1.373H1.183v9.09h2.274v2.273h2.271v2.272h2.273v-2.272h11.366v2.272h2.272v-2.272 h2.271v-2.273h2.271v-9.09H23.909z M10.271,8.191H7.999V5.917h2.272V8.191z M19.364,8.191h-2.274V5.917h2.274V8.191z';
        inv.b2 = 'M21.636-0.901h-2.272v2.273h2.272V-0.901z M12.544,17.283V15.01H7.999v2.273H12.544z M5.724-0.901v2.273 h2.272v-2.273H5.724z M23.909,8.191V5.917h-2.271V3.645h-2.273V1.373h-2.273v2.272h-6.817V1.373H8.001v2.272H5.728v2.272H3.458     v2.274H1.183v6.817h2.274v-2.272h2.271v2.272h2.273v-2.272h11.366v2.272h2.272v-2.272h2.271v2.272h2.271V8.191H23.909z  M10.271,8.191H7.999V5.917h2.272V8.191z M19.364,8.191h-2.274V5.917h2.274V8.191z M14.817,17.283h4.546V15.01h-4.546V17.283z';
        inv.c1 = 'M25.313,16.102v-2.086h-2.086v2.086H25.313z M10.705,14.016h4.174v-2.09h-4.174V14.016z M0.274,16.102     H2.36v-2.086H0.274V16.102z M25.313,9.842v-6.26h-2.086V1.496h-6.26v-2.088H8.618v2.088h-6.26v2.086H0.272v6.26h6.26v2.086H2.358  v2.088h2.088v2.086h2.086v-2.086h2.086v-2.088h2.087V9.842h4.174v2.086h2.088v2.088h2.084v2.086h2.088v-2.086h2.088v-2.088     h-4.176V9.842H25.313z M10.705,7.756H6.532V5.668h4.173V7.756z M14.879,7.756V5.668h4.172v2.088H14.879z';
        inv.c2 = 'M10.705,13.994h4.174V11.91h-4.174V13.994z M25.313,9.82V3.561h-2.086V1.476h-6.26v-2.087H8.618v2.087     h-6.26v2.085H0.272V9.82h4.174v2.09H2.358v2.084h2.088v2.086h4.172v-2.086H6.532V11.91h4.173V9.82h4.174v2.09h4.172v2.084h-2.084     v2.086h4.172v-2.086h2.088V11.91h-2.088V9.82H25.313z M10.705,7.735H6.532V5.65h4.173V7.735z M19.051,7.735h-4.172V5.65h4.172     V7.735z';
        
        // Create group
        var group = document.createElementNS(svg.ns,'g');
        group.setAttribute('class','open');
        group.setAttribute('id','flock');
        
        // Creating the invader array
        invArray = new Array(inv.row);
        for (row=0; row<inv.row; row++) {
                invArray[row] = new Array(inv.col);
        }
        
        for (row=0; row<inv.row; row++) {
                for (col=0; col<inv.col; col++) {
                        inv.create = document.createElementNS(svg.ns,'svg');
                        inv.create.setAttribute('x', invPosX(col));
                        inv.create.setAttribute('y', invPosY(row));
                        inv.create.setAttribute('class', 'invader active');
                        inv.create.setAttribute('row', row);
                        inv.create.setAttribute('col', col);
                        inv.create.setAttribute('width', inv.w);
                        inv.create.setAttribute('height', inv.h);
                        inv.create.setAttribute('viewBox', invOffset(row) + ' 0 25 19');
                        
                        //inv.create.setAttributeNS(xlink,'xlink:href', invImage(row));
                        var invA = document.createElementNS(svg.ns,'path');
                        var invB = document.createElementNS(svg.ns,'path');
                        invA.setAttribute('d', invImage(row + 'a'));
                        invA.setAttribute('class','anim1');
                        invB.setAttribute('d', invImage(row + 'b'));
                        invB.setAttribute('class','anim2');
                        inv.create.appendChild(invA);
                        inv.create.appendChild(invB);
                        
                        group.appendChild(inv.create);
                }
        }
        
        svg.id.appendChild(group);
        inv.flock = document.getElementById('flock');
}

function invDraw() {
        invs = document.getElementsByClassName('invader');
        invFirstX = svg.width;
        invLastX = 0;
        
        // Loop through invaders for first and last invader
        if (invs.length >= 1) { 
                for (i=0; i<invs.length; i++) {
                        // Get first and last x value
                        x = parseInt(invs[i].getAttribute('x'));
                        invFirstX = Math.min(invFirstX,x);
                        invLastX = Math.max(invLastX,x);
                }
        }
        
        // Set speed based upon loop results
        if ((invLastX >= (svg.width - 20 - inv.w) && inv.speedY === 0) || (invFirstX < 21 && inv.speedY === 0)) {
                inv.speedY = Math.abs(inv.speed);
        }
        else if ((invLastX >= (svg.width - 20 - inv.w)) || (invFirstX < 21) || inv.speedY > 0) {
                inv.speed = -inv.speed;
                inv.speedY = 0;
        }
        
        // Loop through and update Invader's position
        for (i=0; i<invs.length; i++) {
                x = parseInt(invs[i].getAttribute('x'));
                y = parseInt(invs[i].getAttribute('y'));
                
                newX = x + inv.speed;
                newY = y + inv.speedY;
                
                // Set direction
                if (inv.speedY > 0) {
                        invs[i].setAttribute('y',newY);
                }
                else {
                        invs[i].setAttribute('x',newX);
                }
                
                // Test if Invaders have push up far enough to beat the player
                if (y > shield.y - 20 - inv.h) {
                        return gameOver(); // Exit everything and shut down the game
                }
        }
        invAnimate();
        invShoot();
}

// Fixes offset from Invader paths
function invOffset(row) {
        switch(row) {
                case 0: return -3;
                case 1: return 1;
                case 2: return 1;
                default: return 0;
        }
}

function invImage(row) {
        switch(row) {
                case 0 + 'a': return inv.a1;
                case 0 + 'b': return inv.a2;
                case 1 + 'a': return inv.b1;
                case 1 + 'b': return inv.b2;
                case 2 + 'a': return inv.b1;
                case 2 + 'b': return inv.b2; 
                case 3 + 'a': return inv.c1; 
                case 3 + 'b': return inv.c2; 
                case 4 + 'a': return inv.c1;
                case 4 + 'b': return inv.c2;
        }
}

// See CSS file for more info on how the animations are being flipped
function invAnimate() {
        var c = inv.flock.getAttribute('class');
        if (c == 'open') {
                inv.flock.setAttribute('class','closed');
        } else {
                inv.flock.setAttribute('class','open');
        }
}

function invPosX(row) {
        x = inv.x + (row * inv.w) + (row * inv.gap);
        return x;
}

function invPosY(col) {
        y = inv.y + (col * inv.h) + (col * inv.gap);
        return y;
}

function invShoot () {
        random = Math.floor(Math.random()*5);
        
        if (random === 1) {
                invRandom = Math.floor(Math.random()*invs.length);
                x1 = parseInt(invs[invRandom].getAttribute('x'));
                y1 = 0;
                
                // Determine column
                for (i=0; i<invs.length; i++) {
                        x2 = parseInt(invs[i].getAttribute('x'));
                        
                        // If in the same column find the bottom most Invader
                        if (x1 === x2) {
                                value = parseInt(invs[i].getAttribute('y'));
                                y = Math.max(y,value);
                        }
                }
                
                // Shoot from bottom column
                laserInit(x1 + (inv.w / 2), y + 20, laser.evil);
        }
}

function hudInit() {
        hud.lives = 3;
        hud.level = 1;
        hud.score = 0;
        hud.scoreLife = 0;
        
        textCreate('Lives:',310,30,'textLives');
        textCreate('Score: ' + hud.score,20,30,'textScore');
}

function textCreate(write,x,y,textName) {
        hud.text = document.createElementNS('http://www.w3.org/2000/svg','text');
        
        hud.text.setAttribute('x', x);
        hud.text.setAttribute('y', y);
        hud.text.setAttribute('id', textName);
        hud.text.appendChild(document.createTextNode(write));
        svg.id.appendChild(hud.text);
}

function scoreDraw(amount) {
        scoreCount(amount);
        element = document.getElementById('textScore');
        element.removeChild(element.firstChild);
        element.appendChild(document.createTextNode('Score: ' + hud.score));
}

function scoreCount(pts) {
        hud.score += pts;
        hud.scoreLife += pts;
        
        // Add an extra life
        if (hud.scoreLife >= 100) {
                if (hud.lives < 3) {
                        x = ship.livesX + (ship.w * hud.lives) + (ship.livesGap * hud.lives);
                        shipCreate(x, ship.livesY, 'life');
                        
                        hud.lives += 1;
                        hud.scoreLife = 0;
                }
                else {
                        hud.scoreLife = 0;
                }
        }
}

function levelUp() {
        // count invader kills
        inv.counter += 1;
        invCount = inv.col * inv.row;
        
        // Test to level up or increase invader speed
        if (inv.counter === invCount) {
                hud.level += 1;
                inv.counter = 0;
                inv.update = 800 - (20 * hud.level);
                
                clearRequestInterval(timer.inv);
                svg.id.removeChild(inv.flock);
                invInit();
                timer.inv = requestInterval(invDraw, inv.update);
        }
        else if (inv.counter === Math.round(invCount / 2)) {
                inv.update -= 250;
                
                clearRequestInterval(timer.inv);
                timer.inv = requestInterval(invDraw, inv.update);
        }
        else if (inv.counter === (inv.col * inv.row) - 3) {
                inv.update -= 300;
                
                clearRequestInterval(timer.inv);
                timer.inv = requestInterval(invDraw, inv.update);
        }
}

function lifeDraw() {
        hud.lives -= 1;
        
        svg.id.removeChild(ship.player[0]);
        svg.id.removeChild(ship.lives[hud.lives]);
        
        if (hud.lives > 0) {
                setTimeout('shipCreate(ship.x, ship.y, \'player\')', 1000);
        }
        else {
                return gameOver();
        } 
}

function gameOver() {
        clearRequestInterval(timer.rship);
        clearRequestInterval(timer.inv);
        cancelRequestAnimFrame(timer.svg);
        
        $('.shield, #redShip, .life, #flock, .player, #textScore, #textLives, .laserEvil, .laserGood').detach();

        overlay.restart.setAttribute('style', 'display: inline');
        svg.id.addEventListener('click', restartGame, false);
}

// Movement controls
control.keys = function() {
        control.keyL;
        control.keyR;
        
        $(document).keydown(function(evt) {
                if (evt.keyCode === 39) { // right arrow
                        control.keyL = false;
                        control.keyR = true;
                }
                else if (evt.keyCode === 37) { // left arrow
                        control.keyL = true;
                        control.keyR = false;
                }
                else if (evt.keyCode === 32 && (! $('.' + laser.good)[0])) { // If clicking and laser doesn't already exist
                        laserInit(ship.x + (ship.w / 2), ship.y, laser.good);
                }
        });
        
        $(document).keyup(function(evt) {
                if (evt.keyCode === 39 || evt.keyCode === 37) {
                        control.keyL = false;
                        control.keyR = false;
                }
        });
};

// Monitors positive or negative mouse movement and applies that to the ship's position
// Works very well for the adjustable screen size
control.mouse = function() {
        $('#svg').mousemove(function(e){
                ship.posNew = e.pageX - ship.posPrev + ship.x;
                
                if (ship.posNew > 0 && ship.posNew < svg.width - ship.w) {
                        ship.x = ship.posNew;
                }
                
                // Record previous x
                ship.posPrev = e.pageX;
        });
        
        $('#svg').click(function(){
                if (! $('.' + laser.good)[0] && $('.player')[0]) {
                        laserInit(ship.x + (ship.w / 2), ship.y, laser.good);
                }
        });
};
