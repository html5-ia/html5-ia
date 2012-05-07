window.onload = function() {
    
    /*------------
     Running The Program 
    ------------*/
    // Setup your own engine
    var MyEngine = Engine.extend({
        width: 800,
        height: 600
    });
    
    // Create and activate it
    var World = new MyEngine();
    World.setup();
    
    // Animation must be kept seperate due to a DOM error caused by self-reference in your objects
    function animate() {
        requestAnimFrame( animate );
        World.draw();
    }
    animate();
    
    
    /*------------
     Object Templates
    ------------*/
    
    var Player = Entity.extend({
        // Vertices setup
        bufCols: 3,
        bufRows: 3,
        bufVert: [
             0.0,  2.0,  0.0,  
            -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0
             
        ],
        
        // Color integration
        col: [
            // red, green, blue, alpha (aka transparency)
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            0, 0, 0, 1
        ],
        
        rotateInit: 0,
        rotateSpeed: 2,
        rotate: [0, 0, 1],
        
        update: function() {
            if (Ctrl.left) {
                this.rotateInit += this.rotateSpeed;  
            } else if (Ctrl.right) {
                this.rotateInit -= this.rotateSpeed;  
            }
        }
    });
    
    /***************************
    Game Controllers
    ***************************/
    var Ctrl = {
        init: function() {
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },
        
        keyDown: function(event) {
            switch(event.keyCode) {
                case 37: // Left
                    Ctrl.left = true;
                    break;
                case 39: // Right
                    Ctrl.right = true;
                    break;
                default:
                    break;
            }
        },
        
        keyUp: function(event) {
            switch(event.keyCode) {
                case 37: // Left
                    Ctrl.left = false;
                    break;
                case 39: // Right
                    Ctrl.right = false;
                    break;
                default:
                    break;
            }
        }
    };
    Ctrl.init();
    
    
    /*------------
     Object Spawning
    ------------*/
    // All objects drawn from center outward
    // You can respawn any object as many times as you want
    // Each object receives a unique ID so you don't have to worry about conflicting names
    
    // Four example objects on corners
    /*World.spawnEntity(Player, 0, 0, -20);*/ // spawnEntity(entity, x, y, z);
    World.spawnEntity(Player, 0, 0, -20);
    
} // End onload