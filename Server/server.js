/*

Erfolgreiches Server Setup
=> ChatHistory.json geladen
=> clientData.json geladen
=> botconfig.json geladen
Chatbot ready
Client Verbindung: IUlJXl1AvNJm1027AAAA
------- NEW CONNECTION ENDE -------

-------------- NEUE CLIENT MESSAGE --------------
=> Client/Bot-Message an Client geschickt
=> BotAntwort erfolgreich
=> Client/Bot-Message an Client geschickt
=> CLient-Item erstellt und an Dash geschickt
=> Bot-Item erstellt und an Dash geschickt:
=> Ich Message in ChatHistory gepushed + gespeichert
=> BotPlatzhalter Message in ChatHistory gepushed + gespeichert
=> ClientItem in ClientData gepushed + gespeichert

-------------- NEUE DASH MESSAGE --------------
=> Dash-Item von Dash empfangen
=> Bot-Item erstellt und an Dash geschickt:
=> Client/Bot-Message an Client geschickt

*/



var bp = require( 'body-parser' );
var fs = require( 'fs' );
var express = require('express'); // express ist eig eine Funktion
var socket = require('socket.io');
var RiveScript = require('rivescript');
var bodyParser = require('body-parser');

//SETUPS
var app = express(); //epress() macht eine express app
var server = app.listen(3000, function() {
  console.log('Erfolgreiches Server Setup');
}); // über http://localhost:3000/ kann ich nun auf den Server zugreifen
var bot = new RiveScript({utf8: true});
var io = socket(server); //Socket.io funkt auf diesem Server(server)
app.use(express.static('dashboard'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use( function( request, response, next ) {
  response.setHeader( 'Access-Control-Allow-Origin', '*' );
  response.setHeader( 'Access-Control-Allow-Methods', 'GET, POST, DELETE' );
  response.setHeader( 'Access-Control-Allow-Headers', 'Content-Type' );
  next();
});
app.use( bp.urlencoded({extended:false}));

/****************************             ****************************/
/**************************** Globale Variablen  ****************************/
/****************************             ****************************/
var botConfig = {};

// object = {channelID, username, email, etc}
var clientData = [];

//NUR ÜBER: PUSH_SAVE_CHATHISTORY(channelID, message, name)
var chatHistory = [];


/****************************             ****************************/
/**************************** SERVERSTART  ****************************/
/****************************             ****************************/

fs.readFile('library/chatHistory.json', function(err,data){
  if (err) { fs.writeFile('library/chatHistory.json', JSON.stringify(chatHistory), function() {});
  console.log('=> ChatHistory.json erstellt');
  } else {
    chatHistory = JSON.parse(data);
    console.log('=> ChatHistory.json geladen');
  }

  fs.readFile('library/clientData.json', function(err,data){
    if (err) { fs.writeFile('library/clientData.json', JSON.stringify(clientData), function() {});
    console.log('=> clientData.json erstellt');
    } else {
      clientData = JSON.parse(data);
      console.log('=> clientData.json geladen');
    }

    fs.readFile('library/botconfig.json', function(err,data){
      if (err) { fs.writeFile('library/botconfig.json', JSON.stringify(botConfig), function() {});
      console.log('=> botconfig.json erstellt');
      } else {
        botConfig = JSON.parse(data);
        console.log('=> botconfig.json geladen');
      }

      fs.readFile('library/genConfig.json', function(err,data){
        genConfig = JSON.parse(data);
        console.log('=> genConfig.json geladen');

        fs.readFile('library/statistics.json', function(err,data){
          statistics = JSON.parse(data);
          console.log('=> Statistics.json geladen');

          fs.readFile('library/synonyms.json', function(err,data){
            synonyms = JSON.parse(data);
            console.log('=> Synonyms.json geladen');

            new_connection();
            loadBotFile();

          });
        });
      });
    });
  });
});

function new_connection(){

  io.on('connection', function(socket) {

    console.log('Client Verbindung: ' + socket.id);


    receive_channel_id_from_client(socket);
    receive_client_message_from_client(socket);
    receive_dash_item_from_dash(socket);
    update_bot_status_from_dash(socket);

    send_client_data_to_dash(socket, clientData);
    send_chatHistory_to_dash(socket, chatHistory);

    send_botConfig_to_dash(socket, botConfig);
    receive_genConfig_from_dash(socket);
    send_genConfig_to_dash(socket);
    send_statistics_to_dash(socket);



    statistics.connectedUser++;
    console.log(statistics);
    fs.writeFile('library/statistics.json', JSON.stringify(statistics), function() {
      console.log('=> Statistics gespeichert');
    });


    console.log('------- NEW CONNECTION ENDE -------');
    socket.on('disconnect', function () {
    console.log('Client Verbindung getrennt: ' + socket.id);
    });

  });
}


/****************************             ****************************/
/**************************** DATAMANAGEMENT  ****************************/
/****************************             ****************************/


function JOIN_CHANNEL_ID(socket, channelID){
  socket.join(channelID, function(){
    console.log('=> Socket joined: ' + channelID);
    console.log('------- SOCKET JOIN ENDE -------');
  });
}

function PUSH_SAVE_CHATHISTORY(channelID, senderMessage, senderName, senderType){
  var found = chatHistory.find(x => x.channelID === channelID);
  if( found ){
    var pushObject = {
      name:senderName,
      message:senderMessage,
      senderType:senderType,
    };
    found.chats.push( pushObject );
  } else {
    var pushObject = {
      channelID: channelID,
      chats:[{
        name:senderName,
        message:senderMessage,
        senderType:senderType,
      }],
    };
    chatHistory.push( pushObject );
  }
  fs.writeFile('library/chatHistory.json', JSON.stringify(chatHistory), function() {
    console.log('=> '+senderName+' Message in ChatHistory gepushed + gespeichert');
  });
}

function PUSH_SAVE_CLIENT_ITEM(channelID, senderMessage, senderName, senderType){

    var clientItem = {
      channelID:channelID,
      username:senderName,
      lastMessage:senderMessage,
      senderType: senderType,
    };

    var found = clientData.find(x => x.channelID === channelID);
    if (found) {
      found.lastMessage = senderMessage;
      found.username = senderName;
    } else {
      clientData.push(clientItem);
    }
    fs.writeFile('clientData.json', JSON.stringify(clientData), function() {
      console.log('=> ClientItem in ClientData gepushed + gespeichert');
    });
}

function UPDATE_BOT_STATUS(channelID){
  var found = clientData.find(x => x.channelID === channelID);
  found.botOff = !found.botOff;
  fs.writeFile('library/clientData.json', JSON.stringify(clientData), function() {
    console.log('--------------BotStatus in ClientData gepushed + gespeichert --------------');
  });
}


/****************************             ****************************/
/**************************** CLIENT - SERVER ****************************/
/****************************             ****************************/


function receive_channel_id_from_client(socket){
  socket.on('send_channelID', function(data){
    JOIN_CHANNEL_ID(socket, data);
  });
}

function receive_client_message_from_client(socket){
  socket.on('message_to_server', function(data){

    console.log('-------------- NEUE CLIENT MESSAGE --------------');
    SEND_MESSAGE_TO_CLIENT(data.channelID, data.message, data.name, 'client');
    //await bis vorherige Nachrift fertig -> Promise ->
    PUSH_SAVE_CHATHISTORY(data.channelID, data.message, 'Ich', 'client');
    feed_bot(data, socket);

  });
}

function SEND_MESSAGE_TO_CLIENT(channelID, senderMessage, senderName, senderType){
  sendObject = {
    channelID: channelID,
    message: senderMessage,
    name: senderName,
    senderType: senderType,
  }
  io.sockets.in(channelID).emit('message_to_client', sendObject);
  console.log('=> Client/Bot-Message an Client geschickt');
}

//=> Sende ChatHistory an Client
app.post( '/receive_chat_history', function(req,res) {

  var channelID = Number(req.body.channelID);

  var found = chatHistory.find(x => x.channelID === channelID);
  if( found ){
    console.log('=> ClientRequest: ChannelID gefunden');
    var sendObject = found.chats;
    res.end(JSON.stringify(sendObject), function(){
      console.log('=> Chatverlauf an Client geschickt');
    });
  } else {
    console.log('=> ClientRequest: ChannelID NICHT gefunden');
  }




});


/****************************             ****************************/
/**************************** SERVER - DASH ****************************/
/****************************             ****************************/
function SEND_CLIENT_ITEM_TO_DASH(channelID, senderName, senderMessage, senderType){

  var clientItem = {
    channelID:channelID,
    username:senderName,
    lastMessage:senderMessage,
    senderType: senderType,
  };

  io.emit('clientItem_to_dash', clientItem);
  console.log('=> CLient-Item erstellt und an Dash geschickt');
}


function SEND_BOT_ITEM_TO_DASH(channelID, botName, botReply, senderType){

  var botItem = {
    channelID:channelID,
    botName:botName,
    botReply:botReply,
    senderType: senderType,
  }
  io.emit('botItem_to_dash', botItem);
  console.log('=> Bot-Item erstellt und an Dash geschickt: ');

}

function send_client_data_to_dash(socket, clientData){
  socket.on('receive_clientData', function(){
    socket.emit('receive_clientData', clientData, function(){});
    console.log('=> CLient-Data an Dash geschickt');
  });
}

function send_chatHistory_to_dash(socket, chatHistory){
  socket.on('receive_chat_history', function(channelID){
    var found = chatHistory.find(x => x.channelID === channelID);
    if( found ){
    socket.emit('receive_chat_history', found, function(){});
    console.log('-------------- Chat-HistoryItem an Dash geschickt --------------');
    };

  });
}

function receive_dash_item_from_dash(socket){
  socket.on('dash_item_to_server', function(dashItem){
    console.log('-------------- NEUE DASH MESSAGE --------------');
    console.log('=> Dash-Item von Dash empfangen');
    SEND_BOT_ITEM_TO_DASH(dashItem.channelID, dashItem.senderName, dashItem.senderMessage, 'bot');
    SEND_MESSAGE_TO_CLIENT(dashItem.channelID, dashItem.senderMessage, dashItem.senderName, 'bot');
    PUSH_SAVE_CHATHISTORY(dashItem.channelID, dashItem.senderMessage, dashItem.senderName, 'bot')

  });
}

function update_bot_status_from_dash(socket){
  socket.on('update_bot_status', function(channelID){
    console.log('=> BOT-Status von Dash empfangen', channelID);
    UPDATE_BOT_STATUS(channelID);
  });
}



/*BIS HIER => CHECKED*/



/*
function update_bot_status_from_dash(socket){
  socket.on('bot_status', function(data){
    var found = clientData.find(x => x.channelID === data.channelID);
    found.botStatus = data.botStatus;
    writeFile('clientData.json', clientData);
  });
}





/****************************             ****************************/
/****************************    BOT      ****************************/
/****************************             ****************************/
let synonyms = [];
var rita = require('rita');


function feed_bot(data, socket) {

  loadBotFile().then(function(){
    return set_user_var(data);
  }).then(function(){
    return edit_data(data);
  }).then(function(message){
    return set_synonyms(message);
  }).then(function(message){
    return send_bot_reply(message, data);
  }).then(function(){
    //console.log('FERTIG');
  });

}

function loadBotFile(){
  return new Promise(function(resolve){
    bot.loadDirectory("brain", loading_done(resolve), loading_error);
    resolve();
  });
}

function set_user_var(data){

  return new Promise(function(resolve){
    var found = clientData.find(x => x.channelID === data.channelID);
    if( found ){
      //console.log(found);
      bot.setUservar ('local-user', 'clientname', found.username );
      resolve();
      console.log('=> Userdaten im Brain gesetzt');
    } else {
      bot.setUservar ('local-user', 'clientname', 'Unbekannt');
      resolve();
      console.log('=> Userdaten im Brain gesetzt');
    }
  })
}

function edit_data(data){
  return new Promise(function(resolve){

    let message = {
      botInput: [],
      botInputRS: [],
    };

    message.botInput = data.message.split('.');
    console.log('=> Message bearbeitet (Gesplittet)', message.botInput);

    for(let i in message.botInput){
      var rs = rita.RiString(message.botInput[i]);
      var inputArray = rs.words();
      message.botInputRS.push(inputArray);
    }
    resolve( message );

  });
}


function set_synonyms( message ){

  return new Promise(function(resolve){

    for( var i = 0; i < (message.botInputRS.length); i++ ){
      for ( var m = 0; m < (message.botInputRS[i].length); m++ ) {
        find_synonym( message.botInputRS[i][m] );
      }
    }


    function find_synonym( string ){

      console.log('find_synonym AUSGEFÜHRT', string);
      var synArray;
      for( var i in synonyms ){
        for( var z in synonyms[i] ){
          if( synonyms[i][z] == string ){
            console.log('SYNONYM ARRAY GEFUNDEN');
            synArray = synonyms[i];
            push_synonyms(synArray, string);
          } else {
            resolve(message);
          }
        }
      }
    }


  function push_synonyms(synArray, string){

    var triggerResult;

    for ( var group in botConfig ){
      for ( var index in botConfig[group] ){
        //for ( var trigger in botConfig[group][index] ){

            for( var x = 0; x < (synArray.length); x++ ){
                if(botConfig[group][index].trigger == synArray[x]){
                  triggerResult = synArray[x];
                } else {
                }
            }

        //}
      }
    }


    for( var i = 0; i < (synArray.length); i++ ){
      console.log( 'SYNONYM GESETZT', synArray[i], triggerResult );
      bot.setSubstitution ( synArray[i].toLowerCase(), triggerResult );
    }
    resolve(message);
  }


  });
}



function delay(){
  return new Promise(resolve => setTimeout( resolve, Math.floor((Math.random() * 5000) + 1) ))
}

function delay_writing(item){
  let n = item.length;
  return new Promise(resolve => setTimeout( resolve, n*100 ))
}


function send_bot_reply(message, data){

  console.log('TEST AUSGEFÜHRT', message);
  return new Promise(function(resolve){

      for( var x = 0; x < message.botInput.length; x++ ){

        console.log(message.botInput[x]);
        bot_input(message.botInput[x], data);
        };

        resolve();
  });

}

function bot_input(item, data){
  return new Promise(function(resolve){

    console.log('ITEM',item);

    bot.reply('local-user', item).then( function(botReply) {
      console.log('=> BotAntwort erfolgreich', botReply);
      var username = bot.getUservar ('local-user', 'clientname');

      SEND_CLIENT_ITEM_TO_DASH(data.channelID, username, data.message, 'client');
      PUSH_SAVE_CLIENT_ITEM(data.channelID, data.message, username, 'client');


      var found = clientData.find(x => x.channelID === data.channelID);
      if( found && found.botOff == true ) {  console.log('=> BOT is DEAKTIVIERT') } else {

        SEND_MESSAGE_TO_CLIENT(data.channelID, botReply, genConfig.botName, 'bot');

        SEND_BOT_ITEM_TO_DASH(data.channelID, genConfig.botName, botReply, 'bot');
        PUSH_SAVE_CHATHISTORY(data.channelID, botReply, genConfig.botName, 'bot');

        resolve('-------- Message ABGESCHLOSSEN --------');

      }
    }).catch( function(error) {} )

  });
}









function loading_done() {
  console.log('=> Brain geladen');
  bot.sortReplies();
}

function loading_error() {
  console.log('=> Brain Error');
}

/*BIS HIER => CHECKED*/



/****************************                 ****************************/
/****************************                 ****************************/
/****************************   KONFIGURATOR  ****************************/
/****************************                 ****************************/
/****************************                 ****************************/
/****************************                 ****************************/

let genConfig = {};


/****************************   SOCKETS  ****************************/

function send_genConfig_to_dash(socket){
  socket.emit( 'receive_genConfig', genConfig, function(){} );
  console.log('=>Gen-Config an Dash geschhickt',genConfig);
};


function receive_genConfig_from_dash(socket){
  socket.on('send_genConfig', function(data){
    genConfig = data;
    console.log('=>Gen-Config von Dash erhalten', genConfig);
    fs.writeFile('library/genConfig.json', JSON.stringify(genConfig), function() {
      console.log('=> genConfig erstellt');
    });
  });

}

function send_botConfig_to_dash(socket){

  socket.emit('receive_bot_config', botConfig, function(){});
  console.log('=>Bot.Config an Dash geschickt');


  socket.on('receive_push_object', function(sendObject){

    botConfig = sendObject;


    //TESTEN
    //botConfig.welcome.trigger = 'ANDI';


    var convs = '! version = 2.0\n';

    for (var group in botConfig) {
      if (botConfig.hasOwnProperty(group)) {

        for( var p = 0; p < botConfig[group].length; p++) {

            let triggerList = botConfig[group][p].trigger.join(' [*] ');
            var trigger = '+ ' + triggerList + '\n';
            convs = convs.concat(trigger);

          for( var z = 0; z < botConfig[group][p].replies.length; z++) {
            var reply = '- ' +  botConfig[group][p].replies[z] + '\n';
            convs = convs.concat(reply);
          }
            convs = convs.concat('\n');
        }

        //NR2
        for( var p = 0; p < botConfig[group].length; p++) {

            let triggerList = botConfig[group][p].trigger.join(' [*] ');
            var trigger = '+ * ' + triggerList + '\n';
            convs = convs.concat(trigger);

          for( var z = 0; z < botConfig[group][p].replies.length; z++) {
            var reply = '- {@ <star>} ' +  botConfig[group][p].replies[z] + '\n';
            convs = convs.concat(reply);
          }
            convs = convs.concat('\n');
        }


        //NR3
        for( var p = 0; p < botConfig[group].length; p++) {

            let triggerList = botConfig[group][p].trigger.join(' [*] ');
            var trigger = '+ ' + triggerList + ' *' + '\n';
            convs = convs.concat(trigger);

          for( var z = 0; z < botConfig[group][p].replies.length; z++) {
            var reply = '- ' +  botConfig[group][p].replies[z] + ' {@ <star>}' + '\n';
            convs = convs.concat(reply);
          }
            convs = convs.concat('\n');
        }


        //NR4
        for( var p = 0; p < botConfig[group].length; p++) {

            let triggerList = botConfig[group][p].trigger.join(' [*] ');
            var trigger = '+ * ' + triggerList + ' *' + '\n';
            convs = convs.concat(trigger);

          for( var z = 0; z < botConfig[group][p].replies.length; z++) {
            var reply = '- {@ <star1>} ' +  botConfig[group][p].replies[z] + ' {@ <star2>}' + '\n';
            convs = convs.concat(reply);
          }
            convs = convs.concat('\n');
        }





      }
    }

    console.log('=> Bot Config PUSHOBJEKTvon Dash erhalten + Gepushed');

    fs.writeFile('library/botconfig.json', JSON.stringify(botConfig), function() {
      console.log('=> botConfig erstellt');
    });


    fs.writeFile( 'brain/brain-custom.rive', convs, function() {
      console.log('=>Custom-brain.json erstellt');
      loadBotFile();
    });


  });

}


/****************************                 ****************************/
/****************************                 ****************************/
/****************************   STATISTIKEN  ****************************/
/****************************                 ****************************/
/****************************                 ****************************/
/****************************                 ****************************/


let statistics = {};
statistics.connectedUser = 0;


function send_statistics_to_dash(socket){
  socket.emit( 'receive_statistics', statistics, function(){} );
  console.log('=>Statistics an Dash geschhickt',statistics);
};

/*
function receive_genConfig_from_dash(socket){
  socket.on('send_genConfig', function(data){
    genConfig = data;
    console.log('=>Gen-Config von Dash erhalten', genConfig);
    fs.writeFile('genConfig.json', JSON.stringify(genConfig), function() {
      console.log('=> genConfig erstellt');
    });
  });
}
*/
