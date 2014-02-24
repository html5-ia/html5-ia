$(document).ready(
    function() {
        var chatlog = $('.chatlog');
        if (chatlog.length > 0) {
            var evtSource = new EventSource("sse.php?uid=" + uid);
            evtSource.addEventListener("message", function(e) {
                console.log('message');
                var el = document.createElement("li");
                el.innerHTML = e.data;
                chatlog.append(el);
            })
            evtSource.addEventListener("useradded", function(e) {
                console.log('useradded');
                var el = document.createElement("li");
                el.innerHTML = e.data;
                chatusers.appendChild(el);
            })
            evtSource.addEventListener("ping", function(e) {
                var newElement = document.createElement("li");
                
                var obj = JSON.parse(e.data);
                newElement.innerHTML = "ping at " + obj.time;
                eventList.appendChild(newElement);
            }, false);
            console.log(evtSource);
            var chatformCallback = function() {
                chatform.find('input')[0].value = '';
            }
            var chatform = $('#chat');
            chatform.bind('submit', function() {
                var ajax_params = {
                    url: 'add-chat.php',
                    type: 'POST',
                    data: chatform.serialize(),
                    success: chatformCallback,
                    error: function () { window.alert('An error occurred'); }
                };
                $.ajax(ajax_params);
                return false;
            })
        }
    }
)