// Note: Make sure to replace timeout functions with animate based timeouts
// Limit spawner to 10 asteroids at a time
// Note: Respawn broken
// Note: cubes broken

gd.core.init(800, 600, function() {
    Ctrl.init();
    Hud.init();
    gd.game.spawn('Player');
});

// x and y coordinate information for 3D space, manually retrieved
gd.game.size = {
    width: 43,
    height: 32
};

Ctrl = {
    init: function() {
        window.addEventListener('keydown', this.keyDown, true);
        window.addEventListener('keyup', this.keyUp, true);
    },
    
    keyDown: function(event) {
        switch(event.keyCode) {
            case 38: // up
                Ctrl.up = true;
                break;
            case 40: // down
                Ctrl.down = true;
                break;
            case 37: // Left
                Ctrl.left = true;
                break;
            case 39: // Right
                Ctrl.right = true;
                break;
            case 88:
                Ctrl.space = true;
                break;
            default:
                break;
        }
    },
    
    keyUp: function(event) {
        switch(event.keyCode) {
            case 38:
                Ctrl.up = false;
                break;
            case 40:
                Ctrl.down = false;
                break;
            case 37: // Left
                Ctrl.left = false;
                break;
            case 39: // Right
                Ctrl.right = false;
                break;
            case 88:
                Ctrl.space = false;
                break;
            default:
                break;
        }
    }
};

gd.template.Player = gd.template.Entity.extend({
    // Name of player for searching
    name: 'player',
    
    // Hit collision a = friendly, b = enemy
    type: 'a',
    
    // Spawning info
    x: -1.4,
    
    // Hitbox information
    width: 1,
    height: 1,
    
    // Rotate on the x and y axis information
    rotate: {
        angle: 0,
        axis: [0, 0, 1],
        speed: 3
    },
    
    // Speed of travel
    speed: .5,
    
    // Says if the player is allowed to shoot or not
    shoot: true,
    
    // Time in milliseconds to delay firing
    shootDelay: 400,
    
    init: function() {
        // Setup triangle shape
        this.shape([
            0.0,  2.0,  0.0, // top
           -1.0, -1.0,  0.0, // left
            1.0, -1.0,  0.0  // right
        ]);
        
        // Setup white color
        this.color([
            // red, green, blue, alpha (aka transparency)
            1.0, 1.0, 1.0, 1.0, // top
            1.0, 1.0, 1.0, 1.0, // left
            1.0, 1.0, 1.0, 1.0  // right
        ]);
        
        // Run graphic buffers
        this._super();
    },
    
    update: function() {
        var self = this;
                    
        // Move left or right to rotate the player
        if (Ctrl.left) {
            this.rotate.angle += this.rotate.speed;  
        } else if (Ctrl.right) {
            this.rotate.angle -= this.rotate.speed;  
        }
        
        if (Ctrl.up) {
            this.x -= Math.sin( this.rotate.angle * Math.PI / 180 ) * this.speed;
            this.y += Math.cos( this.rotate.angle * Math.PI / 180 ) * this.speed;
        } else if (Ctrl.down) {
            this.x += Math.sin( this.rotate.angle * Math.PI / 180 ) * this.speed;
            this.y -= Math.cos( this.rotate.angle * Math.PI / 180 ) * this.speed;
        }
        
        // Level boundaries logic
        var top = function() { self.y = gd.game.size.height },
        right = function() { self.x = gd.game.size.width },
        bottom = function() { self.y = - gd.game.size.height },
        left = function() { self.x = - gd.game.size.width };
        gd.game.boundaries(this, top, right, bottom, left);
        
        // Detect a player shooting
        if (Ctrl.space && this.shoot) {
            // Spawning elements need to take new parameters
            gd.game.spawn('Bullet', this.rotate.angle, this.x, this.y);
            
            // Create a timer to prevent firing
            this.shoot = false;
            window.setTimeout(function() {
                self.shoot = true;
            }, this.shootDelay);
        }
    },
    
    kill: function() {
        this._super();
        
        // Clear timeout for leveling
        AsteroidGen.clear();
        
        // End game screen
        Hud.end();
    }
});

