var canvas = document.getElementById('canvas');

if (canvas.getContext){
        var context = canvas.getContext('2d');
    
        context.beginPath();                                                 
        context.arc(70,70, 70, 0, 2 * Math.PI, false);                       
        context.fillStyle = 'yellow';                                         
        context.fill();
            
        context.beginPath();                                                 
        context.arc(45, 57, 7, 0, 1 * Math.PI, true);                        
        context.moveTo(100,57);                                              
        context.arc(95,57, 7, 0, 1 * Math.PI, true);
        context.fillStyle = '#777777';                                       
        context.fill();
            
        context.beginPath();                                                 
        context.arc(70,90, 30, 0, 1 * Math.PI, false);
        context.lineTo(100,90);
        context.fillStyle = '#ffffff';
        context.fill();
        context.stroke();
            
        context.fillStyle = 'black';                                         
        context.lineWidth = 3;
        context.lineJoin = 'round';                                          
        context.lineCap = 'round';                                           
        context.beginPath();
        context.moveTo(30,40);
        context.lineTo(30,70); 
        context.lineTo(60,70); 
        context.lineTo(60,40); 
        context.lineTo(30,40); 
        context.moveTo(60,60); 
        context.lineTo(80,60);
        context.moveTo(80,40); 
        context.lineTo(80,70);
        context.lineTo(110,70);
        context.lineTo(110,40);
        context.lineTo(80,40);
        context.stroke();
}