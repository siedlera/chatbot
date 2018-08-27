$(document).ready(function(){

/**************************** Global Variables ****************************/
//Make Socket connection
var socket = io.connect('http://localhost:3000');

//Query DOM
var message = document.getElementById('message');
    btn = document.getElementById('send'),
    chatoutput = document.getElementById('chatoutput');

var channelID = channelID = Math.floor((Math.random() * 100000) + 1);


/**************************** On Pageload ****************************/

if(localStorage.channelID) {
  getChannelID();
} else {
  storeChannelID();
}
//ChannelID and Server geschickt
socket.emit('send_channelID', channelID);


/**************************** SOCKET MANAGER ****************************/


socket.on('message_to_client', function(data) {
  console.log('=> Nachricht von Server erhalten und ausgegeben',data);

  if( data.senderType == 'bot' ){


      var n = data.message.length;
      $('<span id="istyping">'+data.name+' schreibt</span>').appendTo('#chatoutput');
      //updateScroll();
      //chatoutput.innerHTML += '<span id="istyping">Bot schreibt</span>';
      setTimeout(function(){
        chatoutput.removeChild(document.getElementById('istyping'));
        outputMsg(data.message, data.name, data.senderType);
      }, n*100);

    

  } else {

  outputMsg(data.message, data.name, data.senderType);

  }

});

function sendMsg(data1, data2, data3){
  socket.emit('message_to_server', {
    channelID: data2,
    message: data1,
    name: data3,
  })
}

/**************************** Events ****************************/

btn.addEventListener('click', function(){
  if(message.value) {
    //outputMsg(message.value, 'Ich');
    sendMsg(message.value, channelID, 'Ich')
    message.value = "";
  }
});

/**************************** FUNKTIONEN ****************************/

$('#chat-button').on('click',function(){
  console.log('geklickt');
  $('#mario-chat').removeClass('is-hidden');
  updateScroll();
})

$('#chat-header').on('click',function(){
  console.log('geklickt');
  $('#mario-chat').addClass('is-hidden');
})

function outputMsg(senderMessage, senderName, senderType){
  $('<div class="chat-message" ><div class="'+senderType+'"><strong>' + senderName+ ': </strong>' + senderMessage + '</div></div>').appendTo('#chatoutput');
  updateScroll();
}

//Speicher ChannelID in LocalStorage
function storeChannelID() {
  localStorage.setItem( 'channelID', JSON.stringify( channelID ) );
}

//Lade ChannelID von LocalStorage
function getChannelID() {
  channelID = JSON.parse( localStorage.getItem('channelID') );
  receive_chat_history()
}

//updateScroll -> down
function updateScroll(){
  var messageBody = document.getElementById('chat-window');
  messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
}


function receive_chat_history() {

  $.ajax( {
    url:'http://localhost:3000/receive_chat_history',
    method:'post',
    dataType:'json',
    data:{
      channelID: JSON.stringify(channelID),
    },
    success:function(data) { //data wird von Server geschichkt
      console.log('=> Request erfolgreich: Chatverlauf erhalten', data);
      for (var i in data){
        outputMsg(data[i].message, data[i].name, data[i].senderType);
      }
    }
  });

}

})
