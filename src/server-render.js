import React from 'react';
// import { render, unmountComponentAtNode } from 'react-dom';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './app/reducers';
import App from './app/components/App';

import EventEmitter from 'events';
// TODO: memory leak! make it expire with session
const Emitters = new Map();

export function getEmitter(id) {
  if (Emitters.has(id)) {
    return Emitters.get(id);
  }
  return false;
}

function buildJSDOMWindow() {
  const jsdom = new JSDOM(
    '<!doctype html><html><body><div id="_app"></div></body></html>'
  );
  const { window } = jsdom;

  function copyProps(src, target) {
    Object.defineProperties(target, {
      ...Object.getOwnPropertyDescriptors(src),
      ...Object.getOwnPropertyDescriptors(target)
    });
  }

  global.window = window;
  global.document = window.document;
  global.navigator = {
    userAgent: 'node.js'
  };
  global.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 0);
  };
  global.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
  copyProps(window, global);
  return window;
}

// since React v16 a React component can have multiple direct children
// https://reactjs.org/docs/fragments.html
// TODO: I haven't fully test it yet
// TODO: since we only care about the n-th element, it's unnecessary to expand the whole thing
function expandReactWrapperToDom(wrapper) {
  return wrapper.children().reduce((acc, node) => {
    if (typeof node.type() !== 'string') {
      return [...acc, ...expandReactWrapperToDom(node)];
    } else {
      return [...acc, node];
    }
  }, []);
}

function findDomNode(wrapper, path) {
  return path.reduce((node, idx) => {
    const children = expandReactWrapperToDom(node);
    return children[idx];
  }, wrapper);
}

export default function serverRender(id) {
  // Configure the store with the initial state provided
  const store = createStore(reducer);
  const window = buildJSDOMWindow();
  const appDiv = window.document.getElementById('_app');

  // function renderApp() {
  //   unmountComponentAtNode(appDiv);
  //   render(
  //     <Provider store={store}>
  //       <App />
  //     </Provider>,
  //     appDiv
  //   );
  //   return appDiv.innerHTML;
  // }

  const wrapper = mount(
    <Provider store={store}>
      <App />
    </Provider>,
    {
      attachTo: appDiv
    }
  );
  let content = wrapper.html();

  const emitter = new EventEmitter();
  Emitters.set(id, emitter);
  emitter.on(`input`, function(path, eventType, eventData) {
    const target = findDomNode(wrapper, path);
    // store.dispatch({ type: 'COMPLETE_TODO', id: 0 });
    // wrapper.find('.new-todo').first().simulate("change", { target: { value: "foo" }})
    target.simulate(eventType, eventData);
    // wrapper.unmount();
    // wrapper.mount();
    const newContent = wrapper.html();
    if (newContent !== content) {
      content = newContent;
      emitter.emit(`output`, wrapper.html());
    }
  });

  return content;
}
