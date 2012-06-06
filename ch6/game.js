/*
Name: Canvas Ricochet
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
*/

// How to figure out what a user's computer can handle for frames with fallbacks
// Original by Paul Irish: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// Clear interval version here created by Jerome Etienne http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html
window.requestAnimFrame = ( function() {
    return  window.requestAnimationFrame        || 
    window.webkitRequestAnimationFrame          || 
    window.mozRequestAnimationFrame             || 
    window.oRequestAnimationFrame               || 
    window.msRequestAnimationFrame              || 
    function(/* function */ callback, /* DOMElement */ element){
        return window.setTimeout(callback, 1000 / 60);
    };
})();

var Game = {
    // Setup configuration
    canvas: document.getElementById('canvas'),
    setup: function() {
        if (this.canvas.getContext){
            // Setup variables
            this.ctx = this.canvas.getContext('2d');
            
            // Run the game
            Screen.welcome();
            this.canvas.addEventListener('click', this.listen.run, false);
            Ctrl.init();
        }
    },
    
    init: function() {
        // Setup initial objects
        Background.init();
        Hud.init();
        Bricks.init();
        Ball.init();
        Paddle.init();
    },
    
    animate: function() {
        // Run from the global space, so you must use Game instead of this to prevent a crash
        Game.draw();
        Game.play = requestAnimFrame(Game.animate);
    },
    
    draw: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
        
        // Draw objects
        Background.draw();
        Bricks.draw();
        Paddle.draw();
        Hud.draw();
        Ball.draw();
    },
    
    
    // Must reference as Game isntead of this due to when the listener is fired (outside of the object)
    listen: {
        run: function() {
            Game.canvas.removeEventListener('click', Game.listen.run, false);
            Game.init();
            
            // Run animation
            Game.animate();
        },
        restart: function() {
            Game.canvas.removeEventListener('click', Game.listen.restart, false);
            Game.init();
        }
    },

    // Leveling
    level: {
        up: function() {
            Hud.lv += 1;
            Bricks.init();
            Ball.init();
            Paddle.init();
        },
        limit: function(lv) {
            if (lv > 5) {
                return 5;
            } else {
                return lv;
            }
        }
    },
};

var Screen = {
    welcome: function() {
        // Setup base values
        this.text = 'CANVAS RICOCHET';
        this.textSub = 'Click To Start';
        this.textColor = 'white';
        
        // Create screen
        this.create();
    },
    
    gameover: function() {
        this.text = 'Game Over';
        this.textSub = 'Click To Retry';
        this.textColor = 'red';
        
        this.create();
    },
    
    create: function() {
        // Cache variables
        var ctx = Game.ctx;
        var width = Game.canvas.width;
        var height = Game.canvas.height;
        
        // Background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        
        // Main text
        ctx.fillStyle = this.textColor;
        ctx.textAlign = 'center';
        ctx.font = '40px helvetica, arial';
        ctx.fillText(this.text, width/2, height/2);
        
        // Sub text
        ctx.fillStyle = '#999999';
        ctx.font = '20px helvetica, arial';
        ctx.fillText(this.textSub, width/2, height/2 + 30);            
    }
};

/***************************
Game Objects
***************************/
var Background = {
    init: function() {
        this.ready = false;
        
        this.img = new Image();
        this.img.src = 'background.jpg';
        this.img.onload = function() {
            Background.ready = true;
        }
    },
    draw: function() {
        if (this.ready)
            Game.ctx.drawImage(this.img,0,0);
    }
};

var Ball = {
    r: 10,
    init: function() {            
        this.x = 120;
        this.y = 120;
        this.sx = 1 + (.4 * Hud.lv);
        this.sy = -1.5 - (.4 * Hud.lv);
    },
    
    draw: function() {
        // Edge detection
        this.edges();
        this.collide();
        this.move();
        
        // Cache game's context since its used multiple times
        var ctx = Game.ctx;
        
        // Create ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        ctx.closePath();
        this.gradient();
        ctx.fill();
    },
    
    move: function() {
        this.x += this.sx;
        this.y += this.sy;
    },
    
    // Edge dectection
    edges: function() {
        // Cache Game's canvas for quicker reference
        var canvas = Game.canvas;
        
        // Top
        if (this.y < 1) { 
            this.y = 1; // Prevents the ball from getting stuck at fast speeds
            this.sy = -this.sy;
        } else if (this.y > canvas.height) { // Bottom
            // Stop the ball and hide it
            // Note: You could use a clear animation frame request,
            // but its very unstable in all browsers.
            this.sy = this.sx = 0;
            this.y = this.x = 1000;
            
            // Shut down
            Screen.gameover();
            canvas.addEventListener('click', Game.listen.restart, false);
        }
        
        // Left
        if (this.x < 1) {
                this.x = 1; // Prevents the ball from getting stuck at fast speeds
                this.sx = - this.sx;
        } else if (this.x > canvas.width) { // Right
                this.x = canvas.width - 1; // Prevents the ball from getting stuck at fast speeds
                this.sx = - this.sx;
        }
    },
    
    // Paddle to ball collision detection
    collide: function() {
        var padX = Paddle.x;
        var padY = Paddle.y;
        var padW = Paddle.w;
        
        if (this.x >= padX && this.x <= (padX + padW) && this.y >= padY && this.y <= (padY + padW)) {
            this.sx = 7 * ((this.x - (padX + padW/2))/padW);
            this.sy = -this.sy;
        }
    },
    
    // Gradient for the ball
    gradient: function() {
        var grad = Game.ctx.createRadialGradient(this.x, this.y, 2, this.x - 4, this.y - 3, 10);
        grad.addColorStop(0, '#eee');                         
        grad.addColorStop(1, '#999');                         
        return Game.ctx.fillStyle = grad;
    }
};

