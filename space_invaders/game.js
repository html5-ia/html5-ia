/*
Name: Space Invaders
Version: Beta .2
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Publisher: Manning
*/

/********
Variables
********/
// SVG
var svg = document.getElementById('svg');
var svgW = svg.getAttribute('width');
var svgH = svg.getAttribute('height');
var svgSupport = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1");
var svgNS = 'http://www.w3.org/2000/svg'; // SVG naming scheme
var xlink = 'http://www.w3.org/1999/xlink';

// Screens
var welcome = document.getElementById('screenWelcome');
var restart = document.getElementById('screenGameover');

// Timers
var svgRun;
var rshipTimer;
var invTimer;

// Shields
var shield = document.createElementNS(svgNS,'rect');
var shieldArray;
var shieldX;
var shieldY;
var shieldGap;
var shieldHp;
var shieldNum;
var shieldP;
var shieldPX;
var shieldPY;
var shieldPSize;

// Laser
var laser = document.createElementNS(svgNS,'rect');
var laserSpeed;
var laserCG = 'laserGood';
var laserCE = 'laserEvil';
var lasers;

// Ship
var ship = document.createElementNS(svgNS,'path');
var shipX;
var shipY;
var shipW;
var shipH;
var shipLives;
var shipLivesX;
var shipLivesY;
var shipLivesGap;
var shipPath;
var shipSpeed;
var shipPlayer;

// Red Ship
var rship = document.createElementNS(svgNS,'image');
var rshipW = 45;
var rshipH = 20;
var rshipElem;

// Invaders
var inv = document.createElementNS(svgNS,'image');
var invArray;
var invRow;
var invCol;
var invGap;
var invW;
var invH;
var invX;
var invY;
var invSpeed;
var invSpeedY;
var invSpeedX;
var invCounter;
var invUpdate;
var invs;

// Text
var text = document.createElementNS(svgNS,'text');
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
if (svgSupport){      
        svg.addEventListener('click', runGame, false);
}
else {
        // IE 9 can't run some of the JS here, but it does run SVG so this won't prevent an error message there.
        alert('Your browser does not support SVG. Try using Google Chrome.');
}

function runGame() {
        svg.removeEventListener('click', runGame, false);
        svg.removeChild(welcome);
        
        init();
}

function restartGame() {
        svg.removeEventListener('click', restartGame, false);
        restart.setAttribute('style', 'display: none');
        
        init();
}

function init() {
        // Set these to prevent problems with the gameover
        score = 0;
        lives = 3;
        level = 1;
        invUpdate = 800;
        invCounter = 0;
        
        shieldInit();
        invInit();
        textInit();
        shipInit();
        svgRun = setInterval(draw, 12);
        rshipTimer = setInterval(rshipInit, 30000);
        invTimer = setInterval(invDraw, invUpdate);
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
        // Set variables
        shieldX = 64;
        shieldY = 390;
        shieldHp = 3;
        shieldNum = 4;
        shieldP = 8;
        shieldPSize= 15;
        
        // Create a shield array
        shieldArray = new Array(shieldNum);
        for (i=0; i<shieldNum; i++) {
                shieldArray[i] = new Array(shieldP);
        }
        
        // Build the shields
        for (i=0; i<shieldNum; i++) {
                for (j=0; j<shieldP; j++) {
                        shieldBuild(i,j);
                }
        }
}

function shieldBuild(buildLoc, buildPiece) {
        shield = document.createElementNS('http://www.w3.org/2000/svg','rect');
        shieldPX = shieldX + (buildLoc * shieldX) + (buildLoc * (shieldPSize * 3));
        
        shieldBuildXY(buildPiece);
        
        shield.setAttribute('x', shieldPX);
        shield.setAttribute('y', shieldPY);
        shield.setAttribute('class', 'shield active');
        shield.setAttribute('hp', shieldHp);
        shield.setAttribute('width', shieldPSize);
        shield.setAttribute('height', shieldPSize);
        shield.setAttribute('fill', '#33ff00');
        shield.setAttribute('fill-opacity', 1);
        svg.appendChild(shield);
}

function shieldBuildXY(piece) {
        switch(piece) {
                case 0: shieldPX = shieldPX; shieldPY = shieldY; break;
                case 1: shieldPX = shieldPX; shieldPY = shieldY + shieldPSize; break;
                case 2: shieldPX = shieldPX; shieldPY = shieldY + (shieldPSize * 2); break;
                case 3: shieldPX = shieldPX + shieldPSize; shieldPY = shieldY; break;
                case 4: shieldPX = shieldPX + shieldPSize; shieldPY = shieldY + shieldPSize; break;
                case 5: shieldPX = shieldPX + (shieldPSize * 2); shieldPY = shieldY; break;
                case 6: shieldPX = shieldPX + (shieldPSize * 2); shieldPY = shieldY + shieldPSize; break;
                case 7: shieldPX = shieldPX + (shieldPSize * 2); shieldPY = shieldY + (shieldPSize * 2); break;
        }
}


