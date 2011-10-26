var canvas = document.getElementById('canvas');

if (canvas.getContext){
    var context = canvas.getContext('2d');

    context.font = '20px impact, helvetica, arial';              
    context.textBaseline = 'middle';
    context.fillText('I <3 Canvas', 30, 30);        
    context.strokeText('I <3 Canvas', 60, 60);  
}    