var Paddle = {
    w: 90,
    h: 20,
    r: 9,
    init: function() {
        this.x = 100;
        this.y = 210;
        this.speed = 4;
    },
    
    draw: function() {        
        this.move();
        
        // Cache drawing tool
        var ctx = Game.ctx;
        
        // Create paddle
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arcTo(this.x + this.w, this.y, this.x + this.w, this.y + this.r, this.r);
        ctx.arcTo(this.x + this.w, this.y + this.h, this.x + this.w - this.r, this.y + this.h, this.r);
        ctx.arcTo(this.x, this.y + this.h, this.x, this.y + this.h - this.r, this.r);
        ctx.arcTo(this.x, this.y, this.x + this.r, this.y, this.r);
        ctx.closePath();
        this.gradient();
        ctx.fill();
    },
    
    move: function() {
        // Detect controller input
        if (Ctrl.left && (this.x < (Game.canvas.width - this.w))) {                      
            this.x += this.speed;                                         
        } else if (Ctrl.right && this.x > 0) {                                  
            this.x += -this.speed;                                                    
        }
    },
    
    gradient: function() {
        var grad = Game.ctx.createLinearGradient(this.x, this.y, this.x, this.y + 20);
        grad.addColorStop(0, '#eee');
        grad.addColorStop(1, '#999');
        return Game.ctx.fillStyle = grad;
    }
};

var Bricks = {
    gap: 2,
    col: 5,
    w: 80,
    h: 15,
    init: function() {
        this.row = 2 + Game.level.limit(Hud.lv);
        this.total = 0;
        
        // Create an updatable brick array = number of bricks
        this.count = new Array(this.row);
        for (i=0; i < this.row; i++) {
            this.count[i] = new Array(this.col);
        }
    },
    
    draw: function() {
        for (i=0; i < this.row; i++) {
            for (j=0; j < this.col; j++) {
                // Test in case we shouldn't draw a brick
                if (this.count[i][j] !== false) {
                    // Cache needed information
                    ballX = Ball.x;
                    ballY = Ball.y;
                    brickX = this.x(j);
                    brickY = this.y(i);
                    
                    // Delete overlapping bricks if present
                    if (ballX >= brickX && ballX <= (brickX + this.w) && ballY >= brickY && ballY <= (brickY + this.h)) {
                        Hud.score += 1;
                        this.total += 1;
                        this.count[i][j] = false;
                        Ball.sy = -Ball.sy;
                    }
                                        
                    this.gradient(i);
                    Game.ctx.fillRect(brickX, brickY, this.w, this.h);
                }
            }
        }
    
        if (this.total === (this.row * this.col)) {
            Game.level.up();
        }
    },
    
    x: function(row) {
        return (row * this.w) + (row * this.gap);
    },
    
    y: function(col) {
        return (col * this.h) + (col * this.gap);
    },
    
    gradient: function(row) {
        var y = this.y(row);
        var grad = Game.ctx.createLinearGradient(0, y, 0, y + this.h);
        switch(row) {                                                    
            case 0:  grad.addColorStop(0,'#bd06f9');                   
                grad.addColorStop(1,'#9604c7'); break;                     
    
            case 1: grad.addColorStop(0,'#F9064A');                    
                grad.addColorStop(1,'#c7043b'); break;                     
            
            case 2: grad.addColorStop(0,'#05fa15');                    
                grad.addColorStop(1,'#04c711'); break;                     
            
            default: grad.addColorStop(0,'#faa105');                   
                grad.addColorStop(1,'#c77f04'); break;                     
        }
        return Game.ctx.fillStyle = grad;
    }
};

var Hud = {
    init: function() {
        this.lv = 1;
        this.score = 0;
    },
    
    draw: function() {
        var ctx = Game.ctx;
        var canvasH = Game.canvas.height;
        
        ctx.font = '12px helvetica, arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left'; 
        ctx.fillText('Score: ' + Hud.score, 5, canvasH - 5);
        ctx.textAlign = 'right'; 
        ctx.fillText('Lv: ' + Hud.lv, Game.canvas.width - 5, canvasH - 5);
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
Run Game
***************************/
window.onload = function() {
    Game.setup();
}