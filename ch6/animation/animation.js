var canvas = document.getElementById('canvas');
var context;
var x = 10;                          
var y = 5;
var xAdd = 3;                                      
var yAdd = 6;                                      

function init() {
    if (canvas.getContext){
        context = canvas.getContext('2d');
        return setInterval(draw, 60);   
    }
}

function draw() {
    context.clearRect(0,0,408,250);                           
    context.fillStyle = 'black';
    context.fillRect(x,y,20,20);
    x += xAdd;
    y += yAdd;
}

init();