/*
Name: SVG Invaders
Version: .4
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Publisher: Manning

Note: to see to-dos search note:
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
            this.svg.addEventListener('click', this.listen.start, false);
        } else if (this.support) {
            alert('This game is specifically designed for the latest version of Google Chrome. You may proceed, but no gurantee that everything will run smoothly.');
            this.svg.addEventListener('click', this.listen.start, false);
        } else {
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
        if (! this.play)
            this.animate();
    },
    
    animate: function() {
        // Self-referring object, so you must use Game instead of this to prevent a crash
        Game.update();
        Game.play = requestAnimFrame(Game.animate);
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
            Game.svg.removeChild(Game.welcome);
            
            // Fire controls and activate the game elements
            Ctrl.init();
            Game.init();
        },
        restart: function() {
            // Update DOM
            Game.svg.removeEventListener('click', Game.listen.restart, false);
            Game.restart.setAttribute('style', 'display: none');
            
            // Fire game
            Game.init();
        }
    },
    
    end: function() {
        clearRequestInterval(InvShip.timer);
        clearRequestInterval(Inv.timer);
        
        this.remove.elClass('shield player life laser');
        this.remove.elId('flock invShip textScore textLives');

        this.restart.setAttribute('style', 'display: inline');
        Game.svg.addEventListener('click', this.listen.restart, false);
    },
    
    remove: {
        elClass: function(name) {
            // Explode passed names
            var elAll = name.split(' ');
            
            // Loop through exploded string
            for (var count in elAll) {
                // Get elements and remove them until empty
                var el = document.getElementsByClassName(elAll[count]);
                while(el[0])
                    el[0].parentNode.removeChild(el[0]);
            }
        },
        elId: function(name) {
            var elAll = name.split(' ');
            
            for (var count in elAll) {
                var el = document.getElementById(elAll[count]);
                if (typeof el === 'object' && el != null)
                    Game.svg.removeChild(el);
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
    num: 4,
    p: 8, // Pieces
    pSize: 15, // Piece size
    
    init: function() {
        // Create a shield array to store the pieces
        this.shields = new Array(this.num);

        for (var block = 0; block < this.num; block++) {
            for (var piece = 0; piece < this.p; piece++) {
                this.build(block, piece);
            }
        }
    },
    
    // Designed to build individual shield pieces based upon their location in an array
    build: function(loc, piece) {
        var el = document.createElementNS(Game.ns,'rect');
        var x = this.x + (loc * this.x) + (loc * (this.pSize * 3));
        
        el.setAttribute('x', this.locX(piece, x));
        el.setAttribute('y', this.locY(piece));
        el.setAttribute('class', 'shield active');
        el.setAttribute('hp', this.hp);
        el.setAttribute('width', this.pSize);
        el.setAttribute('height', this.pSize);
        Game.svg.appendChild(el);
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
            for (var cur = 0; cur < lasers.length; cur++) {
                // collect vars for current laser object
                var laserX = parseInt(lasers[cur].getAttribute('x'));
                var laserY = parseInt(lasers[cur].getAttribute('y'));
                var laserClass = lasers[cur].getAttribute('class');
                
                // Remove laser if its out of bounds
                if (laserY < 0 || laserY > Game.height) {
                    Game.svg.removeChild(lasers[cur]);
                    continue; // Exit for loop and start next item, nothing left to do
                } else { // Otherwise move it on the cartesian graph and update the y coordinate
                    laserY = this.direction(laserY, laserClass);
                    lasers[cur].setAttribute('y', laserY);
                }
                
                // Check against active elements
                var active = document.getElementsByClassName('active');
                for (var num = 0; num < active.length; num++) {
                    // Get active element properties
                    var activeX = parseInt(active[num].getAttribute('x'));
                    var activeY = parseInt(active[num].getAttribute('y'));
                    var activeW = parseInt(active[num].getAttribute('width'));
                    var activeH = parseInt(active[num].getAttribute('height'));
                    
                    // Laser and active element collision test
                    if (laserX + this.width >= activeX &&
                        laserX <= (activeX + activeW) &&
                        laserY + this.height >= activeY &&
                        laserY <= (activeY + activeH)) {
                        
                        // Use active's class to determine what was hit
                        var activeClass = active[num].getAttribute('class');
                        if (activeClass === 'invader active') {
                            Inv.hit(active[num]);
                        } else if (activeClass === 'shield active') {
                            Shield.hit(active[num]);
                        } else { // invader ship
                            InvShip.hit(active[num]);
                        }
                        
                        // Remove laser
                        this.hit(lasers[cur]);
                    } else if ( // Separate check due to ships using paths instead of x/y
                        (laserX >= Ship.x && laserX <= (Ship.x + Ship.width) &&
                        laserY >= Ship.y &&
                        laserY <= (Ship.y + Ship.height)) &&
                        Ship.player[0]) {
                        Ship.hit();
                        this.hit(lasers[cur]);
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
    },
    
    hit: function(laser) {
        if (laser != null) Game.svg.removeChild(laser);
    }
};

var Ship = {
    width: 35,
    height: 15,
    speed: 3,
    // path only contains the shape, not the x and y information (limitation of SVG paths)
    path: 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0',
    
    init: function() {
        // Change player x and y to the default
        this.x = 220;
        this.y = 460;
        
        // Create the main player
        this.build(this.x, this.y, 'player active');
        
        // Store the lives and player in memory for easy reference
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
        if (Ctrl.left && this.x >= 0) {
            this.x -= this.speed;
        } else if (Ctrl.right &&
            this.x <= (Game.width - this.width)) {
            this.x += this.speed;
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
            setTimeout('Ship.build(Ship.x, Ship.y, \'player\')', 1000);
        } else {
            return Game.end();
        } 
    }
};

var InvShip = {
    width: 45,
    height: 20,
    x: -46,
    y: 50,
    speed: 1,
    delay: 30000,
    init: function() {
        // Invader ships have their own separate spawning timer
        this.timer = requestInterval(this.build, this.delay);
    },
    
    // Fires from window, no this
    build: function() {
        // create invader ship element
        var el = document.createElementNS(Game.ns, 'image');
        el.setAttribute('id', 'invShip'); // Can be targeted by ID since only 1 will ever be present
        el.setAttribute('class', 'invShip active');
        el.setAttribute('x', InvShip.x);
        el.setAttribute('y', InvShip.y);
        el.setAttribute('width', InvShip.width);
        el.setAttribute('height', InvShip.height);
        el.setAttributeNS(Game.xlink, 'xlink:href', 'redship.svg');
        Game.svg.appendChild(el);
        
        // Store for later use
        InvShip.el = document.getElementById('invShip');
    },
    
    update: function() {
        if (this.el) {
            var x = parseInt(this.el.getAttribute('x'));
            
            if (x > Game.width) {
                Game.svg.removeChild(this.el);
                this.el = null;
            } else
                this.el.setAttribute('x', x + this.speed);
        }
    },
    
    hit: function(el) {
        Hud.update.score(30);
        this.el = null;
        return Game.svg.removeChild(el);
    }
};

var Inv = {
    width: 25,
    height: 19,
    x: 64,
    y: 90,
    gap: 10,
    row: 5,
    col: 11,
    
    // Invader paths retrieved from Inkscape with SVG files saved from Adobe Illustrator
    // In Inkscape use the XML DOM view to get your path data
    // Download Inkscape now at http://inkscape.org/
    pathA1: 'M-0.174,18.136h2.437v-2.436h-2.437V18.136z M16.575,13.307h-2.395v-2.393h4.786V6.129h-2.305V3.87h-2.481    V1.431h-2.348v-2.437h-4.83v2.437H4.612V3.87H2.261v2.259h-2.349v4.786H4.61v2.349H2.259v2.438H4.61v2.348h2.438v-2.438H4.698 v-2.26h2.349v-2.438h4.697v2.438h2.392v2.304h-2.348v2.437h2.437v-2.348h2.352L16.575,13.307L16.575,13.307z M7.049,8.962H4.612 V6.525h2.438V8.962z M13.679,8.962h-2.438V6.525h2.438V8.962z M16.575,15.745v2.437h2.437v-2.437H16.575z',
    pathA2: 'M2.181,18.17h2.442V15.73H2.181V18.17z M2.236,13.286h-2.442v2.443h2.442V13.286z M14.275,18.215h2.44 v-2.441h-2.44V18.215L14.275,18.215z M19.018,10.932V6.136h-2.309V3.873h-2.487V1.429h-2.354V-1.01h-4.84v2.439H4.631v2.443     H2.279v2.264h-2.354v4.795h2.324v2.442h2.442v-2.441h9.525v2.441h2.354v2.397h2.438V13.33h-2.351v-2.398L19.018,10.932 L19.018,10.932z M7.073,8.973H4.631V6.534h2.442V8.973z M13.717,8.973h-2.439V6.534h2.439V8.973z',
    pathB1: 'M3.453,17.283h2.271V15.01H3.453V17.283z M5.724-0.901v2.273h2.272v-2.273H5.724z M23.909,17.283V15.01 h-2.271v2.273H23.909z M21.636-0.901h-2.272v2.273h2.272V-0.901z M23.909,1.373v4.545h-2.271V3.645h-2.273V1.373h-2.273v2.272 h-6.817V1.373H8.001v2.272H5.728v2.272H3.458V1.373H1.183v9.09h2.274v2.273h2.271v2.272h2.273v-2.272h11.366v2.272h2.272v-2.272 h2.271v-2.273h2.271v-9.09H23.909z M10.271,8.191H7.999V5.917h2.272V8.191z M19.364,8.191h-2.274V5.917h2.274V8.191z',
    pathB2: 'M21.636-0.901h-2.272v2.273h2.272V-0.901z M12.544,17.283V15.01H7.999v2.273H12.544z M5.724-0.901v2.273 h2.272v-2.273H5.724z M23.909,8.191V5.917h-2.271V3.645h-2.273V1.373h-2.273v2.272h-6.817V1.373H8.001v2.272H5.728v2.272H3.458     v2.274H1.183v6.817h2.274v-2.272h2.271v2.272h2.273v-2.272h11.366v2.272h2.272v-2.272h2.271v2.272h2.271V8.191H23.909z  M10.271,8.191H7.999V5.917h2.272V8.191z M19.364,8.191h-2.274V5.917h2.274V8.191z M14.817,17.283h4.546V15.01h-4.546V17.283z',
    pathC1: 'M25.313,16.102v-2.086h-2.086v2.086H25.313z M10.705,14.016h4.174v-2.09h-4.174V14.016z M0.274,16.102 H2.36v-2.086H0.274V16.102z M25.313,9.842v-6.26h-2.086V1.496h-6.26v-2.088H8.618v2.088h-6.26v2.086H0.272v6.26h6.26v2.086H2.358  v2.088h2.088v2.086h2.086v-2.086h2.086v-2.088h2.087V9.842h4.174v2.086h2.088v2.088h2.084v2.086h2.088v-2.086h2.088v-2.088 h-4.176V9.842H25.313z M10.705,7.756H6.532V5.668h4.173V7.756z M14.879,7.756V5.668h4.172v2.088H14.879z',
    pathC2: 'M10.705,13.994h4.174V11.91h-4.174V13.994z M25.313,9.82V3.561h-2.086V1.476h-6.26v-2.087H8.618v2.087     h-6.26v2.085H0.272V9.82h4.174v2.09H2.358v2.084h2.088v2.086h4.172v-2.086H6.532V11.91h4.173V9.82h4.174v2.09h4.172v2.084h-2.084 v2.086h4.172v-2.086h2.088V11.91h-2.088V9.82H25.313z M10.705,7.735H6.532V5.65h4.173V7.735z M19.051,7.735h-4.172V5.65h4.172 V7.735z',
    
    init: function() {
        // Reset necessary values
        this.speed = 10;
        this.ySpeed = 0;
        this.counter = 0;
        
        // Create invaders
        this.build();
        
        // Invaders run on their own separate time gauge
        this.delay = 800 - (20 * Hud.level); // Delay dynamically changes so reset it
        
        var self = this;
        this.timer = requestInterval(self.update, self.delay); // Must use self since it from the global scale
    },
    
    build: function() {        
        // Create group for storing invader array output
        var group = document.createElementNS(Game.ns, 'g');
        group.setAttribute('class','open');
        group.setAttribute('id','flock');
        
        // Create the invader array
        var invArray = new Array(this.row);
        for (var row = 0; row < this.row; row++) {
            invArray[row] = new Array(this.col);
        }
        
        // Loop through invader array data you just created
        for (var row = 0; row < this.row; row++) {
            for (var col=0; col < this.col; col++) {       
                // Setup the invader's output
                var el = document.createElementNS(Game.ns, 'svg');
                el.setAttribute('x', this.locX(col));
                el.setAttribute('y', this.locY(row));
                el.setAttribute('class', 'invader active');
                el.setAttribute('row', row);
                el.setAttribute('col', col);
                el.setAttribute('width', this.width);
                el.setAttribute('height', this.height);
                el.setAttribute('viewBox', this.offset(row) + ' 0 25 19'); // Controls viewport of individual invader
                
                var imageA = document.createElementNS(Game.ns, 'path');
                var imageB = document.createElementNS(Game.ns, 'path');
                imageA.setAttribute('d', this.path(row + 'a'));
                imageA.setAttribute('class','anim1');
                imageB.setAttribute('d', this.path(row + 'b'));
                imageB.setAttribute('class','anim2');
                el.appendChild(imageA);
                el.appendChild(imageB);
                
                group.appendChild(el);
            }
        }
        
        // Add the created invader flock to the DOM
        Game.svg.appendChild(group);
        
        // Store the invader flock for manipulation later
        this.flock = document.getElementById('flock');
    },
    
    locX: function(col) {
        return this.x + (col * this.width) + (col * this.gap);
    },
    
    locY: function(row) {
        return this.y + (row * this.height) + (row * this.gap);
    },
    
    offset: function(row) {
        // helps to fix graphical offset from animation
        switch(row) {
            case 0: return -3;
            case 1: return 1;
            case 2: return 1;
            default: return 0;
        }
    },
    
    path: function(row) {
        switch(row) {
            case '0a': return this.pathA1;
            case '0b': return this.pathA2;
            case '1a': return this.pathB1;
            case '1b': return this.pathB2;
            case '2a': return this.pathB1;
            case '2b': return this.pathB2; 
            case '3a': return this.pathC1; 
            case '3b': return this.pathC2; 
            case '4a': return this.pathC1;
            case '4b': return this.pathC2;
        }
    },
    
    // Fired from DOM window, cannot use this
    update: function() {
        var invs = document.getElementsByClassName('invader');
        
        if (invs.length > 0) {
            // Find the first and last invader in the flock
            var xFirst = Game.width;
            var xLast = 0;
            for (var count = 0; count < invs.length; count++) {
                var x = parseInt(invs[count].getAttribute('x'));
                xFirst = Math.min(xFirst, x);
                xLast = Math.max(xLast, x);
            }
            
            // Set speed based upon first and last invader results
            if ((xLast >= (Game.width - 20 - Inv.width) &&
                Inv.ySpeed === 0) ||
                (xFirst < 21 && Inv.ySpeed === 0))
                    Inv.ySpeed = Math.abs(Inv.speed);
            else if ((xLast >= (Game.width - 20 - Inv.width)) ||
                (xFirst < 21) ||
                Inv.ySpeed > 0) {
                    Inv.speed = -Inv.speed;
                    Inv.ySpeed = 0;
            }
            
            // Update invader positions
            for (var count = 0; count < invs.length; count++) {
                // Increment x and y counters
                var x = parseInt(invs[count].getAttribute('x'));
                var y = parseInt(invs[count].getAttribute('y'));
                var xNew = x + Inv.speed;
                var yNew = y + Inv.ySpeed;
                
                // Set direction (left, right, down)
                if (Inv.ySpeed > 0) {
                    invs[count].setAttribute('y', yNew);
                } else {
                    invs[count].setAttribute('x', xNew);
                }
                
                // Test if Invaders have pushed far enough to beat the player
                if (y > Shield.y - 20 - Inv.height) {
                    return Game.end(); // Exit everything and shut down the game
                }
            }
            
            Inv.animate();
            Inv.shoot(invs);
        }
    },
    
    animate: function() {
        var c = this.flock.getAttribute('class');
        if (c == 'open') {
            this.flock.setAttribute('class','closed');
        } else {
            this.flock.setAttribute('class','open');
        }
    },
    
    shoot: function(invs) {
        // Test a random number to see if the Invaders fire
        var test = Math.floor(Math.random() * 5);

        if (test === 1) {
            // Choose a random invader to fire
            var invRandom = Math.floor(Math.random() * invs.length);
            var invX = parseInt(invs[invRandom].getAttribute('x'));
            var y = 0;
            
            // Find current column and shoot with it
            for (var count = 0; count < invs.length; count++) {
                var currentX = parseInt(invs[count].getAttribute('x'));
                
                // If in the same column find the bottom most Invader
                if (invX === currentX) {
                    var yVal = parseInt(invs[count].getAttribute('y'));
                    var y = Math.max(y, yVal);
                }
            }
            
            // Shoot from bottom column
            Laser.build(invX + (this.width / 2), y + 20, false);
        }
    },
    
    hit: function(el) {
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
    
    update: {
        score: function(pts) {
            // Update scores
            Hud.score += pts;
            Hud.bonus += pts;
            
            Hud.lifePlus();
            
            // Inject new score text
            el.replaceChild(
                document.createTextNode('Score: ' + Hud.score),
                document.getElementById('textScore').firstChild);
        },
        level: function() {
            // count invader kills
            Inv.counter += 1;
            var invTotal = Inv.col * Inv.row;
            
            // Test to level
            if (Inv.counter === invTotal) {
                Hud.level += 1;
                Inv.counter = 0;
                                
                clearRequestInterval(Inv.timer);
                Game.svg.removeChild(Inv.flock);
                Inv.init();
            } else if (Inv.counter === Math.round(invTotal / 2)) { // Increase invader speed
                Inv.delay -= 250;
                
                clearRequestInterval(Inv.timer);
                Inv.timer = requestInterval(Inv.update, Inv.delay);
            } else if (Inv.counter === (Inv.col * Inv.row) - 3) {
                Inv.delay -= 300;
                
                clearRequestInterval(Inv.timer);
                Inv.timer = requestInterval(Inv.update, Inv.delay);
            }
        }
    },
    
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
        var player = document.getElementsByClassName('player')
        
        if (event.button === 0 &&
            ! laser.length &&
            player.length)
            Laser.build(Ship.x + (Ship.width / 2), Ship.y, true);
    }
};

/***************************
 Execute the game
***************************/
window.onload = function() {
    Game.run();  
};