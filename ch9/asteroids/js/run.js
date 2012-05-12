window.onload = function() {
    
    /*------------
     Running The Program 
    ------------*/
    // Setup your own engine
    var MyEngine = Engine.extend({
        width: 800,
        height: 600
    });
    
    // Create and activate it
    World = new MyEngine();
    World.setup();
    
    // Animation must be kept seperate due to a DOM error caused by self-reference in your objects
    function animate() {
        requestAnimFrame( animate );
        World.draw();
    }
    animate();
    
    
    /*------------
     Object Templates
    ------------*/
    var Hud = Entity.extend({
        name: 'hud',
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
            if (e.keyCode === 32) {
                var hud = World.entityGetVal('name', 'hud');
                
                // Remove listener
                window.removeEventListener('keydown', hud[0].start, true);
                
                // Create asteroid generator
                
                // Hide text
                hud[0].el.start.style.display = 'none';
                
                console.log('start');
            }
        },
        
        end: function() {
            var self = this;
            
            // Show end game text
            this.el.end.style.display = 'block';
            
            // add restart listener
            window.addEventListener('keydown', function() {
                // Spawn player
                
                // 
            }, true);
        },
        
        update: function() {
            // Check if the score has changed, if so, update the counter
            if (this.score.current > this.score.prev) {
                // Replace score text
                this.el.score.innherHTML = this.score.current;
            }
            this.score.prev = this.score.current;
        },
        
        // Stores elements
        el: {
            score: document.getElementById('count'),
            start: document.getElementById('start'),
            end: document.getElementById('end')
        }
        
        
    });
    
    var Player = Entity.extend({
        name: 'player',
        type: 'a',
        width: 1,
        height: 1,
        // Vertices setup to create a triangle
        bufCols: 3,
        bufRows: 3,
        bufVert: [
             0.0,  2.0,  0.0,  
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ],
        
        init: function() {
            // Add key binding logic
        },
        
        kill: function() {
            // Ends game and debinds keys
        },
        
        // Color integration
        col: [
            // red, green, blue, alpha (aka transparency)
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ],
        
        // Rotate on the x and y axis
        rotateInit: 0,
        rotateSpeed: 3,
        rotate: [0, 0, 1],
        
        // Speed of travel
        speed: .5,
        
        // Says if the player is allowed to shoot or not
        shoot: true,
        
        // Time in milliseconds to delay firing
        shootDelay: 300,
        
        update: function() {
            var self = this;
            
            // Move left or right to rotate the player
            if (Ctrl.left) {
                this.rotateInit += this.rotateSpeed;  
            } else if (Ctrl.right) {
                this.rotateInit -= this.rotateSpeed;  
            }
            
            if (Ctrl.up) {
                this.x -= Math.sin( this.rotateInit * Math.PI / 180 ) * this.speed;
                this.y += Math.cos( this.rotateInit * Math.PI / 180 ) * this.speed;
            } else if (Ctrl.down) {
                this.x += Math.sin( this.rotateInit * Math.PI / 180 ) * this.speed;
                this.y -= Math.cos( this.rotateInit * Math.PI / 180 ) * this.speed;
            }
            
            // Move forward or backward
            if (this.x < -43) {
                return this.x = -43;
            } else if (this.x > 43) {
                return this.x = 43;
            } else if (this.y < -31) {
                return this.y = -31;
            } else if (this.y > 31) {
                return this.y = 31;
            }
            
            // Detect a player shooting
            if (Ctrl.space && this.shoot) {
                // Spawning elements need to take new parameters
                var temp = World.spawnEntity(Bullet, this.x, this.y, 0);
                
                // Create a timer to prevent firing
                this.shoot = false;
                window.setTimeout(function() {
                    self.shoot = true;
                }, this.shootDelay);
            }
        }
    });
    
    // Creates a cube by using multiple vertices
    var Bullet = Entity.extend({
        angle: 0,
        type: 'a',
        width: .6,
        height: .6,
        init: function() {
            var player = World.entityGetVal('name', 'player');
            if (player)
                this.angle = player[0].rotateInit;
        },
        
        bufCols: 3,
        bufRows: 12, // Increased due to larger verticies
        bufVert: [
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
        ],

        rotateInit: 360,
        rotate: [.5, .5, 1],
        
        speed: .8,
            
        col: [
            // red, green, blue, alpha (aka transparency)
            // Front face
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0
        ],
        rotateDelay: 30,
        update: function() {
                this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed;
                this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed;
            
            // Uses a measurement of time to update and configure your rotation
            // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
            this.currentTime = (new Date).getTime();
            if (this.lastUpdate < this.currentTime) {  
                this.delta = (this.currentTime) - this.lastUpdate;  
                
                this.rotateInit += (30 * this.delta) / this.rotateDelay;  
            }  
            this.lastUpdate = this.currentTime;
        }
    });
    
    var Asteroid = Bullet.extend({
        type: 'b',
        width: 7,
        height: 9,
        
        rotateDelay: 300,
        bufRows: 48, 

        init: function() {
            this.rotateDelay = World.random(500, 100);
            
            // Randomly generate axis rotation
            this.rotate = [
                World.random(10, 1) / 10,
                World.random(10, 1) / 10,
                World.random(10, 1) / 10
            ];
            
            // Choose 3 random colors and cache them
            var color = {
                pyramid: [
                    World.random(10, 1) / 10,
                    World.random(10, 1) / 10,
                    World.random(10, 1) / 10
                ],
                cube: [
                    World.random(10, 1) / 10,
                    World.random(10, 1) / 10,
                    World.random(10, 1) / 10
                ]
            };

            // Generate color vertices
            var length = this.bufVert.length;
            for (var v = 0; v < length; v += 3 ) {
                // Triangle is 36 vertics
                // Square is 72
                if (v > 108 || v <= 36) {
                    this.col.push(color.pyramid[0], color.pyramid[1], color.pyramid[2], 1);
                } else {
                    this.col.push(color.cube[0], color.cube[1], color.cube[2], 1);
                }
            }
        },
        rotate: [1, 1, .5],
        update: function() {
            // Uses a measurement of time to update and configure your rotation
            // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
            this.currentTime = (new Date).getTime();
            if (this.lastUpdate < this.currentTime) {  
                this.delta = (this.currentTime) - this.lastUpdate;  
                
                this.rotateInit += (30 * this.delta) / this.rotateDelay;  
            }  
            this.lastUpdate = this.currentTime;
        },
        collide: function(obj) {
            this.kill();
            
            // Generate a random number of particles spawned at current center
            var num = World.random(9, 3) / 10;
            //for ();
            
            // Generate a random number of cubes spawned at current center
            var num = World.random(9, 3) / 10;
        },
        
        bufVert: [
            // Top triangle
            // Front face
            0.0,  7,  0.0,
           -4, 2,  4,
            4, 2,  4,
           // Right face
            0.0,  7,  0.0,
            4, 2,  4,
            4, 2, -4,
           // Back face
            0.0,  7,  0.0,
            4, 2, -4,
           -4, 2, -4,
           // Left face
            0.0,  7,  0.0,
           -4, 2, -4,
           -4, 2,  4,
           
           // Middle plates
            // Plate
             -4, 2, 4,
             -4, -5, 4,
             -4, -5, -4,
             
             -4, 2, 4,
             -4, 2, -4,
             -4, -5, -4,
             
             // Plate
             -4, 2, -4,
             -4, -5, -4,
             4, -5, -4,
             
            -4, 2, -4,  
             4, 2, -4,  
             4,  -5, -4,
             
             // Plate
            4, 2, 4,
             4, 2, -4,
             4, -5, -4,
             
            4, 2, 4,
            4, -5, 4,
             4, -5, -4,
             

             
            // Plate  
            -4, 2, 4,  
             4, 2, 4,  
             4,  -5, 4,
             
             -4, 2, 4,
             -4, -5, 4,
             4, -5, 4,

           
           // Bottom triangle
            // Front face
            0.0,  -10,  0.0,
           -4, -5,  4,
            4, -5,  4,
           // Right face
            0.0,  -10,  0.0,
            4, -5,  4,
            4, -5, -4,
           // Back face
            0.0,  -10,  0.0,
            4, -5, -4,
           -4, -5, -4,
            //Left face
            0.0,  -10,  0.0,
           -4, -5, -4,
           -4, -5,  4
        ],
        col: []
    });
    
    var Cube = Entity.extend({
        init: function() {
            // Random color of R, G, or B
            
            // Random axis rotation
            
            // Random rotation speed
            
            // Random x and y acceleration
        },
        bufRows: 36, // Increased due to larger verticies
        bufVert: [
            // Front  
            -1, -1, 1,  
             1, -1, 1,  
             1,  1, 1,  
            -1,  1, 1,  
            // Back  
            -1, -1, -1,  
            -1,  1, -1,  
             1,  1, -1,  
             1, -1, -1,  
            // Top  
            -1,  1, -1,  
            -1,  1,  1,  
             1,  1,  1,  
             1,  1, -1,  
            // Bottom  
            -1, -1, -1,  
             1, -1, -1,  
             1, -1,  1,  
            -1, -1,  1,  
            // Right  
             1, -1, -1,  
             1,  1, -1,  
             1,  1,  1,  
             1, -1,  1,  
            // Left  
            -1, -1, -1,  
            -1, -1,  1,  
            -1,  1,  1,  
            -1,  1, -1  
        ],
        // Maps the square vertices into a cube with dimension
        bufDim: [
             0,  1,  2,    0,  2,  3, // front
             4,  5,  6,    4,  6,  7, // back
             8,  9, 10,    8, 10, 11, // top
            12, 13, 14,   12, 14, 15, // bottom
            16, 17, 18,   16, 18, 19, // right
            20, 21, 22,   20, 22, 23  // left
        ],
            
        colRows: 6,
        colCols: 4,
        colVert: [
            [1, 0, 0, 1], // Front: red  
            [0, 1, 0, 1], // Back: green  
            [0, 0, 1, 1], // Top: blue  
            [1, 1, 0, 1], // Bottom: blue  
            [1, 0, 1, 1], // Right face: yellow  
            [0, 1, 1, 1]  // Left face: purple  
        ],
        
        // Variables can be created on the fly
        rotate: [1,0,1],
        rotateInit: 0,
        
        // Occurs at each frame update
        // Init: function() {} can also be called to alter an object right when its created
        update: function() {
            // Logic for acceleration
            
            
            // Uses a measurement of time to update and configure your rotation
            // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
            this.currentTime = (new Date).getTime();
            if (this.lastUpdate < this.currentTime) {  
                this.delta = this.currentTime - this.lastUpdate;  
                
                this.rotateInit += (30 * this.delta) / 1000.0;  
            }  
            this.lastUpdate = this.currentTime;  
        }
    });
    
    /***************************
    Game Controllers
    ***************************/
    var Ctrl = {
        init: function() {
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },
        
        keyDown: function(event) {
            
            switch(event.keyCode) {
                case 37: // Left
                    Ctrl.left = true;
                    break;
                case 39: // Right
                    Ctrl.right = true;
                    break;
                case 38: // up
                    Ctrl.up = true;
                    break;
                case 40: // down
                    Ctrl.down = true;
                    break;
                case 32:
                    Ctrl.space = true;
                    break;
                default:
                    break;
            }
        },
        
        keyUp: function(event) {
            
            switch(event.keyCode) {
                case 37: // Left
                    Ctrl.left = false;
                    break;
                case 39: // Right
                    Ctrl.right = false;
                    break;
                case 38:
                    Ctrl.up = false;
                    break;
                case 40:
                    Ctrl.down = false;
                    break;
                case 32:
                    Ctrl.space = false;
                    break;
                default:
                    break;
            }
        }
    };
    Ctrl.init();
    
    
    /*------------
     Object Spawning
    ------------*/
    // All objects drawn from center outward
    // You can respawn any object as many times as you want
    // Each object receives a unique ID so you don't have to worry about conflicting names
    
    // Four example objects on corners
    World.spawnEntity(Player, 0, 0, 0); // spawnEntity(entity, x, y, z);
    World.spawnEntity(Hud, 0, 0, 0);
    World.spawnEntity(Asteroid, 10, 10, 0);
    //World.spawnEntity(Bullet, 0, 0, 0);
    
} // End onload