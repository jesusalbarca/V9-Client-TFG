/*
    View related endpoints (Server Side Rendering)
 */
const express = require('express');
const router = express.Router();

// MONGOOSE MODELS
const ModelService = require("../model/Service");
const ModelMessage = require("../model/Message");

const grpcHelpers = require("../shared/utils/grpcHelpers");
const alert = require("alert");
const path = require("path");
const {resolveInclude} = require("ejs");
require("dotenv").config()

let serverAddress = process.env.HOSTNAME;
let grpcServerPort = `${process.env.GRPC_SERVER_PORT}`;


router.get('/', async function (req, res) {
    res.render('inicio.ejs', {activeTab: "home-tab"});
})

// TODO: Incomplete functionality
router.get('/configurar', async function (req, res) {
    res.render("configuracion.ejs", {activeTab: "configure-tab"})
});


// FRONT ROUTE - PÁGINA EJECUTAR SERVICIO
// [X] REFACTORED
router.get('/ejecutar', async function (req, res) {

    console.group(`/ejecutar (t)[${now()}]`.yellow());
    try {
        const servicios = await ModelService.find();
        const mensajes = await ModelMessage.find();

        res.render('index.ejs', {activeTab: "execute-tab", servicios: servicios, messages: mensajes})

    } catch (e) {
        console.groupEnd();
        return res.status(500).json({
            message: 'Error mostrando los servicios'
        })
    }
    console.groupEnd();

})


router.get('/execute_services', async function (req, res) {

    console.group(`/execute_services (t)[${now()}]`.yellow());
    try {

        //Tengo que extraer esta info de un archivo proto y pasarlo a la

        const servicios = [];
        const mensajes = [];


        res.render('execute_services.ejs', {activeTab: "execute-tab", servicios: servicios, messages: mensajes})

    } catch (e) {

        console.error(e.message)
        return res.status(500);
        console.groupEnd();

    }
    console.groupEnd();

})


var servicio_creado = "";
let existe_service = false;

// FRONT ROUTE - PÁGINA CREAR SERVICIOS GRPC
// [X] REFACTORED
router.get('/insertar_service', async function (req, res) {

    // Busco y despliego mensajes existentes
    let allMessages = [];
    try {
        allMessages = await ModelMessage.find();
    } catch (e) {
        return res.status(500).json({
            message: `Error cargando los mensajes grpc desde base de datos: ${e}`
        });
    }

    // Muestro la página de creación de servicios grpc (alert_service... se usan para indicar la última operación realizada y mostrar un mensaje de éxito u error en la redirección)
    res.render('insertar_service.ejs', {
        activeTab: "insert-tab",
        messages: allMessages,
        alert_service_create: servicio_creado,
        alert_service_existe: existe_service
    });
    servicio_creado = "";
    existe_service = false;

});


var servicio_delete = null;


// FRONT ROUTE - PÁGINA MOSTRAR SERVICIOS
// [X] REFACTORED
router.get('/mostrar_servicios', async function (req, res) {
        console.group(`/mostrar_servicios (t)[${now()}]`.yellow());


        let allServices = null;
        try {
            allServices = await ModelService.find();
        } catch (e) {
            console.groupEnd();
            return res.status(500).json({
                message: 'Error mostrando los servicios grpc existentes'
            });
        }
        res.render('mostrar_servicios', {
            activeTab: "show-services-tab",
            servicios: allServices,
            alert_service_delete: servicio_delete
        });
        servicio_delete = null;

        console.groupEnd();
    }
)
;


