/********
Variables
********/
// Canvas
var canvas = document.getElementById('canvas');                       
var canvasAtt = canvas.attributes;                                    
var canvasW = canvasAtt.getNamedItem('width').value;                  
var canvasH = canvasAtt.getNamedItem('height').value;
var canvasRun;

// Ball
var ballX;
var ballSX;
var ballY;
var ballSY;
var ballR;

// Paddle
var padX;
var padY;
var padW;
var padH;
var padR;
var padSpeed;

// Bricks
var bricks;
var bGap;
var bRow;
var bCol;
var bW;
var bH;
var bCount;

// HUD
var score;
var level;

// Controls
var keyL;
var keyR;
var mouseX;

// Screen transitions
var start = false;


/********
Setup
********/
if (canvas.getContext){
        var context = canvas.getContext('2d');
        init();                                                       
}

function init() {
        hudInit();
        brickInit();
        ballInit();
        padInit();
        return canvasRun = setInterval(draw, 12);
}

function draw() {
        context.clearRect(0,0,canvasW,canvasH); 
        background();
    
        brickDraw();
        if (start) ballDraw();
        padDraw();
        hudDraw();
        if (!start) welcomeDraw();
        if (ballY > canvasH) goDraw();                             
}


/********
Functions
********/
function background() {                                               
        var img = new Image();               
        img.src = 'background.jpg';             
        context.drawImage(img,0,0);        
}

// Ball
function ballInit() { 
        ballX = 120;
        ballSX = .9 + (.4 * level);
        ballY = 120;
        ballSY = -.9 - (.4 * level);
        ballR = 10;
}

function ballDraw() {
        if (!(ballY > canvasH)) {
                // Canvas edge detection
                if (ballY < 1) {
                    ballSY = - ballSY;
                }
                if (ballX < 1 || ballX > canvasW) {
                    ballSX = - ballSX;
                }
                
                // Paddle to ball collision
                if (ballX >= padX && ballX <= (padX + padW) && ballY >= padY && ballY <= (padY + padW)) {
                        ballSX = 7 * ((ballX - (padX+padW/2))/padW);
                        ballSY = -ballSY;
                }
                
                ballX += ballSX;
                ballY += ballSY;
                
                // Create ball
                context.beginPath();
                context.arc(ballX, ballY, ballR, 0, 2 * Math.PI, false);
                context.fillStyle = ballGrad();
                context.fill();
        }
}

function ballGrad() {
    var ballG = context.createRadialGradient(ballX,ballY,2,ballX-4,ballY-3,10);                                                     
    ballG.addColorStop(0, '#eee');                         
    ballG.addColorStop(1, '#999');                         
    return ballG;
}

// Paddle
function padInit() {     
        padX = 100;
        padY = 210;
        padW = 90;
        padH = 20;
        padR = 9;
        padSpeed = 4;
}

function padDraw() {
        // Detect controller input
        if (keyL && (padX < (canvasW - padW))) {                      
                padX += padSpeed;                                         
        }                                                             

        else if (keyR && padX > 0) {                                  
                padX += -padSpeed;                                                    
        }
        
        // Create paddle
        context.beginPath();
        context.moveTo(padX,padY);                                           
        context.arcTo(padX+padW, padY, padX+padW, padY+padR, padR);
        context.arcTo(padX+padW, padY+padH,padX+padW-padR,padY+padH, padR);
        context.arcTo(padX, padY+padH, padX, padY+padH-padR, padR);
        context.arcTo(padX, padY, padX+padR, padY, padR);
        context.closePath();                                                 
        context.fillStyle = padGrad();
        context.fill();
}

function padGrad() {                
        var padG = context.createLinearGradient(padX,padY,padX,padY+20);
        padG.addColorStop(0, '#eee');
        padG.addColorStop(1, '#999');
        return padG;
}

// Bricks
function brickInit() {
        bGap = 2;
        bRow = 2 + levelLim(level);
        bCol = 5;
        bW = 80;
        bH = 15;
        bCount = 0;
        
        // Create an updatable brick array = number of bricks
        bricks = new Array(bRow);
        for (i=0; i<bRow; i++) {
                bricks[i] = new Array(bCol);
        }
}

