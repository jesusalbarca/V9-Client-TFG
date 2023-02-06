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


// //Al pulsar botón de ejecutarse llama a este endpoint
// app.post('/ejecuteService', async function (req, res) {
//
//
//         let needsRefresh = false;
//
//
//         const requestBody = req.body;
//
//
//         // Comprobación para Re-Asignación de IP y puerto al que enviar las llamadas RPC si el usuario cambia este campo a algo que no sea lo anterior
//         if (serverAddress !== requestBody.hostname && requestBody.hostname !== null && requestBody.hostname !== undefined && requestBody.hostname !== "") {
//             serverAddress = requestBody.hostname;
//             needsRefresh = true;
//         }
//         if (grpcServerPort !== requestBody.port && requestBody.port !== null && requestBody.port !== undefined && requestBody.port !== "") {
//             grpcServerPort = requestBody.port;
//             needsRefresh = true;
//         }
//
//         //Refrescamos
//         if (needsRefresh)
//             grpcServices = await grpcHelpers.grpcs(PROTO_PATH, PROTO_PACKAGE, serverAddress, grpcServerPort);
//
//
//         console.group(" [>>>>] Requested execution of service! ")
//         console.log(requestBody);
//         var objRequest = {}; // Contruimos los parámetros de la llamada remota
//         var x = 0;
//
//
//         //typeAtrb es el nombre del parámetro
//         requestBody.typeAtrb.forEach(
//             tipo => {
//                 let valorParam = req.body.nameAtrb[x];
//
//                 let tipoDeDatos = req.body["tipo"][x];
//                 // console.log("[@alreylz] TIPO DE DATOS!!! " + tipoDeDatos);
//
//                 switch (tipoDeDatos) {
//                     case "int32":
//                         valorParam = Number(valorParam);
//                         break;
//                     case "bool":
//                         if (valorParam === "False" || valorParam === "false") valorParam = false;
//                         // console.log("[@alreylz] detectado un tipo bool " + valorParam);
//                         break;
//
//                 }
//
//                 objRequest[`${tipo}`] = valorParam;
//
//                 x++;
//             })
//
//
//         console.log("----------------");
//         console.log(grpcServices);
//
//         console.log("----------------");
//         const grpcMethod = grpcServices['service' + requestBody.ServiceChoose];
//
//         console.log(requestBody.ServiceChoose)
//
//         console.log("GRPC METHOD!")
//         console.log(grpcMethod);
//         console.log(`[@alreylz]
//             Petición
//             enviada:  `)
//         console.log(objRequest);
//         grpcMethod[`${requestBody.grpcChoose}`](
//             objRequest,
//             function (err, response) {
//                 if (err != null) {
//                     console.log('SERVIDOR NO CONECTADO');
//                     alert('SERVIDOR NO CONECTADO');
//                     console.log(err);
//                     alert(err.details);
//
//                 } else {
//                     console.log("Error executing the grpc" + req.body.grpcChoose)
//                     console.log(response);
//                     console.log('Servidor:', response.message);
//                     alert(response + response.message);
//                     res.redirect('/ejecutar');
//                 }
//             });
//         //  console.log(res.body);
//     }
// )
// ;


// -----------------------------------------
// ENDPOINTS DE DESCARGA DE ARCHIVOS PROTO
// -----------------------------------------

// DIRECTORIO DE PROTO FILES EXISTENTES
// app.get('/protos', async function (req, res) {
//
//     const files = await fs.promises.readdir(protosPath);
//     res.send(files);
// });
//
// // DESCARGA DE ARCHIVOS PROTO
// app.get('/protos/:name', async function (req, res) {
//
//     const files = await fs.promises.readdir(protosPath);
//     for (const f of files) {
//         if (req.params.name === f) {
//             console.log(`Found ${f}`)
//         }
//         console.log(f)
//     }
//     res.type(".proto")
//     // files.
//     // res.(req.params.name);
//     res.sendFile(path.resolve(protosPath, req.params.name));
// });


// --------------------------
// ------REST APIs-----------
// --------------------------


let f = async () => {
    const mapServices = await grpcHelpers.loadProtofileToMap(path.join(__dirname, "proto", "protofile.proto"), "testRoomScene", "localhost").then((d) => console.log(d));
    console.log(mapServices)
};
f();


