/*
Name: WebGL Engine
Author: Ashton Blue
Author URL: http://twitter.com/#!/ashbluewd
Credits: Based on Mozilla's WebGL (https://developer.mozilla.org/en/WebGL) and Giles Thomas' Learning WebGL (http://learningwebgl.com/blog) tutorials.
*/

/*---------
 Core game logic
---------*/
var Engine = Class.extend({
    /* ----- Default Values -----*/
    canvas: document.getElementById("canvas"),
    width: 400,
    height: 400,
    storage: new Array(),
    id: 0,
    
    
    /* ----- Utilities -----*/
    spawnEntity: function(name, x, y, z) {
        // window[] allows you to process its contents and treat it as a variable
        // eval() will process its contents before the variable can grab it
        window['id' + this.id] = eval(new name);
        // Pushes your new variable into an array and runs its spawn function
        this.storage.push(window['id' + this.id].spawn(x, y, z));
        
        // Runs the buffers for your object to create the proper shape data
        this.initBuffers(this.storage[this.id]);
        
        // Increment the id so the next shape is a unique variable
        this.id += 1;
    },
    screen: function() {
        // Apply Engine's width to the Canvas
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Set WebGL viewport ratio to prevent distortion
        this.horizAspect = this.width / this.height;
    },
    
    
    /* ----- Game Engine Functions -----*/
    // All necessary code to get WebGL running
    setup: function() {
        this.init();
        this.initGL();
        this.initShadersColor();
        this.texturesLoad();
        this.initShadersTexture();
    },
    
    init: function() {
        try {
            // Canvas width must be set before gl initializes to prevent the Canvas size from distorting WebGL view
            this.screen();
            
            // Current name for WebGL, will be webgl once accepted as a web standard
            this.gl = this.canvas.getContext("experimental-webgl");
        }
        catch(e) {}
        
        // No WebGL context? RUN AWAY!
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
    
    // Sets up shaders for color
    initShadersColor: function() {
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
        // Great for catching errors in your setup scripting
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
    // Sets up shaders for image texture data
    initShadersTexture: function() {
        this.imgFragmentShader = this.getShader('shader-image-fs');
        this.imgVertexShader = this.getShader('shader-image-vs');
        
        this.imgShaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.imgShaderProgram, this.imgVertexShader);
        this.gl.attachShader(this.imgShaderProgram, this.imgFragmentShader);
        this.gl.linkProgram(this.imgShaderProgram);
        
        // Here we will fire a different error that indicates the image shader has failed
        if (!this.gl.getProgramParameter(this.imgShaderProgram, this.gl.LINK_STATUS)) {
            alert("Image shaders have FAILED to load.");
        }
        this.gl.useProgram(this.imgShaderProgram);
        
        // Store the shader's attribute in an object so you can use it again later
        this.imgVertexPositionAttribute = this.gl.getAttribLocation(this.imgShaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.imgVertexPositionAttribute);
        
        // Allow usage of image data with shaders
        this.imgCoordAttribute = this.gl.getAttribLocation(this.imgShaderProgram, "aTextureCoord");
        this.gl.enableVertexAttribArray(this.imgCoordAttribute);
    },
    
    // An object literal of texture images to be loaded
    textures: {
        'test': 'ff.png'
        //'wilson': 'wilson.jpg'
    },
    // Execute logic for each texture individually
    texturesLoad: function() {
        var base = 'images/'; // url base
        for (var file in this.textures) {
            var url = base + this.textures[file]; // Complete url string
            this.texturesProcess(url, this.textures[file]);
        }
    },
    // Load in the texture fired from an array
    texturesProcess: function(imgSrc, objTexture) {
        objTexture = this.gl.createTexture(); // Calls from stored variable name, may need to be dynamically generated
        this.objImg = new Image();
        // Simple post-processing after images have loaded
        this.objImg.onload = function() {
            this.texturesHandle( this.objImg, this.objTexture );
        }
        this.objImg.src = imgSrc;
    },
    texturesHandle: function(image, texture) {
        this.gl.bindTexture(gl.TEXTURE_2D, texture);  
        this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);  
        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
        this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);  
        this.gl.generateMipmap(gl.TEXTURE_2D);  
        this.gl.bindTexture(gl.TEXTURE_2D, null);  
    },
    // Goes into the DOM to get shaders via variable id
    getShader: function(id) {
        this.shaderScript = document.getElementById(id);
        
        // No shader script in the DOM? Return nothing!
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
        }
        else if (this.shaderScript.type == 'x-shader/x-vertex') {
            this.shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        }
        else {
                return null; // Type of current shader is unknown
        }
        
        // Get data and compile it together
        this.gl.shaderSource(this.shader, this.theSource);
        this.gl.compileShader(this.shader);
        
        // Compile success? If not fire an error.
        if (!this.gl.getShaderParameter(this.shader, this.gl.COMPILE_STATUS)) {
            alert('Shader compiling error: ' + this.gl.getShaderInfoLog(this.shader));
            return null;
        }
        
        // Give back the shader so it can be used
        return this.shader;
    },
    
    // Prepare WebGL graphics to be drawn by storing them
    // Occurs right before an object is created
    initBuffers: function(object) {
        // Create shape        
        object.buffer = this.gl.createBuffer(); // Buffer creation
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.buffer); // Graphic storage
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.bufVert), this.gl.STATIC_DRAW); // Uses float32 to change the array into a webGL edible format.
        
        // May need an if here to prevent crashing when an image is loaded instead
        // Create color
        object.colorBuffer = this.gl.createBuffer();  
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.colorBuffer);  
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.colOutput()), this.gl.STATIC_DRAW);
        
        if (object.bufTexture) {
            // Take priority on loading in a texture over color
            object.dimBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(gl.ARRAY_BUFFER, object.dimBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(object.bufTexture), this.gl.STATIC_DRAW);
        }
        else if (object.bufDim) {
            // Define each piece as a triangle to create 3D shapes from flat objects
            // Think of it as folding a gigantic piece of cardboard into a cube
            object.dimBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.dimBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.bufDim), this.gl.STATIC_DRAW);
        }
    },
    
    draw: function() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // Field of view in degress, width/height, only get objects between 1, 100 units in distance
        this.perspectiveMatrix = makePerspective(45, this.horizAspect, 0.1, 100.0);
        
        // Loop through every object in storage
        for (var i in this.storage) {
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
            this.storage[i].update();
            
            // Draw at location x, y, z
            // Other objects drawn before refreshing will be drawn relative to this position
            this.mvTranslate(this.storage[i].posVert());
            this.mvPushMatrix();
            
            // Pass rotate data
            if (this.storage[i].rotate) this.mvRotate(this.storage[i].rotateInit, this.storage[i].rotate);
            
            // Pass shape data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.storage[i].buffer); 
            this.gl.vertexAttribPointer(this.vertexPositionAttribute, this.storage[i].bufCols, this.gl.FLOAT, false, 0, 0); // Pass position data
            
            // Pass texture or color data
            if (this.storage[i].bufTextures) {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.objTexture);
                this.gl.uniform1i(this.gl.getUniformLocation(this.imgShaderProgram, "uSampler"), 0);
            }
            else {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.storage[i].colorBuffer);  
                this.gl.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl.FLOAT, false, 0, 0);
            }
            
            // Create
            this.setMatrixUniforms();
            // Take the matrix vertex positions and go through all of the elements from 0 to the .numItems object
            if (this.storage[i].bufDim) this.gl.drawElements(this.gl.TRIANGLES, this.storage[i].bufRows, this.gl.UNSIGNED_SHORT, 0); // Creation of 3D shape
            else this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.storage[i].bufRows); // Creation of 2D shape
        
            // Restore original matrix to prevent objects from inheriting properties
            this.mvPopMatrix();
        }
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
        var pUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");  
        this.gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));  
        
        var mvUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");  
        this.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten())); 
    },
    
    // Additional functions by Vlad Vukicevic at http://blog.vlad1.com/
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
    colRows: 0,
    colCols: 0,
    colVert: null,
    colOutput: function() {
        if (this.colVert) {
            // Reset color incase something is already present
            this.col = [];
            // Generating colors for the cube by setting them along proper vertices
            for (i=0; i<this.colRows; i++) {
                var c = this.colVert[i];
                for (var k=0; k<this.colCols; k++) {
                    this.col = this.col.concat(c);
                }
            }
        }
        return this.col;
    },
    
    init: function() {
        // place extra setup code initiated at spawning here
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