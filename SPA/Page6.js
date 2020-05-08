WebExtension.addExtensionRegister(() => {
  const target = document.getElementById('page6');
  if (!target) {
    const button = document.getElementById('myButton6B');
    if (button) button.parentNode.removeChild(button);
    return;
  }

  const button = document.getElementById('myButton6A');
  if (!button) {
    target.insertAdjacentHTML('afterend', "<button id='myButton6A' onClick=\"alert('Hello, World!');return false;\">Say Hello on page 6</button>");
    target.parentNode.insertAdjacentHTML('afterend', "<button id='myButton6B' onClick=\"alert('Bye, World!');return false;\">Say Bye on page 6</button>");
  }
});
