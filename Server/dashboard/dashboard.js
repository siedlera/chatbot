$( document ).ready(function() {


/****************************             ****************************/
/**************************** DATA MODULE ****************************/
/****************************             ****************************/

//Make Socket connection
let socket = io.connect('http://localhost:3000');
let clientData = [];
let chats = [];

/****************************             ****************************/
/**************************** SOCKET MANAGER ****************************/
/****************************             ****************************/

//ERHALT EINER NEUEN NACHRICHT (VON CLIENT, DASH ODER BOT)!!!
socket.on('clientItem_to_dash', function(clientItem){
  console.log('=> Client Item vom Server erhalten', clientItem);
  new ChatlistItem(clientItem);
  MessageOutput(clientItem.channelID, clientItem.username, clientItem.lastMessage, clientItem.senderType);
  UserDataOutput(clientItem);
});


socket.on('botItem_to_dash', function(botItem){
  console.log('=> Bot-Item vom Server erhalten', botItem);
  MessageOutput(botItem.channelID, botItem.botName, botItem.botReply, botItem.senderType);
});


//clientData vom Server erhalten
console.log('------ Chat Modul Start ------ ');
socket.emit('receive_clientData', function(){});
socket.on('receive_clientData', function(data){
  console.log('=> ClientData vom Server erhalten', data);
  clientData = data;
  createChatList(data);
  statistics.chatsCount = clientData.length;
  drawGraphics();
});

function send_dash_item_to_server(dashItem){
  socket.emit('dash_item_to_server', dashItem);
}

function get_chat_history(channelID){
  socket.emit('receive_chat_history', channelID, function(){});
}

socket.on('receive_chat_history', function(chatHistoryItem){
  new ChatWindow(chatHistoryItem.chats, chatHistoryItem.channelID)
});

function send_BotStatusUpdate(channelID){
  socket.emit('update_bot_status', channelID);
}
/*BIS HIER => CHECKED*/




/*
//Besch: Sende botConfig an Server
//Ausf: Klicken Save -> button_save_configs.mousePressed
function send_botConfig() {

  $.ajax( {
    url:'http://localhost:3000/botConfig_dashToServer',
    method:'POST',
    contentType: 'application/json; charset=utf-8',
    dataType : 'json',
    data: JSON.stringify(botConfig),
    success:function(success) { //success wird von Server mitgechickt
    }
  });
}
*/

/****************************             ****************************/
/**************************** USERDATA MODULE ****************************/
/****************************             ****************************/




/****************************             ****************************/
/**************************** NAVIGATION ****************************/
/****************************             ****************************/

class MenuList {
  constructor(){
    this.menuList = ['Chats', 'Konfigurator', 'Statistik'];
    for(let index in this.menuList){
      new MenuItem(this.menuList[index], index)
    }
  }
}

class MenuItem {
  constructor(menuName, index){
    this.index = index;
    this.menuName = menuName;
    this.menuItem = $('<li class="menu-item" id="menu-item-'+this.index+'"><a href="javascript:;">'+this.menuName+'</a></li>');
    this.menuItem.appendTo('#menu-list');
    if(this.index==0){this.menuItem.addClass('active-menu')}
    this.click_menu_item();
  }

  click_menu_item(){
    $('#menu-item-'+this.index).on('click', function(){
      this.toggle_show();
      this.add_active_class();
    }.bind(this))
  }

  toggle_show(){
    $('body').find('.container-main.is-shown').removeClass('is-shown').addClass('is-hidden');
    $('#window-'+this.index).removeClass('is-hidden').addClass('is-shown');
  }

  add_active_class(){
    $('#menu-list').find('.active-menu').removeClass('active-menu');
    $('#menu-item-'+this.index).addClass('active-menu');
  }

}

new MenuList();



/****************************                  ****************************/
/**************************** CHAT-MESSENGER   ****************************/
/****************************                  ****************************/

let chatList = [];
let activeChat;

function createChatList(data) {
  $('#chat-list').empty();
  chatList = [];
  for(let i in data){
    let chatItem = new ChatlistItem(data[i]);
    chatList.push(chatItem);
  }
}

class ChatlistItem {

  constructor(clientItem){
    this.username = clientItem.username;
    this.channelID = clientItem.channelID;
    this.lastMessage = clientItem.lastMessage;
    this.add_to_chatlist();
    if(this.channelID == clientData[0].channelID ) {
      this.add_active_class();
    }
    this.render_chat_window(clientItem);
    chatList.push(clientItem);
    this.mobile_hide_chat_menu();
    this.mobile_show_chat_menu();

    render_bot_status(this.channelID);
  }

  add_to_chatlist(){
    let found = chatList.find(x => x.channelID === this.channelID);
    if( found ){ this.update_userdata(); }
    else {
      console.log(this.username);
      $('<div>').attr('id', 'chat-item-' + this.channelID).appendTo('#chat-list');
      $('<div>').attr('class', 'userData').appendTo('#chat-item-' + this.channelID);
      $('<div>').attr('class', 'userName').html(this.username).appendTo('#chat-item-' + this.channelID + ' .userData');
      $('<div>').attr('class', 'lastMessage').html(this.lastMessage).appendTo('#chat-item-' + this.channelID + ' .userData');

      $('<button>').attr('id', 'bot-activation-' + this.channelID).appendTo('#chat-item-' + this.channelID);

      $('#bot-activation-' + this.channelID).on('click', function(){
        send_bot_status(this.channelID);
      }.bind(this));
    }
  }

  update_userdata(){
    $('#chat-item-' + this.channelID + ' .userName' ).html(this.username);
    $('#chat-item-' + this.channelID + ' .lastMessage' ).html(this.lastMessage);
  }

  render_chat_window(clientItem){
    $('#chat-item-' + this.channelID).on('click', function(){
      get_chat_history(this.channelID);
      UserDataOutput(clientItem);
      activeChat = this.channelID;
      this.add_active_class();
    }.bind(this))
  }

  add_active_class(){
    $('#chat-list').find('.active-chat').removeClass('active-chat');
    $('#chat-item-'+this.channelID).addClass('active-chat');
  }

  mobile_hide_chat_menu(){
    $('#chat-item-' + this.channelID).on('click', function(){
      if(window.screen.availWidth < 768) {$('.chat-menu').addClass('is-hidden')};
    });
  }

  mobile_show_chat_menu(){
    this.x = window.matchMedia("(min-width: 767px)");
    if (this.x.matches) { $('.chat-menu').removeClass('is-hidden') };
    this.x.addListener(this.mobile_show_chat_menu);
  }
}


class ChatWindow {

  constructor(chatHistory, channelID){
    this.channelID = channelID;
    let found = clientData.find(x => x.channelID === this.channelID);
    this.chatHistory = chatHistory;
    this.render_chat();
    this.click_send_button(found);
    this.mobile_click_back_button();
  }

  render_chat(){
    $('.chat-messenger').empty();
    $('<div id="sub-menu">zurück</div><div class="chat-output">').appendTo('.chat-messenger');
    $('<input class="message" id="message-'+this.channelID+'" type="text" placeholder="Nachricht">').appendTo('.chat-messenger');
    $('<button class="send" id="send-'+this.channelID+'">Senden</button>').appendTo('.chat-messenger');
      for( let z = (this.chatHistory.length-50); z < this.chatHistory.length; z++ ){
        MessageOutput(this.channelID, this.chatHistory[z].name, this.chatHistory[z].message, this.chatHistory[z].senderType);
      }
      let messageBody = document.querySelector('.chat-output');
      messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
  }

  click_send_button(found){
    $('#send-' + this.channelID).on('click', function(){
      if($('#message-'+this.channelID).val() != '' ) {
        let dashItem = {
          channelID: this.channelID,
          senderMessage: $('#message-' + this.channelID).val(),
          senderName: genConfig.botName,
        }

        if(found.botOff==false){
          send_bot_status(this.channelID);
        }

        send_dash_item_to_server(dashItem);
        $('#message-'+this.channelID).val('');
      }
    }.bind(this));
  }

  mobile_click_back_button(){
    $('#sub-menu').on('click', function(){
      $('.chat-menu').removeClass('is-hidden') ;
    })
  }
}


function MessageOutput(channelID, senderName, senderMessage, senderType) {
    if(activeChat == channelID){
      $('<div class="chat-message" ><div class="'+senderType+'"><strong>' + senderName+ ': </strong>' + senderMessage + '</div></div>').appendTo('.chat-output');
    }
    let messageBody = document.querySelector('.chat-output');
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
}

function UserDataOutput(clientItem) {
    $('#userdata-output').empty();
    $('<div id="username">').html('Name: '+clientItem.username).appendTo('#userdata-output');
}

function render_bot_status(channelID){
    let found = clientData.find(x => x.channelID === channelID);
    $('#bot-activation-' + channelID).html(found.botOff ? 'inaktiv': 'aktiv');
}

function send_bot_status(channelID){
  let found = clientData.find(x => x.channelID === channelID);
  found.botOff = !found.botOff;
  render_bot_status(channelID);
  send_BotStatusUpdate(channelID);
}



  /****************************             ****************************/
  /****************************             ****************************/
  /**************************** Konfigurator MODULE ****************************/
  /****************************             ****************************/
  /****************************             ****************************/

  var botConfig;
  let TriResItems = [];
  var genConfig = {};
  var TriResItemCounter = 0;
  var internalCount = 0;



  /************** SOCKET MANAGER **************/

  $('#menu-item-1').on('click', function(){
    socket.emit('receive_bot_config', function(){});
  });

  socket.on('receive_bot_config', function(sendObject){
    botConfig = sendObject;
    console.log('=> botConfig von Server erhalten', botConfig);
  });

  function send_botConfig_to_server() {
    console.log('SEND pushObject',botConfig);
    socket.emit('receive_push_object', botConfig, function(){});
  }

  function sendGenConfig(){
    socket.emit('send_genConfig', genConfig, function(){});
    console.log('=> genConfig an Server gesendet');
  }

  socket.on('receive_genConfig', function(sendObject){
    genConfig = sendObject;
    console.log('=> genConfig von Server erhalten');
    assign_genConfig_fields()
  });

  /************** FUNCTIONS **************/

  $('.config-menu-item#general').on('click', function(){
    $('#window-1').find('.is-shown').removeClass('is-shown').addClass('is-hidden');
    $('#general-config-container').removeClass('is-hidden').addClass('is-shown');


  })

  $('.config-menu-item#customizer').on('click', function(){
    $('#window-1').find('.is-shown').removeClass('is-shown').addClass('is-hidden');
    $('.customizer-menu').removeClass('is-hidden').addClass('is-shown');
    $('#tri-res-container').removeClass('is-hidden').addClass('is-shown');
    $('#customizer-header-menu').removeClass('is-hidden').addClass('is-shown');

    $('.customizer-list').empty();

    for (var group in botConfig) {
      if (botConfig.hasOwnProperty(group)) {
          new TriResGroup(group);
      }
    }
    $('.customizer-menu').append('<div id="add--trires-group">+Gruppe hinzufügen</div>');
    $('#add--trires-group').on('click', function(){

      new TriResGroup('Gruppe-' + Math.floor(Math.random() * 100));
    });
  })

  $('#save-customizer').on('click', function(){
    send_botConfig_to_server();
  });




  /************** CLASSES **************/


  class TriResGroup {

    constructor(groupName){
      this.groupName = groupName;
      this.groupID = 'group-'+groupName;
      this.renderItem();
      this.renderEvent();
      this.push_newGroup();

    }

    renderItem(){
      $('<div class="trires-group" id="'+this.groupID+'">'+this.groupName+'</div>').appendTo('.customizer-list');
    }

    renderEvent(){
      $('#group-'+this.groupName).on('click', function(){

        TriResItemCounter = 0;
        $('#tri-res-output').empty();

        for(let i in botConfig[this.groupName]){
          let existingItem = botConfig[this.groupName][i]
          new TriResItem(this.groupName, existingItem)
        }

      }.bind(this))
    }

    push_newGroup(){
      if(! botConfig[this.groupName]){
          botConfig[this.groupName] = [];
        }
    }
  }


  class TriResItem {

    constructor(itemName, existingItem, parentItem){

      TriResItemCounter++;

      this.itemName = itemName;
      this.parentItem = parentItem;
      this.trigger = [''];
      this.replies = [''];

      this.existingItem = existingItem;
      this.replyIndex = 0;

      (existingItem.itemID)?this.itemID = existingItem.itemID:this.push_newItem();

      this.renderItem(this.parentItem);

      new TriResItemInputs(this.existingItem, this.itemID, this.itemName);
      //this.renderDeleteGroupButton();

    }

    push_newItem(){
      this.itemID = Math.floor(Math.random() * 1000) + 1;
      botConfig[this.itemName].push(this);
    }

    renderItem(parentItem){
      let newItem = $('<div class="tri-res-item" id="item-'+this.itemID
      +'"><div class="tri-input"></div><div class="res-input"></div><div class="tri-res-actions"></div></div>');
        newItem.appendTo('#tri-res-output');
        this.renderNewItemButton();
      }

    renderNewItemButton(){

      $('<br><span class="add-item-button" id="test-'+this.itemID+'">+Item</span>').appendTo('#item-'+this.itemID+' .tri-res-actions');
      $('#test-'+this.itemID).click( function(){
          new TriResItem(this.itemName,'', this.itemID);
      }.bind(this));
    }

    renderDeleteGroupButton(){
      $('<br><span class="delete-item-button" id="'+this.itemID+'" >-deleteItem</span>').appendTo('#group-'+this.itemID+' .tri-res-actions');
      $('.delete-item-button#'+this.itemID).click( function(){
      }.bind(this));
    }

  }



  class TriResItemInputs {
    constructor(existingItem, itemID, itemName){

      this.triggerIndex = 0;
      this.replyIndex = 0;

      this.existingItem = existingItem;
      this.itemID = itemID;
      this.itemName = itemName;

      if(this.existingItem){
        this.loopReplies();
        this.loopTrigger();
      } else {
        this.renderTrigger()
        this.renderReply();
      };

      this.renderAddReply();
      this.renderAddTrigger();

      this.update_data();

    }

    loopTrigger(){
      for(let i in this.existingItem.trigger){
        this.renderTrigger(this.existingItem.trigger[i]);
      }
    }

    renderTrigger(triggerValue){
      $('<input placeholder="Trigger" class="trigger" id="trigger-'+this.itemID+'-'+this.triggerIndex
      +'"></div>').val(triggerValue).appendTo('#item-'+this.itemID+' .tri-input');
      this.triggerIndex++;
    }

    loopReplies(){
      for(let i in this.existingItem.replies){
        this.renderReply(this.existingItem.replies[i], i);
      }
    }

    renderReply(replyValue, i){
      $('<input placeholder="Reply" id="reply-'+this.itemID+'-'+this.replyIndex
      +'"></div>').val(replyValue).appendTo('#item-'+this.itemID+' .res-input');
      this.replyIndex++;
    }

    renderAddReply(){
      $('<span class="add-replybutton" id="rep-button-'+this.itemID+'" >+Reply</span>').appendTo('#item-'+this.itemID+' .tri-res-actions');
      $('#rep-button-'+this.itemID).click( function(){

      let found = botConfig[this.itemName].find(x => x.itemID === this.itemID);

        found.replies.push(''); //Wenn AddReply gedrückt wird -> Pushen von lleren String in botConfig
        this.renderReply();
        this.update_data();

      }.bind(this));
    }

    renderAddTrigger(){
      $('<span class="add-replybutton" id="tri-button-'+this.itemID+'" >+Trigger</span>').appendTo('#item-'+this.itemID+' .tri-res-actions');
      $('#tri-button-'+this.itemID).click( function(){
        console.log('trigger geklickt');
        let found = botConfig[this.itemName].find(x => x.itemID === this.itemID);
        console.log(found);
        found.trigger.push('');
        this.renderTrigger();
        this.update_data();
      }.bind(this));
    }


    update_data(){

      let found = botConfig[this.itemName].find(x => x.itemID === this.itemID);

      for(let i in found.trigger){

        console.log(found.trigger);

        let triggerInput = $("#trigger-"+this.itemID+'-'+i);
        triggerInput.change( function(){
          found.trigger[i] = triggerInput.val();
          console.log('botConfigTest',botConfig);
        }.bind(this));
      }

      for(let i in found.replies){
        let replyInput = $("input#reply-"+this.itemID+'-'+i);
        replyInput.change( function(){
          found.replies[i] = replyInput.val();
          console.log('botConfig',botConfig);
        }.bind(this));
      }
    }


  }


  /**************************** GENERAL CONIFG ****************************/

  $('#save-genconfig').on('click', function(){
      genConfig.botName = $('#bot-name').val();
      sendGenConfig();
  })

  function assign_genConfig_fields(){
    $('#bot-name').val(genConfig.botName)
  }



/****************************             ****************************/
/****************************             ****************************/
/**************************** STATISTIK MODULE ****************************/
/****************************             ****************************/
/****************************             ****************************/


let statistics = {};




/*
function sendStatistics(){
  socket.emit('send_statistics', statistics, function(){});
  console.log('=> statistics an Server gesendet');
}
*/

  socket.on('receive_statistics', function(sendObject){
    statistics = sendObject;
    console.log('=> Statistics von Server erhalten');
  });

function drawGraphics(){


  $( '<span style="display:block;background:#ccc; padding:10px;">Connected Users: '+statistics.connectedUser+'</span><br>' ).appendTo('#statistic-output');
  $( '<span style="display:block;background:#575ed8; padding:10px; color:white;">Current Chats: '+statistics.chatsCount+'</span>' ).appendTo('#statistic-output');


var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 300;
myCanvas.height = 300;

var ctx = myCanvas.getContext("2d");

function drawLine(ctx, startX, startY, endX, endY){
    ctx.beginPath();
    ctx.moveTo(startX,startY);
    ctx.lineTo(endX,endY);
    ctx.stroke();
}

function drawArc(ctx, centerX, centerY, radius, startAngle, endAngle){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
}

function drawPieSlice(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
}

drawLine(ctx,100,100,200,200);
drawArc(ctx, 150,150,150, 0, Math.PI/3);
drawPieSlice(ctx, 150,150,150, Math.PI/2, Math.PI/2 + Math.PI/4, '#ff0000');

var myVinyls = {
    "connectedUser": statistics.connectedUser,
    "chatsCount": statistics.chatsCount,
};

var Piechart = function(options){
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;

    this.draw = function(){
        var total_value = 0;
        var color_index = 0;
        for (var categ in this.options.data){
            var val = this.options.data[categ];
            total_value += val;
        }

        var start_angle = 0;
        for (categ in this.options.data){
            val = this.options.data[categ];
            var slice_angle = 2 * Math.PI * val / total_value;

            drawPieSlice(
                this.ctx,
                this.canvas.width/2,
                this.canvas.height/2,
                Math.min(this.canvas.width/2,this.canvas.height/2),
                start_angle,
                start_angle+slice_angle,
                this.colors[color_index%this.colors.length]
            );

            start_angle += slice_angle;
            color_index++;
        }

    }
}

var myPiechart = new Piechart(
    {
        canvas:myCanvas,
        data:myVinyls,
        colors:["#ccc","#575ed8"]
    }
);
myPiechart.draw();
}

//BIS HIER FUNKTS!!!!!!


});
