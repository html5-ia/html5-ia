var Planner = function(ee) {
    var plan = {};
    plan.tasks = [];
    plan.workers = [];
    plan.statuses = ['todo','inprogress','done'];
    var Task = function(task_name, task_id) {
        var that = {};
        that.name = task_name;
        if (typeof task_id === 'undefined') {
            that.id = guidGenerator();
        } else {
            that.id = task_id;
        }
        that.owner = '';
        that.status = '';
    }
    function get_task(task_id) {
        return plan.tasks[get_task_index(task_id)];
    }
    function get_task_index(task_id) {
        for (var i = 0; i < plan.tasks.length; i++) {
            if (plan.tasks[i].id == task_id) { return i; }
        }
        return -1;
    }
    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    var that = {
        load_plan: function(new_plan) {
            //IRL, put validation logic in here
            plan = JSON.parse(new_plan);
            ee.emit('loadPlan',plan);
        },
        get_plan: function() {
            return JSON.stringify(plan);
        },
        add_task: function(task_name, task_id, source) {
            var task = Task(task_name, task_id);
            plan.tasks.push(task);
            ee.emit('addTask', task, source);
            return task.id;
        },
        move_task: function(task_id, owner, status, source) {
            var task = get_task(task_id);
            task.owner = owner;
            task.status = status;
            ee.emit('moveTask', task, source);
        },
        delete_task: function(task_id, source) {
            var task_index = get_task_index(task_id);
            if (task_index >= 0) {
                var head = plan.tasks.splice(task_index,1);
                head.concat(plan.tasks);
                plan.tasks = head;
                ee.emit('deleteTask', task_id, source);
            }
        },
        add_worker: function(worker_name, source) {
            var worker = {};
            worker.name = worker_name;
            worker.id = guidGenerator();
            plan.workers.push(worker);
            ee.emit('addWorker', worker, source);
        },
        delete_worker: function(worker_name, source) {
            var worker;
            for (var i=0; i < plan.workers.length; i++) {
                if (plan.workers[i].name == worker_name) { worker = plan.workers[i]; }
            }
            if (typeof worker !== 'undefined') {
                for (var j=0; j < worker.statuses.length; j++) {
                    var tasks = worker.statuses[j];
                    for (var k=0; k < tasks.length; k++) {
                        plan.free_tasks.push(tasks[k]);
                    }
                }
                ee.emit('deleteWorker', worker, source)
            }
        },
        eachListener: ee.eachListener,
        addListener: ee.addListener,
        on: ee.on,
        once: ee.once,
        removeListener: ee.removeListener,
        removeAllListeners: ee.removeAllListeners,
        listeners: ee.listeners,
        emit: ee.emit,
        setMaxListeners: ee.setMaxListeners
    };
    return that;
}