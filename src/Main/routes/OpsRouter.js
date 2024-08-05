// ENDPOINT OPERACIONES
// MÉTODO INSERTAR SERVICIO
const ModelMessage = require("../../Grpc/model/Message");
const ModelService = require("../../Grpc/model/Service");
const ModelRPC = require("../../Grpc/model/RPC");

const path = require("path");
const grpcHelpers = require("../../Grpc/grpcHelpers");
const notifier = require("node-notifier");


const router = require("express").Router();

const {now} = require("../../shared/JSHelpers");
const {checkSession} = require("../../shared/middlewares/SessionFilter");


/***
 * @description Endpoint al que los usuarios llaman cuando quieren crear un nuevo servicio (conjunto de rpcs)
 */
router.post('/create_service', async function (req, res) {

    console.group(`User action CREATE_SERVICE [${now()}]`.yellow());

    console.log(`Form data:`.yellow());
    console.log(req.body);


    debugger;


    //Lista de funciones asociadas al servicio definido
    let grpcs = [];


    // Recorro el array de datos de entrada (el formulario) para extraer los datos de la RPC a crear
    for (let i = 0; i < req.body.array.length; i = i + 3) {

        const rpcName = req.body.array[i];
        const requestDataTypeName = req.body.array[i + 1];
        const replyDataTypeName = req.body.array[i + 2];

        const requestType = await ModelMessage.findOne({messageName: requestDataTypeName});
        const replyType = await ModelMessage.findOne({messageName: replyDataTypeName});


        console.log(requestType)
        console.log(replyType)


        // const grpc = {"name": rpcName, "request": requestDataType, "reply": replyDataType};
        const grpc = {
            rpcName: rpcName,
            argsType: requestType,
            returnType: replyType,
            user_id: req.session.user
        };
        grpcs.push(grpc);
        debugger;
    }

    const GRPC = require("../../Grpc/model/RPC");

    console.log(grpcs);
    let insertedGrpcs = await GRPC.insertMany(grpcs);
    console.log(insertedGrpcs);
    debugger;


    // Crear servicio
    const grpcServiceName = req.body.name;

    let allGrpcServices = null;

    try {
        allGrpcServices = await ModelService.find({name: grpcServiceName});

        //There is no grpc with the same name already
        if (allGrpcServices.length == 0) {
            const newService = new ModelService({
                name: grpcServiceName,
                grpcs: grpcs,
                user_id: req.session.user
            });

            const savedService = await newService.save();

            console.log(`Creado el servicio grpc ${savedService}`);

            req.session.statusMsg = "Hola creado el servicio";
            servicio_creado = grpcServiceName;


        }
        else  //The
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


    return res.redirect('/service_editor');
})


/***
 * TODO: SEPARAR EL PROCESO DE CREAR RPCS y servicios
 */
router.post('/create_rpc', checkSession, async function (req, res) {

    console.group(`User action CREATE RPC [${now()}]`.yellow());

    console.log(`Form data:`.yellow());
    console.log(req.body);

    const newGrpc = new ModelRPC({
        rpcName: req.body.name,
        argsType: await ModelMessage.findOne({messageName: req.body.requestMessageType}),
        returnType: await ModelMessage.findOne({messageName: req.body.replyMessageType}),
        user_id: req.session.user
    });


    try {
        const allExistingRpcs = await ModelRPC.find({rpcName: newGrpc.rpcName});


        console.log(allExistingRpcs)
        debugger;


        //There is no grpc with the same name already
        if (allExistingRpcs.length === 0) {


            let savedRPC = newGrpc.save();

            console.log(newGrpc)
            debugger;
            console.log(`Creada la grpc ${savedRPC}`);

            servicio_creado = savedRPC.rpcName;


        }
        else  //The
        {
            console.log(`El servicio grpc '${newGrpc.rpcName}' ya existe, elige otro nombre para el servicio`.red());
            existe_service = newGrpc.rpcName;
        }

    } catch (e) {
        console.error(e)
        res.redirect("/error")
    }

    return res.redirect('/service_editor');


})
;


router.post("/create_message_v2", async function (req, res) {
        console.group(`User action CREATE_MESSAGE V2 [${now()}]`.yellow());


        if (!"messageFieldsInfo" in req.body || !"messageName" in req.body) {
            console.error("No se ha provisto de la información necesaria para crear un mensaje.");
            return res.status(500).json({
                msg: 'Error al crear servicio'
            });
        }


        // contiene el tipo de datos y el nombre del campo a crear que ha especificado el usuario en el formulario
        const arrayOfFields = req.body.messageFieldsInfo;


        const newMessageName = req.body.messageName;
        let newMessageFields = [];
        //Extract the field types and their name from the form data
        for (let i = 0; i < arrayOfFields.length; i = i + 2) {
            const field = {
                dataType: arrayOfFields[i],
                dataName: arrayOfFields[i + 1]
            };


            // Check if datatype is not a "native type"
            //TODO: avoid this being hardcoded
            if (field.dataType != "int32" && field.dataType != "bool" && field.dataType != "string") {
                const fullNestedDatatypeDesc = await ModelMessage.find({"messageName": field.dataType});
                field.dataType = fullNestedDatatypeDesc;

                console.log("NESTED DATATYPE DETECTED IN MESSAGE DESCRIPTION", fullNestedDatatypeDesc)
                debugger;
            }


            newMessageFields.push(field)
        }

        // Construct the final message object and associate a user to it (author)
        const nuMessage = new ModelMessage({
            messageName: newMessageName,
            messageFields: newMessageFields,
            user_id: req.session.user
        });


        // Save message to BBDD
        try {
            console.info(nuMessage)
            const savedMessage = await nuMessage.save()
            res.redirect('/service_editor');
        } catch (e) {
            console.error(e)
            console.groupEnd();
            return res.status(500).json({
                msg: 'Error al crear message'
            });
        }
        console.groupEnd();

    }
)
;


/**
 * @description Endpoint al que los usuarios llaman cuando han rellenado los campos del formulario de crear mensaje para crear un nuevo mensaje
 */
router.post('/create_message', async function (req, res) {

    console.group(`User action CREATE_MESSAGE [${now()}]`.yellow());


    const newMessageName = req.body.nameType;
    let nuMessageFields = [];

    //Extract the field types and their name from the form data
    for (let i = 0; i < req.body.array.length; i = i + 2) {
        const field = {dataType: req.body.array[i], dataName: req.body.array[i + 1]};
        nuMessageFields.push(field)
    }

    // Construct the final message object and associate a user to it (author)
    const nuMessage = new ModelMessage({
        messageName: newMessageName,
        messageFields: nuMessageFields,
        user_id: req.session.user
    });

    // Save message to BBDD
    try {
        console.info(nuMessage)
        const savedMessage = await nuMessage.save()
        res.redirect('/service_editor');
    } catch (e) {
        console.error(e)
        console.groupEnd();
        return res.status(500).json({
            msg: 'Error al crear servicio'
        });
    }
    console.groupEnd();

});


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
            host: req.body.host,
            port: req.body.port,
            service: req.body.service,
            grpc: req.body.grpc,
            protofile: req.body.protofile,
            protoPackage: "testRoomScene",
            arguments: req.body.arguments
        }

        const protoPath = path.join(__dirname, "..", "..", "..", "proto", "TestRoomScene.proto")


        // const stubMapGrpcServices = await grpcHelpers.loadProtofileToMap(protoPath, clientParams.protoPackage, clientParams.host, grpcServerPort = 50051);
        const stubMapGrpcServices = await grpcHelpers.loadProtofileToMap(protoPath, clientParams.protoPackage, clientParams.host, clientParams.port);


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


        //EXECUTE

        stubMapGrpcServices[clientParams.grpc](
            objRequest,
            function (err, response) {
                if (err != null) {
                    console.log("⚠ SERVER NOT CONENCTED");
                    notifier.notify({title: "Application says", message: ' ⚠ SERVER NOT CONNECTED'});
                    console.log(err.details);


                }

                if (!err) {

                    console.log(`✅ EXECUTED GRPC `.green());
                    console.dir(response);

                    let msg = "";

                    for (let [key, val] of Object.entries(response)) {
                        msg += `${key}: ${val}\n`
                    }

                    notifier.notify({title: "Application says", message: msg});

                }
            });


        res.status(200);
    }
)


module.exports = router;