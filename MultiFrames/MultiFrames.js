WebExtension.addExtensionRegister(() => {
  const target = document.getElementById('number');
  if (!target) return;

  const subButton = document.getElementById('subButton');
  if (!subButton) {
    target.insertAdjacentHTML('afterend', "<button id='subButton' onClick='sub();return false;'>Sub</button>");
  }
  const addButton = document.getElementById('addButton');
  if (!addButton) {
    target.insertAdjacentHTML('afterend', "<button id='addButton' onClick='add();return false;'>Add</button>");
  }
});

function add() {
  const number = document.getElementById('number').value;
  const target = document.getElementById('subButton');
  WebExtension.openFrame('add.html?'+number, target, {frameId:'add', width:'200px', height:'100px'});
}

// When the responseId is different value from the frameId,
// you need to specify the frameId in options ({frameId:'add'}).
// Or you need to call WebExtension.closeFrame(frameId) function to close the frame.
WebExtension.addResponseHandler('add', response => {
  console.log('res handler response=('+response+')');
  document.getElementById('number').value = Number(document.getElementById('number').value || 0) + Number(response || '0');
  //WebExtension.closeFrame('add');
});

function sub() {
  const number = document.getElementById('number').value;
  const target = document.getElementById('subButton');
  WebExtension.openFrame('sub.html?'+number, target, {frameId:'sub', width:'200px',height:'100px'});
}

// When the responseId is different value from the frameId,
// you need to specify the frameId in options ({frameId:'sub'}).
// Or you need to call WebExtension.closeFrame(frameId) function to close the frame.
WebExtension.addResponseHandler('sub', response => {
  console.log('res handler response=('+response+')');
  document.getElementById('number').value = Number(document.getElementById('number').value || 0) - Number(response || '0');
  //WebExtension.closeFrame('sub');
});
