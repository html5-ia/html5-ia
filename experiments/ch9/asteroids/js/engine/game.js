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
    // Creates a new object from a class
    spawn: function(name, params) {
        // temporarily store item for reference purposes
        var entity = new gd.template[name];
        
        // Set the id
        entity.id = gd.core.id.get();
        
        // Store entity in main array
        gd.core.storage.all.push(entity);
        
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
        //entity.init();
        if (arguments.length > 1) {
            // Remove name argument
            var args = [].slice.call(arguments, 1);
            // Fire the init with proper arguments
            entity.init.apply(entity, args);
        } else {
            entity.init();
        }
    },
    
    // Gets a single game object and returns it
    get: function(key, val) {
        // Loop through objects and get matched value
        for (var obj = gd.core.storage.all.length; obj--;) {
            if (gd.core.storage.all[obj][key] === val) 
                return gd.core.storage[obj];
                break; // Note: Might not be necessary
        }
        
        // Note: Double check this doesn't happen on success too
        return false;
    },
    
    size: {
        width: 0,
        height: 0
    },
    
    // Detects if boundaries have been violated and fires a callback if so
    boundaries: function(obj, top, right, bottom, left) {
        if (obj.x < - this.size.width) {
            return left();
        } else if (obj.x > this.size.width) {
            return right();
        } else if (obj.y < - this.size.height) {
            return bottom();
        } else if (obj.y > this.size.height) {
            return top();
        }
    },
    
    // Basic equation for rotation based upon time
    // Originally from Mozilla's WebGL tutorial https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
    rotate: function(obj) {
        var currentTime = Date.now();
        if (obj.lastUpdate < currentTime) {  
            var delta = currentTime - obj.lastUpdate;  
            
            obj.rotate.angle += (30 * delta) / obj.rotate.speed;  
        }  
        obj.lastUpdate = currentTime;
    },

    
    // Random number generators
    random: {
        polarity: function() {
            return Math.random() < 0.5 ? -1 : 1;
        },
        number: function(max, min) {
            if (!min) min = 1;
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    },
    
    // Kill everything, kill them all!
    armageddon: function() {
        for (var obj = gd.core.storage.all.length; obj--;)
            gd.core.graveyard.storage.push(gd.core.storage.all[obj]);
    }
};