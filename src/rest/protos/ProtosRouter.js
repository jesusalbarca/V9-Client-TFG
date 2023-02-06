const express = require('express');
const router = express.Router();
require("dotenv").config();


const fs = require("fs");
const path = require("path");

const PROTOS_PATH = process.env.PROTOFILE;


// -----------------------------------------
// ENDPOINTS DE DESCARGA DE ARCHIVOS PROTO
// -----------------------------------------

// DIRECTORIO DE PROTO FILES EXISTENTES
router.get('/protos',
    async function (req, res) {

        console.log("\t\t request to /protos".red())

        const files = await fs.promises.readdir("C:\\Users\\cored\\Desktop\\Github\\remote-hci-grpc\\proto");

        const protoFiles = files.filter(el => path.extname(el) === '.proto')
        // console.log(protoFiles)
        res.send(protoFiles);
    });


// DESCARGA DE ARCHIVOS PROTO
router.get('/protos/:name', async function (req, res) {

    const files = await fs.promises.readdir(PROTOS_PATH);
    for (const f of files) {
        if (req.params.name === f) {
            console.log(`Found ${f}`)
        }
        console.log(f)
    }
    res.type(".proto")
    // files.
    // res.(req.params.name);
    res.sendFile(path.resolve(PROTOS_PATH, req.params.name));
});


//Devolverá una lista de dispositivos disponibles para ejecutar las llamadas
router.get("/availableEndpoints", async function (req, res) {


    res.json();

});


const grpcHelpers = require("../../shared/utils/grpcHelpers")

router.get('/def/packages/:protofile', async function (req, res) {

    console.log("\t\trequest to /def/packages".red())

    //Recibe el nombre del archivo proto a cargar
    // console.log(req.body.protoFile);
    // devuelve un json que contiene los servicios y mensajes asociados para poder ejecutarlos

    const servicesMap = await grpcHelpers.loadProtofileToDescription(path.join(__dirname, "..", "..", "..", "proto", req.params.protofile), "testRoomScene");

    console.log(servicesMap)
    return res.json(servicesMap);

});


module.exports = router;