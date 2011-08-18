/*
Name: Space Invaders
Version: Beta .2
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Publisher: Manning

Known bugs:
- Text styling doesn't render correctly in Chrome and IE
- Red ship shoots off the screen in IE
- When down to last 3 invaders they go too far off of the right edge
- Fix images, rect, and paths with /> at the end
- Invader 2 is slightly snipped on the width

Features to integrate:
- Respawning delay for player
- Game over screen with click to restart
-- Use animation to rotate Invader back and forth
- Extra life every 100 points
- Consildate and clean code
- Use and creat functions to cut down code
*/

/********
Variables
********/
// SVG
var svg = document.getElementById('svg');
var svgW = svg.getAttribute('width');
var svgH = svg.getAttribute('height');
var svgPosLeft = Math.round($("#svg").position().left);
var svgSupport = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1");
var svgNS = 'http://www.w3.org/2000/svg';

// Timers
var svgRun;

// Shields
var shield = document.createElementNS(svgNS,'rect');
var shieldArray;
var shieldX;
var shieldY;
var shieldGap;
var shieldHp;
var shieldColor;
var shieldNum;
var shieldP;
var shieldPX;
var shieldPY;
var shieldPSize;
var shields;
var shieldOpac;

// Laser
var laser = document.createElementNS(svgNS,'rect');
var laserW;
var laserH;
var laserSpeed;
var laserColor;
var laserCG = 'laserGood';
var laserCE = 'laserEvil';
var lasers;

// Ship
var ship = document.createElementNS(svgNS,'path');
var shipX;
var shipY;
var shipW;
var shipLivesX;
var shipLivesY;
var shipH;
var shipColor;
var shipPath;
var shipLives;
var shipLivesGap;
var shipSpeed;
var shipPlayer;

// Red Ship
var rship = document.createElementNS(svgNS,'image');
var rshipW = 45;
var rshipH = 20;
var rshipImg;
var rshipTimer;
var rshipSpeed;
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
var invTimer;
var invs;
var invSpeedY;
var invSpeedX;
var invSpeed = 10;
var invCounter = 0;
var invUpdateBase = 800;
var invUpdate = 800;

// Text
var text = document.createElementNS(svgNS,'text');
var score = 0;
var lives = 3;
var level = 1;

// Controls
var keyL;
var keyR;

// Misc
var score;


/********
Core Logic
********/
if (svgSupport){      
        var welcome = document.getElementById('screenWelcome');
        welcome.addEventListener('click', runGame, false);
}

function runGame() {
        welcome.removeEventListener('click', init, false);
        svg.removeChild(welcome);
        
        init();
}

