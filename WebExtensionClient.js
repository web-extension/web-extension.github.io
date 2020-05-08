/*
 * WebExtension - Client
 *
 * Version 0.0.1
 * Masayuki Otoshi
 * Released under the Apache License 2.0.
 */
const WebExtensionClient = {

  messageHandlers: {},

  addMessageHandler: function(messageId, func) {
    if (!messageId || !func || typeof(func) !== 'function') throw new Error('ERROR: messageId('+messageId+') and func parameters are mandatory.');
    WebExtensionClient.messageHandlers[messageId] = func;
  },

  sendResponse: function(responseId, response, options) {
    if (response && typeof response !== 'string') {
      response = JSON.stringify(response);
    }
    const optionsText = JSON.stringify(options || {});
    window.parent.postMessage(responseId+'|#!WebExtension!#|'+optionsText+'|#!WebExtension!#|'+response, "*");
  }
};

window.addEventListener("message", function(event) {
  const data = event.data;
  if (!data || typeof(data) !== 'string') return;
  const tokens = data.split('|#!WebExtension!#|');
  if (tokens.length < 3) return;
  const messageId = tokens[0];
  let options = tokens[1];
  let message = tokens[2];
  console.log('messageId=('+messageId+') options=('+options+') message=('+message+')');

  try {
    options = JSON.parse(options);
  } catch (e) {
    options = {};
  }

  try {
    message = JSON.parse(message);
  } catch (e) {}

  const func = WebExtensionClient.messageHandlers[messageId];
  if (typeof(func) === 'function') func(message);
});
