const WebSocket = require("ws");
const LogColouring = require("../shared/LogColouring");
const Basics = require("../shared/utils/Basics");


// LA idea de esta clase es crear un endpoint sobre el que cada usuario se pueda conectar

//Para cada usuario de la aplicación, tendré que tener una lista de conexiones abiertas (los juegos que están ejecutando y los navegadores que están conectados)


class CustomWebsocketServer {


    connectionsMap = new Map(); // Mapa  <usuario, Conexiones


    //  List of all non-game connections for a given websocket server
    browser_sockets = [];
    // List of all game connections for a given websocket server
    game_clients = [];
    // All game connections in a given websocket server (browser_sockets + game_clients)
    connections = {}

    pingTimeoutSeconds = 3;


    constructor(httpServer, port, path) {

        const self = this;


        // The websocket server object
        self.server = new WebSocket.Server({host: httpServer, port: port, path: path});

        //--------------------------------------------------------------------------------
        // WEBSOCKET EVENT SERVER CODE
        //--------------------------------------------------------------------------------

        self.server.on('open', function (a) {
            self.active = true;
            console.log(`Authenticated Websocket server listening @ ws://${httpServer.address()}:${port}${path}`.yellow())
        });

        self.server.on('close', function (a) {
            console.log("CLOSED  Authenticated WEBSOCKET  SERVER")
            self.active = false;
            console.log(a)
        });


        // CONNECTION -> When a connection is established on a websocket.
        self.server.on('connection',
            /***
             *
             * @param ws The websocket object, which represents connection between the server and the client
             * @param req The HTTP request object associated with the websocket connection (used to authenticate the user)
             */
            async function connection(ws, req) {


                //Comprobar token de autenticación
                const jwtUtils = require("../shared/middlewares/jwtUtils");
                let userConnectingToWS = undefined;

                try {
                    userConnectingToWS = await jwtUtils.verifyJWT(req);
                } catch (e) {
                    //Si hay un error comprobando el token, cerramos la conexión
                    console.error("Error verifying JWT, websocket connection will be closed", e);
                    ws.close();
                    return;
                }


                console.log("User connecting to websocket: ", userConnectingToWS);


                // The client socket is alive as a connection is established.
                ws.isAlive = true;
                console.log(`New websocket! @ ws://${httpServer.address()}${port}${path}`.yellow())

                /* Obtenemos la instancia del web socket (ws)
                   podemos tener varios clientes conectándose a nuestro servidor web,
                   por lo que necesitamos una manera de identificar las diferentes conexiones bidireccionales
                 */


                console.log(userConnectingToWS.username)


                self.username = userConnectingToWS.username;






                ws.on('message',
                    function incoming(_message) {
                    //-> When a message is received in any web socket handled by this server.

                    switch (_message.toString()) {
                        case "woz": // if is a web client, used for game monitoring and command triggering


                            ws.id = self.getUniqueID(); // give an id property to the web socket,

                            // so that we can distinguish between sockets later
                            self.browser_sockets.push(ws);
                            console.log(` [+1]`.yellow() + ` browser_client`.red() + ` Websocket Connection` + ` with id '${ws.id}' from ${req.socket.remoteAddress}`);

                            ws.send(`Connection established with Server. You are a browser_client with id ${ws.id}`);
                            //PASS DATA TO CLIENT

                            // const initData = new WebsocketMessage(-1, 0, {
                            //     wsId: ws.id
                            // })
                            // ws.send(JSON.stringify(initData));
                            ws.send("wtf");


                            break;
                        case "mr": // if it is a game client, then we want to handle it in a different way.

                            ws.id = self.getUniqueID();

                            self.connectionsMap.set(self.username, ws) ;
                            console.log(self.connectionsMap);
                            debugger;


                            self.game_clients.push(ws);
                            console.log(` [+1]`.yellow() + ` game_client`.red() + ` Websocket Connection` + ` with id '${ws.id}' from ${req.socket.remoteAddress}`);
                            // console.log(`[NewWS][GAME-CLIENT] ${_ws.id}`);
                            ws.send("Connection established with Server. You are a game_client");

                            break;

                        default: // If connection has already been confirmed.

                            //a) message comes from game --> pass it to browser clients.
                            if (self.game_clients.length > 0 && self.game_clients.find(elem => elem.id === ws.id)) {
                                console.log(`Message received FROM game_client: ${ws.id}`.magenta());
                                self.browser_sockets.forEach(_sock => _sock.send(_message));
                                console.log("\t[Action >>]".red() + " Message sent TO all browser clients ");
                            }

                        // //b) message comes from browser client --> send it to game_clients
                        // else {
                        //     console.log(`Message received FROM browser_client: ${ws.id}`.yellow());
                        //     self.game_clients.forEach(_sock => _sock.send(_message));
                        //     console.log("\t[Action >>]".red() + "Message sent TO all game clients ");
                        // }


                        // Display incoming messages
                        // console.log(`>> received message: ${_message}`);


                    }

                    // console.log(self.server.clients)


                });
                ws.on('close', function () {
                    const idx = self.browser_sockets.findIndex(el => el.id == ws.id);
                    const idg = self.game_clients.findIndex(el => el.id == ws.id)

                    if (idx > -1) {
                        const deleted = self.browser_sockets.splice(idx, 1);
                        console.log(`deleted browser_socket.`);
                    }
                    else {
                        const deleted = self.game_clients.splice(idx, 1);
                        console.log(`deleted game_client.`);
                    }
                })


            });


        //PING FROM TIME TO TIME TO CHECK IF CLIENTS ARE STILL ALIVE
        Basics.executeEveryNSecs(self.pingTimeoutSeconds, self.active === false, function ping() {
                console.log("Pinging all web socket connections from server " + Date.now());
                self.server.clients.forEach(function each(ws) {
                    if (ws.isAlive === false) return ws.terminate();
                    ws.isAlive = false;
                    ws.ping();
                });
            }
        );

        self.server.on('pong', function heartbeat(ws) {
            ws.isAlive = true;
        });


        // CLOSE -> When the server has to be shut down, I created this method to perform cleanup.
        self.server.close = function cleanup() {

            console.log("Closing all web socket connections from server " + Date.now())
            self.connections.forEach((s => {

                s.send("server instructs to shut down the connection");
                s.close();
                s.terminate();
            }));

        };


        // Summary of connections
        self.connections = {};
        self.connections.browser_sockets = self.browser_sockets;
        self.connections.game_clients = self.game_clients;

    }