// heads up display
Hud = {
    init: function() {
        var self = this;
        
        // Setup start callback
        var callback = function() {
            if (Ctrl.space) {            
                // Remove listener
                window.removeEventListener('keydown', callback, true);
                
                // Create asteroid generator
                AsteroidGen.init();
                
                // Hide text
                self.el.start.style.display = 'none';
                self.el.title.style.display = 'none';
            }
        }
        
        // Add click start listener
        window.addEventListener('keydown', callback, true);
    },
    
    end: function() {
        var self = this;
        
        // Show end game text
        this.el.end.style.display = 'block';
        
        // callback
        var callback = function() {
            // Run kill on everything in storage
            gd.game.armageddon();
            
            // Spawn player
            gd.game.spawn('Player');
            
            // Remove text
            self.el.end.style.display = 'none';
            
            // Debind listener
            window.removeEventListener('click', callback, true);
            
            // Reset score
            self.score.count = 0;
            
            // Begin asteroid generation
            AsteroidGen.init();
        };
        
        // add restart listener
        window.addEventListener('click', callback, true);
    },
    
    score: {
        count: 0,
        update: function() {
            this.count++;
            
            // Replace score text
            Hud.el.score.innerHTML = this.count;
            console.log(Hud.el.score);
        }
    },
    
    // Stores elements
    el: {
        score: document.getElementById('count'),
        start: document.getElementById('start'),
        end: document.getElementById('end'),
        title: document.getElementById('title')
    }
};

// Creates a cube by using multiple vertices
gd.template.Bullet = gd.template.Entity.extend({
    type: 'a',
    width: .6,
    height: .6,
    speed: .8,
    angle: 0,
    
    rotate: {
        angle: 0,
        axis: [.5, .5, 1],
        speed: 30
    },
    
    init: function(angle, x, y) {
        // Setup double sided triangle
        this.shape([
            // Front face
            0.0,  0.3,  0.0,
           -0.3, -0.3,  0.3,
            0.3, -0.3,  0.3,
           // Right face
            0.0,  0.3,  0.0,
            0.3, -0.3,  0.3,
            0.3, -0.3, -0.3,
           // Back face
            0.0,  0.3,  0.0,
            0.3, -0.3, -0.3,
           -0.3, -0.3, -0.3,
           // Left face
            0.0,  0.3,  0.0,
           -0.3, -0.3, -0.3,
           -0.3, -0.3,  0.3
        ]);
        
        // Setup bullet color by repeating
        var stack = [];
        for (var line = this.shapeRows; line--;)
            stack.push(1.0, 0.0, 0.0, 1.0);
        this.color(stack);
        
        // Set angle and location from parameters    
        this.angle = angle;
        this.x = x;
        this.y = y;
    },
    
    update: function() {
        var self = this;
        
        // Kill if the item goes outside a boundary
        var side = function() { self.kill() };
        gd.game.boundaries(this, side, side, side, side);
        
        // Movement
        this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed;
        this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed;
        
        // Uses a measurement of time to update and configure your rotation
        gd.game.rotate(this);
    },
    
    collide: function() {
        this._super();

        Hud.score.update();
    }
});
    
// Note: Make sure to clear asteroid generation upon death
AsteroidGen = {
    delay: 7000,
    speed: 10000,
    count: 1,
    
    init: function() {
        var self = this;
        
        // Spawn first asteroid
        gd.game.spawn('Asteroid');
        
        // Setup spawn timer
        this.create = window.setInterval(function() {
            gd.game.spawn('Asteroid');
        }, this.delay);
        
        // Difficulty modifier
        this.difficulty = window.setInterval( function() {
            self.faster();
        }, this.speed);
    },
    
    faster: function() {
        var self = this;
        
        // Clear spawner
        window.clearInterval(self.create);
        
        // Increase speed
        if (this.delay > 1000)
            this.delay -= 1000;
        
        // Increase count
        this.count++;
        
        this.create = window.setTimeout( function() {
            for (var c = self.count; c--;) {
                gd.game.spawn('Asteroid');
            }
        }, this.delay);
    },
    
    clear: function() {
        // Clear timers
        window.clearInterval(this.create);
        window.clearInterval(this.difficulty);
        
        // Set speed back to the default
        this.count = 0;
        this.delay = 7000;
    }
}

