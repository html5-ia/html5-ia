gd.core.init(800, 600, function() {
    //gd.game.spawnEntity(Player);
    //gd.game.spawnEntity(Hud);
    //gd.game.spawnEntity(Bullet);
});

// x and y coordinate information for 3D space, manually retrieved
gd.core.size = {
    width: 43,
    height: 32
};

/*------------
 Object Templates
------------*/
var Hud = {
    // score counter
    score: {
        current: 0,
        prev: 0
    },
    
    init: function() {
        // Begin game on click
        window.addEventListener('keydown', this.start, true);
    },
    
    start: function(e) {
        if (Ctrl.space) {
            var hud = World.entityGetVal('name', 'hud');
            
            // Remove listener
            window.removeEventListener('keydown', hud[0].start, true);
            
            // Create asteroid generator
            AsteroidGen.init();
            
            // Hide text
            hud[0].el.start.style.display = 'none';
            hud[0].el.title.style.display = 'none';
        }
    },
    
    end: function() {
        var self = this;
        
        // Show end game text
        this.el.end.style.display = 'block';
        
        // callback
        var callback = function() {
            // Run kill on everything in storage
            for ( var o = World.storage.length; o--; ) {
                // Note: Not the best way to do this, but it works... Should call the actual kill
                if (World.storage[o].name !== 'hud')
                    World.graveyard.push(World.storage[o]);
            }
            
            // Spawn player
            World.spawnEntity(Player);
            
            // Remove text
            self.el.end.style.display = 'none';
            
            // Debind listener
            window.removeEventListener('click', callback, true);
            
            // Reset score
            self.score.current = 0;
            
            // Begin asteroid generation
            AsteroidGen.init();
        };
        
        // add restart listener
        window.addEventListener('click', callback, true);
    },
    
    update: function() {
        // Check if the score has changed, if so, update the counter
        if (this.score.current !== this.score.prev) {
            // Replace score text
            this.el.score.innerHTML = this.score.current;
        }
        this.score.prev = this.score.current;
    },
    
    // Stores elements
    el: {
        score: document.getElementById('count'),
        start: document.getElementById('start'),
        end: document.getElementById('end'),
        title: document.getElementById('title')
    }
};
//
//
//var Player = Entity.extend({
//    name: 'player',
//    type: 'a',
//    width: 1,
//    height: 1,
//    // Vertices setup to create a triangle
//    bufCols: 3,
//    bufRows: 3,
//    bufVert: [
//         0.0,  2.0,  0.0,  
//        -1.0, -1.0,  0.0,
//         1.0, -1.0,  0.0
//    ],
//    
//    kill: function() {
//        this._super();
//        
//        // Clear timeout for leveling
//        AsteroidGen.clear();
//        
//        // End game screen
//        var hud = World.entityGetVal('name', 'hud')[0];
//        hud.end();
//    },
//    
//    // Color integration
//    col: [
//        // red, green, blue, alpha (aka transparency)
//        1, 1, 1, 1,
//        1, 1, 1, 1,
//        1, 1, 1, 1
//    ],
//    
//    // Rotate on the x and y axis
//    rotateInit: 0,
//    rotateSpeed: 3,
//    rotate: [0, 0, 1],
//    
//    // Speed of travel
//    speed: .5,
//    
//    // Says if the player is allowed to shoot or not
//    shoot: true,
//    
//    // Time in milliseconds to delay firing
//    shootDelay: 400,
//    
//    update: function() {
//        var self = this;
//                    
//        // Move left or right to rotate the player
//        if (Ctrl.left) {
//            this.rotateInit += this.rotateSpeed;  
//        } else if (Ctrl.right) {
//            this.rotateInit -= this.rotateSpeed;  
//        }
//        
//        if (Ctrl.up) {
//            this.x -= Math.sin( this.rotateInit * Math.PI / 180 ) * this.speed;
//            this.y += Math.cos( this.rotateInit * Math.PI / 180 ) * this.speed;
//        } else if (Ctrl.down) {
//            this.x += Math.sin( this.rotateInit * Math.PI / 180 ) * this.speed;
//            this.y -= Math.cos( this.rotateInit * Math.PI / 180 ) * this.speed;
//        }
//        
//        // Level boundaries
//        if (this.x < - gd.game.size.width) {
//            return this.x = - gd.game.size.width;
//        } else if (this.x > gd.game.size.width) {
//            return this.x = gd.game.size.width;
//        } else if (this.y < - gd.game.size.height) {
//            return this.y = - gd.game.size.height;
//        } else if (this.y > gd.game.size.height) {
//            return this.y = gd.game.size.height;
//        }
//        
//        // Detect a player shooting
//        if (Ctrl.space && this.shoot) {
//            // Spawning elements need to take new parameters
//            var temp = World.spawnEntity(Bullet, this.x, this.y, 0);
//            
//            // Create a timer to prevent firing
//            this.shoot = false;
//            window.setTimeout(function() {
//                self.shoot = true;
//            }, this.shootDelay);
//        }
//    }
//});
//
//// Creates a cube by using multiple vertices
//var Bullet = Entity.extend({
//    x: 0,
//    y: 0,
//    z: 0,
//    angle: 0,
//    type: 'a',
//    width: .6,
//    height: .6,
//    init: function() {
//        var player = World.entityGetVal('name', 'player');
//        if (player)
//            this.angle = player[0].rotateInit;
//    },
//    collide: function() {
//        this._super();
//        var hud = World.entityGetVal('name', 'hud')[0];
//        hud.score.current++;
//    },
//    
//    bufCols: 3,
//    bufRows: 12, // Increased due to larger verticies
//    bufVert: [
//        // Front face
//        0.0,  0.3,  0.0,
//       -0.3, -0.3,  0.3,
//        0.3, -0.3,  0.3,
//       // Right face
//        0.0,  0.3,  0.0,
//        0.3, -0.3,  0.3,
//        0.3, -0.3, -0.3,
//       // Back face
//        0.0,  0.3,  0.0,
//        0.3, -0.3, -0.3,
//       -0.3, -0.3, -0.3,
//       // Left face
//        0.0,  0.3,  0.0,
//       -0.3, -0.3, -0.3,
//       -0.3, -0.3,  0.3
//    ],
//
//    rotateInit: 360,
//    rotate: [.5, .5, 1],
//    
//    speed: .8,
//        
//    col: [
//        // red, green, blue, alpha (aka transparency)
//        // Front face
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0,
//        1.0, 0.0, 0.0, 1.0
//    ],
//    rotateDelay: 30,
//    update: function() {
//        // Level boundaries
//        if (this.x < - gd.game.size.width - this.width) {
//            return this.kill();
//        } else if (this.x > gd.game.size.width + this.width) {
//            return this.kill();
//        } else if (this.y < - gd.game.size.height - this.height) {
//            return this.kill();
//        } else if (this.y > gd.game.size.height + this.height) {
//            return this.kill();
//        }
//        
//        // Movement
//        this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed;
//        this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed;
//        
//        // Uses a measurement of time to update and configure your rotation
//        // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
//        this.currentTime = (new Date).getTime();
//        if (this.lastUpdate < this.currentTime) {  
//            this.delta = (this.currentTime) - this.lastUpdate;  
//            
//            this.rotateInit += (30 * this.delta) / this.rotateDelay;  
//        }  
//        this.lastUpdate = this.currentTime;
//    }
//});
//    
//// Note: Make sure to clear asteroid generation upon death
//var AsteroidGen = {
//    delay: 7000,
//    count: 1,
//    //speed: 20000,
//    speed: 10000,
//    
//    init: function() {
//        var self = this;
//        
//        // Spawn first asteroid
//        World.spawnEntity(Asteroid);
//        
//        // Setup spawn timer
//        this.create = window.setInterval(function() {
//            World.spawnEntity(Asteroid);
//        }, this.delay);
//        
//        // Difficulty modifier
//        this.difficulty = window.setInterval( function() {
//            self.faster();
//        }, this.speed);
//    },
//    
//    faster: function() {
//        var self = this;
//        
//        // Clear spawner
//        window.clearInterval(self.create);
//        
//        // Increase speed
//        if (this.delay > 1000)
//            this.delay -= 1000;
//        
//        // Increase count
//        this.count++;
//        
//        this.create = window.setTimeout( function() {
//            for (var c = self.count; c--;) {
//                World.spawnEntity(Asteroid);
//            }
//        }, this.delay);
//    },
//    
//    clear: function() {
//        // Clear timers
//        window.clearInterval(this.create);
//        window.clearInterval(this.difficulty);
//        
//        // Set speed back to the default
//        this.count = 0;
//        this.delay = 7000;
//    }
//}
//var Asteroid = Bullet.extend({
//    type: 'b',
//    width: 7,
//    height: 9,
//    
//    rotateDelay: 300,
//    bufRows: 48, 
//
//    init: function() {
//        // Randomly generate speed
//        this.speed = {
//            x: World.random(10, 4) / 100,
//            y: World.random(10, 4) / 100
//        }
//        
//        // Randomly spawn from one of four sides
//        var side = World.random(4, 1);
//        
//        //top
//        if (side === 1) {
//            this.angle = World.random(200, 160);
//            var range = gd.game.size.width - this.width;
//            this.x = World.random(range, -range);
//            this.y = gd.game.size.height + this.height;
//            
//        // right
//        } else if (side === 2) { 
//            this.angle = World.random(290, 250);
//            var range = gd.game.size.height - this.height;
//            this.x = (gd.game.size.width + this.width) * -1;
//            this.y = World.random(range, -range);
//            
//        // bottom
//        } else if (side === 3) {
//            this.angle = World.random(380, 340);
//            var range = gd.game.size.width - this.width;
//            this.x = World.random(range, -range);
//            this.y = (this.height + gd.game.size.height) * -1;
//            
//        // left
//        } else {
//            this.angle = World.random(110, 70);
//            var range = gd.game.size.height - this.height;
//            this.x = gd.game.size.width + this.width;
//            this.y = World.random(range, -range);
//        }
//        
//        // Speed of rotation
//        this.rotateDelay = World.random(500, 100);
//        
//        // Randomly generate axis rotation
//        this.rotate = [
//            World.random(10, 1) / 10,
//            World.random(10, 1) / 10,
//            World.random(10, 1) / 10
//        ];
//        
//        // Choose 3 random colors and cache them
//        var color = {
//            pyramid: [
//                World.random(10, 1) / 10,
//                World.random(10, 1) / 10,
//                World.random(10, 1) / 10
//            ],
//            cube: [
//                World.random(10, 1) / 10,
//                World.random(10, 1) / 10,
//                World.random(10, 1) / 10
//            ]
//        };
//
//        // Generate color vertices
//        var length = this.bufVert.length;
//        for (var v = 0; v < length; v += 3 ) {
//            // Triangle is 36 vertics
//            // Square is 72
//            if (v > 108 || v <= 36) {
//                this.col.push(color.pyramid[0], color.pyramid[1], color.pyramid[2], 1);
//            } else {
//                this.col.push(color.cube[0], color.cube[1], color.cube[2], 1);
//            }
//        }
//    },
//    rotate: [1, 1, .5],
//    update: function() {
//        // Level boundaries
//        if (this.x < - gd.game.size.width - this.width) {
//            return this.kill();
//        } else if (this.x > gd.game.size.width + this.width) {
//            return this.kill();
//        } else if (this.y < - gd.game.size.height - this.height) {
//            return this.kill();
//        } else if (this.y > gd.game.size.height + this.height) {
//            return this.kill();
//        }
//        
//        // Logic for acceleration
//        this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed.x;
//        this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed.y;
//        
//        // Uses a measurement of time to update and configure your rotation
//        // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
//        this.currentTime = (new Date).getTime();
//        if (this.lastUpdate < this.currentTime) {  
//            this.delta = (this.currentTime) - this.lastUpdate;  
//            
//            this.rotateInit += (30 * this.delta) / this.rotateDelay;  
//        }  
//        this.lastUpdate = this.currentTime;
//    },
//    collide: function(obj) {            
//        // Generate a random number of particles spawned at current center
//        var num = World.random(40, 10);
//        for ( var p = num; p--; ) {
//            World.spawnEntity(Particle, this.x, this.y, this.z);
//        }
//        
//        // Generate a random number of cubes spawned at current center
//        num = World.random(7, 3);
//        for ( var c = num; c--; ) {
//            World.spawnEntity(Cube, this.x, this.y, this.z);
//        }
//        
//        this.kill();
//    },
//    
//    bufVert: [
//        // Top triangle
//        // Front face
//        0.0,  7,  0.0,
//       -4, 2,  4,
//        4, 2,  4,
//       // Right face
//        0.0,  7,  0.0,
//        4, 2,  4,
//        4, 2, -4,
//       // Back face
//        0.0,  7,  0.0,
//        4, 2, -4,
//       -4, 2, -4,
//       // Left face
//        0.0,  7,  0.0,
//       -4, 2, -4,
//       -4, 2,  4,
//       
//       // Middle plates
//        // Plate
//         -4, 2, 4,
//         -4, -5, 4,
//         -4, -5, -4,
//         
//         -4, 2, 4,
//         -4, 2, -4,
//         -4, -5, -4,
//         
//         // Plate
//         -4, 2, -4,
//         -4, -5, -4,
//         4, -5, -4,
//         
//        -4, 2, -4,  
//         4, 2, -4,  
//         4,  -5, -4,
//         
//         // Plate
//        4, 2, 4,
//         4, 2, -4,
//         4, -5, -4,
//         
//        4, 2, 4,
//        4, -5, 4,
//         4, -5, -4,
//         
//
//         
//        // Plate  
//        -4, 2, 4,  
//         4, 2, 4,  
//         4,  -5, 4,
//         
//         -4, 2, 4,
//         -4, -5, 4,
//         4, -5, 4,
//
//       
//       // Bottom triangle
//        // Front face
//        0.0,  -10,  0.0,
//       -4, -5,  4,
//        4, -5,  4,
//       // Right face
//        0.0,  -10,  0.0,
//        4, -5,  4,
//        4, -5, -4,
//       // Back face
//        0.0,  -10,  0.0,
//        4, -5, -4,
//       -4, -5, -4,
//        //Left face
//        0.0,  -10,  0.0,
//       -4, -5, -4,
//       -4, -5,  4
//    ],
//    col: []
//});
//
//var Cube = Entity.extend({
//    z: 0,
//    type: 'b',
//    size: {
//        max: 3,
//        min: 1,
//        divider: 1
//    },
//    alpha: 1,
//    init: function() {
//        // Random axis rotation
//        this.rotate = [
//            World.random(10, 1) / 10,
//            World.random(10, 1) / 10,
//            World.random(10, 1) / 10
//        ];
//        
//        // Random rotation speed
//        this.rotateDelay = World.random(300, 30);
//        
//        // Random x and y acceleration
//        this.speed = {
//            x: (World.random(50, 1) / 100) * World.randomPosNeg(),
//            y: (World.random(50, 1) / 100) * World.randomPosNeg()
//        };
//        
//        // Random direction
//        this.angle = this.rotateInit = World.random(360);
//        
//        // Random size
//        var s = World.random(this.size.max, this.size.min) / this.size.divider;
//        this.width = s * 2;
//        this.height = s * 2;
//        this.bufVert = [
//            // Front  
//            -s, -s, s,  
//             s, -s, s,  
//             s,  s, s,  
//            -s,  s, s,  
//            // Back  
//            -s, -s, -s,  
//            -s,  s, -s,  
//             s,  s, -s,  
//             s, -s, -s,  
//            // Top  
//            -s,  s, -s,  
//            -s,  s,  s,  
//             s,  s,  s,  
//             s,  s, -s,  
//            // Bottom  
//            -s, -s, -s,  
//             s, -s, -s,  
//             s, -s,  s,  
//            -s, -s,  s,  
//            // Right  
//             s, -s, -s,  
//             s,  s, -s,  
//             s,  s,  s,  
//             s, -s,  s,  
//            // Left  
//            -s, -s, -s,  
//            -s, -s,  s,  
//            -s,  s,  s,  
//            -s,  s, -s  
//        ]
//    },
//    
//    bufCols: 3,
//    bufRows: 36, // Increased due to larger verticies
//    // Maps the square vertices into a cube with dimension
//    bufDim: [
//         0,  1,  2,    0,  2,  3, // front
//         4,  5,  6,    4,  6,  7, // back
//         8,  9, 10,    8, 10, 11, // top
//        12, 13, 14,   12, 14, 15, // bottom
//        16, 17, 18,   16, 18, 19, // right
//        20, 21, 22,   20, 22, 23  // left
//    ],
//        
//    colRows: 6,
//    colCols: 4,
//    colVert: [
//        [1, 0, 0, this.alpha], // Front: red  
//        [0, 1, 0, this.alpha], // Back: green  
//        [0, 0, 1, this.alpha], // Top: blue  
//        [1, 1, 0, this.alpha], // Bottom: blue  
//        [1, 0, 1, this.alpha], // Right face: yellow  
//        [0, 1, 1, this.alpha]  // Left face: purple  
//    ],
//    
//    // Occurs at each frame update
//    // Init: function() {} can also be called to alter an object right when its created
//    update: function() {
//        // Level boundaries
//        if (this.x < - gd.game.size.width - this.width) {
//            return this.kill();
//        } else if (this.x > gd.game.size.width + this.width) {
//            return this.kill();
//        } else if (this.y < - gd.game.size.height - this.height) {
//            return this.kill();
//        } else if (this.y > gd.game.size.height + this.height) {
//            return this.kill();
//        }
//        
//        // Logic for acceleration
//        this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed.x;
//        this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed.y;
//        
//        // Uses a measurement of time to update and configure your rotation
//        // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
//        this.currentTime = (new Date).getTime();
//        if (this.lastUpdate < this.currentTime) {  
//            this.delta = this.currentTime - this.lastUpdate;  
//            
//            this.rotateInit += (30 * this.delta) / this.rotateDelay;  
//        }  
//        this.lastUpdate = this.currentTime;  
//    }
//});
//
//var Particle = Cube.extend({
//    type: 0,
//    size: {
//        min: 1,
//        max: 3,
//        divider: 10
//    },
//    speed: {
//        z: 0
//    },
//    init: function() {
//        this._super();
//        
//        var self = this;
//        this.create = window.setTimeout(function() {
//            self.kill();
//        }, 2000);
//    },
//    update: function() {
//        // Add z axis to make the cube fly in 3D
//        this.z += 1;
//        
//        this._super();
//    }
//});
//
///***************************
//Game Controllers
//***************************/
//var Ctrl = {
//    init: function() {
//        window.addEventListener('keydown', this.keyDown, true);
//        window.addEventListener('keyup', this.keyUp, true);
//    },
//    
//    keyDown: function(event) {
//        switch(event.keyCode) {
//            case 38: // up
//                Ctrl.up = true;
//                break;
//            case 40: // down
//                Ctrl.down = true;
//                break;
//            case 37: // Left
//                Ctrl.left = true;
//                break;
//            case 39: // Right
//                Ctrl.right = true;
//                break;
//            case 88:
//                Ctrl.space = true;
//                break;
//            default:
//                break;
//        }
//    },
//    
//    keyUp: function(event) {
//        
//        switch(event.keyCode) {
//            case 38:
//                Ctrl.up = false;
//                break;
//            case 40:
//                Ctrl.down = false;
//                break;
//            case 37: // Left
//                Ctrl.left = false;
//                break;
//            case 39: // Right
//                Ctrl.right = false;
//                break;
//            case 88:
//                Ctrl.space = false;
//                break;
//            default:
//                break;
//        }
//    }
//};
//Ctrl.init();