WebExtension.addExtensionRegister(() => {
  const target = document.getElementById('page2');
  if (!target) return;
  const button = document.getElementById('myButton2');
  if (!button) {
    target.insertAdjacentHTML('afterend', "<button id='myButton2' onClick=\"alert('Hello, World!');return false;\">Say Hello on page 2</button>");
  }
});