// Laser
function laserInit(x, y, laserName) {     
        laserSpeed = 5;
        
        laser.setAttribute('class', laserName);
        laser.setAttribute('x', x);
        laser.setAttribute('y', y);
        laser.setAttribute('width', 2);
        laser.setAttribute('height', 10);
        laser.setAttribute('fill', '#ddd');
        svg.appendChild(laser);
        
        laser = document.createElementNS('http://www.w3.org/2000/svg','rect'); // Resets element creation
}

function laserDraw() {
        laserAnimate(laserCG,-laserSpeed);
        laserAnimate(laserCE,laserSpeed);
}

function laserAnimate(laserClass,speed) {
        lasers = document.getElementsByClassName(laserClass);
        
        if (lasers.length){
                for (n=0; n<lasers.length; n++) {
                        x1 = parseInt(lasers[n].getAttribute('x'));
                        y1 = parseInt(lasers[n].getAttribute('y'));
                        
                        if (y1 < 0 || y1 > svgH) {
                                svg.removeChild(lasers[n]);
                        }
                        else {
                                y1 += speed;
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
                                                if (lasers.length) svg.removeChild(lasers[n]);
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
                                                        svg.removeChild(collide[j]);
                                                }
                                        }
                                        // test if redship
                                        else if (objClass === 'active') {
                                                svg.removeChild(lasers[n]);
                                                svg.removeChild(collide[j]);
                                                scoreDraw(10);
                                        }
                                        // else normal points and remove
                                        else {
                                                svg.removeChild(lasers[n]);
                                                svg.removeChild(collide[j]);
                                                scoreDraw(1);
                                                levelUp();
                                        }
                                }
                        }
                        
                        // Test if ship
                        if ((x1 >= shipX && x1 <= (shipX + shipW) && y1 >= shipY && y1 <= (shipY + shipH)) && shipPlayer[0]) {
                                svg.removeChild(lasers[n]);
                                lifeDraw();
                        }
                } 
        }
}


// Ship
function shipInit() {
        shipW = 35;
        shipH = 15;
        shipX = 220;
        shipY = 460;
        shipSpeed = 3;
        shipLivesX = 360;
        shipLivesY = 10;
        shipLivesGap = 10;
        
        shipCreate(shipX, shipY, 'player');
        
        for (i=0; i<lives; i++) {
                x = shipLivesX + (shipW * i) + (shipLivesGap * i);
                
                shipCreate(x, shipLivesY, 'life');
        }
        
        shipPlayer = document.getElementsByClassName('player');
        shipLives = document.getElementsByClassName('life');
}

function shipDraw() {
        if (keyL && shipX <= (svgW - shipW)) {
                shipX += shipSpeed;
        }
        else if (keyR && shipX >= 0) { 
                shipX -= shipSpeed;
        }
        
        shipPath = 'M' + shipX + ' ' + (shipY + 8) + 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0'; // No easy way to create a resizable ship equation
        if (shipPlayer[0]) shipPlayer[0].setAttribute('d', shipPath);
}

function shipCreate(x,y,shipName) {
        // Drawing this here gives you the flexibility to reuse it to redraw ships for lives
        ship = document.createElementNS('http://www.w3.org/2000/svg','path'); // Resets element creation
        shipPath = 'M' + x + ' ' + (y + 8) + 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0';
        
        ship.setAttribute('class', shipName);
        ship.setAttribute('d', shipPath);
        ship.setAttribute('fill', '#33ff00');
        svg.appendChild(ship);
}


// Red Ship
function rshipInit() {
        rshipX = -rshipW;
        rshipY = 50;
        
        rship.setAttribute('id', 'redShip');
        rship.setAttribute('class', 'active');
        rship.setAttribute('x', rshipX);
        rship.setAttribute('y', rshipY);
        rship.setAttribute('width', rshipW);
        rship.setAttribute('height', rshipH);
        rship.setAttributeNS(xlink,'xlink:href', 'redship.svg');
        svg.appendChild(rship);
        
        rship = document.createElementNS('http://www.w3.org/2000/svg','image'); // Resets element creation
}

function rshipDraw() {
        rshipElem = document.getElementById('redShip');

        if (rshipElem) {
                x = parseInt(rshipElem.getAttribute('x'));
                
                if (x > svgW) {                
                        svg.removeChild(rshipElem);
                }
                else {
                        rshipElem.setAttribute('x', x + 1);
                }
        }
}


