/*
    View related endpoints (Server Side Rendering)
 */
const express = require('express');
const router = express.Router();


// MONGOOSE MODELS
const ModelService = require("../../Grpc/model/Service");
const ModelMessage = require("../../Grpc/model/Message");
const ModelRPC = require("../../Grpc/model/RPC");
const ModelGrpcPackage = require("../../Grpc/model/GrpcPackage");


const grpcHelpers = require("../../Grpc/grpcHelpers");
const {now} = require("../../shared/JSHelpers");

const notifier = require('node-notifier')


const path = require("path");
const {resolveInclude} = require("ejs");
const {UIStatusMessage} = require("../../shared/classes/UIStatusMessageNotificationSystem");
const {checkSession} = require("../../shared/middlewares/SessionFilter");
require("dotenv").config()

let serverAddress = process.env.HOSTNAME;
let grpcServerPort = `${process.env.GRPC_SERVER_PORT}`;


// TODO: ELIMINAR ESTO, SUSTITUIR POR SISTEMA DE NOTIFICACIONES
var servicio_creado = "";
var servicio_delete = "";
var message_delete = "";
var existe_service = false;





/**
 * @description Renders home page of the application
 */
router.get('/', async function (req, res) {
    res.render('inicio.ejs', {activeTab: "home-tab",
        session: req.session,
        statusMsg: req.session.status_msg});
});


/***
 * @description Renders the page that allows executing services
 */
router.get('/execute_services', checkSession,async function (req, res) {

    console.group(`/execute_services (t)[${now()}]`.yellow());
    try {

        //Tengo que extraer esta info de un archivo proto y pasarlo a la

        const servicios = [];
        const mensajes = [];


        res.render('execute_services.ejs', {
            activeTab: "execute-tab",
            session: req.session,
            servicios: servicios,
            messages: mensajes
        })

    } catch (e) {

        console.error(e.message)
        return res.status(500);
        console.groupEnd();

    }
    console.groupEnd();

});


/***
 * @description Renders the page that allows authoring RPCs according to the researcher needs
 */
router.get('/service_editor', checkSession,async function (req, res) {


    console.log(req.session)


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
        session: req.session,
        messages: allMessages,
        alert_service_create: servicio_creado,
        alert_service_existe: existe_service
    });
    servicio_creado = "";
    existe_service = false;

});



router.get("/package_editor", checkSession,async function (req, res) {


    const myMessages = await ModelMessage.find({user_id: req.session.user});
    const myServices = await ModelService.find({user_id: req.session.user});
    const myRpcs = await ModelRPC.find({user_id: req.session.user});



    res.render("crear_paquetes.ejs",
        {activeTab: "package-editor-tab",
        messages:myMessages,
        services:myServices,
        rpcs:myRpcs,
        statusMsg: req.session.status_msg,
        alert_service_create: "FUCK YOU",
        alert_service_existe: "KHE",
        session: req.session})



});




/***
 * @description Renders the page that displays all the services that have been created
 */
router.get('/services', checkSession, async function (req, res) {

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
            session: req.session,
            servicios: allServices,
            alert_service_delete: servicio_delete
        });
        servicio_delete = null;

        console.groupEnd();
    }
);

/***
 * @description Renders the page that displays all the messages that have been created
 */
router.get('/messages', checkSession,async function (req, res) {

    console.group(`/messages (t)[${now()}]`.yellow());

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
        session: req.session,
        messages: allMessages,
        alert_message_delete: message_delete
    })

    console.groupEnd()
});


/***
 * @description Shows all packages created by a user in a view
 */
router.get('/packages', checkSession,async function (req, res) {

    console.group(`USER REQUESTED /packages (t)[${now()}]`.yellow());
    const allPackagesByLoggedUser = await ModelGrpcPackage.find({user_id: req.session.user})
    console.log(allPackagesByLoggedUser);
    debugger;



    res.render('mostrar_packages', {
        activeTab: "show-packages-tab",
        session: req.session,
        packages: allPackagesByLoggedUser
    })
    console.groupEnd();


});



router.get("/cameras", checkSession, async function (req, res) {

    const ENV = {ip: process.env.SERVER_ADDRESS, port: process.env.WEBSOCKET_SERVER_PORT, autoConnectLocal: true}


    console.log(req.session)


    res.render("cameras.ejs", {activeTab: "cameras", session: req.session, ENV})

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
                    notifier.notify({title: "Application says", message: "SERVIDOR NO CONECTADO"});
                    console.log(err);
                    notifier.notify({title: "Application says", message: err.details});

                }
                else {
                    console.log("Error executing the grpc" + req.body.grpcChoose)
                    console.log(response);
                    console.log('Servidor:', response.message);
                    notifier.notify({title: "Application says", message: response.message}); // todo: delete probablemente
                    res.redirect('/ejecutar');
                }
            });
    }
);


module.exports = router;