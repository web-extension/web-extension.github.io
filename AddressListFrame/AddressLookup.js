WebExtension.addExtensionRegister(() => {
  const target = document.querySelector('input[id=zipcode]');
  if (!target) return;
  const button = document.querySelector('button[id=myButton]');
  if (!button) {
    target.insertAdjacentHTML('afterend', "<button id='myButton' onClick='lookup();return false;'>Lookup</button>");
  }
});

async function lookup() {
  const zipcode = document.querySelector('input[id=zipcode]').value;
  const restUrl = 'https://api.zipaddress.net/?lang=rome&zipcode='+zipcode;
  const response = await WebExtension.sendHttpRequest('get', restUrl, {useProxy: false});

  const list = [{pref:response.data.pref, address:response.data.address}]; // data returned from REST API

  // Add dummy addresses to show the results in address list.
  if (zipcode === '100-0006') {
    list.push({pref:'CHIBA', address:'Test City'});
    list.push({pref:'KANAGAWA', address:'Yokohama City'});
  }

  if (list.length < 2) {
    WebExtension.sendResponse('addressLookup', list[0]);
    return;
  }

  // Open a frame and show the addresses in the IFrame.
  const url = 'AddressList.html';
  const button = document.getElementById('myButton');
  WebExtension.openFrame(url, button, {height:'', onload:function(){
    WebExtension.sendMessage('addressList', list);
  }});
}

WebExtension.addResponseHandler('addressLookup', response => {
  console.log('res handler response=('+response+')');
  if (response) {
    document.getElementById('pref').value = response.pref;
    document.getElementById('address').value = response.address;
  }
});
