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
    var World = new MyEngine();
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
    
    var Player = Entity.extend({
        // Vertices setup to create a triangle
        bufCols: 3,
        bufRows: 3,
        bufVert: [
             0.0,  2.0,  0.0,  
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ],
        
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
                var temp = World.spawnEntity(Bullet, this.x, this.y, 0, { angle: self.rotateInit });
                
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
        // Maps the square vertices into a cube with dimension
        //bufDim: [
        //     0,  1,  2,    0,  2,  3, // front
        //     4,  5,  6,    4,  6,  7 // back
        //],
        rotateInit: 360,
        rotate: [.5, .5, 1],
        
        speed: 1,
            
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
            //this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed;
            //this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed;
            
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
        rotateDelay: 300,
        bufRows: 48, // Increased due to larger verticies

        rotate: null,
        rotate: [1, 1, .5],
                
        bufVert: [
            // Top triangle
            // Front face
            0.0,  2,  0.0,
           -1, .5,  1,
            1, .5,  1,
           // Right face
            0.0,  2,  0.0,
            1, .5,  1,
            1, .5, -1,
           // Back face
            0.0,  2,  0.0,
            1, .5, -1,
           -1, .5, -1,
           // Left face
            0.0,  2,  0.0,
           -1, .5, -1,
           -1, .5,  1,
           
           // Middle plates
            // Plate
             -1, .5, 1,
             -1, -1, 1,
             -1, -1, -1,
             
             -1, .5, 1,
             -1, .5, -1,
             -1, -1, -1,
             
             // Plate
             -1, .5, -1,
             -1, -1, -1,
             1, -1, -1,
             
            -1, .5, -1,  
             1, .5, -1,  
             1,  -1, -1,
             
             // Plate
                          1, .5, 1,
             1, .5, -1,
             1, -1, -1,
             
            1, .5, 1,
             1, -1, 1,
             1, -1, -1,
             

             
            // Plate  
            -1, .5, 1,  
             1, .5, 1,  
             1,  -1, 1,
             
             -1, .5, 1,
             -1, -1, 1,
             1, -1, 1,

           
           // Bottom triangle
            // Front face
            0.0,  -2,  0.0,
           -1, -1,  1,
            1, -1,  1,
           // Right face
            0.0,  -2,  0.0,
            1, -1,  1,
            1, -1, -1,
           // Back face
            0.0,  -2,  0.0,
            1, -1, -1,
           -1, -1, -1,
            //Left face
            0.0,  -2,  0.0,
           -1, -1, -1,
           -1, -1,  1
        ],
        col: [
            // red, green, blue, alpha (aka transparency)
            // Front face
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            // Right face
            0, 1.0, 0.0, 1.0,
            0, 1.0, 0.0, 1.0,
            0, 1.0, 0.0, 1.0,
            // Back face
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            // Left face
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            // Front face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Right face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Back face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Left face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
                        // red, green, blue, alpha (aka transparency)
            // Front face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Right face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Back face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Left face
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Front face
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            // Right face
            0, 0.0, 1.0, 1.0,
            0, 0.0, 1.0, 1.0,
            0, 0.0, 1.0, 1.0,
            // Back face
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            // Left face
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0
        ]
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
    World.spawnEntity(Player, -43, 31, 0); // spawnEntity(entity, x, y, z);
    World.spawnEntity(Asteroid, 0, 0, 0);
    World.spawnEntity(Bullet, 0, 0, 0);
    
} // End onload