var canvas = document.getElementById('canvas');

if (canvas.getContext){
        var context = canvas.getContext('2d');
        
        context.fillStyle = 'yellow';                                    
        context.fillRect(20,20,100,100);                                 
        context.fillStyle = 'grey';                                     
        context.fillRect(40,50,10,10);                                   
        context.fillRect(90,50,10,10);                                   
            
        context.clearRect(30,100,80,10);
        
        context.fillStyle = 'black';
        context.lineWidth = 3;                                                   
        context.strokeRect(30,40,30,30);
        context.strokeRect(80,40,30,30);
        context.fillRect(60,60,20,3);
}