function init() {
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
Functions
********/
// Shield
function shieldInit() {
        // Set variables
        shieldX = 64;
        shieldY = 390;
        shieldHp = 3;
        shieldColor = '#33ff00';
        shieldNum = 4;
        shieldP = 8;
        shieldPSize= 15;
        shieldOpac = 1;
        
        elementClean('shield');
        
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
        shieldPX = shieldX + (buildLoc * shieldX) + (buildLoc * (shieldPSize * 3));
        
        shieldBuildXY(buildPiece);
        
        shield.setAttribute('x', shieldPX);
        shield.setAttribute('y', shieldPY);
        shield.setAttribute('class', 'shield active');
        shield.setAttribute('hp', shieldHp);
        shield.setAttribute('width', shieldPSize);
        shield.setAttribute('height', shieldPSize);
        shield.setAttribute('fill', shieldColor);
        shield.setAttribute('fill-opacity', shieldOpac);
        svg.appendChild(shield);
        
        shield = document.createElementNS('http://www.w3.org/2000/svg','rect'); // Resets element creation
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
        laserW = 2;
        laserH = 10;
        laserColor = '#ddd';
        laserSpeed = 5;
        
        laser.setAttribute('class', laserName);
        laser.setAttribute('x', x);
        laser.setAttribute('y', y);
        laser.setAttribute('width', laserW);
        laser.setAttribute('height', laserH);
        laser.setAttribute('fill', laserColor);
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
                for (i=0; i<lasers.length; i++) {
                        x1 = lasers[i].getAttribute('x');
                        x1 = parseInt(x1);
                        y1 = lasers[i].getAttribute('y');
                        y1 = parseInt(y1);
                        
                        if (y1 < 0 || y1 > svgH) {
                                svg.removeChild(lasers[i]);
                        }
                        else {
                                y1 += speed;
                                lasers[i].setAttribute('y',y1);
                        }
                        
                        collide = document.getElementsByClassName('active');
                        for (j=0; j<collide.length; j++) {
                                x2 = collide[j].getAttribute('x');
                                x2 = parseInt(x2);
                                y2 = collide[j].getAttribute('y');
                                y2 = parseInt(y2);
                                width = collide[j].getAttribute('width');
                                width = parseInt(width);
                                height = collide[j].getAttribute('height');
                                height = parseInt(height);
                                //alert(height);
                                
                                if (x1 >= x2 && x1 <= (x2 + width) && y1 >= y2 && y1 <= (y2 + height)) {
                                        objClass = collide[j].getAttribute('class');
                                        
                                        // test if shield
                                        if (objClass === 'shield active') {
                                                svg.removeChild(lasers[i]);
                                                hp = collide[j].getAttribute('hp');
                                                hp = parseInt(hp);
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
                                                svg.removeChild(lasers[i]);
                                                svg.removeChild(collide[j]);
                                                scoreDraw(10);
                                        }
                                        // if so extra points
                                        // else normal points and remove
                                        else {
                                                svg.removeChild(lasers[i]);
                                                svg.removeChild(collide[j]);
                                                scoreDraw(1);
                                                levelUp();
                                        }
                                }
                        }
                        
                        // test if ship
                        if ((x1 >= shipX && x1 <= (shipX + shipW) && y1 >= shipY && y1 <= (shipY + shipH)) && shipPlayer[0]) {
                                svg.removeChild(lasers[i]);
                                
                                lifeDraw();
                        }
                } 
        }
}

// Collisions



// Ship
function shipInit() {
        shipW = 35;
        shipH = 15;
        shipX = 220;
        shipY = 460;
        shipSpeed = 3;
        shipLives = 3;
        shipLivesX = 360;
        shipLivesY = 10;
        shipLivesGap = 10;
        
        shipCreate(shipX, shipY, 'player');
        
        for (i=0; i<shipLives; i++) {
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
        shipPath = 'M' + x + ' ' + (y + 8) + 'v 13 h 35 v -13 h -2 v -2 h -12 v -4 h -2 v -2 h -3 v 2 h -2 v 4 h -12 v 2 l -2 0';
        shipColor = '#33ff00';
        
        ship.setAttribute('class', shipName);
        ship.setAttribute('d', shipPath);
        ship.setAttribute('fill', shipColor);
        svg.appendChild(ship);
        
        ship = document.createElementNS('http://www.w3.org/2000/svg','path'); // Resets element creation
}


// Red Ship
function rshipInit() {
        rshipX = -rshipW;
        rshipY = 50;
        rshipImg = 'redship.svg';
        rshipSpeed = 1;
        
        rship.setAttribute('id', 'redShip');
        rship.setAttribute('class', 'active');
        rship.setAttribute('x', rshipX);
        rship.setAttribute('y', rshipY);
        rship.setAttribute('width', rshipW);
        rship.setAttribute('height', rshipH);
        rship.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', rshipImg);
        svg.appendChild(rship);
        
        rship = document.createElementNS('http://www.w3.org/2000/svg','image'); // Resets element creation
}

function rshipDraw() {
        rshipElem = document.getElementById('redShip');

        if (rshipElem) {
                x = rshipElem.getAttribute('x');
                x = parseInt(x);
                
                if (x > svgW) {                
                        svg.removeChild(rshipElem);
                }
                else {
                        rshipElem.setAttribute('x', x + rshipSpeed);
                }
        }
}


// Invaders
function invInit() {
        invRow = 5;
        invCol = 11;
        invGap = 10;
        invW = 25;
        invH = 20;
        invX = 64;
        invY = 90;
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
                        inv.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', invImage(row));
                        svg.appendChild(inv);
                        
                        inv = document.createElementNS('http://www.w3.org/2000/svg','image'); // Resets element creation
                }
        }
}

