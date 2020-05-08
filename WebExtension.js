/*
 * WebExtension - customizes the browsing web pages.
 *
 * Version 0.0.1
 * Masayuki Otoshi
 * Released under the Apache License 2.0.
 */
(function() {
var WebExtension = window.WebExtension = {

  proxy: '/WebExtensionHttpProxy',
  //proxy: '/pc/WebExtensionHttpProxy',

  extensionRegisters: [],
  responseHandlers: {},
  _timerId: null,

  openFrame: function(src, extensionPoint, options) {
    if (!src) throw new Error('ERROR: openFrame: src parameter is mandatory.');
    options = options || {};
    if (!extensionPoint) {
      extensionPoint = document.getElementsByTagName('body')[0];
      options.position = options.position || 'beforeend';
      options.frameSize = options.frameSize || 'browser';
    }

    const position = options.position || 'afterend';
    const frameSize = (options.frameSize || 'full').toLowerCase(); // '', 'full', 'browser'

    const proxy = options.proxy || WebExtension.proxy;
    const useProxy = options.useProxy === true;
    src += (src.indexOf('?') >= 0 ? '&' : '?') + ('webextensiontime=' + Date.now());
    if (useProxy) {
      src = proxy+'?'+src;
    }

    const frameId = options.frameId || 'webExtensionFrame';
    let webExtensionFrame = WebExtension.getFrameElement(frameId);
    if (webExtensionFrame) webExtensionFrame.parentNode.removeChild(webExtensionFrame);

    let width = options.width||'';
    let height = options.height||'';
    let style = '';
    if (frameSize === 'full') {
      if (options.width === undefined) width = '100%';
      if (options.height === undefined) height = '100%';
    } else if (frameSize === 'browser') {
      width = WebExtension._getBrowserWidth()+'px';
      height = WebExtension._getBrowserHeight()+'px';
      style = ' position:absolute; top:0px; left:0px; background-color:'+(extensionPoint.style.backgroundColor||'white')+'; z-index:2147483647;';
    }
    if (options.style) style += ' ' + options.style;
    extensionPoint.insertAdjacentHTML(position, '<iframe id="'+frameId+'" style="display:block; border:0px;'+style+'" width="'+width+'" height="'+height+'" src="'+src+'"></iframe>');

    webExtensionFrame = WebExtension.getFrameElement(frameId);
    webExtensionFrame.addEventListener("load", function(event) {
      window.parent.WebExtension.setExtensionRegistersTimer();
      if (typeof(options.onload) === 'function') options.onload();
    });

    if (frameSize === 'browser') {
      window.parent.addEventListener("resize", function() {
        const webExtensionFrame = WebExtension.getFrameElement(frameId);
        if (!webExtensionFrame) {
          window.parent.removeEventListener("resize", arguments.callee);
          return;
        }
        webExtensionFrame.style.width = WebExtension._getBrowserWidth()+'px';
        webExtensionFrame.style.height = WebExtension._getBrowserHeight()+'px';
      });
    }
  },

  closeFrame: function(frameId) {
    let webExtensionFrame = WebExtension.getFrameElement(frameId);
    if (!webExtensionFrame && frameId !== 'webExtensionFrame') {
      webExtensionFrame = WebExtension.getFrameElement('webExtensionFrame');
    }
    if (webExtensionFrame) webExtensionFrame.parentNode.removeChild(webExtensionFrame);
    WebExtension.setExtensionRegistersTimer();
  },

  getFrameElement: function(frameId) {
    return document.getElementById(frameId || 'webExtensionFrame');
  },

  isFrameOpen: function(frameId) {
    return WebExtension.getFrameElement(frameId) != null;
  },

  sendHttpRequest: function(method, url, options) {
    return new Promise(function(resolve, reject) {
      method = (method || 'GET').toUpperCase();
      options = options || {};
      let body = options.body;
      const proxy = options.proxy || WebExtension.proxy;
      const useProxy = options.useProxy !== false;
      if (useProxy) {
        url = proxy+'?'+url;
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.responseType = options.responseType || 'text';
      if (method === 'POST') {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        try {
          if (typeof(body) === 'object') {
            body = JSON.stringify(body);
          }
        } catch (e) {}
      } else if (method === 'GET') {
        body = null;
      }

      xhr.onload = function() {
        let response = xhr.response;
        if (typeof response === 'string') {
          try {
            response = JSON.parse(response);
          } catch (e) {}
        }
        if (xhr.status === 200) {
          if (typeof(resolve) === 'function') return resolve(response);
        }
        if (typeof(reject) === 'function') return reject(response);
        return response;
      };

      // Handle network error
      xhr.onerror = function() {
        if (typeof(reject) === 'function') return reject("Network error");
      };

      if (options.requestHandler === 'function') options.requestHandler(xhr);
      xhr.send(body);
    });
  },

  sendMessage: function(messageId, message, options) {
    options = options || {};
    if (message && typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    const optionsText = JSON.stringify(options || {});

    const frameId = options.frameId || 'webExtensionFrame';
    let webExtensionFrame = WebExtension.getFrameElement(frameId);
    if (!webExtensionFrame && frameId !== 'webExtensionFrame') {
      webExtensionFrame = WebExtension.getFrameElement('webExtensionFrame');
    }
    if (webExtensionFrame) {
      webExtensionFrame.contentWindow.postMessage(messageId+'|#!WebExtension!#|'+optionsText+'|#!WebExtension!#|'+message, "*");
    } else {
      console.error('ERROR: No WebExtension Frame found. Failed to send a message. frameId('+frameId+') messageId('+messageId+')');
    }
  },

  sendResponse: function(responseId, response, options) {
    if (response && typeof response !== 'string') {
      response = JSON.stringify(response);
    }
    const optionsText = JSON.stringify(options || {});
    window.postMessage(responseId+'|#!WebExtension!#|'+optionsText+'|#!WebExtension!#|'+response, "*");
  },

  addExtensionRegister: function(func) {
    if (!func || typeof(func) !== 'function') throw new Error('ERROR: addExtensionRegister: A function is required to register extension register function.');
    WebExtension.extensionRegisters.push(func);
  },

  addResponseHandler: function(responseId, func) {
    if (!responseId || !func || typeof(func) !== 'function') throw new Error('ERROR: addResponseHandler: responseId('+responseId+') and func parameters are mandatory.');
    WebExtension.responseHandlers[responseId] = func;
  },

  _registerExtensionRegisters: function() {
    if (WebExtension.extensionRegisters.length == 0) return;

    WebExtension.extensionRegisters.forEach(register => {
      if (typeof(register) === 'function') {
        try {
          register();
        } catch (err) {
          console.error(err);
        }
      }
    });

    WebExtension._timerId = setTimeout(WebExtension._registerExtensionRegisters, 1000);
  },
  
  setExtensionRegistersTimer: function() {
    WebExtension.clearExtensionRegistersTimer();
    WebExtension._registerExtensionRegisters();
  },

  clearExtensionRegistersTimer: function() {
    if (WebExtension._timerId) {
      clearTimeout(WebExtension._timerId);
      WebExtension._timerId = null;
    }
  },

  _getBrowserWidth: function() {
    if (window.innerWidth) {
      return window.innerWidth;
    } else if (document.documentElement && document.documentElement.clientWidth != 0) {
      return document.documentElement.clientWidth;
    } else if (document.body) {
      return document.body.clientWidth;
    }
    return 0;
  },

  _getBrowserHeight: function() {
    if (window.innerHeight) {
      return window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight != 0) {
      return document.documentElement.clientHeight;
    } else if (document.body) {
      return document.body.clientHeight;
    }
    return 0;
  }
};

})();

window.addEventListener("message", function(event) {
  const data = event.data;
  if (!data || typeof(data) !== 'string') return;
  const tokens = data.split('|#!WebExtension!#|');
  if (tokens.length < 3) return;
  const responseId = tokens[0];
  let options = tokens[1];
  let response = tokens[2];
  console.log('responseId=('+responseId+') options=('+options+') response=('+response+')');

  try {
    options = JSON.parse(options);
  } catch (e) {
    options = {};
  }

  try {
    response = JSON.parse(response);
  } catch (e) {}

  if (typeof(response) === 'string') {
    if (response === 'undefined') {
      response = undefined;
    } else if (response === 'null') {
      response = null;
    }
  }

  try {
    const func = WebExtension.responseHandlers[responseId];
    if (typeof(func) === 'function') func(response);
  } finally {
    if (options.closeFrame !== false && options.closeFrame !== 'false') {
      WebExtension.closeFrame(options.frameId || responseId);
    }
  }
});

window.addEventListener("load", function() {
  WebExtension._registerExtensionRegisters();
});

window.addEventListener("unload", function() {
  WebExtension.clearExtensionRegistersTimer();
});
