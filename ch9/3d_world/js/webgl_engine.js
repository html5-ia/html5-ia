var canvas;
var gl;
var squareVerticesBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix;
var horizAspect;
var squareRotation = 0.0;
var lastSquareUpdateTime = 0;

// How to figure out what a user's computer can handle for frames with fallbacks
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
          window.setTimeout(callback, 1000 / 60);
        };
})();

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
                                               
                animate();
        }
}

function animate() {
        requestAnimFrame( animate );
        draw();
}

function initWebGL(canvas) {
        try {
                // Canvas width must be set before gl initializes to prevent the Canvas
                // size from distorting WebGL view
                canvas.width = window.innerWidth - 20;
                canvas.height = window.innerHeight - 20;
                //canvas.width = 480;
                //canvas.height = 640;
                gl = canvas.getContext("experimental-webgl");
                
                // Set width and height equal to window
                
                
                horizAspect = canvas.width/canvas.height;
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
        
        // Store color data
        vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");  
        gl.enableVertexAttribArray(vertexColorAttribute); 
        
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
        // rgba
        var colors = [  
                1.0,  1.0,  1.0,  1.0,    // white  
                1.0,  0.0,  0.0,  1.0,    // red  
                0.0,  1.0,  0.0,  1.0,    // green  
                0.0,  0.0,  1.0,  1.0     // blue  
        ];  
        
        // Uses float32 to change the array into a webGL edible format. Research float32arrays more and play.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
        // Color data
        squareVerticesColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);  
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW); 
} 

function draw() {  
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
        // field of view in degress, width/height, only get objects between 1, 100 units
        perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0);  
        
        // Set things up to draw
        loadIdentity();
        // Setup translate away from the camera by 6 units
        
        
        // Rotate square
        mvPushMatrix();
        mvRotate(squareRotation, [0, 0, 1]); // x, y, z
        mvTranslate([0.0, 0.0, -6.0]);
        
        
        // Pass buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        // Send over shader program, number of arrays, something, something, something, something
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        
        // Pass color data from buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);  
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);  
        
        setMatrixUniforms();
        // Why x, y, and z?
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // Restore original matrix after drawing square
        mvPopMatrix();
        
        // Actual rotation of square
        var currentTime = (new Date).getTime();  
        if (lastSquareUpdateTime) {
                var delta = currentTime - lastSquareUpdateTime;  
            
                squareRotation += (100 * delta) / 1000.0;
                // alert(squareRotation);
        }   
        lastSquareUpdateTime = currentTime; 
}

// Matrix functions written by Vlad Vukicevic
    var mvMatrixStack = [];  
      
    function mvPushMatrix(m) {  
      if (m) {  
        mvMatrixStack.push(m.dup());  
        mvMatrix = m.dup();  
      } else {  
        mvMatrixStack.push(mvMatrix.dup());  
      }  
    }  
      
    function mvPopMatrix() {  
      if (!mvMatrixStack.length) {  
        throw("Can't pop from an empty matrix stack.");  
      }  
        
      mvMatrix = mvMatrixStack.pop();  
      return mvMatrix;  
    }  
      
    function mvRotate(angle, v) {  
      var inRadians = angle * Math.PI / 180.0;  
        
      var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();  
      multMatrix(m);  
    }  

// Matrix functions from Mozilla
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