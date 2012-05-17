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
        var entity = (new name);
        
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
        if (arguments.length > 1) {
            // Remove name argument
            var args = [].slice.call(arguments, 1);
            // Fire the init with proper arguments
            entity.init.apply(this, arguments);
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
            graveyard.push(gd.core.storage.all[obj]);
    }
};