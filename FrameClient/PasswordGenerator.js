WebExtension.addExtensionRegister(() => {
  const target = document.querySelector('input[id=password]');
  if (!target) return;
  const button = document.querySelector('button[id=myButton]');
  if (!button) {
    target.insertAdjacentHTML('afterend', "<button id='myButton' onClick='openFrame();return false;'>Show suggestions</button>");
  }
});

function openFrame() {
  // Define a URL of an external HTML with a parameter
  const password = document.querySelector('input[id=password]').value;
  const url = 'generator.html?'+encodeURIComponent(password);

  // Open a frame and load the HTML under the button.
  const button = document.querySelector('button[id=myButton]');
  WebExtension.openFrame(url, button);
}

// Add a ResponseHandler function to handle the response from the external HTML.
WebExtension.addResponseHandler('passwordGenerator', response => {
  console.log('res handler response=('+response+')');
  document.querySelector('input[id=password]').value = response;
});
