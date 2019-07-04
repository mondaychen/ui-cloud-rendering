import express from 'express';
import path from 'path';
import template from './src/template';
import ssr from './src/server-render';

const app = express();

// Serving static files
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));

// hide powered by express
app.disable('x-powered-by');
// start the server
app.listen(process.env.PORT || 3090);

// server rendered home page
app.get('/', (req, res) => {
  const { content } = ssr();
  const response = template('Server Rendered Page', content);
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

// Pure client side rendered page
app.get('/client', (req, res) => {
  let response = template('Client Side Rendered page');
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

// tiny trick to stop server during local development

app.get('/exit', (req, res) => {
  if (process.env.PORT) {
    res.send('Sorry, the server denies your request');
  } else {
    res.send('shutting down');
    process.exit(0);
  }
});
