/*
Name: Engine Core
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
Credits: Based on Mozilla's WebGL (https://developer.mozilla.org/en/WebGL)
and Giles Thomas' Learning WebGL (http://learningwebgl.com/blog) tutorials.

Desc: Contains all the components that handle setup and object generation.
Important, shouldn't contain any functions run during a game. Those should
be stored in game.js. All classes are stored in template.js.
*/

var gd = gd || {};

gd.core = {
    canvas: document.getElementById("canvas"),

    // Width and height of the gameplay area
    size: function(width, height) {
        // Set WebGL viewport ratio to prevent distortion
        this.horizAspect = width / height;
    },

    // Unique identifier key
    id: {
        count: 0,
        get: function() {
            return this.count++;
        }
    },

    // Contains all active game elements
    storage: {
        all: [],
        a: [],
        b: []
    },

    init: function(width, height, run) {
        this.size(width, height);

        if (!this.canvas.getContext) return alert('Please download a browser that supports Canvas like Google Chrome to proceed.');
        gd.gl = this.canvas.getContext("experimental-webgl");

        // Manually check for WebGL support, some browsers return null and some undefined if getContext fails
        if (gd.gl === null || gd.gl === undefined)
            return alert('Uhhh, your browser doesn\'t support WebGL. Your options are build a large wooden badger or download Google Chrome.');

        // Setup base properties
        gd.gl.clearColor(0.05, 0.05, 0.05, 1.0); // Clear color = black and opaque via (r, g, b, a)
        gd.gl.enable(gd.gl.DEPTH_TEST);
        gd.gl.depthFunc(gd.gl.LEQUAL); // Near things near, far things far
        gd.gl.clear(gd.gl.COLOR_BUFFER_BIT | gd.gl.DEPTH_BUFFER_BIT); // Clear color and depth buffer

        // Setup WebGL
        this.shader.init();
        this.animate();

        // Fire run code when everything is ready
        window.onload = run;
    },

    animate: function() {
        requestAnimFrame(gd.core.animate);
        gd.core.draw();
    },

    shader: {
        // Creates the shader base
        init: function() {
            // Literally pulls shader programs from the DOM
            this.fragments = this.get('shader-fragment');
            this.vertex = this.get('shader-vertex');

            // Attaches both elements to a 'program'
            // Each program can hold one fragment and one vertex shader
            this.program = gd.gl.createProgram();
            // Attaches shaders to webGL
            gd.gl.attachShader(this.program, this.vertex);
            gd.gl.attachShader(this.program, this.fragments);
            // Attach the new program we created
            gd.gl.linkProgram(this.program);

            // Failsafe incase shaders fail and backfire
            // Great for catching errors in your setup scripting
            if (!gd.gl.getProgramParameter(this.program, gd.gl.LINK_STATUS)) {
                return alert("Shaders have FAILED to load.");
            }

            // Tell WebGL its okay to use the assembled program
            gd.gl.useProgram(this.program);

            // Create stored shader data for later usage
            this.store();

            // Delete assembled shader DOM data to save memory
            gd.gl.deleteShader(this.fragments);
            gd.gl.deleteShader(this.vertex);
            gd.gl.deleteProgram(this.program);
        },

        // Gets the shaders from the DOM
        get: function(id) {
            this.script = document.getElementById(id);

            // No shader script in the DOM? Return nothing!
            if (!this.script) {
                alert('The requested shader script was not found in the DOM. Make sure that shader.get(id) is properly setup.');
                return null;
            }

            this.source = "";
            this.currentChild = this.script.firstChild;

            // Return compiled shader program
            while (this.currentChild) {
                if (this.currentChild.nodeType === this.currentChild.TEXT_NODE) {
                    this.source += this.currentChild.textContent; // Dump shader data here
                }
                this.currentChild = this.currentChild.nextSibling;
            }

            // Check for the type of shader accessed and process as necessary
            if (this.script.type === 'x-shader/x-fragment') {
                this.shader = gd.gl.createShader(gd.gl.FRAGMENT_SHADER);
            } else if (this.script.type === 'x-shader/x-vertex') {
                this.shader = gd.gl.createShader(gd.gl.VERTEX_SHADER);
            } else {
                return null; // Type of current shader is unknown
            }

            // Get data and compile it together
            gd.gl.shaderSource(this.shader, this.source);
            gd.gl.compileShader(this.shader);

            // Compile success? If not fire an error.
            if (!gd.gl.getShaderParameter(this.shader, gd.gl.COMPILE_STATUS)) {
                alert('Shader compiling error: ' + gd.gl.getShaderInfoLog(this.shader));
                return null;
            }

            // Give back the shader so it can be used
            return this.shader;
        },

        // Stores shader data in other places for easy usage later
        store: function() {
            // Store the shader's attribute in an object so you can use it again later
            this.vertexPositionAttribute = gd.gl.getAttribLocation(this.program, "aVertexPosition");
            gd.gl.enableVertexAttribArray(this.vertexPositionAttribute);

            // Allow usage of color data with shaders
            this.vertexColorAttribute = gd.gl.getAttribLocation(this.program, "aVertexColor");
            gd.gl.enableVertexAttribArray(this.vertexColorAttribute);
        }
    },

    draw: function() {
        gd.gl.clear(gd.gl.COLOR_BUFFER_BIT | gd.gl.DEPTH_BUFFER_BIT);

        // Field of view in degress, width/height, only get objects between 1, 300 units in distance
        this.perspectiveMatrix = makePerspective(45, this.horizAspect, 0.1, 300.0);

        // Loop through every object in storage.all
        for (var i in this.storage.all) {
            // Resets and creates a matrix that has 1s diagnolly and 0s everywhere else, crazy math stuff
            // Essential in processing your matrices for object creation
            // If you are a math nut and really want to understand this read http://mathworld.wolfram.com/IdentityMatrix.html
            /* Basic idea/example of this matrix
            [ 1, 0, 0
              0, 1, 0
              0, 0, 1 ]
            */
            this.loadIdentity();

            // Run update functions before drawing anything to prevent screen pops for recently spawned items
            this.storage.all[i].update();

            // Draw at location x, y, z
            // Other objects drawn before refreshing will be drawn relative to this position
            this.mvTranslate(this.storage.all[i].position());
            this.mvPushMatrix();

            // Pass rotate data if present
            if (this.storage.all[i].rotate.axis) {
                this.mvRotate(
                    this.storage.all[i].rotate.angle,
                    this.storage.all[i].rotate.axis);
            }

            // Pass shape data
            gd.gl.bindBuffer(
                gd.gl.ARRAY_BUFFER,
                this.storage.all[i].shapeStorage);
            gd.gl.vertexAttribPointer(
                this.shader.vertexPositionAttribute,
                this.storage.all[i].shapeColumns,
                gd.gl.FLOAT,
                false, 0, 0); // Pass position data

            // Pass color data
            gd.gl.bindBuffer(
                gd.gl.ARRAY_BUFFER,
                this.storage.all[i].colorStorage);
            gd.gl.vertexAttribPointer(
                this.shader.vertexColorAttribute,
                this.storage.all[i].colorColumns,
                gd.gl.FLOAT,
                false, 0, 0);

            this.setMatrixUniforms();

            // Take the matrix vertex positions and go through all of the elements from 0 to the .numItems object
            if (this.storage.all[i].indicesStorage) {
                // Creation of 3D shape
                gd.gl.drawElements(
                    gd.gl.TRIANGLES,
                    this.storage.all[i].indicesCount,
                    gd.gl.UNSIGNED_SHORT,
                    0);
            } else {
                // Creation of 2D shape
                gd.gl.drawArrays(
                    gd.gl.TRIANGLE_STRIP,
                    0,
                    this.storage.all[i].shapeRows);
            }

            // Restore original matrix to prevent objects from inheriting properties
            this.mvPopMatrix();

            // Collision detection for 2D elements only
            if (this.storage.all[i].type === 'a') {
                // Check all items in the b type array only since its an a type item
                for (var en = this.storage.b.length; en--;) {
                    // Test for overlap between the two
                    if (this.overlap(
                    this.storage.all[i].x,
                    this.storage.all[i].y,
                    this.storage.all[i].width,
                    this.storage.all[i].height,
                    this.storage.b[en].x,
                    this.storage.b[en].y,
                    this.storage.b[en].width,
                    this.storage.b[en].height)) {
                        // If they have collided, run the collision logic for both entities
                        this.storage.all[i].collide(this.storage.b[en]);
                        this.storage.b[en].collide(this.storage.all[i]);
                    }
                }
            }
        }

        // Clean out killed items
        this.graveyard.purge();
    },

    // Used to destroy entities when necessary instead of doing it during the loop and potentially blowing
    // everything up by accident.
    graveyard: {
        storage: [],
        purge: function() {
            if (this.storage) {
                for (var obj = this.storage.length; obj--;) {
                    // Remove object from memory and delete
                    this.remove(this.storage[obj]);
                }
                this.graveyard = [];
            }
        },
        remove: function(object) {
            // Remove from main storage
            var obj;
            for (obj = gd.core.storage.all.length; obj--;) {
                if (gd.core.storage.all[obj].id === object.id) {
                    gd.core.storage.all.splice(obj, 1);
                    break;
                }
            }

            // Remove from specialized storage
            switch (object.type) {
                case 'a':
                    for (obj = gd.core.storage.a.length; obj--;) {
                        if (gd.core.storage.a[obj].id === object.id) {
                            gd.core.storage.a.splice(obj, 1);
                            break;
                        }
                    }
                    break;
                case 'b':
                    for (obj = gd.core.storage.b.length; obj--;) {
                        if (gd.core.storage.b[obj].id === object.id) {
                            gd.core.storage.b.splice(obj, 1);
                            break;
                        }
                    }
                    break;
                default:
                    break;
            }

            // Clean buffers out of browser's memory permanently
            gd.gl.deleteBuffer(object.colorStorage);
            gd.gl.deleteBuffer(object.shapeStorage);
        }
    },

    overlap: function(x1, y1, width1, height1, x2, y2, width2, height2) {
        // Modify x and y values to take into account center offset
        x1 = x1 - (width1 / 2);
        y1 = y1 - (height1 / 2);
        x2 = x2 - (width2 / 2);
        y2 = y2 - (height2 / 2);

        // Test for collision
        return x1 < x2 + width2 &&
            x1 + width1 > x2 &&
            y1 < y2 + width2 &&
            y1 + height1 > y2;
    },

    /* ----- Utilities | Pre-Written w/ credits -----*/
    // Matrix functions modified from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Adding_2D_content_to_a_WebGL_context
    // From Mozilla's tutorial "Nobody seems entirely clear on where it came from, but it does simplify the use of Sylvester even further by adding methods for building special types of matrices, as well as outputting HTML for displaying them."
    loadIdentity: function() {
        mvMatrix = Matrix.I(4);
    },
    multMatrix: function(m) {
        mvMatrix = mvMatrix.x(m);
    },
    mvTranslate: function(v) {
        this.multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    },
    setMatrixUniforms: function() {
        var pUniform = gd.gl.getUniformLocation(this.shader.program, "uPMatrix");
        gd.gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

        var mvUniform = gd.gl.getUniformLocation(this.shader.program, "uMVMatrix");
        gd.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
    },

    // Additional functions by Vlad Vukicevic at http://blog.vlad1.com/
    mvMatrixStack: [],

    mvPushMatrix: function(m) {
        if (m) {
            this.mvMatrixStack.push(m.dup());
            mvMatrix = m.dup();
        } else {
            this.mvMatrixStack.push(mvMatrix.dup());
        }
    },

    mvPopMatrix: function() {
        if (! this.mvMatrixStack.length) {
            throw("Can't pop from an empty matrix stack.");
        }

        mvMatrix = this.mvMatrixStack.pop();
        return mvMatrix;
    },

    mvRotate: function(angle, v) {
        var inRadians = angle * Math.PI / 180.0;

        var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
        this.multMatrix(m);
    }
};