function brickDraw() {      
        for (i=0; i<bRow; i++) {
                for (j=0; j<bCol; j++) {
                        // Test in case we shouldn't draw a brick
                        if (bricks[i][j] !== false) { 
                                // Delete overlapping brick if overlap
                                if (ballX >= brickX(j) && ballX <= (brickX(j) + bW) && ballY >= brickY(i) && ballY <= (brickY(i) + bH)) {
                                        score += 1;
                                        bCount += 1;
                                        bricks[i][j] = false;
                                        ballSY = -ballSY;
                                }
                                        
                                brickColor(i);          
                                context.fillRect(brickX(j),brickY(i),bW,bH);
                        }
                }
        }
    
        if (bCount === (bRow * bCol)) {
                levelUp();                                                   
        }
}

function brickX(row) {
        return (row * bW) + (row * bGap);
}
        
function brickY(col) {
        return (col * bH) + (col * bGap);
}

function brickColor(row) {                                           
        y = brickY(row);
        var brickG = context.createLinearGradient(0,y,0,y+bH);
        switch(row) {                                                    
                case 0:  brickG.addColorStop(0,'#bd06f9');                   
                brickG.addColorStop(1,'#9604c7'); break;                     
        
                case 1: brickG.addColorStop(0,'#F9064A');                    
                brickG.addColorStop(1,'#c7043b'); break;                     
                
                case 2: brickG.addColorStop(0,'#05fa15');                    
                brickG.addColorStop(1,'#04c711'); break;                     
                
                default: brickG.addColorStop(0,'#faa105');                   
                brickG.addColorStop(1,'#c77f04'); break;                     
        }
        return context.fillStyle = brickG;
}

// Leveling
function levelUp() {
        level += 1;
        brickInit();
        ballInit();
        padInit();
}

function levelLim(lv) {
        if (lv > 5) {
                return 5;
        }
        else {
                return lv;
        }
}

// Heads up display
function hudInit() {
        level = 1;
        score = 0;
}

function hudDraw() {
        context.font = '12px helvetica, arial';
        context.fillStyle = 'white';
        context.textAlign = 'left'; 
        context.fillText('Score: ' + score, 5, canvasH - 5);
        context.textAlign = 'right'; 
        context.fillText('Lv: ' + level, canvasW - 5, canvasH - 5);
}

// Transition screens
function welcomeDraw() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvasW, canvasH);
        
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = '40px helvetica, arial';
        context.fillText('BREAKOUT', canvasW/2, canvasH/2);
        
        context.fillStyle = '#999999';
        context.font = '20px helvetica, arial';
        context.fillText('Click To Start', canvasW/2, canvasH/2 + 30);
}

$('#canvas').click(function() { 
        start = true;
        
        if (ballY > canvasH) {
                clearInterval(canvasRun);                             
                init();
        }
});

function goDraw() {
        context.fillStyle = 'black';
        context.fillRect(0,0,canvasW,canvasH);
        
        context.fillStyle = 'red';
        context.textAlign = 'center';
        context.font = '40px helvetica, arial';
        context.fillText('Game Over', canvasW/2, canvasH/2);
        
        context.fillStyle = '#999999';
        context.font = '20px helvetica, arial';
        context.fillText('Click To Retry', canvasW/2, canvasH/2 + 30);
}

// Game controller logic
$(document).keydown(function(evt) {                                  
        if (evt.keyCode === 39) {                                    
                keyL = true;                                                                                 
        }
        else if (evt.keyCode === 37) {                               
                keyR = true;
        }
});

$(document).keyup(function(evt) {                                    
        if (evt.keyCode === 39) {                                    
                keyL = false;                                        
        }                                                            
        else if (evt.keyCode === 37) {                               
                keyR = false;                                        
        }                                                            
});                                                                  

$('#canvas').mousemove(function(e){
        var canvasPosLeft = Math.round($("#canvas").position().left);  
        var canvasPos = e.pageX - canvasPosLeft;                             
        var padM = padW / 2;                                           
        
        if (canvasPos > padM && canvasPos < canvasW - padM) {          
                mouseX = canvasPos;                                 
                mouseX -= padW / 2;                                        
                padX = mouseX;                                         
        }
});