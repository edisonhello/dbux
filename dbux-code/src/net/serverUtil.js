import http from 'http';
import * as SocketIOServer from 'socket.io';
import { newLogger } from '@dbux/common/src/log/logger';

// eslint-disable-next-line no-unused-vars
const { log, debug, warn, error: logError } = newLogger('net/listener');

let _makeHttpServerPromise;

/**
 * @param {number} port 
 * @param {function} serverCallback
 * @return {Promise<httpServer>}
 */
export function makeHttpServer(port, serverCallback) {
  const httpServer = http.createServer(serverCallback);
  // const address = '0.0.0.0';
  const address = '';

  if (_makeHttpServerPromise) {
    return _makeHttpServerPromise;
  }

  return _makeHttpServerPromise = new Promise((resolve, reject) => {
    httpServer.listen(port, () => {
      debug(`server listening on port ${address}:${port}...`);

      resolve(httpServer);
    });

    httpServer.on('error', err => {
      logError('dbux http server failed', err);

      reject(new Error(`makeHttpServer failed`));
    });
  });
}


export async function makeListenSocket(port) {
  const httpServer = await makeHttpServer(port);

  // see: https://socket.io/docs/server-api/
  const listenSocket = SocketIOServer(httpServer, {
    // const server = require('socket.io')(httpServer, {
    serveClient: false,

    // see: https://github.com/socketio/engine.io/blob/6a16ea119280a02029618544d44eb515f7f2d076/lib/server.js#L107
    wsEngine: 'ws' // in case uws is not supported
  });

  listenSocket.on('error', err => {
    logError('dbux listen server failed', err);
  });

  return listenSocket;
}