//
// General utils
//
module.exports = {execInSecs: execInSecsPromise, executeEveryNSecs: setIntervalPromise,
    getApplicationRoot,
    isString,
    getIPAddress}


/***
 * Promise based wrapper of setTimeout()
 * @param delaySecs - delay in seconds
 * @param func - the name of a function of a lambda expression
 * @returns {Promise<unknown>}
 */
async function execInSecsPromise(delaySecs, func) {
    return new Promise(
        (resolve, reject) => {
            setTimeout(() => {
                    try {
                        resolve(func());

                    } catch (error) {
                        console.log("error " + error)
                        reject();
                    }
                }
                ,
                delaySecs * 1000
            )

        }
    )
        ;
}


/*
* Promise based wrapper of setInterval()
 */
async function setIntervalPromise(delaySecs, stopCond, func) {
    return new Promise(
        (resolve, reject) => {
            setInterval(() => {
                    try {
                        if (stopCond === true) {
                            resolve(func())
                        }


                    } catch (error) {
                        console.log("error " + error)
                        reject();
                    }
                }
                ,
                delaySecs * 1000
            )

        }
    );
}


const path = require("path");
const fs = require("fs");


let APPLICATION_ROOT = undefined;


/**
 * Función que devuelve la ruta de la carpeta raíz de la aplicación, para simplificar el acceso relativo a archivos en la aplicación
 * @returns {string}
 */
function getApplicationRoot() {

    if (APPLICATION_ROOT === undefined) {
        APPLICATION_ROOT = appRootByFindFile() || appRootByAssumeFromSharedFolder() || appRootFromIndexJs();
        console.log(`APPLICATION_ROOT = ${APPLICATION_ROOT}`);
    }

    return APPLICATION_ROOT;

}






// ***********************************************************************
// Formas diferente de obtener la ruta de la carpeta raíz de la aplicación
// ***********************************************************************


function appRootByAssumeFromSharedFolder() {
    return path.join(__dirname, "../", "../");
}
function appRootByFindFile(file = "package.json") {
    let currentDir = __dirname;
    while(!fs.existsSync(path.join(currentDir, file))) {
        currentDir = path.join(currentDir, '..')
    }
    return currentDir;
}
function appRootFromIndexJs(){
    return require.main.path || require.main.filename;
}

let os =require("os")

// Aux function to get my IPs
function getIPAddress() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4') {
                addresses.push(address.address);
            }
        }
    }
    return addresses;
}









function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]"
}