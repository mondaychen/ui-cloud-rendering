import express from 'express';
import http from 'http';
import path from 'path';
import uuid from 'uuid';
import session from 'express-session';
import WebSocket from 'ws';
import template from './src/template';
import ssr, { getEmitter } from './src/server-render';

const app = express();
const server = http.createServer(app);

// We need the same instance of the session parser in express and
// WebSocket server.
const sessionParser = session({
  name: 'cloud-render-id',
  maxAge: 60000,
  saveUninitialized: false,
  secret: 'Mengd1$eCuRiTy',
  resave: false
});
app.use(sessionParser);

// Serving static files
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));

// hide powered by express
app.disable('x-powered-by');

// server rendered home page
app.get('/', (req, res) => {
  if (!req.session.renderId) {
    req.session.renderId = uuid();
    console.log('Setting new renderID: ' + req.session.renderId);
  }
  const content = ssr(req.session.renderId);
  const response = template(
    'Server Rendered Page',
    content,
    req.session.renderId
  );
  res.setHeader('Cache-Control', 'assets, max-age=604800');
  res.send(response);
});

const wss = new WebSocket.Server({
  verifyClient: function(info, done) {
    console.log('Parsing session from request...');
    sessionParser(info.req, {}, () => {
      console.log('WS connection from renderId: ' + info.req.session.renderId);
      // reject here if renderId is unknown, by returning falsy value to done().
      done(info.req.session.renderId);
    });
  },
  server
});

wss.on('connection', function(ws, request) {
  const id = request.session.renderId;
  const emitter = getEmitter(id);
  emitter.on('output', output => {
    console.log(output);
    ws.send(output);
  });
  ws.on('message', function(message) {
    console.log(`WS message ${message} from ${id}`);
    const data = JSON.parse(message);
    emitter.emit('input', data.path, data.event, data.eventData);
  });
  ws.on('close', function() {
    console.log(`WS connection ${id} close`);
  });
});

// start the server
const port = process.env.PORT || 3090;
server.listen(port, function() {
  console.log(`Listening on http://localhost:${port}`);
});
