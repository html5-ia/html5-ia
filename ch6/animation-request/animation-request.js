var canvas = document.getElementById('canvas');
var context;
var x = 10;                          
var y = 5;
var xAdd = 2;                                      
var yAdd = 3;

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   || 
    window.webkitRequestAnimationFrame     || 
    window.mozRequestAnimationFrame        || 
    window.oRequestAnimationFrame          || 
    window.msRequestAnimationFrame         || 
    function(/* function */ callback, /* DOMElement */ element){
        return window.setTimeout(callback, 1000 / 60);
    };
})();

function init() {
    if (canvas.getContext){
        context = canvas.getContext('2d');
        animate();
    }
}

function animate() {
    draw();
    canvas.run = requestAnimFrame(animate);
}

function draw() {
    context.clearRect(0,0,408,250);                           
    context.fillStyle = 'black';
    context.fillRect(x,y,20,20);
    x += xAdd;
    y += yAdd;
}

init();