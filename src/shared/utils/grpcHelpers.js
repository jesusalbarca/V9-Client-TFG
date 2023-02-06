let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader');
const fs = require("fs");
const fetch = require("node-fetch");

require("dotenv").config()


module.exports = {
    deleteProtofile,
    createProtoDirIfDoesNotExist,
    protoDirExists,
    writeProtocHeaders,
    genServicesSyntaxInProtoFile,
    generateSintax,
    grpcs: genAdressedStubMapFromProtofile,
    loadProtofileToMap,
    loadProtofileToDescription

}


/***
 * Elimina un archivo (en este caso un archivo .proto) cuya ruta se pasa por parámetro
 * @param protoPath - ruta absoluta del archivo a elminar
 * @returns {Promise<unknown>}
 */
async function deleteProtofile(protoPath) {

    return new Promise(async (resolve, reject) => {

        // Elimina el archivo.proto que ya existe
        try {

            let stat = await checkFileExists(protoPath);
            if (stat) {
                let result = await fs.promises.unlink(protoPath);
                console.log(`Successfully deleted file ${protoPath}`);
            }
            console.log(".proto file does not exist, creating from scratch")
            resolve();
        } catch (error) {
            console.error(`Error in deleteProtofile(${protoPath}) ${error.message}`);
            reject();
        }

    })
}


