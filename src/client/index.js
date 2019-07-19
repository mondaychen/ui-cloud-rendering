// import React from 'react';
// import { hydrate } from 'react-dom';
// import { Provider } from 'react-redux';
// import { createStore } from 'redux';
// import reducer from './app/reducers';
// import App from './app/components/App';

// const store = createStore(reducer);

// hydrate(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.querySelector('#app')
// );

import DOM from './dom';

export class View {
  constructor() {
    this.initWebSocket();
    this.initDom();
  }

  initWebSocket() {
    const ws = new WebSocket(`ws://${location.host}`);
    ws.onerror = function() {
      console.log('WebSocket error');
    };
    ws.onopen = function() {
      console.log('WebSocket connection established');
    };
    ws.onclose = function() {
      console.log('WebSocket connection closed');
    };
    ws.onmessage = message => {
      console.log(message);
      if (message.data) {
        this.patch(message.data);
      }
    };
    this.socket = ws;
  }

  initDom() {
    this.container = document.getElementById('app');
    // this.on('click', (evt) => {
    //   this.sendAction('click', evt.path)
    // })
    this.on(
      'change',
      e => {
        if (!e.target.classList.contains('toggle')) {
          return;
        }
        let input = e.target;
        let key = input.type === 'checkbox' ? 'checked' : 'value';
        if (this.prevInput === input && this.prevValue === input[key]) {
          return;
        }

        this.prevInput = input;
        this.prevValue = input[key];
        this.setActiveElement(input);
        this.sendAction('change', e.path, { target: { [key]: input[key] } });
      },
      false
    );

    this.on('keydown', e => {
      if (e.target.classList.contains('new-todo') && e.which === 13) {
        this.sendAction('keydown', e.path, {
          target: { value: e.target.value },
          which: e.which
        });
      }
    });
  }

  sendAction(eventName, path, eventData = {}) {
    this.socket.send(
      JSON.stringify({
        event: eventName,
        path: serializeDomPath(this.container, path),
        eventData
      })
    );
  }

  setActiveElement(target) {
    if (!target) {
      return;
    }
    if (this.activeElement === target) {
      return;
    }
    this.activeElement = target;
    let cancel = () => {
      if (target === this.activeElement) {
        this.activeElement = null;
      }
      target.removeEventListener('mouseup', this);
      target.removeEventListener('touchend', this);
    };
    target.addEventListener('mouseup', cancel);
    target.addEventListener('touchend', cancel);
  }

  getActiveElement() {
    if (document.activeElement === document.body) {
      return this.activeElement || document.activeElement;
    } else {
      return document.activeElement;
    }
  }

  patch(html) {
    let focused = this.getActiveElement();
    let selectionStart = null;
    let selectionEnd = null;

    if (DOM.isTextualInput(focused)) {
      selectionStart = focused.selectionStart;
      selectionEnd = focused.selectionEnd;
    }

    this.container.innerHTML = html;

    this.silenceEvents(() => {
      DOM.restoreFocus(focused, selectionStart, selectionEnd);
    });
  }

  silenceEvents(callback) {
    this.silenced = true;
    callback();
    this.silenced = false;
  }

  on(event, callback) {
    window.addEventListener(event, e => {
      if (!this.silenced) {
        callback(e);
      }
    });
  }
}

function serializeDomPath(root, domPath) {
  let i = domPath.length - 1;
  while (i >= 0) {
    if (domPath[i] === root) {
      break;
    }
    i--;
  }
  if (i < 0) {
    throw new Error('Cannot find root in domPath');
  }
  const output = [];
  while (i > 0) {
    const current = domPath[i];
    const next = domPath[i - 1];
    output.push(Array.from(current.children).indexOf(next));
    i--;
  }
  return output;
}

const view = new View();
