var canvas;
var gl;
var squareVerticesBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix; 

window.onload = function() { webGL(); }

function webGL() {
        canvas = document.getElementById("canvas");
        initWebGL(canvas);      // Initialize the GL context
        
        // Only continue if WebGL is available and working
        if (gl) {
                gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black and opaque
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL); // Near things near, far things far
                gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); // Clear color and depth buffer
                
                // Loop through shaders 
                initShaders();
                // Loop throug buffers
                initBuffers();
                
                // RGB for clear color
                // Set clear color to black, fully opaque
                
                
                // Enable depth testing
                                               
        
                draw();
                
                // Constantly updating version of draw
                //tick();
        }
}

function initWebGL(canvas) {
        try {
                gl = canvas.getContext("experimental-webgl");
                
                // Set width and height equal to window
                //canvas.width = window.innerWidth - 20;
                //canvas.height = window.innerHeight - 20;
                canvas.width = 640;
                canvas.height = 480;
                // Set WebGL box in Canvas viewport
        }
        catch(e) {}
        
        // If we don't have a GL context, RUN AWAY!
        if (!gl) {
                alert("Uhhh, your browser doesn't support WebGL. Your options are build a large wooden badger or download Google Chrome.");
        }
}

function initShaders() {
        // Literally pulls shader programs from the DOM
        var fragmentShader = getShader(gl, 'shader-fs');
        var vertexShader = getShader(gl, 'shader-vs');
        
        // Attaches both elements to a 'program' which is code from WebGL
        // Each program can hold one fragment and one vertex shader
        // Attaches shaders to our webGL
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram); // Attach the new program we created
        
        // Failsafe incase shaders fail and backfire
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Shaders have FAILED to load.");
        }
        gl.useProgram(shaderProgram);
        
        // Store the shader's attribute in an object so you can use it again later
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

// Get shader from https://developer.mozilla.org/en/WebGL/Adding_2D_content_to_a_WebGL_context 
function getShader(gl, id) {
        // Look for shader program
        var shaderScript = document.getElementById(id);
        
        if (!shaderScript) {
                return null;
        }
        
        var theSource = '';
        var child = shaderScript.firstChild;
        
        // Reutrn compiled shader program
        while (child) {
                if (child.nodeType == child.TEXT_NODE) {
                        theSource += child.textContent; // Dump shader data here
                }
                child = child.nextSibling;
        }
        
        // Get shader MIME type to test for vertex or fragment shader
        // Create shader based upon return value
        var shader;
        if (shaderScript.type == 'x-shader/x-fragment') {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == 'x-shader/x-vertex') {
                shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
                return null; // Type of current shader is unknown
        }
        
        gl.shaderSource(shader, theSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('Shader compiling error: ' + gl.getShaderInfoLog(shader));
                return null;
        }
        return shader;
}

var horizAspect = 480.0/640.0;  
  
function initBuffers() {
        // Create a buffer and store the graphics 
        squareVerticesBuffer = gl.createBuffer();  
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);  
        
        // Sets up points at x, y, z
        var vertices = [  
                 1.0,  1.0,  0.0,  
                -1.0,  1.0,  0.0,  
                 1.0, -1.0,  0.0,  
                -1.0, -1.0,  0.0  
        ]; 
        
        // Uses float32 to change the array into a webGL edible format. Research float32arrays more and play.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);  
} 

function draw() {  
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
        // field of view in degress, width/height, only get objects between 1, 100 units
        perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, 200.0);  
        
        // Set things up to draw
        loadIdentity();
        // Setup translate away from the camera by 6 units
        mvTranslate([0.0, 0.0, -6.0]);  
        
        // Pass buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        // Send over shader program, number of arrays, something, something, something, something
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);  
        setMatrixUniforms();
        // Why x, y, and z?
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  
}

function loadIdentity() {  
        mvMatrix = Matrix.I(4);  
}    
function multMatrix(m) {  
        mvMatrix = mvMatrix.x(m);  
}  
function mvTranslate(v) {  
        multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());  
}  
function setMatrixUniforms() {  
        var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");  
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));  
        
        var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");  
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));  
}