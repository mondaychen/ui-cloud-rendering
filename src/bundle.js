import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import reducer from './app/reducers'
import App from './app/components/App'

// Create a fresh store
const store = createStore(reducer)

render(
  <Provider store={store} >
     <App />
  </Provider>,
  document.querySelector('#app')
)
