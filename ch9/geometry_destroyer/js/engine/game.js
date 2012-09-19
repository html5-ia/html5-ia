/*
Name: Game Utilities
Version: 1.0
Author: Ashton Blue
Author URL: http://blueashes.com
Publisher: Manning

Desc: Contains a series of re-usable game functions for
interacting with the engine.
*/

var gd = gd || {};

gd.game = {
    // Creates a new object from a class
    spawn: function(name, params) {
        // temporarily store item for reference purposes
        var entity = new gd.template[name];

        // Set the id, faster for object searching than a object comparison
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

        // Apply the passed parameters as an init via Curry
        if (arguments.length > 1 && entity.init) {
            // Remove name argument
            var args = [].slice.call(arguments, 1);
            // Fire the init with proper arguments
            entity.init.apply(entity, args);
        } else if (entity.init) {
            entity.init();
        }
    },

    // Detects if boundaries have been violated and fires a callback if so
    boundaries: function(obj, top, right, bottom, left, offset) {
        if (offset === undefined)
            offset = 0;

        if (obj.x < - this.size.width - offset) {
            return left.call(obj);
        } else if (obj.x > this.size.width + offset) {
            return right.call(obj);
        } else if (obj.y < -this.size.height - offset) {
            return bottom.call(obj);
        } else if (obj.y > this.size.height + offset) {
            return top.call(obj);
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
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }
};