gd.template.Asteroid = gd.template.Entity.extend({
    type: 'b',
    width: 7,
    height: 9,
    
    init: function() {
        this.shape([
            // Top triangle
            // Front face
             0.0,  7.0,  0.0,
            -4.0,  2.0,  4.0,
             4.0,  2.0,  4.0,
           // Right face
             0.0,  7.0,  0.0,
             4.0,  2.0,  4.0,
             4.0,  2.0, -4.0,
           // Back face
             0.0,  7.0,  0.0,
             4.0,  2.0, -4.0,
            -4.0,  2.0, -4.0,
           // Left face
             0.0,  7.0,  0.0,
            -4.0,  2.0, -4.0,
            -4.0,  2.0,  4.0,
           
            // Middle plates
            // Plate
             -4.0, 2.0, 4.0,
             -4.0, -5.0, 4.0,
             -4.0, -5.0, -4.0,
             -4.0, 2.0, 4.0,
             -4.0, 2.0, -4.0,
             -4.0, -5.0, -4.0,
             
             // Plate
            -4.0,  2.0, -4.0,
            -4.0, -5.0, -4.0,
             4.0, -5.0, -4.0,
            -4.0,  2.0, -4.0,  
             4.0,  2.0, -4.0,  
             4.0, -5.0, -4.0,
             
             // Plate
             4.0,  2.0,  4.0,
             4.0,  2.0, -4.0,
             4.0, -5.0, -4.0,
             4.0,  2.0,  4.0,
             4.0, -5.0,  4.0,
             4.0, -5.0, -4.0,
             
            // Plate  
            -4.0,  2.0,  4.0,  
             4.0,  2.0,  4.0,  
             4.0, -5.0,  4.0,
            -4.0,  2.0,  4.0,
            -4.0, -5.0,  4.0,
             4.0, -5.0,  4.0,
    
           // Bottom triangle
            // Front face
            0.0, -10.0, 0.0,
           -4.0, -5.0,  4.0,
            4.0, -5.0,  4.0,
           // Right face
            0.0, -10.0, 0.0,
            4.0, -5.0,  4.0,
            4.0, -5.0, -4.0,
           // Back face
            0.0, -10.0, 0.0,
            4.0, -5.0, -4.0,
           -4.0, -5.0, -4.0,
            //Left face
            0.0, -10.0, 0.0,
           -4.0, -5.0, -4.0,
           -4.0, -5.0,  4.0
        ]);
    
        this.randomSide();
        this.randomMeta();
    
        // Generate color vertices (relies on data set by this.randomMeta)
        // Triangle is 36 vertics
        // Square is 72
        var stack = [];
        for (var v = 0; v < this.shapeRows * this.shapeColumns; v += 3 ) {
            // Triangle coloring
            if (v > 108 || v <= 36) {
                stack.push(this.colorData.pyramid[0], this.colorData.pyramid[1], this.colorData.pyramid[2], 1);
                
            // Square coloring
            } else {
                stack.push(this.colorData.cube[0], this.colorData.cube[1], this.colorData.cube[2], 1);
            }
        }
        this.color(stack);
    },
    
    // Randomly genertes meta information such as speed, rotation, and other details at random
    randomMeta: function() {
        this.rotate = {
            speed: gd.game.random.number(400, 100),
            axis: [
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10
            ],
            angle: gd.game.random.number(250)
        };
        
        // Randomly generate speed
        this.speed = {
            x: gd.game.random.number(10, 4) / 100,
            y: gd.game.random.number(10, 4) / 100
        };
        
        // Choose 3 random colors and cache them
        this.colorData = {
            pyramid: [
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10
            ],
            cube: [
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10
            ]
        };
    },
    
    // Determines a side of the play area to spawn from
    randomSide: function() {
        // Randomly spawn from one of four sides
        var side = gd.game.random.number(4, 1);
        
        //top
        if (side === 1) {
            this.angle = gd.game.random.number(200, 160);
            var range = gd.game.size.width - this.width;
            this.x = gd.game.random.number(range, -range);
            this.y = gd.game.size.height + this.height;
            
        // right
        } else if (side === 2) { 
            this.angle = gd.game.random.number(290, 250);
            var range = gd.game.size.height - this.height;
            this.x = (gd.game.size.width + this.width) * -1;
            this.y = gd.game.random.number(range, -range);
            
        // bottom
        } else if (side === 3) {
            this.angle = gd.game.random.number(380, 340);
            var range = gd.game.size.width - this.width;
            this.x = gd.game.random.number(range, -range);
            this.y = (this.height + gd.game.size.height) * -1;
            
        // left
        } else {
            this.angle = gd.game.random.number(110, 70);
            var range = gd.game.size.height - this.height;
            this.x = gd.game.size.width + this.width;
            this.y = gd.game.random.number(range, -range);
        }
    },
    
    update: function() {
        // Kill if the item goes outside a boundary
        if (this.x < - gd.game.size.width - this.width) {
            return this.kill();
        } else if (this.x > gd.game.size.width + this.width) {
            return this.kill();
        } else if (this.y < - gd.game.size.height - this.height) {
            return this.kill();
        } else if (this.y > gd.game.size.height + this.height) {
            return this.kill();
        }
        
        // Logic for acceleration
        this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed.x;
        this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed.y;
        
        gd.game.rotate(this);
    },

    collide: function() {            
        // Generate a number of particles spawned at current center
        for ( var p = 5; p--; ) {
            gd.game.spawn('Particle', this.x, this.y);
        }
        
        // Generate a random number of cubes spawned at current center
        num = gd.game.random.number(7, 3);
        for ( var c = num; c--; ) {
            gd.game.spawn('Cube', this.x, this.y);
        }
        
        this.kill();
    }
});

