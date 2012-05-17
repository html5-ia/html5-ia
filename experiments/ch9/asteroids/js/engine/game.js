/*
Name: Game Utilities
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning
Credits: Uses a modified version of John Resig's class extension script
http://ejohn.org/blog/simple-javascript-inheritance/
*/

var gd = gd || {};

gd.game = {
    // Note: should be in the run file, not here
    // x and y coordinate information for 3D space, manually retrieved
    size: {
        width: 43,
        height: 32
    },
    
    spawn: function(name, params) {
        // temporarily store item for reference purposes
        var entity = (new name);
        
        // Store entity in main array
        gd.core.storage.push(entity);
        
        // Store in sub arrays for faster collision detection
        switch (entity.type) {
            case 'a':
                gd.core.storage.a.push(entity);
                break;
            case 'b':
                gd.core.storage.b.push(entity);
                break;
            default:
                break;
        }
        
        // Apply the passed parameters as an init
        if (entity.init) {
            // Remove name argument
            var args = [].slice.call(arguments, 1);
            // Fire the init with arguments
            entity.init.apply(this, arguments);
        }
        
        // Fire new object's buffers
        gd.core.initBuffers(entity);
    },
    
    // Note: cleanup
    entityGetVal: function(name, val) {
        // Setup stack for storage
        var stack = new Array;
        
        // Loop through objects and get matched value
        if (typeof val != 'undefined') { // Incase no val was passed
            for (var j in this.storage) {
                if (this.storage[j][(name)] == val) stack.push(this.storage[j]);
            }
        }
        else {
            for (var j in this.storage) {
                if (this.storage[j][(name)]) stack.push(this.storage[j]);
            }
        }
        
        // Return value or false
        if (stack.length > 0) {
            return stack;
        }
        else {
            return false;
        }
    },
    
    random: function(max, min) {
        if (!min) min = 1;
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    
    randomPosNeg: function() {
        return Math.random() < 0.5 ? -1 : 1;
    },
    
    // Kill everything and place it in the graveyard
    armageddon: function() {
        
    }
};