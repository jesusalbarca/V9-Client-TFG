//---------------
// CONFIG
//---------------

// FOR LOCAL TESTING BY DEFAULT
// @alreylz (env is a variable written in another script)

const DEFAULT_PORT = env.port || 9030;
const HOSTNAME = env.ip || "localhost";
const AUTO_CONNECT_LOCAL = env.autoConnectLocal || true;


console.log(`AUTO CONNECT LOCAL = ${AUTO_CONNECT_LOCAL} | DEFAULT PORT ${DEFAULT_PORT}  | HOSTNAME ${HOSTNAME}`)


//Tengo que tener

let websocketURL = "";

let socket = undefined;


const clientLogDiv = document.querySelector("#client-log");


// [Main program]


//Extract where to connect and attempt connection if AUTO-CONNECT is enabled.
if (AUTO_CONNECT_LOCAL) {
    // Show if auto-connect is enabled
    let infoShow_ConnectConfig = document.querySelector("[data-id='connect-configuration']")
    infoShow_ConnectConfig.innerHTML = ` TRUE: ${HOSTNAME}:${DEFAULT_PORT}`
    ;
    document.querySelector("#s-connection-prompt").className = "hidden";
    socket = new WebSocket(websocketURL =
        `ws://${HOSTNAME}:${DEFAULT_PORT}/monitor/all`);
    AttemptWSServerConnect(); //Attempt Connection
} else {
    // Show if auto-connect is enabled
    let infoShow_ConnectConfig = document.querySelector("[data-id='connect-configuration']")
    infoShow_ConnectConfig.innerHTML = `
FALSE`;
}


/*
    Extracts a url from a page input field and attempts a connection to a websocket server at such url.
 */
function AttemptWSServerConnect() {

    //Obtain a valid ws url.
    if (socket === undefined) {
        let connectToTxtBox = document.querySelector("#f-hostname").value;
        connectToTxtBox.startsWith("ws://") ?
            socket = new WebSocket(websocketURL = `${connectToTxtBox}`) :
            socket = new WebSocket(websocketURL = `
ws://${connectToTxtBox}/`);
    }


    console.log(`[Websocket] Attempting Connection To : '${websocketURL}' [AUTO_CONNECT_LOCAL=${AUTO_CONNECT_LOCAL}]`);


//[WS CLOSED]
    socket.onclose = function (event) {
        if (event.wasClean) {
            alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            alert('[close] Connection died.');
        }
    };

//[WS ERROR]
    socket.onerror = function (error) {
        alert("[error]"); // ${error.message}`);
        socket = undefined;
    };

//[WS OPEN]
    socket.onopen = function (e) {
        alert("[open] Connection established");
        // socket.send("woz");
    };


// [WS MESSAGE RECEIVED]
    socket.onmessage = OnWsMessage;


}




/* Takes a message and generates a div with the message content for a given device.  (reuses components*/
function DisplayRemoteData(jsonObjMsg) {

    // Creo un objeto imagen para mostrarlo
    // let msgData = jsonObjMsg;


    // Extraigo datos de un mensaje de websockets obtenido
    if (jsonObjMsg.messageType === 2) {

        let isNewDevice = false;
        // Para el mensaje obtenido, busco si existe un div con el id del dispositivo; lo que significa que puedo reutilizar el div.
        // Si no existe, lo creo.
        let deviceDiv = document.querySelector(`div[data-id="${jsonObjMsg.deviceInfo.id}"]`);

        if (deviceDiv === null) {
            isNewDevice = true;
            deviceDiv = document.createElement("div");
        }

        if(isNewDevice === true) {
            deviceDiv.setAttribute("data-id", jsonObjMsg.deviceInfo.id);
            deviceDiv.innerHTML = "";
        }

        console.log(jsonObjMsg.deviceInfo.ip)

        const deviceName = isNewDevice === true ? document.createElement("h3") : deviceDiv.querySelector("h3");
        deviceName.innerHTML = `ID:'${jsonObjMsg.deviceInfo.id} - ${jsonObjMsg.deviceInfo.ip}:${jsonObjMsg.deviceInfo.port}`;
        const imageElement = isNewDevice === true ?  document.createElement("img") : deviceDiv.querySelector("img");

        if(isNewDevice == true) {
            deviceDiv.append(deviceName);
            deviceDiv.append(imageElement);

        }


        const objMsgData = jsonObjMsg.data;

        //CONVERTING BASE 64 to an object URL
        const byteCharacters = atob(objMsgData.contentBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: "image/jpeg"});

        // Create a URL object from the Blob object
        const objectURL = URL.createObjectURL(blob);

        imageElement.src = objectURL;
        imageElement.height = 400;
        imageElement.width = 400;


        let putInto = document.querySelector("#remoteViews");

        if (isNewDevice)
            putInto.append(deviceDiv);

    }

    //END SUPPORT FOR BINARY IMAGES

}


