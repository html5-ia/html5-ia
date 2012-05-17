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
        
        // Width and height relative to 3D world
        width: 0,
        height: 0,
        
        // Creates an artifical zoom without a complex transformation matrix or camera
        zoom: -80,
        
        // Returns an assembled position array
        init: function() {
            this.buffer.shape.init();
            this.buffer.color.init();
            this.buffer.dimension.init();
        },
        
        rotate: {
            angle: 0,
            axis: false
        },
        
        // Creates 3D data at bootup
        buffer: {
            shape: {
                init: function() {
                    this.storage = gd.gl.createBuffer();
                    
                    // Graphic storage
                    gd.gl.bindBuffer(gd.gl.ARRAY_BUFFER, this.storage);
                    
                    // Uses float32 to change the array into a webGL edible format.
                    gd.gl.bufferData(gd.gl.ARRAY_BUFFER, new Float32Array(this.vetices), gd.gl.STATIC_DRAW);
                    
                    // Count rows
                    this.rows = this.vertices.length / this.columns;
                },
                vetices: [],
                columns: 3,
                rows: 0
            },
            color: {
                init: function() {
                    this.storage = gd.gl.createBuffer();
                    
                    // Map colors for a complex object such as a cube, before doing so, check if the first array element is a string
                    // as it should be an array
                    if (typeof this.vertices[0] === 'array') {
                        // temporary storage location for new vertices
                        var colorNew = [];
                        
                        // Create complete verticy array
                        for (var v = 0; v < this.vertices.length; i++) {
                            var colorLine = this.vertices[v];
                            for (var c = 0; c < this.columns; c++) {
                                colorNew = colorNew.concat(colorLine);
                            }
                        }
                        
                        // Apply new verticy array
                        this.vertices = colorNew;
                    }
                    
                    // Bind buffers as buffer.shape
                    gd.gl.bindBuffer(gd.gl.ARRAY_BUFFER, this.storage);
                    gd.gl.bufferData(gd.gl.ARRAY_BUFFER, new Float32Array(this.vetices), gd.gl.STATIC_DRAW);
                    
                    this.rows = this.vertices.length / this.columns;
                },
                vetices: [],
                columns: 4,
                rows: 0
            },
            // Note: I don't think dimension is accurate, as I believe this just connects 2 triangles together, maybe snap is a better name?
            dimension: {
                init: function() {
                    this.storage = gd.gl.createBuffer();
                    
                    // Verify this init even needs to run
                    if (! this.vertices) return;

                    gd.gl.bindBuffer(gd.gl.ELEMENT_ARRAY_BUFFER, this.storage);
                    gd.gl.bufferData(gd.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertices), gd.gl.STATIC_DRAW);
                },
                vertices: false
            }
        },
        
        // Logic fired at object destruction
        kill: function() {
            World.graveyard.push(this);
        },
        
        // Passes the object hit during a collision for processing
        collide: function(object) {
            this.kill();
        },
        
        update: function() {
            // place code before animating here
        }
    })
};