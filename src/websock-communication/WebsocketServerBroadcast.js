const WebSocket = require("ws");
const LogColouring = require("../shared/LogColouring");
const Basics = require("../shared/utils/Basics");
const mongoose = require("mongoose");




// const wss = new WebSocket.Server({server}, {port: wsPort});
// let wsServerInfo = require("./wsServer")(wss);


class BroadcastWebsocketServer {

    //  List of all connections waiting to receive broadcasting messages
    browser_sockets = [];
    pingTimeoutSeconds = 3;


    constructor(httpServer, port, path) {


        const self = this;

        // The websocket server object
        self.server = new WebSocket.Server({host: httpServer, port: port, path: path});


        self.hostname = httpServer.address().address;
        //--------------------------------------------------------------------------------
        // WEBSOCKET EVENT SERVER CODE
        //--------------------------------------------------------------------------------

        self.server.on('open', function (param) {
            console.log(`Websocket server listening @ ws://${port}${path}`.yellow());
            self.active = true;
        });

        self.server.on('close', function (param) {
            console.log("Closed Websocket Server".red())
            self.active = false;
        });


        // CONNECTION -> When a connection is established on a websocket.
        self.server.on('connection',
            async function connection(ws, req) {

                self.hostname = httpServer.address().address;
                // The client socket is alive as a connection is established.
                ws.isAlive = true;
                // give an id property to the Web Socket.
                ws.id = self.getUniqueID();
                self.browser_sockets.push(ws);


                console.log("INTENTO DE CONEXION DESDE UNO DE LOS NAVEGADORES AKA 'CAMERAS'")
                console.log(req)

                const cookies = req.headers.cookie;

                console.log(cookies)

                const parsedCookies = parseCookies(cookies);


                console.log(parsedCookies);
                debugger;




                // TODO: ESTO NO FUNCIONA POR LA FORMA EN LA QUE SE TRANSFORMA EL ID DE LA COOKIE AL ID DE MONGO ( ahora mismo es automático con el express-session)
                const {mongow, operations} = require("../shared/PureMongoWrappers")
                const dataFromUser = await  mongow("sessions",operations.findById,parsedCookies['ixci'])

                debugger;



                console.log(` [+1]`.yellow() + `New websocket broadcast connection! @ ws://${self.hostname}:${port}${path} ; id ${ws.id} FROM host: ${req.socket.remoteAddress}`.cyan())

                //Para cada cliente que está enviando datos al servidor,
                // suscribimos un "puente" para enviar los datos a los clientes que están escuchando.
                game_clients.forEach(gc => {
                    gc.on('message', async function incoming(_message) {


                        // const terminalImage = await import("terminal-image");

                            //LEER EL MENSAJE, VER QUé CONTIENE (para hacer transformaciones necesarias)
                            // Añadir metadata
                            // y ENVIARLO A LOS CLIENTES QUE ESTÁN ESCUCHANDO


                            const gcClientInfo = {ip: gc.ip, port: gc.port, id: gc.id, alias: "OCULUS A"};
                            const data = await readBinaryWebsocketMessageToBase64(_message);

                            console.log(data)

                            // console.log(await terminalImage.buffer(_message));


                            const complexMsg = new WebsocketBrowserDataMessage(gcClientInfo, WsMessageType.SCREENCAST, data);
                            ws.send(JSON.stringify(complexMsg));


                        }
                    );
                });

                /* Obtenemos la instancia del web socket (ws)
                   podemos tener varios clientes conectándose a nuestro servidor web,
                   por lo que necesitamos una manera de identificar las diferentes conexiones bidireccionales
                 */
                ws.on('message', function incoming(_message) {
                    //-> When a message is received in any web socket handled by this server.
                    self.browser_sockets.push(ws);
                    console.log(` [+1]`.yellow() + ` browser`.red() + ` Websocket Connection` + ` with id '${ws.id}' from ${req.socket.remoteAddress}`);

                    // Display incoming messages
                    console.log(`BROADCAST WEBSOCKET >>  received message: ${_message}`);
                });
                ws.on('close', function () {
                    const idx = self.browser_sockets.findIndex(el => el.id == ws.id);
                    const deleted = self.browser_sockets.splice(idx, 1);
                    console.log(`deleted browser_socket.`);
                })


            }
        )
        ;


        //PING FROM TIME TO TIME TO CHECK IF CLIENTS ARE STILL ALIVE
        Basics.executeEveryNSecs(self.pingTimeoutSeconds,
            self.active == false,
            function ping() {
                console.log("Pinging all web socket connections from server " + Date.now());
                self.server.clients.forEach(function each(ws) {
                    if (ws.isAlive === false) return ws.terminate();
                    ws.isAlive = false;
                    ws.ping();
                });
            }
        )
        ;

        self.server.on('pong',
            function heartbeat(ws) {
                ws.isAlive = true;
            }
        );


        // CLOSE -> When the server has to be shut down, I created this method to perform cleanup.
        self.server.close = function cleanup() {

            console.log("Closing all web socket connections from server " + Date.now())
            self.connections.forEach((s => {

                s.send("server instructs to shut down the connection");
                s.close();
                s.terminate();
            }));

        };

    }


// AUX (PROVIDING ID TO EACH WEBSOCKET CONNECTION) -> We create a method which creates unique ids made of 3 randomly generated hex strings (using the s4());
    getUniqueID() {

        function s4() {
            //generates a number between 1 and 16 , then converts it to base HEX and then avoids the first letter.
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4();
    }


}


class WebsocketBrowserDataMessage {
    constructor(deviceInfo = {}, messageType, data) {
        this.deviceInfo = deviceInfo; // ip, status, etc
        this.messageType = messageType;
        this.data = data;
    }
}


const WsMessageType = {
    SCREENCAST: 2
}


async function readBinaryWebsocketMessageToBase64(binaryWebsocketMessage) {

    const blobRaw = binaryWebsocketMessage;

    // Convert to to array buffer
    const arraybuffer = await Buffer.from(blobRaw, "binary").buffer;

    //Extract 1st byte and parse it to a Uint8Array
    const firstByteView = new Uint8Array(arraybuffer.slice(0, 1));
    const firstByteUTF8 = convertByteToUTF8(firstByteView); // Byte as UTF8 indicating the type of data incoming (e.g. 'I' for image)
    const firstByteBinaryText = toBinString(firstByteView); // 0s and 1s for the first byte
    //
    console.log(`readBinaryWebsocketMessageToObjectUrl > FIRST BYTE: ${firstByteUTF8} | ${firstByteBinaryText} `);


    let dataType = "";
    //Read encoded headers from binary message
    switch (firstByteUTF8) {

        case "I":
            console.log(" > Received image data.");
            dataType = "image/jpeg";
            break;
        default:
            dataType = "unknown";
            console.error(" > ERROR: Received message is not a SUPPORTED binary message .");
            throw new Error("Received message is not a SUPPORTED binary message .");
            break;
    }


    //Extract the actual image (after the first byte)
    const
        restOfBlobView = new Uint8Array(arraybuffer.slice(1));

    const contentBuffer = Buffer.from(restOfBlobView.buffer);
    const base64 = contentBuffer.toString('base64');

    return {
        type: dataType,
        contentBase64: base64
    };


}


function convertByteToUTF8(byte) {
    return new TextDecoder().decode(byte);
}

const toBinString = (bytes) =>
    bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '');


function parseCookies(cookieHeader) {
    return cookieHeader.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = value;
        return cookies;
    }, {});
}

module.exports = (httpServer, port, path) => new BroadcastWebsocketServer(httpServer, port, path);