// Invaders
function invInit() {
        invRow = 5;
        invCol = 11;
        invGap = 10;
        invW = 25;
        invH = 19;
        invX = 64;
        invY = 90;
        invSpeed = 10;
        invSpeedX = 0;
        invSpeedY = 0;
        
        // Creating the invader array
        invArray = new Array(invRow);
        for (row=0; row<invRow; row++) {
                invArray[row] = new Array(invCol);
        }
        
        for (row=0; row<invRow; row++) {
                for (col=0; col<invCol; col++) {
                        inv.setAttribute('x', invPosX(col));
                        inv.setAttribute('y', invPosY(row));
                        inv.setAttribute('class', 'invader active');
                        inv.setAttribute('row', row);
                        inv.setAttribute('col', col);
                        inv.setAttribute('width', invW);
                        inv.setAttribute('height', invH);
                        inv.setAttributeNS(xlink,'xlink:href', invImage(row));
                        svg.appendChild(inv);
                        
                        inv = document.createElementNS(svgNS,'image');
                }
        }
}

function invDraw() {
        invFirstX = svgW;
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
        if ((invLastX >= (svgW - 20 - invW) && invSpeedY === 0) || (invFirstX < 21 && invSpeedY === 0)) {
                invSpeedY = Math.abs(invSpeed);
        }
        else if ((invLastX >= (svgW - 20 - invW)) || (invFirstX < 21) || invSpeedY > 0) {
                invSpeed = -invSpeed;
                invSpeedY = 0;
        }
        
        // Loop through and update invaders position + visual element with previous tests and loops from this function
        for (i=0; i<invs.length; i++) {
                x = parseInt(invs[i].getAttribute('x'));
                y = parseInt(invs[i].getAttribute('y'));
                img = invs[i].getAttribute('xlink:href');
                
                newX = x + invSpeed;
                newY = y + invSpeedY;
                
                // Cycle speed
                if (invSpeedY > 0) {
                        invs[i].setAttribute('y',newY);
                }
                else {
                        invs[i].setAttribute('x',newX);
                }
                
                // Cycle animation
                img = invImageChange(img);
                invs[i].setAttribute('xlink:href',img);
                
                // Game over test
                if (y > shieldY - 20 - invH) {
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
        x = invX + (row * invW) + (row * invGap);
        return x;
}

function invPosY(col) {
        y = invY + (col * invH) + (col * invGap);
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
                laserInit(x1 + (invW / 2), y1 + 20, laserCE);
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
        svg.appendChild(text);
}

function scoreDraw(amount) {
        scoreCount(amount);
        element = document.getElementById('textScore');
        element.removeChild(element.firstChild);
        element.appendChild(document.createTextNode('Score: ' + score));
}

function levelUp() {
        // count invader kills
        invCounter += 1;
        invCount = invCol * invRow;
        
        // Test to level up or increase invader speed
        if (invCounter === invCount) {
                level += 1;
                invCounter = 0;
                invUpdate = 800 - (20 * level);
                
                clearInterval(invTimer);
                invInit();
                invTimer = setInterval(invDraw, invUpdate);
        }
        else if (invCounter === Math.round(invCount / 2)) {
                invUpdate -= 250;
                
                clearInterval(invTimer);
                invTimer = setInterval(invDraw, invUpdate);
        }
        else if (invCounter === (invCol * invRow) - 3) {
                invUpdate -= 300;
                
                clearInterval(invTimer);
                invTimer = setInterval(invDraw, invUpdate);
        }
}

function lifeDraw() {
        lives -= 1;
        
        svg.removeChild(shipPlayer[0]);
        svg.removeChild(shipLives[lives]);
        
        if (lives > 0) {
                setTimeout('shipCreate(shipX, shipY, \'player\')', 1000);
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
                        x = shipLivesX + (shipW * lives) + (shipLivesGap * lives);
                        shipCreate(x, shipLivesY, 'life'); // Add an extra life
                        
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
        svg.addEventListener('click', restartGame, false);
}

// Movement controls
$(document).keydown(function(evt) {
        if (evt.keyCode === 39) { // left arrow
                keyL = true;
                keyR = false;
        }
        else if (evt.keyCode === 37) { // right arrow
                keyR = true;
                keyL = false;
        }
        else if (evt.keyCode === 32 && (! $('.' + laserCG)[0])) { // If clicking and laser doesn't already exist
                laserInit(shipX + (shipW / 2), shipY, laserCG);
        }
});

$(document).keyup(function(evt) {
        if (evt.keyCode === 39 || evt.keyCode === 37) {
                keyL = false;
                keyR = false;
        }
});

$('#svg').mousemove(function(e){
        var svgPosLeft = Math.round($("#svg").position().left);
        var svgPos = e.pageX - svgPosLeft;
        var shipM = shipW / 2; // ship middle
        
        if (svgPos > shipM && svgPos < svgW - shipM) {
                mouseX = svgPos;
                mouseX -= shipW / 2;
                shipX = mouseX;
        }
});

$('#svg').click(function(){
        if (! $('.' + laserCG)[0] && $('.player')[0]) {
                laserInit(shipX + (shipW / 2), shipY, laserCG);
        }
});