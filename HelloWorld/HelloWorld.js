// An ExtensionRegister function is called every second.
// The number of element queries must be kept to a minimum.

WebExtension.addExtensionRegister(() => {
  // Check to see if an HTML element (an extension point) exists on this page.
  const target = document.querySelector('p[id=message]');
  if (!target) return;

  // Insert a custom button if it is NOT inserted yet.
  const button = document.querySelector('button[id=myButton]');
  if (!button) {
    target.insertAdjacentHTML('beforebegin', `<button id='myButton' onClick="alert('Hello, World!');return false;">Say Hello</button>`);
  }
});
