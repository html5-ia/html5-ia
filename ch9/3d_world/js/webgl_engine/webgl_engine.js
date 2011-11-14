/*
Name: Canvas Prime
Version: Alpha
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd

To-do
- Fallback for no-dimensions
*/

/*----------
 Core library
----------*/
// How to figure out what a user's computer can handle for frames with fallbacks
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = function(){
return( window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
        }
    );
}();

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
*/
// Inspired by base2 and Prototype
(function(){
        var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
        // The base Class implementation (does nothing)
        this.Class = function(){};
        
        // Create a new Class that inherits from this class
        Class.extend = function(prop) {
                var _super = this.prototype;
                
                // Instantiate a base class (but only create the instance,
                // don't run the init constructor)
                initializing = true;
                var prototype = new this();
                initializing = false;
    
                // Copy the properties over onto the new prototype
                for (var name in prop) {
                        // Check if we're overwriting an existing function
                        prototype[name] = typeof prop[name] == "function" && 
                        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                        (function(name, fn){
                                return function() {
                                        var tmp = this._super;
            
                                        // Add a new ._super() method that is the same method
                                        // but on the super-class
                                        this._super = _super[name];
            
                                        // The method only need to be bound temporarily, so we
                                        // remove it when we're done executing
                                        var ret = fn.apply(this, arguments);        
                                        this._super = tmp;
                                        
                                        return ret;
                                };
                        })(name, prop[name]) :
                        prop[name];
                }
    
                // The dummy class constructor
                function Class() {
                        // All construction is actually done in the init method
                        if ( !initializing && this.init )
                                this.init.apply(this, arguments);
                }
                
                // Populate our constructed prototype object
                Class.prototype = prototype;
                
                // Enforce the constructor to be what we expect
                Class.prototype.constructor = Class;
            
                // And make this class extendable
                Class.extend = arguments.callee;
    
                return Class;
        };
})();


