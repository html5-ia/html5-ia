window.onload = function() {
/*------------
 Running The Game 
------------*/
var World = new Engine();
World.setup();

// Animation must be kept seperate due to a DOM error it causes from self-reference in your objects
function animate() {
    requestAnimFrame( animate );
    World.draw();
}
animate();


/*------------
 Entity Objects
------------*/
var Square = Entity.extend({
        x: 0,
        y: 0,
        z: -6,
        posVert: function() {
            return [ this.x, this.y, this.z ];
        },
        
        bufCols: 3,
        bufRows: 36,
        bufVert: [
            // Front face  
            -1.0, -1.0,  1.0,  
             1.0, -1.0,  1.0,  
             1.0,  1.0,  1.0,  
            -1.0,  1.0,  1.0,  
              
            // Back face  
            -1.0, -1.0, -1.0,  
            -1.0,  1.0, -1.0,  
             1.0,  1.0, -1.0,  
             1.0, -1.0, -1.0,  
              
            // Top face  
            -1.0,  1.0, -1.0,  
            -1.0,  1.0,  1.0,  
             1.0,  1.0,  1.0,  
             1.0,  1.0, -1.0,  
              
            // Bottom face  
            -1.0, -1.0, -1.0,  
             1.0, -1.0, -1.0,  
             1.0, -1.0,  1.0,  
            -1.0, -1.0,  1.0,  
              
            // Right face  
             1.0, -1.0, -1.0,  
             1.0,  1.0, -1.0,  
             1.0,  1.0,  1.0,  
             1.0, -1.0,  1.0,  
              
            // Left face  
            -1.0, -1.0, -1.0,  
            -1.0, -1.0,  1.0,  
            -1.0,  1.0,  1.0,  
            -1.0,  1.0, -1.0  
        ],
        
        bufDim: [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ],
        
        colRows: 6,
        colCols: 4,
        colVert: [
            // r,g,b,a
            [1.0,  1.0,  1.0,  1.0],    // Front face: white  
            [1.0,  0.0,  0.0,  1.0],    // Back face: red  
            [0.0,  1.0,  0.0,  1.0],    // Top face: green  
            [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue  
            [1.0,  1.0,  0.0,  1.0],    // Right face: yellow  
            [1.0,  0.0,  1.0,  1.0]     // Left face: purple  
        ],
        
        // Make so no rotate will not rotate the shape and not crash
        rotate: [1,0,1],

        init: function() {
                
        },
        spawn: function(x,y,z) { // Add x, y, z support
                if (x) this.x = x;
                if (y) this.y = y;
                if (z) this.z = z;
                this.init();
                return this;
        }
});


/*------------
 Entity Spawning
------------*/
World.spawnEntity(Square,0,0,-6);

} // End onload