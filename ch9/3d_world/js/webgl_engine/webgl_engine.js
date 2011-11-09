/*
Name: Canvas Prime
Version: Alpha
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd

To-do
- Solve prespective ratio drawing bug
- Configure dynamic screen resizing listener
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
    width: window.innerWidth - 20,
    height: window.innerHeight - 20,
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
    screenResize: function() {
        // Might do this, not too sure
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
            // Current name for WebGL, will be webgl once complete
            this.gl = this.canvas.getContext("experimental-webgl");
            
            // Canvas width must be set before gl initializes to prevent the Canvas size from distorting WebGL view
            // Set width and height equal to window
            this.screen();
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
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.colVert), this.gl.STATIC_DRAW);
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
            this.mvTranslate(this.storage[i].posVert()); // Draw at location x, y, z
            
            // Pass shape data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.storage[i].buffer); 
            this.gl.vertexAttribPointer(this.vertexPositionAttribute, this.storage[i].bufCols, this.gl.FLOAT, false, 0, 0); // Pass position data
            
            // Pass color data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.storage[i].colorBuffer);  
            this.gl.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl.FLOAT, false, 0, 0);  
            
            // Crete
            this.setMatrixUniforms();
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.storage[i].bufRows); // Take the matrix vertex positions and go through all of the elements from 0 to the .numItems object
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
        
        // Buffer data for color
        colVert: null,
        
        // place extra setup code before spawning here
        init: function() {
            
        },
        spawn: function(x,y,z) {
                if (x) this.x = x;
                if (y) this.y = y;
                if (z) this.z = z;
                this.init();
                return this;
        }
});

//var canvas;
//var gl;
//var squareVerticesBuffer;
//var mvMatrix;
//var shaderProgram;
//var vertexPositionAttribute;
//var perspectiveMatrix;
//var horizAspect;
//var squareRotation = 0.0;
//var lastSquareUpdateTime = 0;
//
//window.onload = function() { webGL(); }
//
//function webGL() {
//        canvas = document.getElementById("canvas");
//        initWebGL(canvas);      // Initialize the GL context
//        
//        // Only continue if WebGL is available and working
//        if (gl) {
//                gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black and opaque
//                gl.enable(gl.DEPTH_TEST);
//                gl.depthFunc(gl.LEQUAL); // Near things near, far things far
//                gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); // Clear color and depth buffer
//                
//                // Loop through shaders 
//                initShaders();
//                // Loop throug buffers
//                initBuffers();
//                                               
//                animate();
//        }
//}
//
//function animate() {
//        requestAnimFrame( animate );
//        draw();
//}
//
//function initWebGL(canvas) {
//        try {
//                // Canvas width must be set before gl initializes to prevent the Canvas
//                // size from distorting WebGL view
//                canvas.width = window.innerWidth - 20;
//                canvas.height = window.innerHeight - 20;
//                //canvas.width = 480;
//                //canvas.height = 640;
//                gl = canvas.getContext("experimental-webgl");
//                
//                // Set width and height equal to window
//                
//                
//                horizAspect = canvas.width/canvas.height;
//                // Set WebGL box in Canvas viewport
//        }
//        catch(e) {}
//        
//        // If we don't have a GL context, RUN AWAY!
//        if (!gl) {
//                alert("Uhhh, your browser doesn't support WebGL. Your options are build a large wooden badger or download Google Chrome.");
//        }
//}
//
//function initShaders() {
//        // Literally pulls shader programs from the DOM
//        var fragmentShader = getShader(gl, 'shader-fs');
//        var vertexShader = getShader(gl, 'shader-vs');
//        
//        // Attaches both elements to a 'program' which is code from WebGL
//        // Each program can hold one fragment and one vertex shader
//        // Attaches shaders to our webGL
//        shaderProgram = gl.createProgram();
//        gl.attachShader(shaderProgram, vertexShader);
//        gl.attachShader(shaderProgram, fragmentShader);
//        gl.linkProgram(shaderProgram); // Attach the new program we created
//        
//        // Failsafe incase shaders fail and backfire
//        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
//                alert("Shaders have FAILED to load.");
//        }
//        gl.useProgram(shaderProgram);
//        
//        // Store color data
//        vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");  
//        gl.enableVertexAttribArray(vertexColorAttribute); 
//        
//        // Store the shader's attribute in an object so you can use it again later
//        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
//        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
//}
//
//// Get shader from https://developer.mozilla.org/en/WebGL/Adding_2D_content_to_a_WebGL_context 
//function getShader(gl, id) {
//        // Look for shader program
//        var shaderScript = document.getElementById(id);
//        
//        if (!shaderScript) {
//                return null;
//        }
//        
//        var theSource = '';
//        var child = shaderScript.firstChild;
//        
//        // Reutrn compiled shader program
//        while (child) {
//                if (child.nodeType == child.TEXT_NODE) {
//                        theSource += child.textContent; // Dump shader data here
//                }
//                child = child.nextSibling;
//        }
//        
//        // Get shader MIME type to test for vertex or fragment shader
//        // Create shader based upon return value
//        var shader;
//        if (shaderScript.type == 'x-shader/x-fragment') {
//                shader = gl.createShader(gl.FRAGMENT_SHADER);
//        } else if (shaderScript.type == 'x-shader/x-vertex') {
//                shader = gl.createShader(gl.VERTEX_SHADER);
//        } else {
//                return null; // Type of current shader is unknown
//        }
//        
//        gl.shaderSource(shader, theSource);
//        gl.compileShader(shader);
//        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//                alert('Shader compiling error: ' + gl.getShaderInfoLog(shader));
//                return null;
//        }
//        return shader;
//}
//  
//function initBuffers() {
//        // Create a buffer and store the graphics 
//        squareVerticesBuffer = gl.createBuffer();  
//        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);  
//        
//        // Sets up points at x, y, z
//        var vertices = [  
//                 1.0,  1.0,  0.0,  
//                -1.0,  1.0,  0.0,  
//                 1.0, -1.0,  0.0,  
//                -1.0, -1.0,  0.0  
//        ];
//        // rgba
//        var colors = [  
//                1.0,  1.0,  1.0,  1.0,    // white  
//                1.0,  0.0,  0.0,  1.0,    // red  
//                0.0,  1.0,  0.0,  1.0,    // green  
//                0.0,  0.0,  1.0,  1.0     // blue  
//        ];  
//        
//        // Uses float32 to change the array into a webGL edible format. Research float32arrays more and play.
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
//        
//        // Color data
//        squareVerticesColorBuffer = gl.createBuffer();
//        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);  
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW); 
//} 
//
//function draw() {  
//        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
//        // field of view in degress, width/height, only get objects between 1, 100 units
//        perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0);  
//        
//        // Set things up to draw
//        loadIdentity();
//        // Setup translate away from the camera by 6 units
//        
//        
//        // Rotate square
//        mvPushMatrix();
//        mvRotate(squareRotation, [0, 0, 1]); // x, y, z
//        mvTranslate([0.0, 0.0, -6.0]);
//        
//        
//        // Pass buffer data
//        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
//        // Send over shader program, number of arrays, something, something, something, something
//        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
//        
//        // Pass color data from buffer
//        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);  
//        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);  
//        
//        setMatrixUniforms();
//        // Why x, y, and z?
//        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//        
//        // Restore original matrix after drawing square
//        mvPopMatrix();
//        
//        // Actual rotation of square
//        var currentTime = (new Date).getTime();  
//        if (lastSquareUpdateTime) {
//                var delta = currentTime - lastSquareUpdateTime;  
//            
//                squareRotation += (100 * delta) / 1000.0;
//                // alert(squareRotation);
//        }   
//        lastSquareUpdateTime = currentTime; 
//}
//
//// Matrix functions written by Vlad Vukicevic
//    var mvMatrixStack = [];  
//      
//    function mvPushMatrix(m) {  
//      if (m) {  
//        mvMatrixStack.push(m.dup());  
//        mvMatrix = m.dup();  
//      } else {  
//        mvMatrixStack.push(mvMatrix.dup());  
//      }  
//    }  
//      
//    function mvPopMatrix() {  
//      if (!mvMatrixStack.length) {  
//        throw("Can't pop from an empty matrix stack.");  
//      }  
//        
//      mvMatrix = mvMatrixStack.pop();  
//      return mvMatrix;  
//    }  
//      
//    function mvRotate(angle, v) {  
//      var inRadians = angle * Math.PI / 180.0;  
//        
//      var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();  
//      multMatrix(m);  
//    }  
//
//// Matrix functions from Mozilla
//function loadIdentity() {  
//        mvMatrix = Matrix.I(4);  
//}    
//function multMatrix(m) {  
//        mvMatrix = mvMatrix.x(m);  
//}  
//function mvTranslate(v) {  
//        multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());  
//}  
//function setMatrixUniforms() {  
//        var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");  
//        gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));  
//        
//        var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");  
//        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));  
//}