/*---------
 Core game logic
---------*/
var Engine = Class.extend({
    /* ----- Default Values -----*/
    canvas: document.getElementById("canvas"),
    width: 800,
    height: 600,
    storage: new Array(),
    id: 0,
    
    
    /* ----- Utilities -----*/
    // Generates a random number from min to max
    random: function(min,max) {
        // Defaults to 1 for min
        if (!min) min = 1;
        // Default to positive value of minimum number + 9
        if (!max) max = Math.abs(min) + 9;
        
        return Math.floor(Math.random() * (max - min) + min);
    },
    spawnEntity: function(name,x,y,z) { // Add x, y, z support
        window['id' + this.id] = eval(new name);
        this.storage.push(window['id' + this.id].spawn(x,y,z));
        this.initBuffers(this.storage[this.id]);
        
        this.id += 1;
    },

    
    /* ----- Screen Control -----*/
    screen: function() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Set WebGL viewport ratio to prevent potential distortion
        this.horizAspect = this.width / this.height;
    },
    
    
    /* ----- Game Engine Functions -----*/
    setup: function() {
        this.init();
        this.initGL();
        this.initShaders();
        //this.initBuffers();
    },
    
    init: function() {
        try {
            // Canvas width must be set before gl initializes to prevent the Canvas size from distorting WebGL view
            // Set width and height equal to window
            this.screen();
            
            // Current name for WebGL, will be webgl once complete
            this.gl = this.canvas.getContext("experimental-webgl");
            
            
        }
        catch(e) {}
        
        // No GL context? RUN AWAY!
        if (!this.gl) {
            alert("Uhhh, your browser doesn't support WebGL. Your options are build a large wooden badger or download Google Chrome.");
        }
    },
    // Configures WebGL after verifying it's okay to do so
    initGL: function() {
        if (this.gl) {
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear color = black and opaque via (r, g, b, a)
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL); // Near things near, far things far
            this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT); // Clear color and depth buffer
        }
    },
    // Sets up shaders
    initShaders: function() {
        // Literally pulls shader programs from the DOM
        this.fragmentShader = this.getShader('shader-fs');
        this.vertexShader = this.getShader('shader-vs');
        
        // Attaches both elements to a 'program'
        // Each program can hold one fragment and one vertex shader
        this.shaderProgram = this.gl.createProgram();
        // Attaches shaders to webGL
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        // Attach the new program we created
        this.gl.linkProgram(this.shaderProgram);
        
        // Failsafe incase shaders fail and backfire
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
                alert("Shaders have FAILED to load.");
        }
        this.gl.useProgram(this.shaderProgram);
        
        // Store the shader's attribute in an object so you can use it again later
        this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
        
        // Allow usage of color data with shaders
        this.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
        this.gl.enableVertexAttribArray(this.vertexColorAttribute);
    },
    // Prepare WebGL graphics to be drawn by storing them
    initBuffers: function(object) {
        // Create shape        
        object.buffer = this.gl.createBuffer(); // Buffer creation
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.buffer); // Graphic storage
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.bufVert), this.gl.STATIC_DRAW); // Uses float32 to change the array into a webGL edible format.
        
        // Create color
        object.colorBuffer = this.gl.createBuffer();  
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.colorBuffer);  
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.colOutput()), this.gl.STATIC_DRAW);
        
        if (object.bufDim) {
            // Define each piece as a triangle to create 3D shapes from flat objects
            // Think of it as folding a gigantic piece of cardboard into a cube
            object.dimBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.dimBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.bufDim), this.gl.STATIC_DRAW);
        }
    },
    // Goes into the DOM to configure shaders via variable id
    getShader: function(id) {
        this.shaderScript = document.getElementById(id);
        
        if (!this.shaderScript) {
            return null;
        }
        
        this.theSource = "";
        this.currentChild = this.shaderScript.firstChild;
        
        // Return compiled shader program
        while (this.currentChild) {
            if (this.currentChild.nodeType == this.currentChild.TEXT_NODE) {
                this.theSource += this.currentChild.textContent; // Dump shader data here
            }
            this.currentChild = this.currentChild.nextSibling;
        }
        
        // Get shader MIME type to test for vertex or fragment shader
        // Create shader based upon return value
        this.shader;
        if (this.shaderScript.type == 'x-shader/x-fragment') {
            this.shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        } else if (this.shaderScript.type == 'x-shader/x-vertex') {
            this.shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        } else {
                return null; // Type of current shader is unknown
        }
        
        // Get data and compile it together
        this.gl.shaderSource(this.shader, this.theSource);
        this.gl.compileShader(this.shader);
        
        // Compile success? If so continue.
        if (!this.gl.getShaderParameter(this.shader, this.gl.COMPILE_STATUS)) {
                alert('Shader compiling error: ' + this.gl.getShaderInfoLog(this.shader));
                return null;
        }
        return this.shader;
    },
    
    draw: function() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // field of view in degress, width/height, only get objects between 1, 100 units
        this.perspectiveMatrix = makePerspective(45, this.horizAspect, 0.1, 100.0);
        
        this.loadIdentity();
        
        for (var i in this.storage) {
            this.storage[i].update();
            
            this.mvTranslate(this.storage[i].posVert()); // Draw at location x, y, z
            
            // Pass rotate data
            this.mvPushMatrix();  
            if (this.storage[i].rotate) this.mvRotate(this.storage[i].rotateInit, this.storage[i].rotate);
            
            // Pass shape data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.storage[i].buffer); 
            this.gl.vertexAttribPointer(this.vertexPositionAttribute, this.storage[i].bufCols, this.gl.FLOAT, false, 0, 0); // Pass position data
            
            // Pass color data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.storage[i].colorBuffer);  
            this.gl.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl.FLOAT, false, 0, 0);
            
            // Create
            this.setMatrixUniforms();
            // Take the matrix vertex positions and go through all of the elements from 0 to the .numItems object
            if (this.storage[i].bufDim) this.gl.drawElements(this.gl.TRIANGLES, this.storage[i].bufRows, this.gl.UNSIGNED_SHORT, 0); // Creation of 3D shape
            else this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.storage[i].bufRows); // Creation of 2D shape
        
            // Restore original matrix
            this.mvPopMatrix();
            
            // Implement rotation
            this.currentTime = (new Date).getTime();
            if (this.storage[i].lastUpdate) {  
                this.delta = this.currentTime - this.storage[i].lastUpdate;  
                
                this.storage[i].rotateInit += (30 * this.delta) / 1000.0;  
            }  
              
            this.storage[i].lastUpdate = this.currentTime;  
        }
    },
    
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
        var pUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");  
        this.gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));  
        
        var mvUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");  
        this.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten())); 
    },
    
    // Additional functions by Vlad Vukicevic
    mvMatrixStack: [],
  
    mvPushMatrix: function(m) {  
        if (m) {  
            this.mvMatrixStack.push(m.dup());  
            mvMatrix = m.dup();  
        }
        else {  
            this.mvMatrixStack.push(mvMatrix.dup());  
        }  
    },  
      
    mvPopMatrix: function() {  
        if (!this.mvMatrixStack.length) {  
            throw("Can't pop from an empty matrix stack.");  
        }  
        
        mvMatrix = this.mvMatrixStack.pop();  
        return mvMatrix;  
    },
      
    mvRotate: function(angle, v) {  
      this.inRadians = angle * Math.PI / 180.0;  
        
      this.m = Matrix.Rotation(this.inRadians, $V([v[0], v[1], v[2]])).ensure4x4();  
      this.multMatrix(this.m);  
    }  
});


/*-----------
 Entity Pallete
-----------*/
var Entity = Class.extend({
        // Determines position
        x: 0,
        y: 0,
        z: 0,
        posVert: function() {
            return [ this.x, this.y, this.z ];
        },
        
        // Buffer data for drawing
        bufCols: 0,
        bufRows: 0,
        bufVert: null,
        
        // Buffer data for creating dimension (practically folds the object)
        bufDim: null,
        
        // Buffer data for color
        col: [],
        colRows: 6,
        colCols: 4,
        colVert: null,
        colOutput: function() {
            // Single color non-folded shape
            //for (var i=0; i < this.colRows; i++) {
            //    this.col = this.col.concat(this.colVert);
            //}
            
            this.colGen = [];
            
            // Generating colors for the cube, is there an easier way?
            for (i=0; i<this.colRows; i++) {
                var c = this.colVert[i];
                
                for (var k=0; k<this.colCols; k++) {
                    this.colGen = this.colGen.concat(c);
                }
            }
            
            return this.colGen;
        },
        
        // Rotation
        rotate: null,
        rotateInit: 0,
        
        init: function() {
            // place extra setup code before spawning here
        },
        update: function() {
            // place code before each draw sequence here
        },
        
        spawn: function(x,y,z) {
                if (x) this.x = x;
                if (y) this.y = y;
                if (z) this.z = z;
                this.init();
                return this;
        }
});