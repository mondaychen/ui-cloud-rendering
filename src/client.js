import React from 'react'
import {hydrate} from 'react-dom'
import {Provider} from 'react-redux'
import { createStore } from 'redux'
import reducer from './app/reducers'
import App from './app/components/App'

const store = createStore(reducer)

/**
 * hydrate the page to make sure both server and client
 * side pages are identical. This includes markup checking,
 * react comments to identify elements and more.
 */

hydrate(
  <Provider store={store} >
     <App />
  </Provider>,
  document.querySelector('#app')
)
