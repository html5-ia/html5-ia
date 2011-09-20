var canvas;

window.onload = function() { start(); }

function start() {
        canvas = document.getElementById("glcanvas");
      
        initWebGL(canvas);      // Initialize the GL context
        
        // Only continue if WebGL is available and working
        if (gl) {
                initShaders();
                initBuffers();
                
                // RGB for clear color
                // Set clear color to black, fully opaque
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                
                // Enable depth testing
                gl.enable(gl.DEPTH_TEST);                               
        
                // draw();
                
                // Constantly updating version of draw
                tick();
        }
}