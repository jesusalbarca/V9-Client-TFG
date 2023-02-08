/*
    Main project file
 */


require('./LogColouring')


const fs = require('fs');


require("dotenv").config()

const grpcHelpers = require("./src/shared/utils/grpcHelpers"); // Mis funciones para trabajar con grpc


const utils = require("./utils")


const express = require("express");

// Import the actual express application providing access to my endpoints
const app = require("./express-app")
const server = require("http").Server(app);

// Connect to the database and
const db = require('./db');


const PORT = process.env.PORT;
server.listen(PORT, () => {
    // console.clear()
    console.log(
        "\n\n**━━━━━━━━━━━━━━━┏┓━┏┓┏━━━┓┏━━━┓┏━━┓**\n".magenta() +
        "**━━━━━━━━━━━━━━━┃┃━┃┃┃┏━┓┃┃┏━━┛┗┫┣┛**\n".magenta() +
        "**┏━━┓┏━┓┏━━┓┏━━┓┃┗━┛┃┃┃━┗┛┃┗━━┓━┃┃━**\n".magenta() +
        "**┃┏┓┃┃┏┛┃┏┓┃┃┏━┛┃┏━┓┃┃┃━┏┓┃┏━━┛━┃┃━**\n".magenta() +
        "**┃┗┛┃┃┃━┃┗┛┃┃┗━┓┃┃━┃┃┃┗━┛┃┃┗━━┓┏┫┣┓**\n".magenta() +
        "**┗━┓┃┗┛━┃┏━┛┗━━┛┗┛━┗┛┗━━━┛┗━━━┛┗━━┛**\n".magenta() +
        "**┏━┛┃━━━┃┃━━━━━━━━━━━━━━━━━━━━━━━━━**\n".magenta() +
        "**┗━━┛━━━┗┛━━━━━━━━━━━━━━━━━━━━━━━━━**\n".magenta())

    console.log(`\t[>>>] Server started at localhost ${PORT}\n`.magenta());
});


const path = require('path');


//Elmina el archivo proto y lo vuelve a crear con la cabecera
const PROTO_PATH = path.resolve(__dirname, 'proto', 'protofile.proto'); // -> Archivo de salida (proto)

const PROTO_PACKAGE = process.env.DEFAULT_PROTO_PACKAGE; //"testRoomScene";


//Insertar servicios de mongodb
// const fetch = require("node-fetch");
// const {resolve} = require('path');
// const {dir} = require('console');
// const grpc = require("@grpc/grpc-js");
const GrpcPackage = require("./src/model/gRPCPackage");

const protosPath = path.resolve(__dirname, 'proto');


if (false)
    grpcHelpers.generateSintax(PROTO_PATH);


//CONFIGURATION ELEMENTS @alreylz


var grpcServices = new Map(); // Mapa de stubs para poder ejecutar los RPC. (e.g. grpcServices["service<NombreServicio>"]





// --------------------------
// ------REST APIs-----------
// --------------------------


let f = async () => {
    const mapServices = await grpcHelpers.loadProtofileToMap(path.join(__dirname, "proto", "protofile.proto"), "testRoomScene", "localhost").then((d) => console.log(d));
    console.log(mapServices)
};
f();



