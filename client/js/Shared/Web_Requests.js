/*
    todo: Rework it
    This file provides a set of functions that are used to make
    HTTP requests from the client javascript to a given endpoint,
    with or without authentication
 */


export async function GetRequestAsync(url) {

    return new Promise(function (resolve, reject) {

        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);

        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhttp.responseText);
            }
            else {
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


export async function GetRequestAsyncJWT(url, jwtToken, expect = "json") {

    return new Promise(function (resolve, reject) {

        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);

        //Set the adequate header to authorize the request
        xhttp.setRequestHeader("Authorization", 'Bearer ' + jwtToken);


        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(
                    expect === "json" ? JSON.parse(xhttp.responseText) : xhttp.responseText
                );
            }
            else {
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


/**
 *
 * @param url Endpoint
 * @param bodyObj Body of the request
 * @param expect Expected response type (json|text)
 * @returns {Promise<unknown>}
 * @constructor
 */
export async function PostRequestAsyncJson(url, bodyObj, expect = "json") {
    return new Promise(function (resolve, reject) {

        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader('Content-type', 'application/json');


        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(
                    expect === "json" ? JSON.parse(xhttp.responseText) : xhttp.responseText
                );
            }
            else {
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


/***
 * INTENTO DE FUNCION MÁS GENERICA PARA HACER PETICIONES a mis propios endpoints REST
 * @param url
 * @param method
 * @param options
 * @returns {Promise<unknown>}
 * @constructor
 */

export async function RequestAsync(url, method = "GET", options) {


    // jwtToken: the JWT token to be used for authentication
    // body: an object to be sent as the request body
    // expect : the type of content to expect as response; ("json" | "text")
    let {body, jwtToken, expect} = options;
    if (!body)
        body = {};
    if (!expect)
        expect = "json";

    return new Promise(function (resolve, reject) {

        let xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);

        if (jwtToken)
            //Set the adequate header to authorize the request
            xhttp.setRequestHeader("Authorization", 'Bearer ' + jwtToken);

        //Set the adequate header to set the body type
        xhttp.setRequestHeader('Content-type', 'application/json');


        xhttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(
                    expect === "json" ? JSON.parse(xhttp.responseText) : xhttp.responseText
                );
            }
            else {
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

        xhttp.send(JSON.stringify(body));

    })
}



