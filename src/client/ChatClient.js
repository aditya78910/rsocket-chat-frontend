import { WebsocketClientTransport } from "rsocket-websocket-client";
import { WebsocketServerTransport } from "rsocket-websocket-server";
import { RSocketConnector, RSocketServer } from "rsocket-core";
import { MESSAGE_RSOCKET_COMPOSITE_METADATA } from "rsocket-core";
import { get_base_ws_url } from "../util/util";

//const rsocket = await connector.connect();

export async function getRsocketClient(user) {
  const connectapiurl = "/initiate";
  const connector = new RSocketConnector({
    setup: {
      payload: {
        data: Buffer.from(JSON.stringify({ username: user.username })),
        metadata: Buffer.concat([
          Buffer.from(String.fromCharCode(connectapiurl.length)),
          Buffer.from(connectapiurl),
        ]),
      },
      keepAlive: 100,
      lifetime: 100000,
      dataMimeType: "application/json",
      metadataMimeType: "message/x.rsocket.routing.v0",
    },
    transport: new WebsocketClientTransport({
      url: get_base_ws_url("chat") + "/rsocket",
      wsCreator: (url) => new WebSocket(url),
    }),
  });
  const cl = connector.connect();
  return cl;
}
