import http from 'http';
import { handleApiRequest } from './apiHandler.ts';
import { serverConfig } from './config.ts';

const PORT = serverConfig.PORT;

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[AirSaathi Backend] Server running on http://localhost:${PORT}`);
});

export default server;
