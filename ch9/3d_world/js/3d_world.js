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
        bufRows: 4,
        bufVert: [
             1.0,  1.0,  0.0,  
            -1.0,  1.0,  0.0,  
             1.0, -1.0,  0.0,  
            -1.0, -1.0,  0.0
        ],
        
        colVert: [
            1.0,  1.0,  1.0,  1.0,    // white  
            1.0,  0.0,  0.0,  1.0,    // red  
            0.0,  1.0,  0.0,  1.0,    // green  
            0.0,  0.0,  1.0,  1.0     // blue  
        ],
        
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