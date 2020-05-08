WebExtension.addExtensionRegister(() => {
  const target = document.getElementById('page4');
  if (!target) {
    const button = document.getElementById('myButton4');
    if (button) button.parentNode.removeChild(button);
    return;
  }

  const button = document.getElementById('myButton4');
  if (!button) {
    target.parentNode.insertAdjacentHTML('afterend', "<button id='myButton4' onClick=\"alert('Bye, World!');return false;\">Say Bye on page 4</button>");
  }
});