/// -------------------------------
/// [UPDATING THE PAGE DYNAMICALLY]
/// -------------------------------

/***
 * Displays a message in the console section of the page.
 * @param msg
 */
async function DisplayIncomingMessageInClientLog(msg) {


    const debugMessageToRender = document.createElement("output");
    //Formatting
    debugMessageToRender.setAttribute("class", "debugMsg");
    debugMessageToRender.textContent = msg;


    let consoleFilterValue = document.querySelector("select[name='filter-full-log']").value;
    console.log(consoleFilterValue)


    try {

        let parsedMsg = JSON.parse(msg);

        if (consoleFilterValue !== "dict" && consoleFilterValue !== "any" && parsedMsg !== null && parsedMsg !== undefined) {
            debugMessageToRender.setAttribute("class", "hidden");
        }

        if (parsedMsg["MessageType"] === 2) {
            debugMessageToRender.textContent = `New Frame Received: ts=${parsedMsg["Timestamp"].toString()}s`;
        }


    } catch (e) {

    }


    let parsedMsg = JSON.parse(msg);
    let msgData = await parsedMsg.data;


    clientLogDiv.appendChild(debugMessageToRender);


}


/**
 * Returns an objectUrl given a binary message containing an image.
 * @param binaryWebsocketMessage
 * @returns {Promise<string>} An object url pointing to the image
 */
async function readBinaryWebsocketMessageToObjectUrl(binaryWebsocketMessage) {

    // ALLOWS READING A BINARY FILE WITH THE STRUCTURE ( LETTER 'I' + FILE CONTENT )
    if (binaryWebsocketMessage instanceof Blob) {

        let blobRaw = binaryWebsocketMessage;

        // Convert to to array buffer
        let arraybuffer = await blobRaw.arrayBuffer()
        //Extract 1st byte and parse it to a Uint8Array
        const firstByteView = new Uint8Array(arraybuffer.slice(0, 1));

        const firstByteUTF8 = convertByteToUTF8(firstByteView); // Byte as UTF8 indicating the type of data incoming (e.g. 'I' for image)
        const firstByteBinaryText = toBinString(firstByteView); // 0s and 1s for the first byte

        console.log(`readBinaryWebsocketMessageToObjectUrl > FIRST BYTE: ${firstByteUTF8} | ${firstByteBinaryText} `);

        switch (firstByteUTF8) {

            case "I":
                console.log(" > Received image data.");
                break;

        }


        //Extract the actual image (after the first byte)
        const
            restOfBlobView = new Uint8Array(arraybuffer.slice(1));

        const objectURL = URL.createObjectURL(new Blob([restOfBlobView]));

        return objectURL;
    } else {
        console.error(" > ERROR: Received message is not a SUPPORTED binary blob .");
        throw new Error("Received message is not a SUPPORTED binary blob .");
    }
}


function convertByteToUTF8(byte) {
    return new TextDecoder().decode(byte);
}


const toBinString = (bytes) =>
    bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '');


