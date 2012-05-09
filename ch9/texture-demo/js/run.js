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
    // Creates a 2D square with mutliple colors
    var Square = Entity.extend({
        // Vertices setup
        bufCols: 3,
        bufRows: 4,
        bufVert: [
             1.0,  1.0,  0.0,  
            -1.0,  1.0,  0.0,  
             1.0, -1.0,  0.0,  
            -1.0, -1.0,  0.0
        ],
        
        // Color integration
        col: [
            // red, green, blue, alpha (aka transparency)
            1, 0, 0, 1,
            0, 1, 1, 1,
            1, 0, 1, 1,
            1, 1, 0, 1
        ]
    });
    
    // Allows rotation of the square by updating before each draw sequence
    var SquareRotate = Square.extend({
        // Variables can be created on the fly
        rotate: [1,0,1],
        rotateInit: 0,
        
        // Occurs at each frame update
        // Init: function() {} can also be called to alter an object right when its created
        update: function() {
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
    
    // Creates a cube by using multiple vertices
    var Cube = SquareRotate.extend({
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
            
        textureMap: [
            // Front  
            0.0,  0.0,  
            1.0,  0.0,  
            1.0,  1.0,  
            0.0,  1.0,  
            // Back  
            0.0,  0.0,  
            1.0,  0.0,  
            1.0,  1.0,  
            0.0,  1.0,  
            // Top  
            0.0,  0.0,  
            1.0,  0.0,  
            1.0,  1.0,  
            0.0,  1.0,  
            // Bottom  
            0.0,  0.0,  
            1.0,  0.0,  
            1.0,  1.0,  
            0.0,  1.0,  
            // Right  
            0.0,  0.0,  
            1.0,  0.0,  
            1.0,  1.0,  
            0.0,  1.0,  
            // Left  
            0.0,  0.0,  
            1.0,  0.0,  
            1.0,  1.0,  
            0.0,  1.0  
        ]
    });
    
    
    /*------------
     Object Spawning
    ------------*/
    // All objects drawn from center outward
    // You can respawn any object as many times as you want
    // Each object receives a unique ID so you don't have to worry about conflicting names
    
    // Four example objects on corners
    /*World.spawnEntity(Player, 0, 0, -20);*/ // spawnEntity(entity, x, y, z);
    World.spawnEntity(Cube, 0, 0, -20);
} // End onload