// ENDPOINT OPERACIONES
// MÉTODO INSERTAR SERVICIO
router.post('/crear_service', async function (req, res) {

    console.group(`/crear_service : Creando nuevo servicio en BBDD (t)[${now()}]`.yellow());
    console.log(`Form data:`.yellow());
    console.log(req.body);

    //Lista de funciones asociadas al servicio definido
    let grpcs = [];


    // Recorro el array de datos de entrada (el formulario)
    for (let i = 0; i < req.body.array.length; i = i + 3) {

        const rpcName = req.body.array[i];
        const requestDataTypeName = req.body.array[i + 1];
        const replyDataTypeName = req.body.array[i + 2];

        const requestType = await ModelMessage.findOne({messageName: requestDataTypeName});
        const replyType = await ModelMessage.findOne({messageName: replyDataTypeName});

        // const grpc = {"name": rpcName, "request": requestDataType, "reply": replyDataType};
        const grpc = {rpcName: rpcName, argsType: requestType, returnType: replyType};
        grpcs.push(grpc);
    }


    const grpcServiceName = req.body.name;


    let allGrpcServices = null;

    try {
        allGrpcServices = await ModelService.find({name: grpcServiceName});

        //There is no grpc with the same name already
        if (allGrpcServices.length == 0) {
            const newService = new ModelService({
                name: grpcServiceName,
                grpcs: grpcs
            });

            const savedService = await newService.save();

            console.log(`Creado el servicio grpc ${savedService}`);

            servicio_creado = grpcServiceName;


        } else  //The
        {
            console.log(`El servicio grpc '${grpcServiceName}' ya existe, elige otro nombre para el servicio`.red());
            existe_service = grpcServiceName;
        }


    } catch (e) {

        console.error(`${e.message}`.red())

        return res.status(500).json({
            message: `Error al crear un servicio grpc llamado ${grpcServiceName}. ${e.message}`
        })
    }

    return res.redirect('/insertar_service');
})


//FRONT ROUTE - MÉTODO INSERTAR MENSAJE
// [X] ENDPOINTS
router.post('/crear_message', async function (req, res) {


    let newMessageFields = [];
    var types = [];


    console.group(`POST /crear_message : Creando nuevo servicio en BBDD (t)[${now()}]`.yellow());


    for (let i = 0; i < req.body.array.length; i = i + 2) {

        const field = {dataType: req.body.array[i], dataName: req.body.array[i + 1]};
        newMessageFields.push(field)

    }

    const newMessageName = req.body.nameType;


    const newMessage = new ModelMessage({
        messageName: newMessageName,
        messageFields: newMessageFields
    });

    try {
        const savedMessage = await newMessage.save()
        console.log(`Guardado nuevo tipo de mensaje grpc ${savedMessage}`)


        res.redirect('/insertar_service');
    } catch (e) {
        console.groupEnd();
        return res.status(500).json({
            msg: 'Error al crear servicio'
        });
    }
    console.groupEnd();

});

var message_delete = "";

//PÁGINA MOSTRAR MENSAJES
router.get('/mostrar_messages', async function (req, res) {

    console.group(`/mostrar_messages (t)[${now()}]`.yellow());

    let allMessages = [];

    try {
        allMessages = await ModelMessage.find();
    } catch (e) {
        console.groupEnd()
        return res.status(500).json({
            message: 'Error mostrando los servicios'
        })
    }

    res.render('mostrar_messages', {
        activeTab: "show-messages-tab",
        messages: allMessages,
        alert_message_delete: message_delete
    })

    console.groupEnd()
});


