import React from 'react'
// import { render } from 'react-dom';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from './app/reducers'
import App from './app/components/App'

function buildJSDOMWindow() {
  const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
  const { window } = jsdom;

  function copyProps(src, target) {
    Object.defineProperties(target, {
      ...Object.getOwnPropertyDescriptors(src),
      ...Object.getOwnPropertyDescriptors(target),
    });
  }

  global.window = window;
  global.document = window.document;
  global.navigator = {
    userAgent: 'node.js',
  };
  global.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 0);
  };
  global.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
  copyProps(window, global);
  return window;
}


module.exports = function serverRender() {
  // Configure the store with the initial state provided
  const store = createStore(reducer)
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
    <Provider store={store} >
       <App />
    </Provider>
  );
  // wrapper.find('.delete-btn').first().simulate('click');
  const content = wrapper.html();
  console.log(window.document.activeElement.innerHTML);

  return {content, store};
}