//Given a width and a height of the Antilatency Map in the real world, displays the position and rotation of the head in a svg window in the browser page.
function ShowPositionAndRotationInSvgMap(wsMessage, widthInAntilatencyMatSquares = 8.0, heightInAntilatencyMatSquares = 5.0) {

    let svgContainer = document.getElementById("world2D");

    // Obtain real dimensions in meters and aspect ratio from these (to keep svg map properly scaled).
    let rwWidth = 0.6 * widthInAntilatencyMatSquares;
    let rwHeight = 0.6 * heightInAntilatencyMatSquares;
    let aspectRatio = rwHeight / rwWidth;

    //console.log(`aspect ratio ${aspectRatio}`);

    //[MAKE SVG GROW AND SHRINK WITH WINDOW]
    let mapWidth = svgContainer.getBoundingClientRect().width;
    //Calculo la altura correspondiente.
    let mapHeight = mapWidth * aspectRatio;
    svgContainer.setAttribute("height", mapHeight);

    //console.log(`svg (W,H) = ${mapWidth} , ${mapHeight}`);

    //Get svg elements representing the user.
    let userHead = svgContainer.querySelector(".user-head-svg");
    let userGazeLine = document.querySelector("#user-head-dir")
    let userRepresentation = document.querySelector("#user-rep");


    //Coordinate correction

    let xposition = wsMessage.Data.position[0];
    let zposition = wsMessage.Data.position[2];

    if (typeof (wsMessage.Data.position) == typeof (String)) {

        let arrayPos = JSON.parse(wsMessage.Data.position);
        xposition = arrayPos[0];
        zposition = arrayPos[2];

    }

    //1) Sumar nuevo origen.
    let correctedX = JSON.parse(xposition) + rwWidth / 2.0;
    let correctedY = parseFloat(zposition) + rwHeight / 2.0;


    //2) Convert meters to window units
    correctedX = mapWidth - (correctedX * mapWidth / rwWidth);
    correctedY = correctedY * mapHeight / rwHeight;

    let headDiameter = 0.15;//cm   //https://en.wikipedia.org/wiki/Human_head

    userHead.setAttribute("cx", correctedX.toString());
    userHead.setAttribute("cy", correctedY.toString());
    userHead.setAttribute("r", (headDiameter * mapWidth / rwWidth).toString())
    userHead.setAttribute("fill", "yellow")


    userGazeLine.setAttribute("d", `M ${correctedX} ${correctedY} L ${correctedX} ${correctedY + 60} Z`)
    userGazeLine.setAttribute("style", "stroke:teal;stroke-width:2");

    userGazeLine.setAttribute("transform", `rotate (${wsMessage.Data.rotation[1]} ${correctedX.toString()} ${correctedY.toString()} ) `);

}


// To be executed when a message is received via the Websocket connection

async function OnWsMessage(event) {

    //Incoming message
    const wsMessage = event.data;
    let wsMessageAsJSObject = undefined;

    //Try to convert the input message (a json),
    // to a Javascript Object to ease manipulation.

    //CHECK SELECT VALUE IN LOG CONSOLE PART OF HTML (FILTER BY STRUCTURED MESSAGE OR NOT STRUCTURED)

    try {
        wsMessageAsJSObject = JSON.parse(wsMessage);
        //Do something with the message.
    } catch (e) {
        console.log("[WS][MSG RECEIVED] Message arrived (not an Object) \n" + event.data)
    }
    await DisplayRemoteData(wsMessageAsJSObject);
    // DisplayIncomingMessageInClientLog(wsMessage);


};


const WsMessageTypes = {
    VAR_SHARING: -1,
    RPC_COMMAND: 0,
    MONITORING: 1,
    SCREENCASTING: 2
}

function callerName() {
    return callerName.caller.name;
}

/***
 * Clears the html  console log content
 *
 */
function ClearClientLog() {
    while (clientLogDiv.lastElementChild) {
        clientLogDiv.removeChild(clientLogDiv.lastElementChild);
    }
}