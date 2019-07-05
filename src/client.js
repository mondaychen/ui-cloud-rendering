import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './app/reducers';
import App from './app/components/App';

const store = createStore(reducer);

/**
 * hydrate the page to make sure both server and client
 * side pages are identical. This includes markup checking,
 * react comments to identify elements and more.
 */

hydrate(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#app')
);

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

setTimeout(() => {
  ws.send('Hello!');
}, 1000);
