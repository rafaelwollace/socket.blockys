const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const socketIO = require('socket.io');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let filePath = path.join(
    __dirname,
    'public',
    parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname
  );

  const ext = path.extname(filePath);
  let contentType = 'text/html';

  switch (ext) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server error: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const io = socketIO(server);

let blocklyHistory = ''; // Armazena o histórico de blocos

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Enviar o histórico de blocos para o novo usuário conectado
  socket.emit('blockly-load', blocklyHistory);

  socket.on('blockly-update', (data) => {
    blocklyHistory = data.workspace; // Atualiza o histórico de blocos
    socket.broadcast.emit('blockly-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