gd.template.Cube = gd.template.Entity.extend({
    type: 'b',
    size: {
        max: 3,
        min: 1,
        divider: 1
    },

    init: function(x, y) {
        this.x = x;
        this.y = y;
        
        // Random x and y acceleration
        this.speed = {
            x: (gd.game.random.number(50, 1) / 100) * gd.game.random.polarity(),
            y: (gd.game.random.number(50, 1) / 100) * gd.game.random.polarity()
        };
        
        // Random direction
        this.angle = gd.game.random.number(360);
        
        // Random size
        var s = gd.game.random.number(this.size.max, this.size.min) / this.size.divider;
        this.width = s * 2;
        this.height = s * 2;
        this.shape([
            // Front  
            -s, -s,  s,  
             s, -s,  s,  
             s,  s,  s,  
            -s,  s,  s,  
            // Back  
            -s, -s, -s,  
            -s,  s, -s,  
             s,  s, -s,  
             s, -s, -s,  
            // Top  
            -s,  s, -s,  
            -s,  s,  s,  
             s,  s,  s,  
             s,  s, -s,  
            // Bottom  
            -s, -s, -s,  
             s, -s, -s,  
             s, -s,  s,  
            -s, -s,  s,  
            // Right  
             s, -s, -s,  
             s,  s, -s,  
             s,  s,  s,  
             s, -s,  s,  
            // Left  
            -s, -s, -s,  
            -s, -s,  s,  
            -s,  s,  s,  
            -s,  s, -s  
        ]);
        
        this.dimension([
             0,  1,  2,    0,  2,  3, // front
             4,  5,  6,    4,  6,  7, // back
             8,  9, 10,    8, 10, 11, // top
            12, 13, 14,   12, 14, 15, // bottom
            16, 17, 18,   16, 18, 19, // right
            20, 21, 22,   20, 22, 23  // left
        ]);
        
        this.color([
            [1, 0, 0, 1], // Front: red  
            [0, 1, 0, 1], // Back: green  
            [0, 0, 1, 1], // Top: blue  
            [1, 1, 0, 1], // Bottom: blue  
            [1, 0, 1, 1], // Right face: yellow  
            [0, 1, 1, 1]  // Left face: purple  
        ]);
        
        this.rotate = {
            axis: [
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10,
                gd.game.random.number(10, 1) / 10],
            angle: gd.game.random.number(350),
            speed: gd.game.random.number(400, 200)
        };
    },
    
    // Occurs at each frame update
    // Init: function() {} can also be called to alter an object right when its created
    update: function() {
        var self = this;
        
        // Level boundaries
        // Kill if the item goes outside a boundary
        var side = function() { self.kill() };
        gd.game.boundaries(this, side, side, side, side);
        
        // Logic for acceleration
        this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed.x;
        this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed.y;
        
        // Uses a measurement of time to update and configure your rotation
        // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
        gd.game.rotate(this);
    }
});

gd.template.Particle = gd.template.Cube.extend({
    type: 0,
    size: {
        min: 1,
        max: 3,
        divider: 10
    },
    count: 0,
    init: function(x, y) {
        console.log(this._super(x, y));
    },
    update: function() {
        // Add z axis to make the cube fly in 3D
        if (this.count > 200) {
            this.kill();
        } else {
            this.count++;
        }
        
        this._super();
    }
});