window.onload = function() {
    
    /*------------
     Running The Program 
    ------------*/
    var World = new Engine();
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
    var Square = Entity.extend({
        rotate: [1,0,1],
        
        bufCols: 3,
        bufRows: 36,
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
            // r,g,b,a
            [1, 0, 0, 1], // Front: red  
            [0, 1, 0, 1], // Back: green  
            [0, 0, 1, 1], // Top: blue  
            [1, 1, 0, 1], // Bottom: blue  
            [1, 0, 1, 1], // Right face: yellow  
            [0, 1, 1, 1]  // Left face: purple  
        ]
    });
    
    var SquareStop = Square.extend({
        rotate: null
    });
    
    var SquareSolid = Square.extend({
        colVert: [
            [0, 1, 0, 1],  
            [0, 1, 0, 1],  
            [0, 1, 0, 1],  
            [0, 1, 0, 1], 
            [0, 1, 0, 1], 
            [0, 1, 0, 1] 
        ]
    });
    
    var SquareFlat = Square.extend({
        bufRows: 4,
        bufVert: [
             1.0,  1.0,  0.0,  
            -1.0,  1.0,  0.0,  
             1.0, -1.0,  0.0,  
            -1.0, -1.0,  0.0
        ],
        bufDim: null,
        
        colOutput: function() {
            vert = [ 1, 0, 0, 1,
                     0, 1, 1, 1,
                     1, 0, 1, 1,
                     1, 1, 0, 1 ]
            return vert;
        }
    });
    
    var SquareReverse = Square.extend({
        rotate: [-1,0,-1]
    });
    
    
    /*------------
     Object Spawning
    ------------*/
    World.spawnEntity(SquareStop,-6,4,-15);
    World.spawnEntity(Square, 6, -4, 5);
    World.spawnEntity(SquareSolid, 6, -4, -5);
    World.spawnEntity(SquareReverse, 0, 8, 0);
    World.spawnEntity(SquareFlat, -12, -8, 0);
    
} // End onload