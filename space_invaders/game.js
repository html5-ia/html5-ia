/*
Name: Space Invaders
Version: Beta .3
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Publisher: Manning
*/

/********
Variables
********/
// Default setup
var svg = {};
svg.id = document.getElementById('svg');
svg.width = 500;
svg.height = 500;
svg.support = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1");
svg.ns = 'http://www.w3.org/2000/svg';

var xlink = 'http://www.w3.org/1999/xlink'; 

// Screens
var welcome = document.getElementById('screenWelcome');
var restart = document.getElementById('screenGameover');

// Timers
var svgRun;
var rshipTimer;
var invTimer;

// Entities
var shield = {};
var laser = {};
laser.good = 'laserGood'; // A way to get rid of this?
laser.evil = 'laserEvil';
var ship = {};
var rship = {};
var inv = {};

// Text
var text = document.createElementNS(svg.ns,'text');
var score;
var scoreLife;
var lives;
var level;

// Controls
var keyL;
var keyR;


/********
Core Logic
********/
if (svg.support){      
        svg.id.addEventListener('click', runGame, false);
}
else {
        // IE 9 can't run some of the JS here, but it does run SVG so this won't prevent an error message there.
        alert('Your browser does not support SVG. Try using Google Chrome.');
}

function runGame() {
        svg.id.removeEventListener('click', runGame, false);
        svg.id.removeChild(welcome);
        
        init();
}

function restartGame() {
        svg.id.removeEventListener('click', restartGame, false);
        restart.setAttribute('style', 'display: none');
        
        init();
}

function init() {
        // Set these to prevent problems with the gameover
        score = 0;
        lives = 3;
        level = 1;
        inv.update = 800;
        inv.counter = 0;
        
        shieldInit();
        invInit();
        textInit();
        shipInit();
        svgRun = setInterval(draw, 12);
        rshipTimer = setInterval(rshipInit, 30000);
        invTimer = setInterval(invDraw, inv.update);
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
        shield.create.setAttribute('fill', '#33ff00');
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


// Laser
function laserInit(x, y, laserName) {
        laser.create = document.createElementNS(svg.ns,'rect'); // Resets element creation
        laser.speed = 5;
        laser.width = 2;
        laser.height = 10;
        
        laser.create.setAttribute('class', laserName + ' laser');
        laser.create.setAttribute('x', x);
        laser.create.setAttribute('y', y);
        laser.create.setAttribute('width', laser.width);
        laser.create.setAttribute('height', laser.height);
        laser.create.setAttribute('fill', '#ddd');
        svg.id.appendChild(laser.create);
        
        
}

// Where is the laser width and height in all this?
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
                                if (side == laser.evil + ' laser') y1 += laser.speed;
                                else y1 -= laser.speed;
                                lasers[n].setAttribute('y',y1);
                        }
                        
                        // Collision detection with laser
                        collide = document.getElementsByClassName('active');
                        for (j=0; j<collide.length; j++) {
                                x2 = parseInt(collide[j].getAttribute('x'));
                                y2 = parseInt(collide[j].getAttribute('y'));
                                width = parseInt(collide[j].getAttribute('width'));
                                height = parseInt(collide[j].getAttribute('height'));
                                
                                if (x1 >= x2 && x1 <= (x2 + width) && y1 >= y2 && y1 <= (y2 + height)) {
                                        objClass = collide[j].getAttribute('class');
                                        
                                        // test if shield
                                        if (objClass === 'shield active') {
                                                if (lasers.length) svg.id.removeChild(lasers[n]);
                                                hp = parseInt(collide[j].getAttribute('hp'));
                                                hp -= 1;
                                                
                                                if (hp > 0) {
                                                        switch(hp) {
                                                                case 1: opacity = .33; break;
                                                                case 2: opacity = .66; break;
                                                        }
                                                        
                                                        collide[j].setAttribute('hp', hp);
                                                        collide[j].setAttribute('fill-opacity', opacity);
                                                }
                                                else {
                                                        svg.id.removeChild(collide[j]);
                                                }
                                        }
                                        // test if redship
                                        else if (objClass === 'active') {
                                                if (lasers.length) svg.id.removeChild(lasers[n]);
                                                svg.id.removeChild(collide[j]);
                                                scoreDraw(10);
                                        }
                                        // else normal points and remove
                                        else {
                                                if (lasers.length) svg.id.removeChild(lasers[n]);
                                                svg.id.removeChild(collide[j]);
                                                scoreDraw(1);
                                                levelUp();
                                        }
                                }
                        }
                        
                        // Test if ship
                        if ((x1 >= ship.x && x1 <= (ship.x + ship.w) && y1 >= ship.y && y1 <= (ship.y + ship.h)) && ship.player[0]) {
                                svg.id.removeChild(lasers[n]);
                                lifeDraw();
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
        shipCreate(ship.x, ship.y, 'player');
        
        for (i=0; i<lives; i++) {
                x = ship.livesX + (ship.w * i) + (ship.livesGap * i);
                
                shipCreate(x, ship.livesY, 'life');
        }
        ship.lives = document.getElementsByClassName('life');
        ship.player = document.getElementsByClassName('player');
}