function invDraw() {
        // Wrap all content in test for timer
                invLastX = 0;
                invFirstX = svgW;
                
                invs = document.getElementsByClassName('invader');
                
                // Loop through invaders
                for (i=0; i<invs.length; i++) {
                        // Get first and last value
                        x = invs[i].getAttribute('x');
                        x = parseInt(x);
                        
                        // Set x and y based on those values
                        if (invFirstX > x) {
                                invFirstX = x;
                        }
                        else if (invLastX < x) {
                                invLastX = x;  
                        }
                }
                
                // Set speed based upon loop results
                // Test last element
                if ((invLastX >= (svgW - 20 - invW) && invSpeedY === 0) || (invFirstX < 21 && invSpeedY === 0)) {
                        invSpeedY = Math.abs(invSpeed);
                }
                else if ((invLastX >= (svgW - 20 - invW)) || (invFirstX < 21) || invSpeedY > 0) {
                        invSpeed = -invSpeed;
                        invSpeedY = 0;
                }
                
                // Test first element
                /* if (invFirstX < 21 && invSpeedY === 0) {
                        invSpeedY = Math.abs(invSpeed);
                } */
                /* else if (invFirstX < 21) {
                        invSpeed = -invSpeed;
                        invSpeedY = 0;
                } */
                
                // Loop through invaders
                for (i=0; i<invs.length; i++) {
                        x = invs[i].getAttribute('x');
                        x = parseInt(x);
                        y = invs[i].getAttribute('y');
                        y = parseInt(y);
                        img = invs[i].getAttribute('xlink:href');
                        
                        newX = x + invSpeed;
                        newY = y + invSpeedY;
                        
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
                                return gameOver(); // Exit everything and shut down the game
                        }
                }
                
                // Fire invShoot
                invShoot();
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

function invImage(row) {
        switch(row) {
                case 0: return 'invader1a.svg'; break;
                case 1: return 'invader2a.svg'; break;
                case 2: return 'invader2a.svg'; break;
                case 3: return 'invader3a.svg'; break;
                case 4: return 'invader3a.svg'; break;
        }
}

function invShoot () {
        random = Math.floor(Math.random()*5);
        
        if (random === 1) {
                 invRandom = Math.floor(Math.random()*invs.length); // number should dynamically change to remaing space invader number
                y1 = 0;
                x1 = invs[invRandom].getAttribute('x');
                x1 = parseInt(x1);
                
                for (i=0; i<invs.length; i++) {
                        x2 = invs[i].getAttribute('x');
                        x2 = parseInt(x2);
                        
                        if (x1 === x2) {
                                y2 = invs[i].getAttribute('y');
                                y2 = parseInt(y2);
                                
                                if (y2 > y1) {
                                        y1 = y2;
                                }
                        }
                }
                
                laserInit(x1 + (invW / 2), y1 + 20, laserCE);
        }
}


// Text
function textInit() {
        score = 0;
        
        textCreate('Lives:',310,30,'textLives');
        textCreate('Score: ' + score,20,30,'textScore');
}

function textCreate(write,x,y,textName,color) {
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('id', textName);
        text.setAttribute('fill', '#ddd');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-size', '14px');
        text.appendChild(document.createTextNode(write));
        svg.appendChild(text);
        
        text = document.createElementNS('http://www.w3.org/2000/svg','text');
}

function scoreDraw(amount) {
        score += amount;
        element = document.getElementById('textScore');
        element.removeChild(element.firstChild);
        element.appendChild(document.createTextNode('Score: ' + score));
}

function levelUp() {
        // count invader kills
        invCounter += 1;
        invCount = invCol * invRow;
        // alert(invCount / 2);
        
        // if kills > invaders
        if (invCounter === invCount) {
                level += 1;
                invCounter = 0;
                invUpdate = invUpdateBase - (20 * level);
                
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
                shipCreate(shipX, shipY, 'player');
        }
        else {
                gameOver();
        }
}

function gameOver() {
        clearInterval(rshipTimer);
        clearInterval(invTimer);
        clearInterval(svgRun);
        alert('game over');
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
        else if (evt.keyCode === 32 && (! $('.' + laserCG)[0])) { // Added a test to see if a laser already exists
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


// Misc
function elementClean(name) {
        element = document.getElementsByClassName(name);
        for (i=0; i<element.length; i++) {
                svg.removeChild(element[i]);
        }
}