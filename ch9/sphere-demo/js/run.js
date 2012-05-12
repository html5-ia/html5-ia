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
        //bufDim: [
        //     0,  1,  2,    0,  2,  3, // front
        //     4,  5,  6,    4,  6,  7, // back
        //     8,  9, 10,    8, 10, 11, // top
        //    12, 13, 14,   12, 14, 15, // bottom
        //    16, 17, 18,   16, 18, 19, // right
        //    20, 21, 22,   20, 22, 23  // left
        //],
            
        colRows: 6,
        colCols: 4,
        colVert: [
            [1, 0, 0, 1], // Front: red  
            [0, 1, 0, 1], // Back: green  
            [0, 0, 1, 1], // Top: blue  
            [1, 1, 0, 1], // Bottom: blue  
            [1, 0, 1, 1], // Right face: yellow  
            [0, 1, 1, 1]  // Left face: purple  
        ]
    });
    
    var Sphere = Entity.extend({
        latitudeBands: 30,
        longitudeBands: 30,
        radius: 2,
        
        init: function() {
            // Based on this sphere tutorial http://learningwebgl.com/blog/?p=1253
            // Create a series of vertices for the circle
            for (var latNumber = 0; latNumber <= this.latitudeBands; latNumber++) {
                var theta = latNumber * Math.PI / this.latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
                
                for (var longNumber = 0; longNumber <= this.longitudeBands; longNumber++) {
                    var phi = longNumber * 2 * Math.PI / this.longitudeBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);
            
                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - (longNumber / this.longitudeBands);
                    var v = 1 - (latNumber / this.latitudeBands);
            
                    // normalData
                    //this.normalVert.push(x);
                    //this.normalVert.push(y);
                    //this.normalVert.push(z);
                    
                    // Note: Might or might not work, color should be sufficient, double check
                    //textureCoordData.push(u);
                    //textureCoordData.push(v);
                    
                    // vertexPositionData
                    this.bufVert.push(this.radius * x);
                    this.bufVert.push(this.radius * y);
                    this.bufVert.push(this.radius * z);
                }
            }
            //console.log(this.normalVert);
            
            for (var latNumber = 0; latNumber < this.latitudeBands; latNumber++) {
                  for (var longNumber = 0; longNumber < this.longitudeBands; longNumber++) {
                    var first = (latNumber * (this.longitudeBands + 1)) + longNumber;
                    var second = first + this.longitudeBands + 1;
                    
                    // indexData
                    this.bufDim.push(first);
                    this.bufDim.push(second);
                    this.bufDim.push(first + 1);
            
                    this.bufDim.push(second);
                    this.bufDim.push(second + 1);
                    this.bufDim.push(first + 1);
                }
            }
        },
        
        indexData: [],
        normalVert: [],
        bufRows: 3, // Increased due to larger verticies
        bufVert: [],
        // Maps the square vertices into a cube with dimension
        bufDim: [],
            
        colRows: 1,
        colCols: 4,
        colVert: [
            [1, 0, 0, 1]
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
    //World.spawnEntity(Square, 0, 0, -20);
    World.spawnEntity(Cube, 0, 0, -20);
    
} // End onload