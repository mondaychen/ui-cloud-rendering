import React from 'react';
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
  const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
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

export default function serverRender(id) {
  // Configure the store with the initial state provided
  const store = createStore(reducer);
  const window = buildJSDOMWindow();

  // render the App store static markup ins content variable
  // let renderOutput = render(
  //   <Provider store={store} >
  //      <App />
  //   </Provider>,
  //   app
  // );
  // console.log(renderOutput);
  // const content = app.innerHTML;

  const wrapper = mount(
    <Provider store={store}>
      <App />
    </Provider>
  );

  const emitter = new EventEmitter();
  Emitters.set(id, emitter);
  emitter.on(`input`, function(type, path) {
    wrapper
      .find('.toggle')
      .first()
      .simulate('change', { target: { checked: true } });
    emitter.emit(`output`, wrapper.html());
  });

  const content = wrapper.html();

  return content;
}
