function getWords(letters) {
    var msg = {};
    msg.type = 'getWordList';
    msg.params = {};
    msg.params.letters = letter;
    parent.postMessage(JSON.stringify(msg), 'http://localhost');
}

window.addEventListener('message', receiver, false);
function receiver(e) {
    if (e.origin == 'http://localhost:8080') {
        var msg = JSON.parse(e.data);
        switch (msg.type) {
            case 'sendWordList':
                showAutocompleter(msg.params.words);
                break;
        }
    }
}

get_words: function(letters) {
    var words = [];
    for (var i=0; i<plan.tasks.length; i++) {
        var tokens = plan.tasks[i].name.split(' ');
        for (var j=0; j<tokens.length; j++) {
            if (tokens[j].length > 2 && tokens[j].indexOf(letters) > -1) {
                words.push(tokens[j]);
            }
        }
    }
    return words;
},