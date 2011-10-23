/********
Variable Setup
********/
var canvas = document.getElementById('canvas'); 
var ball = {};
var pad = {};
var brick = {};
var hud = {};
var ctrl = {};


/********
Setup
********/
if (canvas.getContext){
        var context = canvas.getContext('2d');
        
        // Run the game
        welcomeDraw();
        canvas.addEventListener('click', runGame, false);                                                    
}

function runGame() {
        canvas.removeEventListener('click', runGame, false);
        init();
}

function restartGame() {
        canvas.removeEventListener('click', restartGame, false);
        clearInterval(canvas.run);
        init();
} 

function init() {
        hudInit();
        brickInit();
        ballInit();
        padInit();
        return canvas.run = setInterval(draw, 12);
}

function draw() {
        context.clearRect(0,0,canvas.width,canvas.height); 
        background();
    
        brickDraw();
        ballDraw();
        padDraw();
        hudDraw();                        
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
        ball.x = 120;
        ball.sx = .9 + (.4 * hud.lv);
        ball.y = 120;
        ball.sy = -.9 - (.4 * hud.lv);
        ball.r = 10;
}

function ballDraw() {
        // Canvas edge detection
        if (ball.y < 1) { // Top
                ball.y = 1; // Prevents the ball from getting stuck at fast speeds
                ball.sy = -ball.sy;
        }
        // Bottom
        else if (ball.y > canvas.height) {
                clearInterval(canvas.run);
                canvas.run = setInterval(goDraw, 12);
                canvas.addEventListener('click', restartGame, false);
        }
        
        // Left
        if (ball.x < 1) {
                ball.x = 1; // Prevents the ball from getting stuck at fast speeds
                ball.sx = - ball.sx;
        }
        // Right
        else if (ball.x > canvas.width) {
                ball.x = canvas.width - 1; // Prevents the ball from getting stuck at fast speeds
                ball.sx = - ball.sx;
        }
        
        // Paddle to ball collision
        if (ball.x >= pad.x && ball.x <= (pad.x + pad.w) && ball.y >= pad.y && ball.y <= (pad.y + pad.w)) {
                ball.sx = 7 * ((ball.x - (pad.x+pad.w/2))/pad.w);
                ball.sy = -ball.sy;
        }
        
        ball.x += ball.sx;
        ball.y += ball.sy;
        
        // Create ball
        context.beginPath();
        context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, false);
        context.fillStyle = ballGrad();
        context.fill();
}

function ballGrad() {
        var ballG = context.createRadialGradient(ball.x,ball.y,2,ball.x-4,ball.y-3,10);
        ballG.addColorStop(0, '#eee');                         
        ballG.addColorStop(1, '#999');                         
        return ballG;
}

// Paddle
function padInit() {     
        pad.x = 100;
        pad.y = 210;
        pad.w = 90;
        pad.h = 20;
        pad.r = 9;
        pad.speed = 4;
}

function padDraw() {
        // Detect controller input
        if (ctrl.left && (pad.x < (canvas.width - pad.w))) {                      
                pad.x += pad.speed;                                         
        }                                                             

        else if (ctrl.right && pad.x > 0) {                                  
                pad.x += -pad.speed;                                                    
        }
        
        // Create paddle
        context.beginPath();
        context.moveTo(pad.x,pad.y);                                           
        context.arcTo(pad.x+pad.w, pad.y, pad.x+pad.w, pad.y+pad.r, pad.r);
        context.arcTo(pad.x+pad.w, pad.y+pad.h,pad.x+pad.w-pad.r,pad.y+pad.h, pad.r);
        context.arcTo(pad.x, pad.y+pad.h, pad.x, pad.y+pad.h-pad.r, pad.r);
        context.arcTo(pad.x, pad.y, pad.x+pad.r, pad.y, pad.r);
        context.closePath();                                                 
        context.fillStyle = padGrad();
        context.fill();
}