    // AUX (PROVIDING ID TO EACH WEBSOCKET CONNECTION) -> We create a method which creates unique ids made of 3 randomly generated hex strings (using the s4());
    getUniqueID() {

        function s4() {
            //generates a number between 1 and 16 , then converts it to base HEX and then avoids the first letter.
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4();
    };

    //Helper function Lists all the websockets connections handled by the ws-server
    async listActiveWSs() {

        let wsStatusList = {};

        wsStatusList["BrowserClients"] = [];
        wsStatusList["GameClients"] = [];

        console.log("[STATUS] >> ACTIVE WEBSOCKETS ?".green());
        if (this.browser_sockets == 'undefined' || this.browser_sockets.length <= 0) {
            console.log('\t NO BROWSER SOCKETS ACTIVE '.red())
        }
        else {
            console.log(`Browser sockets: #${this.browser_sockets.length}`.yellow());
            await this.browser_sockets.forEach(el => {
                    console.log(`\t ${el.id}`.yellow());
                    wsStatusList.BrowserClients.push(el.id);
                }
            )

        }
        if (this.game_clients == 'undefined' || this.game_clients.length <= 0) {
            console.log('\t NO GAME SOCKETS ACTIVE '.red())
        }
        else {
            console.log(`Game clients: #${this.game_clients.length}`.magenta());
            await this.game_clients.forEach(el => {
                console.log(`\t ${el.id}`.magenta());
                wsStatusList.GameClients.push(el.id);

            });

        }
        return wsStatusList;
    }


}


module.exports = (httpServer, port, path) => new CustomWebsocketServer(httpServer, port, path);