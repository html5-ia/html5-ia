/*
Name: Space Invaders
Version: .4
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Publisher: Manning
*/

/********
Global variables and objects
********/
// Core elements
var svg = {};
var screen = {};
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
svg.support = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1");
if (svg.support){
        setup();
        svg.id.addEventListener('click', runGame, false);
}
else {
        alert('Your browser does not support SVG. Try using Google Chrome.');
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
        screen.welcome = document.getElementById('screenWelcome');
        screen.restart = document.getElementById('screenGameover');
        
        svg.id.removeEventListener('click', runGame, false);
        svg.id.removeChild(screen.welcome);
        
        control.keys();
        control.mouse();
        
        init();
}

function restartGame() {
        svg.id.removeEventListener('click', restartGame, false);
        screen.restart.setAttribute('style', 'display: none');
        
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
        
        timer.svg = setInterval(draw, 12);
        timer.rship = setInterval(rshipInit, 30000);
        timer.inv = setInterval(invDraw, inv.update);
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
        laser.speed = 5;
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
                                        else if ((x1 >= ship.x && x1 <= (ship.x + ship.w) && y1 >= ship.y && y1 <= (ship.y + ship.h)) && ship.player[0]) {
                                                svg.id.removeChild(lasers[n]);
                                                lifeDraw();
                                        }
                                        // else normal points and remove
                                        else {
                                                if (lasers[n] != null) svg.id.removeChild(lasers[n]);
                                                inv.flock.removeChild(collide[j]);
                                                scoreDraw(1);
                                                levelUp();
                                        }
                                }
                                // Check for ship
                                else if ((x1 >= ship.x && x1 <= (ship.x + ship.w) && y1 >= ship.y && y1 <= (ship.y + ship.h)) && ship.player[0]) {
                                        svg.id.removeChild(lasers[n]);
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
                                value = parseInt(invs[i].getAttribute('y'))
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

function textCreate(write,x,y,textName,color) {
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

function levelUp() {
        // count invader kills
        inv.counter += 1;
        invCount = inv.col * inv.row;
        
        // Test to level up or increase invader speed
        if (inv.counter === invCount) {
                hud.level += 1;
                inv.counter = 0;
                inv.update = 800 - (20 * hud.level);
                
                clearInterval(timer.inv);
                svg.id.removeChild(inv.flock);
                invInit();
                timer.inv = setInterval(invDraw, inv.update);
        }
        else if (inv.counter === Math.round(invCount / 2)) {
                inv.update -= 250;
                
                clearInterval(timer.inv);
                timer.inv = setInterval(invDraw, inv.update);
        }
        else if (inv.counter === (inv.col * inv.row) - 3) {
                inv.update -= 300;
                
                clearInterval(timer.inv);
                timer.inv = setInterval(invDraw, inv.update);
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
                setTimeout('gameOver()', 3000);
        } 
}

function scoreCount(pts) {
        hud.score += pts;
        hud.scoreLife += pts;
        
        // Add an extra life
        if (hud.scoreLife >= 100) {
                if (hud.lives < 3) {
                        x = ship.livesX + (ship.w * lives) + (ship.hud.livesGap * hud.lives);
                        shipCreate(x, ship.livesY, 'life');
                        
                        hud.lives += 1;
                        hud.scoreLife = 0;
                }
                else {
                        hud.scoreLife = 0;
                }
        }
}

function gameOver() {
        clearInterval(timer.rship);
        clearInterval(timer.inv);
        clearInterval(timer.svg);
        
        $('.shield, #redShip, .life, #flock, .player, #textScore, #textLives, .laserEvil, .laserGood').detach();

        screen.restart.setAttribute('style', 'display: inline');
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
// Works perfect for the adjustable screen size
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