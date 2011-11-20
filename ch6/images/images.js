var canvas = document.getElementById('canvas');

if (canvas.getContext){
        var context = canvas.getContext('2d');
    
        var img = new Image(); 
        img.src = 'background.jpg'; 
        context.rotate(0.1);              
        context.globalAlpha = 0.3;        
        context.drawImage(img,30,20);
}