function shipDraw() {
        if (keyL && ship.x >= 0) {
                ship.x -= ship.speed;
        }
        else if (keyR && ship.x <= (svg.width - ship.w)) {
                ship.x += ship.speed;
        }
        
        ship.path = 'M' + ship.x + ' ' + (ship.y + 8) + 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0'; // No easy way to create a resizable ship equation
        if (ship.player[0]) ship.player[0].setAttribute('d', ship.path);
}

function shipCreate(x,y,shipName) {
        // Drawing this here gives you the flexibility to reuse it to redraw ships for lives
        ship.create = document.createElementNS('http://www.w3.org/2000/svg','path'); // Resets element creation
        ship.path = 'M' + x + ' ' + (y + 8) + 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0';
        
        ship.create.setAttribute('class', shipName);
        ship.create.setAttribute('d', ship.path);
        ship.create.setAttribute('fill', '#33ff00');
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
        rship.create.setAttributeNS(xlink,'xlink:href', 'redship.svg');
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
        inv.row = 5;
        inv.col = 11;
        inv.gap = 10;
        inv.w = 25;
        inv.h = 19;
        inv.x = 64;
        inv.y = 90;
        inv.speed = 10;
        inv.speedX = 0;
        inv.speedY = 0;
        
        // Creating the invader array
        invArray = new Array(inv.row);
        for (row=0; row<inv.row; row++) {
                invArray[row] = new Array(inv.col);
        }
        
        for (row=0; row<inv.row; row++) {
                for (col=0; col<inv.col; col++) {
                        inv.create = document.createElementNS(svg.ns,'image');
                        inv.create.setAttribute('x', invPosX(col));
                        inv.create.setAttribute('y', invPosY(row));
                        inv.create.setAttribute('class', 'invader active');
                        inv.create.setAttribute('row', row);
                        inv.create.setAttribute('col', col);
                        inv.create.setAttribute('width', inv.w);
                        inv.create.setAttribute('height', inv.h);
                        inv.create.setAttributeNS(xlink,'xlink:href', invImage(row));
                        svg.id.appendChild(inv.create);
                }
        }
}

function invDraw() {
        invFirstX = svg.width;
        invLastX = 0;
        
        invs = document.getElementsByClassName('invader');
        
        // Loop through invaders for first and last invader
        if (invs.length > 1) { 
                for (i=0; i<invs.length; i++) {
                        // Get first and last x value
                        x = parseInt(invs[i].getAttribute('x'));
                        
                        if (invFirstX > x) {
                                invFirstX = x;
                        }
                        else if (invLastX < x) {
                                invLastX = x;  
                        }
                }
        }
        // Extra test here makes sure that the first and laster invader test doesn't crash with one invader
        else {
                x = parseInt(invs[0].getAttribute('x'));
                invFirstX = x;
                invLastX = x;
        }
        
        // Set speed based upon loop results
        if ((invLastX >= (svg.width - 20 - inv.w) && inv.speedY === 0) || (invFirstX < 21 && inv.speedY === 0)) {
                inv.speedY = Math.abs(inv.speed);
        }
        else if ((invLastX >= (svg.width - 20 - inv.w)) || (invFirstX < 21) || inv.speedY > 0) {
                inv.speed = -inv.speed;
                inv.speedY = 0;
        }
        
        // Loop through and update invaders position + visual element with previous tests and loops from this function
        for (i=0; i<invs.length; i++) {
                x = parseInt(invs[i].getAttribute('x'));
                y = parseInt(invs[i].getAttribute('y'));
                img = invs[i].getAttribute('xlink:href');
                
                newX = x + inv.speed;
                newY = y + inv.speedY;
                
                // Cycle speed
                if (inv.speedY > 0) {
                        invs[i].setAttribute('y',newY);
                }
                else {
                        invs[i].setAttribute('x',newX);
                }
                
                // Cycle animation
                img = invImageChange(img);
                invs[i].setAttribute('xlink:href',img);
                
                // Game over test
                if (y > shield.y - 20 - inv.h) {
                        return setTimeout('gameOver()', 2000); // Exit everything and shut down the game
                }
        }

        invShoot();
}

function invImage(row) {
        switch(row) {
                case 0: return 'invader1a.svg'; break;
                case 1: return 'invader2a.svg'; break;
                case 2: return 'invader2a.svg'; break;
                case 3: return 'invader3a.svg'; break;
                case 4: return 'invader3a.svg'; break;
        }
}

