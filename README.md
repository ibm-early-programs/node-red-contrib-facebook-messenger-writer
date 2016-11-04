# Node-RED Contrib Facebook Messenger Writer

Writer Node for Facebook Messenger
[Node-RED](http://nodered.org) Bluemix compatible node that writes to Facebook Messenger.


## Install

Run the following command in the root directory of your Node-RED install:

````
    npm install node-red-contrib-facebook-messenger-writer
````

## Usage

This node only writes to your Facebook page. To do that it needs a recipient id (which is normally the sender id from a message received) and an Access Token (something that you set up when you
follow the facebook messenger developers quick start guide.  [Facebook Messenger Developers Quick Start Guide](https://developers.facebook.com/docs/messenger-platform/guides/quick-start))

The message to send should be set in msg.payload

The node needs an ID to send the return message. As the recipient for the
response is normally the sender of the original message, msg.facebookevent
can be set to the incoming message. The node will use the sender ID as the
recipient ID for the return.

eg.
````
msg.facebookevent = {
    "sender": { "id": "111111111111" },
    "recipient": { "id": "222222222222" },
    "timestamp": 1478167276278,
    "message": {
        "mid": "mid.1478167276278:684dd80866",
        "seq": 6,
        "text": "Hello Mr Bot"
      }
};
````

Although only the following is needed by the node.
````
msg.facebookevent = {
    "sender": { "id": "111111111111" }
};
````

The Node needs needs the Access Token, that facebook
sets up for you to use. This is set in the Node's
configuration.


## Registering your GET with Facebook

There is no receiver node, as this can be readily accomplished using the standard HTTP Node-RED
nodes. When following the Quick Start Guide, you can set a GET HTTP in node for the registration. The entry point you use is upto you. eg.

````
  \mybot\xyz
````

This GET should check that the correct Access Token (which you specify
when following the quick star guide) and echo back the challenge as sent
by facebook.

eg:

````
  var mode = '';
  var vtoken = '';
  var challenge = '';
  if (msg.payload['hub.mode']) {
      mode = msg.payload['hub.mode'];
  }
  if (msg.payload['hub.verify_token']) {
      vtoken = msg.payload['hub.verify_token'];
  }
  if (msg.payload['hub.challenge']) {
    challenge = msg.payload['hub.challenge'];
  }
  if ('subscribe' == mode &&
    'ThisStringShouldBeUniqueToYouRepresentsYourVerifyToken' == vtoken) {
      msg.payload = challenge;
    }

````

## Receiving Messages (POST) from Facebook
Once registered you can create a POST HTTP in for incoming messages.
The entry point should match your registration entry point eg.

````
  \mybot\xyz
````

It's upto you how you handle the incoming message, but this is a sample
handling function that you can build your logic on.

````
if (msg.payload.object && 'page' == msg.payload.object) {
    msg.processAS = 'NOTHING';
    if (msg.payload.entry){
        var entry = msg.payload.entry;

        for (var i = 0; i < entry.length; i++) {
            //console.log(myArray[j].x);
            var pageID = entry[i].id;
            var timeOfEvent = entry[i].time;
            var messaging = entry[i].messaging
            for (var j =0; j < messaging.length; j++) {
                if (messaging[j].optin) {
                    msg.processAS = 'AUTHENTICATION';     
                } else if (messaging[j].message) {
                    msg.processAS = 'MESSAGE';
                } else if (messaging[j].delivery) {
                    msg.processAS = 'DELIVERY';
                } else if (messaging[j].postback) {
                    msg.processAS = 'POSTBACK';
                }
                msg.messagingEvent = messaging[j];
                node.send([msg,null]);               
            }
        }
    }
}
return [null,msg];

````

## Contributing

For simple typos and fixes please just raise an issue pointing out our mistakes. If you need to raise a pull request please read our [contribution guidelines](https://github.com/node-red-contrib-utils/node-red-contrib-facebook-messenger-writer/blob/master/CONTRIBUTING.md) before doing so.

## Copyright and license

Copyright 2016 IBM Corp. under the Apache 2.0 license.
