/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
  const request = require('request');

  function checkmsg(msg) {
    if (!msg.payload) {
      return 'Missing property: msg.payload';
    }
    if ('string' !== typeof(msg.payload) && !msg.payload.text) {
      return 'msg.payload must be a string or contain a "text" key';
    }
    if (!msg.facebookevent) {
      return  'Missing property: msg.facebookevent';
    }
    return '';
  }

  function checkevent(event) {
    if (!event.sender || !event.sender.id) {
      return 'Missing property: msg.facebookevent.sender.id';
    }
    //if (!event.recipient || !event.recipient.id) {
    //  return 'Missing property: msg.facebookevent.recipient.id';
    //}
    return '';
  }

  function sendReplyMessage(node, token, to, msg_obj) {
    var our_msg;

    if ('string' == typeof(msg_obj)) {
      // If the message is just a string, format it appropriately
      our_msg = {text: msg_obj};
    } else {
      // Otherwise, pass it on unmaligned
      our_msg = msg_obj;
    }
    
    var messageData = {
        recipient: {id: to},
        message: our_msg
      };
  

    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: token},
      method: 'POST',
      json: messageData

    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
      } else {
        node.status({fill:'red', shape:'dot', text:'Error Sending Message'});
      }
    });
  }

  function Node (config) {
    var node = this;
    RED.nodes.createNode(this, config);

    this.on('input', function (msg) {
      var message = '';
      var event = {};
      var token = this.credentials.token;
      //var token = 'aaaa';
      if (!token) {
        message = 'Access Token must be specified in Node Configuration';
      }
      if (!message) {
        message = checkmsg(msg);
      }
      if (!message) {
        event = msg.facebookevent;
        message = checkevent(event);
      }
      if (message) {
        node.status({fill:'red', shape:'dot', text:message});
        node.error(message, msg);
        return;
      }
      var senderID = event.sender.id;

      node.status({fill:'blue', shape:'dot', text:'about to do something'});
      sendReplyMessage(this, token, senderID, msg.payload);
      node.status({fill:'blue', shape:'dot', text:'did it'});

      node.status({});
      node.send(msg);
    });
  }

  RED.nodes.registerType('facebook-messenger-writer', Node, {
    credentials: {
      token: {type:'text'}
    }
  });
};
