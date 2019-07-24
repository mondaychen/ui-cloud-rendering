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

import morphdom from 'morphdom';
import DOM from './dom';

function traverseDom(root, callback) {
  callback(root);
  for (let i = 0; i < root.children.length; i++) {
    traverseDom(root.children[i], callback);
  }
}

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
        const data = JSON.parse(message.data);
        if (data.type === 'patch') {
          this.patch(data.html);
        }
      }
    };
    this.socket = ws;
  }

  initDom() {
    this.container = document.getElementById('app');

    this.usedEventHandlers = {};
    traverseDom(this.container, node => {
      this.autoBindEvents(node);
    });
  }

  autoBindEvents(node) {
    const DEFAULT_EVENT_READER = {
      change: (e) => {
        let input = e.target;
        let key = input.type === 'checkbox' ? 'checked' : 'value';
        if (this.prevInput === input && this.prevValue === input[key]) {
          return;
        }

        this.prevInput = input;
        this.prevValue = input[key];
        this.setActiveElement(input);
        return { target: { [key]: input[key] } };
      },
      keydown: (e) => {
        return {
          target: { value: e.target.value },
          which: e.which
        };
      },
      click: e => {
        return {
          target: { value: e.target.value, href: e.target.href }
        };
      },
      dblclick: e => {
        return {
          target: { value: e.target.value, href: e.target.href }
        };
      },
      blur: e => {
        return {
          target: { value: e.target.value }
        };
      }
    };

    const boundEventList = node.getAttribute('data-events-binding');
    if (!boundEventList) {
      return;
    }
    boundEventList.split(',').forEach(eventName => {
      let handler = this.usedEventHandlers[eventName];
      if (!handler) {
        handler = (e) => {
          if (DEFAULT_EVENT_READER[eventName]) {
            this.sendAction(eventName, e.path, DEFAULT_EVENT_READER[eventName](e));
          } else {
            this.sendAction(eventName, e.path, {});
          }
        };
        this.usedEventHandlers[eventName] = handler;
      }
      node.addEventListener(eventName, handler);
    });
  }

  autoUnbindEvents(node) {
    const boundEventList = node.getAttribute('data-events-binding');
    if (!boundEventList) {
      return;
    }
    boundEventList.split(',').forEach(eventName => {
      node.removeEventListener(eventName, this.usedEventHandlers[eventName]);
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

    morphdom(this.container, `<div id="app">${html}</div>`, {
      onBeforeNodeAdded: (el) => {
        traverseDom(el, node => {
          this.autoBindEvents(node);
        });
      },
      onBeforeElUpdated: (fromEl, toEl) => {
        if (toEl.tagName === 'INPUT' && toEl.type === 'checkbox') {
          if (toEl.getAttribute('data-checked') === 'true') {
            toEl.checked = true;
          } else if (toEl.getAttribute('data-checked') === 'false') {
            toEl.checked = false;
          }
        }
        // only unbind when necessary?
        this.autoUnbindEvents(fromEl);
      },
      onElUpdated: (el) => {
        this.autoBindEvents(el);
      }
    });

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
