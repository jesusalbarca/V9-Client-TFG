const endpoint = "http://localhost:3000";
const restEndpoint = endpoint + "/rest";


// Executes main when the page fully loads
window.addEventListener("load", async (event) => {
    console.log("page is fully loaded");
    await main();
});


/*
    MAIN FUNCTION
 */

async function main() {

    console.log("Ejecutando cosa.js main()")

    // Load all existing protofiles (from REST API) to allow selection of those.
    await LoadAvailableProtosAsDropdownOptions();

    //Subscribe on click to load all the grpc definitions
    document.getElementById("proto-load-btn").addEventListener("click",
        async function (event) {
            event.preventDefault();
            await getGrpcTypesAndGenerateCallerDivs();
        })


    await ShowAvailableDevices();


}


async function getGrpcTypesAndGenerateCallerDivs() {


    let protoFileSelected = document.querySelector("select[name='protofile']").value;

    console.log(protoFileSelected);
    let endpointUrl = "http://localhost:3000/def/packages/";

    let response = await GetRequestAsync(endpointUrl + protoFileSelected)


    let parsedJSON = JSON.parse(response);
    console.log(`PACKAGE DEFINITION FOR PROTO FILE ${protoFileSelected}: `);
    console.log(parsedJSON)

    // console.log(parsedJSON.messages)


    const mainDiv = document.querySelector("#div_principal");

    // Refresh main div that allows executing Grpcs
    mainDiv.innerHTML = "";
    mainDiv.innerHTML += ` <header> <h2> Active grpc Definition <span class="proto-file-display">${protoFileSelected}</span>  </h2> </header>`;


    mainDiv.innerHTML += `
<form name='grpcTargetHost'> 
        <label> IP</label>
<!--        <input type="text" name="ip"/>-->
        <select name="ip">
        
       </select>
        <label>Listening Port</label>
                <input type="text" name="port" value="50051"/>
 </form>

<form name='proto-aux-info'>




</form>

`

    //Cada vez que ejecuto una grpc, necesito :
    // (1) el nombre de la protofile que define las llamadas,
    // (2) el nombre del paquete donde se encuentra la rpc ejecutar y
    // (3) el nombre del servicio en el que se define la grpc actual.


    // Generate a div for each service allowing to execute a grpc
    for (let [k, v] of Object.entries(parsedJSON.services)) {
        // const Handlebars = require("handlebars");
        let serviceTemplate = document.querySelector("#service-template").innerHTML;

        Handlebars.registerHelper('eq', (a, b) => a === b)
        let compiledTemplate = Handlebars.compile(serviceTemplate);


        let service = {
            name: k,
            arguments: v.requestType.type.field
        }

        console.log(service)

        // console.log(v)
        let html = compiledTemplate(service);

        // console.log("REQUEST TYPE")
        // console.log(v.requestType)
        // console.log("RESPONSE TYPE")
        // console.log(v.responseType)


        mainDiv.innerHTML += html;
    }


}
;


async function ExecuteGrpc(elem, name) {

    console.log("will execute Grpc" + name)


    //(previous version)
    // let ip = document.querySelector("input[name='ip']").value;

    let ip = document.querySelector("select[name='ip']").value; // Extract the target host that will execute the function.
    let port = document.querySelector("input[name='port']").value; // Extract the port the server is listening on.


    let grpc = elem.form.getAttribute("name");


    //Search and generate all data parameters
    let fields = elem.form.querySelectorAll("input");
    console.dir(fields);


    //ip change
    ip = "localhost";

    //port
    port = "50051";



    const requestBody = {
        host: ip,
        port: port,
        service: "ServiceLights",
        grpc: grpc,
        protofile: "TestRoomScene.proto",
        protoPackage: "testRoomScene",
        arguments: {}
    }


    for (let inputField of fields) {
        // console.log(inputField)


        let argValue = inputField.value;

        if (inputField.type === 'checkbox') {
            argValue = inputField.checked;
        }


        requestBody.arguments[`${inputField.getAttribute("data-name")}`] = {
            dataType: inputField.getAttribute("data-type"),
            value: argValue
            // console.log(inputField.getAttribute("data-type"));
            // console.log(inputField.getAttribute("data-name"));
            // console.log(inputField.getAttribute("value"));
        }
    }


    console.log(requestBody)

    let response = await PostRequestAsyncJson("/ejecuteServicev2", requestBody);


    console.log(name + "clicked")


}


/*
    LoadAvailableProtosAsDropdownOptions:
    Calls a REST API to get which are the available protofiles to allow the user to select one to load.

 */
async function LoadAvailableProtosAsDropdownOptions() {
    let response = await GetExistingProtofilesInServer();
    console.log(response);
    let htmlOptions = "<option value='null' disabled > Choose a value </option>";

    for (let pFile of response) {
        htmlOptions += ` <option value = '${pFile}' > ${pFile} </option>`;
    }

    document.querySelector("select[name='protofile']").innerHTML = htmlOptions;
}
;


/* ShowAvailableDevices:  REST API call to get all available protofiles */
async function ShowAvailableDevices() {

    const devices = JSON.parse(await GetRequestAsync("/devices"));


    let ipOptField = document.querySelector("select[name$=ip]")


    for (let [k, v] of Object.entries(devices)) {
        console.log(`${k} -> ${v.ips_device}`)
        ipOptField.innerHTML = `<option value="${v.ips_device}">${k} @ ${v.ips_device}  </option>`
    }


    console.log("SHOWING CONNECTED DEVICES INFO")
    console.log(devices)
}



/**
 * @description Calls a REST API to get all proto definitions available in the server created by the user.
 * @returns {Promise<any>}
 * @constructor
 */
async function GetExistingProtofilesInServer() {
    try {
        const response = await GetRequestAsync("http://localhost:3000/protos");
        return JSON.parse(response);
    } catch (e) {
        console.error(e);
    }
}

//REQUEST TYPES
// xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//             xhttp.setRequestHeader('Content-type', 'application/json');
//             xhttp.setRequestHeader('Content-type', 'text/plain');
//             xhttp.setRequestHeader('Content-type', 'multipart/form-data');


let timer = setInterval(ShowAvailableDevices, 1000);

// clearInterval(timer)


/* Helper functions */


//MOVED TO SHARED CLASS TODO: REMOVE
async function PostRequestAsyncJson(url, bodyObj) {
    return new Promise(function (resolve, reject) {

        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhttp.responseText);
            } else {
                reject({
                    status: this.status,
                    statusText: xhttp.statusText
                });
            }

        }

        xhttp.onerror = function () {
            reject({
                status: this.status,
                statusText: xhttp.statusText
            });
        }

        xhttp.send(JSON.stringify(bodyObj));

    })
}


async function GetRequestAsync(url) {

    return new Promise(function (resolve, reject) {

        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);

        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhttp.responseText);
            } else {
                reject({
                    status: this.status,
                    statusText: xhttp.statusText
                });
            }

        }

        xhttp.onerror = function () {
            reject({
                status: this.status,
                statusText: xhttp.statusText
            });
        }

        xhttp.send();

    })
};