function padGrad() {                
        var padG = context.createLinearGradient(pad.x,pad.y,pad.x,pad.y+20);
        padG.addColorStop(0, '#eee');
        padG.addColorStop(1, '#999');
        return padG;
}

// Bricks
function brickInit() {
        brick.gap = 2;
        brick.row = 2 + levelLim(hud.lv);
        brick.col = 5;
        brick.w = 80;
        brick.h = 15;
        brick.total = 0;
        
        // Create an updatable brick array = number of bricks
        brick.count = new Array(brick.row);
        for (i=0; i<brick.row; i++) {
                brick.count[i] = new Array(brick.col);
        }
}

function brickDraw() {      
        for (i=0; i<brick.row; i++) {
                for (j=0; j<brick.col; j++) {
                        // Test in case we shouldn't draw a brick
                        if (brick.count[i][j] !== false) { 
                                // Delete overlapping brick if overlap
                                if (ball.x >= brickX(j) && ball.x <= (brickX(j) + brick.w) && ball.y >= brickY(i) && ball.y <= (brickY(i) + brick.h)) {
                                        hud.score += 1;
                                        brick.total += 1;
                                        brick.count[i][j] = false;
                                        ball.sy = -ball.sy;
                                }
                                        
                                brickColor(i);          
                                context.fillRect(brickX(j),brickY(i),brick.w,brick.h);
                        }
                }
        }
    
        if (brick.total === (brick.row * brick.col)) {
                levelUp();                                                   
        }
}

function brickX(row) {
        return (row * brick.w) + (row * brick.gap);
}
        
function brickY(col) {
        return (col * brick.h) + (col * brick.gap);
}

function brickColor(row) {                                           
        y = brickY(row);
        var brickG = context.createLinearGradient(0,y,0,y+brick.h);
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
        hud.lv += 1;
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
        hud.lv = 1;
        hud.score = 0;
}

function hudDraw() {
        context.font = '12px helvetica, arial';
        context.fillStyle = 'white';
        context.textAlign = 'left'; 
        context.fillText('Score: ' + hud.score, 5, canvas.height - 5);
        context.textAlign = 'right'; 
        context.fillText('Lv: ' + hud.lv, canvas.width - 5, canvas.height - 5);
}

// Transition screens
function welcomeDraw() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = '40px helvetica, arial';
        context.fillText('BREAKOUT', canvas.width/2, canvas.height/2);
        
        context.fillStyle = '#999999';
        context.font = '20px helvetica, arial';
        context.fillText('Click To Start', canvas.width/2, canvas.height/2 + 30);
}

function goDraw() {
        context.fillStyle = 'black';
        context.fillRect(0,0,canvas.width,canvas.height);
        
        context.fillStyle = 'red';
        context.textAlign = 'center';
        context.font = '40px helvetica, arial';
        context.fillText('Game Over', canvas.width/2, canvas.height/2);
        
        context.fillStyle = '#999999';
        context.font = '20px helvetica, arial';
        context.fillText('Click To Retry', canvas.width/2, canvas.height/2 + 30);
}

// Game controller logic
$(document).keydown(function(evt) {                                  
        if (evt.keyCode === 39) {                                    
                ctrl.left = true;                                                                                 
        }
        else if (evt.keyCode === 37) {                               
                ctrl.right = true;
        }
});

$(document).keyup(function(evt) {                                    
        if (evt.keyCode === 39) {                                    
                ctrl.left = false;                                        
        }                                                            
        else if (evt.keyCode === 37) {                               
                ctrl.right = false;                                        
        }                                                            
});                                                                  

$('#canvas').mousemove(function(e){
        var canvasPosLeft = Math.round($("#canvas").position().left);  
        var canvasPos = e.pageX - canvasPosLeft;                             
        var padM = pad.w / 2;                                           
        
        if (canvasPos > padM && canvasPos < canvas.width - padM) {          
                ctrl.mX = canvasPos;                                 
                ctrl.mX -= pad.w / 2;                                        
                pad.x = ctrl.mX;                                         
        }
});