function checkFileExists(file) {
    return fs.promises.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

/***
 * Crea un directorio /proto dentro del directorio especificado
 * @returns {Promise<unknown>}
 */
async function createProtoDirIfDoesNotExist(basePath = undefined) {
    return new Promise((resolve, reject) => {

        //Si no se pasa una path correcta, se genera el directorio en el directorio donde se encuentra este script
        if (basePath === undefined || basePath === null || basePath === "") {
            basePath = __dirname;
        }

        //Crea el directorio donde trabajar con archivos .proto
        var Q_SAVEPATH = "proto";

        fs.promises.mkdir(`${basePath}/${Q_SAVEPATH}`, {recursive: true})
            .then(() => {
                console.log("[DIR INIT] Success on initialising the persistency directories for gRPC (/proto) : " + `${basePath}/${Q_SAVEPATH}`)
                resolve();
            })
            .catch(() => {
                console.error("[ERROR] Something went wrong initialising directory : " + `${basePath}/${Q_SAVEPATH}`)
                reject();
            });
    });
}


/**
 * Returns true if a /proto folder exists already within the specified directory
 * @param basePath - the directory to search for /proto
 * @returns {Promise<boolean>}
 */
async function protoDirExists(basePath = undefined) {

    if (basePath === undefined || basePath === null || basePath === "") {
        basePath = __dirname;
    }

    try {
        let fileInfo = await fs.promises.stat(`${basePath}/proto`);
        console.log(fileInfo);
        return true;
    } catch (e) {
        console.error(`[ERROR] ProtoDirExists() : ${e}`);
        return false;
    }
}

/**
 * Writes the file headers into a .proto file
 * @param filePath - full path to the .proto file to write into
 * @param packageName - package name for the set of grpc services to be defined in the file (Translates into the namespace in other programming languages)
 * @returns {Promise<unknown>}
 */
async function writeProtocHeaders(filePath, packageName) {

    return new Promise((resolve, reject) => {
            //Crea un archivo con la cabecera necesaria para el archivo .proto
            let protoHeader = `
        syntax = "proto3";\npackage ${packageName};\n`;
            fs.appendFile(filePath, protoHeader,
                (err) => {
                    if (err) {
                        console.error(`[ERROR] writeProtocHeaders() ${err}`)
                        reject();
                    }
                    console.log(`Proto header inserted in file ${filePath}`);
                    resolve();
                });
        }
    );
}


/* Writes a .proto file from the services currently in the database */

async function genServicesSyntaxInProtoFile(protoPath) {


    return new Promise((resolve, reject) => {
        const services_mongo = fetch('http://localhost:3000/get/allServices');

        services_mongo.then(datos => datos.json())
            .then(
                datos => {
                    // We generate the syntax for all Services, with their associated rpcs
                    datos.forEach(
                        service => {
                            const syntaxServiceBegin = 'service ' + service.name + ' { \n';
                            let syntaxAllServiceRpcs = '';
                            service.grpcs.forEach(grpc => {
                                let SyntaxOneRpc = '  rpc ' + grpc.name + ' (' + grpc.request + ') ' + 'returns ' + '(' + grpc.reply + ') ' + ' {}\n';
                                syntaxAllServiceRpcs = syntaxAllServiceRpcs + SyntaxOneRpc;
                            });
                            const syntaxServiceEnd = '} \n';
                            const syntaxAService = syntaxServiceBegin + syntaxAllServiceRpcs + syntaxServiceEnd;


                            fs.appendFile(protoPath, syntaxAService, (err) => {
                                if (err) {
                                    throw err;
                                    reject();
                                }
                                console.log(`
        Servicio
        '${service.name}'
        añadido
        en ${protoPath}
        de
        mongodb`);
                                resolve();
                            });

                        });

                })
    })
}


async function commitDBToProto(savePath, filename) {


    const services_mongo = await fetch('http://localhost:3000/get/allServices');

    for (const service in services_mongo) {

        let syntaxAllServiceRpcs = '';
        service.grpcs.forEach(grpc => {
            let SyntaxOneRpc = ` rpc ${grpc.name} (${grpc.request}) returns (${grpc.reply}) {}\n`;
            syntaxAllServiceRpcs += SyntaxOneRpc;
        });

        const syntaxServiceProtoFile = `service ${service.name} { \n ${syntaxAllServiceRpcs} }\n\n`;

        try {
            await fs.promises.appendFile(savePath, syntaxServiceProtoFile);
        } catch (e) {
            console.log(`Error writing service ${service} to .proto file '${filename}`.red())
        }

    }
}


//This fills the .proto file with all of the message definitions generated and saved in the database.
async function genMessageSyntaxInProtoFile(protoPath) {

    return new Promise((resolve, reject) => {

        const messages_mongo = fetch('http://localhost:3000/get/allMessages');

        messages_mongo
            .then(datos => datos.json())
            .then(datos => {
                // Generate the syntax for all of the messages and write it to a file
                datos.forEach(
                    message => {
                        const syntaxMessageBegin = 'message ' + message.name + ' {\n'; // -> Opens the definition of a message using the proto3 format
                        let syntaxFields = ''; // -> Grows with the definition of new fields within a message
                        let inc = 1; // -> The number that goes along each message element, used for deserialization

                        // Generate the fields line by line
                        message.types.forEach(
                            grpcField => {
                                /* We prepare a line of the file (e.g.  string identifier = 1; ) */
                                const aFieldDefinitionLine = grpcField.tipo + ' ' + grpcField.typename + ' = ' + inc + '; \n';
                                syntaxFields = syntaxFields + aFieldDefinitionLine;
                                inc++;
                            })
                        const syntaxEnd = '} \n';

                        // Aggregate whole message and write it to file
                        let syntaxMessage = syntaxMessageBegin + syntaxFields + syntaxEnd;
                        fs.appendFile(protoPath, syntaxMessage, (err) => {
                            if (err) {
                                throw err;
                                reject();
                            }

                            console.log(`
            Message
            '${message.name}'
            añadido
            en ${protoPath}
            de
            mongodb`.green());
                            resolve();
                        });
                    });


                // setTimeout(() => {
                //     var file_descriptor = fs.openSync(protoPath);
                //     fs.close(file_descriptor, (err) => {
                //         if (err)
                //             console.error('Failed to close file', err);
                //         else {
                //             console.log("\n> File Closed successfully");
                //         }
                //     });
                //     resolve();
                // }, 5000);
            });
    })
}


// Streamlined .proto file management
// -> Elimina el proto
// -> Escribe servicios
// -> Escribe mensajes
// -> Crea el stub desde el archivo
async function generateSintax(protoPath) {


    await createProtoDirIfDoesNotExist()


    console.log("STEP 0 -".yellow() + `
            Executing
            delete_protofile()`.cyan());
    await deleteProtofile(protoPath);

    console.log("STEP 1 -".yellow() + `
            Executing
            writeProtocHeaders()`.cyan());
    await writeProtocHeaders(protoPath, process.env.DEFAULT_PROTO_PACKAGE)


    console.log("STEP 2 -".yellow() + `
            Executing
            genServicesSyntaxInProtoFile()`.cyan());
    await genServicesSyntaxInProtoFile(protoPath);

    console.log("STEP 3 -".yellow() + `
            Executing
            genMessageSyntaxInProtoFile()`.cyan());
    await genMessageSyntaxInProtoFile(protoPath);

    console.log("STEP 4 -".yellow() + `
            Executing
            grpcs()`.cyan());
    await genAdressedStubMapFromProtofile(protoPath, process.env.DEFAULT_PROTO_PACKAGE,);

    console.log("[DONE] generateSintax -".yellow());

}


/***
 * Dado un archivo .proto correctamente generado, crea los STUBs de grpc para poder realizar las llamadas a procedimiento remoto y las mete en un mapa
 * @param protoFilePath - la ruta al archivo .proto del cual generar los stubs
 * @param protoPackageToLoad - nombre del paquete de grpc -> namespace en otros lenguajes
 * @param grpcServerAddress - hostname o ip en la que está ejecutando el servidor grpc
 * @param grpcServerPort - puerto en el que se está ejecutando el servidor remoto de grpc
 * @returns {Promise<Map>} Devuelve un mapa que contiene todos los stubs generados que permiten la ejecución de los comandos remotos.
 */
async function genAdressedStubMapFromProtofile(protoFilePath, protoPackageToLoad, grpcServerAddress, grpcServerPort = 50051) {

    return new Promise(async (resolve, reject) => {


        let grpcServices = new Map(); //Map of stubs


        try {

            //Carga el archivo .proto (No sé qué hacen estas opciones)
            var packageDefinition = protoLoader.loadSync(
                protoFilePath,
                {
                    keepCase: true,
                    longs: String,
                    enums: String,
                    defaults: true,
                    oneofs: true
                });

            // Carga las definiciones del archivo .proto como una jerarquía de objetos
            let grpcObjectHierarchy = grpc.loadPackageDefinition(packageDefinition)[`${protoPackageToLoad}`];


            // HERE
            let services_mongo = await (await fetch('http://localhost:3000/get/allServices')).json();
            // console.log(services_mongo)
            await services_mongo.forEach(
                service => {
                    console.log("Creando stub de servicio " + service.name + ", " + `${grpcServerAddress}
        :${grpcServerPort}
            `)
                    // Creamos un stub para cada servicio y lo guardamos en un mapa para luego poder ejecutar las funciones por nombre.
                    grpcServices['service' + service.name] =
                        new grpcObjectHierarchy[`${service.name}`](`${grpcServerAddress}
        :${grpcServerPort}
            `, grpc.credentials.createInsecure() /*Actualmente no usamos ningún tipo de autenticación para las llamadas*/);
                });

            console.group("-----------------\nGRPC Services\n-----------------".yellow())
            console.dir(grpcServices);
            console.groupEnd();
            resolve(grpcServices);

        } catch (error) {
            console.log(`
            ERROR in grpcs()
        : ${error}
            `.red())
            reject(grpcServices);
        }


    });
}


async function loadProtofileToMap(protoFilePath, protoPackageToLoad, grpcServerAddress, grpcServerPort = 50051) {


    console.group("loadProtofileToMap() ".blue())


    let grpcServices = new Map(); //Map of stubs

    try {
        //Carga el archivo .proto (No sé qué hacen estas opciones)
        let packageDefinition = protoLoader.loadSync(
            protoFilePath,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

        // console.log(packageDefinition)

        // const protoPackageDefinition = grpc.loadPackageDefinition(packageDefinition);
        // let aPackage = protoPackageDefinition[protoPackageToLoad];
        // let construc = grpc.loadPackageDefinition(packageDefinition)[protoPackageToLoad];


        // let grpcObjectHierarchy = grpc.loadPackageDefinition(packageDefinition)[`${protoPackageToLoad}`];

        const AService = grpc.loadPackageDefinition(packageDefinition)[`${protoPackageToLoad}`].ServiceLights;

        console.log(AService)
        const client = new AService(
            `${grpcServerAddress}:${grpcServerPort}`,
            grpc.credentials.createInsecure()
        );
        // LOOKING FOR SERVICES in the package
        // for (let k of Object.keys(aPackage)) {
        //
        //     const potentialService = aPackage[`${k}`];
        //     // console.log(k)
        //
        //     if ('service' in potentialService) {
        //         // grpcServices[potentialService.serviceName] =
        //         //     new aPackage[`${potentialService.serviceName}`](`${grpcServerAddress}:${grpcServerPort}`, grpc.credentials.createInsecure());
        //         // grpcServices[potentialService.serviceName] =
        //         //     new construc(`${grpcServerAddress}:${grpcServerPort}`, grpc.credentials.createInsecure());
        //
        //         grpcServices['service' + potentialService.serviceName] =  await new aPackage[`${potentialService.serviceName}`](`${grpcServerAddress}:${grpcServerPort}`, grpc.credentials.createInsecure() /*Actualmente no usamos ningún tipo de autenticación para las llamadas*/);
        //
        //
        //         console.log(`${potentialService} is a Service`.blue());
        //         // console.log(potentialService);
        //     }
        //     // else {
        //     //     console.log(potentialService + "".red())
        //     //     console.log(potentialService + "is a Message")
        //     // }


        // }

        return client;

        // Creamos un stub para cada servicio y lo guardamos en un mapa para luego poder ejecutar las funciones por nombre.
        // grpcServices['service' + service.name] = new grpcObjectHierarchy[`${service.name}`](`${grpcServerAddress}:${grpcServerPort}`, grpc.credentials.createInsecure() /*Actualmente no usamos ningún tipo de autenticación para las llamadas*/);
    } catch
        (e) {

        console.error(`Error in loadProtofileToMap ${e.message}`.red())
        console.groupEnd();
    }

    console.groupEnd();
    return null;
}


async function loadProtofileToDescription(protoFilePath, protoPackageToLoad) {

    let grpcElements = {};
    grpcElements.services = {}
    grpcElements.messages = {}


    try {
        //Carga el archivo .proto (No sé qué hacen estas opciones)
        var packageDefinition = protoLoader.loadSync(
            protoFilePath,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });


        let protoPackageDefinition = grpc.loadPackageDefinition(packageDefinition);


        let protoPackageElems = protoPackageDefinition[protoPackageToLoad];


        for (let [k, entry] of Object.entries(protoPackageElems)) {

            const protoDescElement = entry;
            // console.log(k)

            if ('service' in protoDescElement) {

                console.log(`Found a service '${protoDescElement} in ${protoFilePath}`.yellow());
                for (let [sName, value] of Object.entries(protoDescElement.service)) {
                    console.log(sName)
                    grpcElements.services[sName] = value;

                    purgeObjectFromKey("fileDescriptorProtos", grpcElements.services[sName])


                }
            } else {
                console.log(`Found a message '${protoDescElement} in ${protoFilePath}`.magenta());
                // grpcElements.messages.push(potentialService)
                grpcElements.messages[k] = entry;
            }


        }

        //
        // grpcElements.services = Object.entries(grpc.services).map(([name, obj]) => ({name, ...obj}))


        // Carga las definiciones del archivo .proto como una jerarquía de objetos
        // let grpcObjectHierarchy = grpc.loadPackageDefinition(packageDefinition)[`${protoPackageToLoad}`];


        // Creamos un stub para cada servicio y lo guardamos en un mapa para luego poder ejecutar las funciones por nombre.
        // grpcServices['service' + service.name] = new grpcObjectHierarchy[`${service.name}`](`${grpcServerAddress}:${grpcServerPort}`, grpc.credentials.createInsecure() /*Actualmente no usamos ningún tipo de autenticación para las llamadas*/);
    } catch
        (e) {

        console.error(e.message)
    }

    return grpcElements;
}


function purgeObjectFromKey(purgeKey, obj) {


    for (let [k, v] of Object.entries(obj)) {
        if (types.get(v) === types.object) {
            if (purgeKey in v) {
                console.log(` found '${purgeKey}¡ key in ` + v);
                delete v[purgeKey];
            }
        }
    }


}


var types = {
    'get': function (prop) {
        return Object.prototype.toString.call(prop);
    },
    'null': '[object Null]',
    'object': '[object Object]',
    'array': '[object Array]',
    'string': '[object String]',
    'boolean': '[object Boolean]',
    'number': '[object Number]',
    'date': '[object Date]',
}