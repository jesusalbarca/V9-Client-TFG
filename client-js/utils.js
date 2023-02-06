// Executes main when the page fully loads
window.addEventListener("load", async (event) => {
    console.log("page is fully loaded");
    await main();
});


async function main() {

    // document.querySelector("#proto-load-btn")
    console.log("Ejecutando utils.js main()")

    // load all existing protofiles to allow selection of those.
    async function loadAvailableProtosAsDropdownOptions() {

        let response = await getExistingProtofiles();
        console.log(response);
        let htmlOptions = "<option value='null' disabled > Choose a value </option>";

        for (let pFile of response) {
            htmlOptions += `<option value='${pFile}' > ${pFile} </option>`;
        }
        document.querySelector("select[name='protofile']").innerHTML = htmlOptions;


    };
    await loadAvailableProtosAsDropdownOptions();


    //Subscribe on click to load all the grpc definitions

    document.getElementById("proto-load-btn").addEventListener("click", async function (event) {
        event.preventDefault();

        await getGrpcTypesAndGenerateCallerDivs();

    })
}


// XMLHttpRequest is the object we use to perform HttpRequests in Javascript
// const xhttp = new XMLHttpRequest();


//To be performed when the request gets a response
// xhttp.onreadystatechange =


function getExistingProtofiles() {

    return new Promise(function (resolve, reject) {

        console.log("executing getExisting protofiles")
        const xhttp = new XMLHttpRequest();
        let url = "http://localhost:3000/protos";
        xhttp.open("GET", url, true);

        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhttp.responseText));
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


    });
}


async function getGrpcTypesAndGenerateCallerDivs() {


    let protoFileSelected = document.querySelector("select[name='protofile']").value;

    console.log(protoFileSelected);
    let endpointUrl = "http://localhost:3000/def/packages/";

    let response = await GetRequestAsync(endpointUrl + protoFileSelected)


    let parsedJSON = JSON.parse(response);

    console.log(parsedJSON.messages)
    // console.log(parsedJSON)


    const mainDiv = document.querySelector("#div_principal");

    // Refresh main div that allows executing grpcs
    mainDiv.innerHTML = "";
    mainDiv.innerHTML += `<header> <h2 >Active grpc Definition <span class="proto-file-display">${protoFileSelected}</span>  </h2> </header>`;


    mainDiv.innerHTML += `<form name='grpcTargetHost'> 
        <label> IP</label>
        <input type="text" name="ip"/>
        <label>port</label>
                <input type="text" name="port"/>
 </form>`


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


    let ip = document.querySelector("input[name='ip']").value;
    let port = document.querySelector("input[name='port']").value;

    let grpc = elem.form.getAttribute("name");



    //search and generate all data parameters

    let fields = elem.form.querySelectorAll("input");
    console.dir(fields);


    const requestBody = {
        host: ip,
        port: port,
        service: "ServiceLights",
        grpc:grpc,
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


//REQUEST TYPES
// xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//             xhttp.setRequestHeader('Content-type', 'application/json');
//             xhttp.setRequestHeader('Content-type', 'text/plain');
//             xhttp.setRequestHeader('Content-type', 'multipart/form-data');


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



