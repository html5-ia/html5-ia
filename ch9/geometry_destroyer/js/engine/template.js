/*
Name: Entity Templates
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
Credits: Uses a modified version of John Resig's class extension script http://ejohn.org/blog/simple-javascript-inheritance/

Desc: Storage location for all classes.
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

        // Creates an artifical zoom without a complex transformation matrix or camera
        zoom: -80,

        // Returns x, y, z in an array
        position: function() {
            return [this.x, this.y, this.z + this.zoom];
        },

        // Width and height relative to 3D world, manually set
        width: 0,
        height: 0,

        update: function() {
            // place code before animating here
        },

        // Passes the object hit during a collision for processing
        collide: function(object) {
            this.kill();
        },

        // Logic fired at object destruction
        kill: function() {
            gd.core.graveyard.storage.push(this);
        },

        // Rotation information, used in core.js
        rotate: {
            angle: 0,
            axis: false
        },

        shape: function(vertices) {
            this.shapeStorage = gd.gl.createBuffer();

            // Graphic storage
            gd.gl.bindBuffer(gd.gl.ARRAY_BUFFER, this.shapeStorage);

            // Uses float32 to change the array into a webGL edible format.
            gd.gl.bufferData(gd.gl.ARRAY_BUFFER, new Float32Array(vertices), gd.gl.STATIC_DRAW);

            // Count rows
            this.shapeColumns = 3;
            this.shapeRows = vertices.length / this.shapeColumns;
        },

        color: function(vertices) {
            this.colorStorage = gd.gl.createBuffer();

            // Map colors for a complex object such as a cube, before doing so, check if the first array element is a string
            // as it should be an array
            if (typeof vertices[0] === 'object') {
                // temporary storage location for new vertices
                var colorNew = [];

                // Create complete verticy array
                for (var v = 0; v < vertices.length; v++) {
                    var colorLine = vertices[v];
                    for (var c = 0; c < 4; c++) {
                        colorNew = colorNew.concat(colorLine);
                    }
                }

                // Apply new verticy array
                vertices = colorNew;
            }

            // Bind buffers as buffer.shape
            gd.gl.bindBuffer(gd.gl.ARRAY_BUFFER, this.colorStorage);
            gd.gl.bufferData(gd.gl.ARRAY_BUFFER, new Float32Array(vertices), gd.gl.STATIC_DRAW);

            // Count rows
            this.colorColumns = 4;
            this.colorRows = vertices.length / this.colorColumns;
        },

        indices: function(vertices) {
            this.indicesStorage = gd.gl.createBuffer();
            gd.gl.bindBuffer(gd.gl.ELEMENT_ARRAY_BUFFER, this.indicesStorage);
            gd.gl.bufferData(gd.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), gd.gl.STATIC_DRAW);

            // Important, drawing with a indices buffer combines triangles, so you're drawing with half the normal amount
            this.indicesCount = vertices.length;
        }
    })
};