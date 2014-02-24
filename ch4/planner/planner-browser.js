function init() {
    var ee = new EventEmitter();
    var planner = new Planner(ee);
    var render;
    if (typeof  MozWebSocket !== 'undefined') { WebSocket = MozWebSocket; }
    var ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = function(msg_json) {
        var msg = JSON.parse(msg_json);
        switch (msg.type) {
            case 'loadPlan':
                planner.load_plan(msg.args.plan);
                render = new Renderer(planner);
                break;
            case 'addTask':
                planner.add_task(msg.args.task_name, msg.args.task_id);
                break;
            case 'moveTask':
                planner.move_task(msg.args.task_id, msg.args.task_owner, msg.args.task_status);
                break;
            case 'deleteTask':
                planner.delete_task(msg.args.task_id);
                break;
        }
    };
    ws.onerror = function(e) {
        console.log(e.reason);
    }
    planner.on('addTask', function(task) {
        var msg = {};
        msg.type = 'addTask';
        msg.args = { 'task_name': task.name, 'task_id': task.id };
        ws.send(JSON.stringify(msg));
    });
    planner.on('moveTask', function(task) {
        var msg = {};
        msg.type = 'moveTask';
        msg.args = { 'task_id': task.id, 'owner': task.owner, 'status': task.status };
        ws.send(JSON.stringify(msg))
    });
    planner.on('deleteTask', function(task_id) {
        var msg = {};
        msg.type = 'deleteTask';
        msg.args = { 'task_id': task_id };
        ws.send(JSON.stringify(msg))
    });
}