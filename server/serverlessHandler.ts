import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from './apiHandler.ts';

interface ServerlessIncomingMessage extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const reqWithQuery = req as ServerlessIncomingMessage;

  let url = req.url || '';
  if (url === '/api' || url === '/api/' || url.startsWith('/api?')) {
    const route = reqWithQuery.query?.__route || reqWithQuery.query?.route;
    if (typeof route === 'string') {
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