function invImageChange(image) {
        switch(image) {
                case 'invader1a.svg': return 'invader1b.svg'; break;
                case 'invader1b.svg': return 'invader1a.svg'; break;
                case 'invader2a.svg': return 'invader2b.svg'; break;
                case 'invader2b.svg': return 'invader2a.svg'; break;
                case 'invader3a.svg': return 'invader3b.svg'; break;
                case 'invader3b.svg': return 'invader3a.svg'; break;
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
                        
                        // If in the same column find the bottom most invader
                        if (x1 === x2) {
                                y2 = parseInt(invs[i].getAttribute('y'));
                                
                                if (y2 > y1) {
                                        y1 = y2;
                                }
                        }
                }
                
                // Shoot from bottom column
                laserInit(x1 + (inv.w / 2), y1 + 20, laser.evil);
        }
}


// Text
function textInit() {
        score = 0;
        scoreLife = 0;
        
        textCreate('Lives:',310,30,'textLives');
        textCreate('Score: ' + score,20,30,'textScore');
}

function textCreate(write,x,y,textName,color) {
        text = document.createElementNS('http://www.w3.org/2000/svg','text');
        
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('id', textName);
        text.setAttribute('fill', '#ddd');
        text.setAttribute('style', 'font: bold 14px Arial, Helvetica');
        text.appendChild(document.createTextNode(write));
        svg.id.appendChild(text);
}

function scoreDraw(amount) {
        scoreCount(amount);
        element = document.getElementById('textScore');
        element.removeChild(element.firstChild);
        element.appendChild(document.createTextNode('Score: ' + score));
}

function levelUp() {
        // count invader kills
        inv.counter += 1;
        invCount = inv.col * inv.row;
        
        // Test to level up or increase invader speed
        if (inv.counter === invCount) {
                level += 1;
                inv.counter = 0;
                inv.update = 800 - (20 * level);
                
                clearInterval(invTimer);
                invInit();
                invTimer = setInterval(invDraw, inv.update);
        }
        else if (inv.counter === Math.round(invCount / 2)) {
                inv.update -= 250;
                
                clearInterval(invTimer);
                invTimer = setInterval(invDraw, inv.update);
        }
        else if (inv.counter === (inv.col * inv.row) - 3) {
                inv.update -= 300;
                
                clearInterval(invTimer);
                invTimer = setInterval(invDraw, inv.update);
        }
}

function lifeDraw() {
        lives -= 1;
        
        svg.id.removeChild(ship.player[0]);
        svg.id.removeChild(ship.lives[lives]);
        
        if (lives > 0) {
                setTimeout('shipCreate(ship.x, ship.y, \'player\')', 1000);
        }
        else {
                setTimeout('gameOver()', 3000);
        } 
}

function scoreCount(pts) {
        score += pts;
        scoreLife += pts;
        
        if (scoreLife >= 100) {
                if (lives < 3) {
                        x = ship.livesX + (ship.w * lives) + (ship.livesGap * lives);
                        shipCreate(x, ship.livesY, 'life'); // Add an extra life
                        
                        lives += 1;
                        scoreLife = 0;
                }
                else {
                        scoreLife = 0;
                }
        }
}

function gameOver() {
        clearInterval(rshipTimer);
        clearInterval(invTimer);
        clearInterval(svgRun);
        
        $('.shield, #redShip, .life, .invader, .player, #textScore, #textLives, .laserEvil, .laserGood').detach();

        restart.setAttribute('style', 'display: inline');
        svg.id.addEventListener('click', restartGame, false);
}

// Movement controls
$(document).keydown(function(evt) {
        if (evt.keyCode === 39) { // right arrow
                keyL = false;
                keyR = true;
        }
        else if (evt.keyCode === 37) { // left arrow
                keyL = true;
                keyR = false;
        }
        else if (evt.keyCode === 32 && (! $('.' + laser.good)[0])) { // If clicking and laser doesn't already exist
                laserInit(ship.x + (ship.w / 2), ship.y, laser.good);
        }
});

$(document).keyup(function(evt) {
        if (evt.keyCode === 39 || evt.keyCode === 37) {
                keyL = false;
                keyR = false;
        }
});

$('#container').mousemove(function(e){
        var svgPos = e.pageX;
        var shipM = ship.w / 2; // ship middle
        
        if (svgPos > shipM && svgPos < svg.width - shipM) {
                mouseX = svgPos;
                mouseX -= shipM;
                ship.x = mouseX;
        }
});

$('#svg').click(function(){
        if (! $('.' + laser.good)[0] && $('.player')[0]) {
                laserInit(ship.x + (ship.w / 2), ship.y, laser.good);
        }
});