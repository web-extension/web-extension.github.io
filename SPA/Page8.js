WebExtension.addExtensionRegister(() => {
  const target = document.getElementById('page8');
  if (!target) return;

  const button = document.getElementById('myButton8A');
  if (!button) {
    target.insertAdjacentHTML('afterend', "<button id='myButton8A' onClick=\"alert('Hello, World!');return false;\">Say Hello on page 8</button>");
    target.parentNode.insertAdjacentHTML('afterend', "<button id='myButton8B' onClick=\"alert('Bye, World!');return false;\">Say Bye on page 8</button>");
    registerObserver(target);
  }
});

function registerObserver(target) {
  const observer = new MutationObserver(() => {
    const button8A = document.getElementById('myButton8A');
    if (!button8A) {
      // myButton8A has been removed, so myButton8B also needs to be removed.
      const button8B = document.getElementById('myButton8B');
      if (button8B) button8B.parentNode.removeChild(button8B);
      observer.disconnect();
    }
  });

  observer.observe(target.parentNode, {
    childList: true,
    subtree: true
  });
}
