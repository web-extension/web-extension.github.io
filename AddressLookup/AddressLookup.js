WebExtension.addExtensionRegister(() => {
  const target = document.querySelector('input[id=zipcode]');
  if (!target) return;

  const button = document.querySelector('button[id=myButton]');
  if (!button) {
    target.insertAdjacentHTML('afterend', "<button id='myButton' onClick='lookup();return false;'>Lookup</button>");
  }
});

function lookup() {
  const zipcode = document.querySelector('input[id=zipcode]').value;
  const url = 'https://api.zipaddress.net/?lang=rome&zipcode='+zipcode;

  // Make a HTTP request to call an AddressLookup REST API
  WebExtension.sendHttpRequest('get', url, {useProxy: false})
    .then(response => {
      // Handle response from the API
      const address = response.data;
      document.querySelector('input[id=pref]').value = address.pref;
      document.querySelector('input[id=address]').value = address.address;
    });
}