//Al pulsar botón de ejecutarse llama a este endpoint, que recoge los datos de la página
router.post('/ejecuteService', async function (req, res) {

        console.group(`/ejecuteService (t)[${now()}]`.yellow());

        let needsRefresh = false;

        const requestBody = req.body;

        // Comprobación para Re-Asignación de IP y puerto al que enviar las llamadas RPC si el usuario cambia este campo a algo que no sea lo anterior
        if (serverAddress !== requestBody.hostname && requestBody.hostname !== null && requestBody.hostname !== undefined && requestBody.hostname !== "") {
            serverAddress = requestBody.hostname;
            needsRefresh = true;
        }
        if (grpcServerPort !== requestBody.port && requestBody.port !== null && requestBody.port !== undefined && requestBody.port !== "") {
            grpcServerPort = requestBody.port;
            needsRefresh = true;
        }

        //Refrescamos
        if (needsRefresh)
            grpcServices = await grpcHelpers.grpcs(PROTO_PATH, PROTO_PACKAGE, serverAddress, grpcServerPort);


        console.group(" [>>>>] Requested execution of service! ")
        console.log(requestBody);
        var objRequest = {}; // Contruimos los parámetros de la llamada remota
        var x = 0;


        //typeAtrb es el nombre del parámetro
        requestBody.typeAtrb.forEach(
            tipo => {
                let valorParam = req.body.nameAtrb[x];

                let tipoDeDatos = req.body["tipo"][x];
                // console.log("[@alreylz] TIPO DE DATOS!!! " + tipoDeDatos);

                switch (tipoDeDatos) {
                    case "int32":
                        valorParam = Number(valorParam);
                        break;
                    case "bool":
                        if (valorParam === "False" || valorParam === "false") valorParam = false;
                        // console.log("[@alreylz] detectado un tipo bool " + valorParam);
                        break;

                }

                objRequest[`${tipo}`] = valorParam;

                x++;
            })


        console.log("----------------");
        console.log(grpcServices);

        console.log("----------------");
        const grpcMethod = grpcServices['service' + requestBody.ServiceChoose];

        console.log(requestBody.ServiceChoose)

        console.log("GRPC METHOD!")
        console.log(grpcMethod);
        console.log(`[@alreylz]  Petición enviada:  `)
        console.log(objRequest);
        grpcMethod[`${requestBody.grpcChoose}`](
            objRequest,
            function (err, response) {
                if (err != null) {
                    console.log('SERVIDOR NO CONECTADO');
                    alert('SERVIDOR NO CONECTADO');
                    console.log(err);
                    alert(err.details);

                } else {
                    console.log("Error executing the grpc" + req.body.grpcChoose)
                    console.log(response);
                    console.log('Servidor:', response.message);
                    alert(response + response.message);
                    res.redirect('/ejecutar');
                }
            });
    }
);


/*
Ejecuta una grpc
 */
router.post('/ejecuteServicev2', async function (req, res) {

        console.group(`/ejecuteService (v2) (t)[${now()}]`.yellow());


        //necesito saber
        // - protofile que está siendo usada
        //  - nombre del servicio
        // - ip y puerto donde realizar rpc
        //parámetros 
        // console.log(req)

        const rqBody = req.body;
        console.dir(rqBody)

        const clientParams = {
            host: req.body.hostname,
            port: req.body.port,
            service: req.body.service,
            grpc: req.body.grpc,
            protofile: req.body.protofile,
            protoPackage: "testRoomScene",
            arguments: req.body.arguments

        }


        const protoPath = path.join(__dirname, "..", "..", "proto", "TestRoomScene.proto")


        // const stubMapGrpcServices = await grpcHelpers.loadProtofileToMap(protoPath, clientParams.protoPackage, clientParams.host, grpcServerPort = 50051);
        const stubMapGrpcServices = await grpcHelpers.loadProtofileToMap(protoPath, clientParams.protoPackage, clientParams.host, grpcServerPort = 50051);


        console.group(" [>>>>] Requested execution of service! ")
        console.log(stubMapGrpcServices);


        let objRequest = {}
        for (let argName in clientParams.arguments) {


            let valor = clientParams.arguments[`${argName}`].value;

            switch (clientParams.arguments[`${argName}`].dataType) {
                case "TYPE_INT32":
                    valor = Number(clientParams.arguments[`${argName}`].value);
                    break;
                case "TYPE_BOOL":
                    if (valor === "False" || valor === "false") valor = false;
                    console.log("[@alreylz] detectado un tipo bool " + valor);
                    break;

            }
            objRequest[`${argName}`] = valor;

        }


        // console.log(objRequest)

        // EJECUTAR EL SERVICIO
        // console.dir(stubMapGrpcServices[`${clientParams.service}`])


        // console.log(stubMapGrpcServices["serviceServiceLights"]);


        console.log("\nFUCKING HEEEELL\n".red())
        console.log(stubMapGrpcServices)


        stubMapGrpcServices[clientParams.grpc](
            objRequest,
            function (err, response) {
                if (err != null) {
                    console.log('SERVIDOR NO CONECTADO');
                    alert('SERVIDOR NO CONECTADO');
                    console.log(err);
                    alert(err.details);

                } else {
                    console.log("Error executing the grpc")
                    console.log(response);
                    console.log('Servidor:', response.message);
                    alert(response + response.message);
                    res.redirect('/ejecutar');
                }
            });


        res.status(200);
    }
)


function now() {

    const dateNow = new Date();

    return `${(dateNow).getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`;
}

module.exports = router;