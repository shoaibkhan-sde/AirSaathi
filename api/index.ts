import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from '../server/apiHandler.ts';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const anyReq = req as any;

  let url = req.url || '';
  if (url === '/api' || url === '/api/' || url.startsWith('/api?')) {
    const route = anyReq.query?.__route || anyReq.query?.route;
    if (route) {
      req.url = `/api/${route}`;
    } else if (req.headers['x-matched-path']) {
      req.url = req.headers['x-matched-path'] as string;
    } else if (req.headers['x-forwarded-uri']) {
      req.url = (req.headers['x-forwarded-uri'] as string).split('?')[0];
    }
  }

  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint Not Found', url: req.url }));
  }
}
