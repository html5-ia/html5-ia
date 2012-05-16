/*
Name: Entity Templates
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
Credits: Uses a modified version of John Resig's class extension script http://ejohn.org/blog/simple-javascript-inheritance/

Desc: Store location for all classes.

Notes:
- Is it better to declar unused variables as false or undefined
*/

var gd = gd || {};

// Initialize and create an object so other classes can be stored here
gd.template = {
    Entity: Class.extend({
        // Passive = 0, friendly a, enemy b
        type: 0,
        
        // Determines position
        x: 0,
        y: 0,
        z: 0,
        
        // Width and height relative to 3D world
        width: 0,
        height: 0,
        
        // Creates an artifical zoom without a complex transformation matrix or camera
        zoom: -80,
        
        // Returns an assembled position array
        position: function() {
            return [ this.x, this.y, this.z + this.zoom ];
        },
        
        // Logic fired at object destruction
        kill: function() {
            World.graveyard.push(this);
        },
        
        buffer: {
            // Buffer data for drawing
            vertices: undefined,
            
            // Buffer data for creating dimension (practically folds a passed object together)
            dimension: undefined
        },
        
        // Passes the object hit during a collision for processing
        collide: function(obj) {
            this.kill();
        },
        
        // Buffer data for color
        color: {
            // Used for a basic array of colors
            basic: undefined,
            
            // Used to map colors onto a complex shape
            advanced: undefined,
            map: function(array) {
                // Note: Convert this to be used by map and pass the value to this.advanced
                //if (this.colVert) {
                //    // Reset color incase something is already present
                //    this.col = [];
                //    // Generating colors for the cube by setting them along proper vertices
                //    for (i=0; i<this.colRows; i++) {
                //        var c = this.colVert[i];
                //        for (var k=0; k<this.colCols; k++) {
                //            this.col = this.col.concat(c);
                //        }
                //    }
                //}
                //return this.col;
            }
        },
        
        update: function() {
            // place code before animating here
        }
    })
};