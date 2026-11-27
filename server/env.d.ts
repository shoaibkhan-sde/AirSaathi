declare module 'http' {
  export interface IncomingMessage {
    url?: string;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
    on(event: 'data', listener: (chunk: Buffer | string) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: unknown) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
    destroy(): this;
  }

  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string | number | readonly string[]): this;
    end(data?: string | Uint8Array, cb?: () => void): this;
  }

  export interface Server {
    listen(port: number, cb?: () => void): this;
  }

  export function createServer(
    requestListener?: (req: IncomingMessage, res: ServerResponse) => void
  ): Server;
}

declare const process: {
  env: Record<string, string | undefined>;
};
