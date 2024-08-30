/**
 *  @fileOverview Package.js
 *  Describes a Grpc Package definition in the client, as specified by the user. The object is mutable and external code can subscribe to changes in the object to perform actions (e.g., Updating the UI)
 *
 * @author Alejandro Rey López
 *              alreylz | alejandro.rey@uc3m.es
 */


import {EventManager} from "./EventManager.js";
import JSHelpers from "../Helpers.js";

/**
 * Represents a Package (a set of Services) in the client side
 */
export class Package extends EventManager {

    constructor(name = "", description = "") {
        super();
        this._name = name;
        this._description = description;
        this._services = new Map();

        this.subscribe("updated", (s) => {
            console.log("@Internal State - Package Updated: ", s);
        });
    }


    get name() {
        return this._name;
    }

    set name(value) {
        if (value === this._name || value === "")
            return;
        this._name = value;
        this._dispatch("updated", this);
    }


    get description() {
        return this._description;
    }

    set description(value) {
        if (value === this._description || value === "")
            return;
        this._description = value;
        this._dispatch("updated", this);
    }

    get services() {
        return this._services;
    }


    findService(serviceName) {
        return this.services.get(serviceName);
    }


    linkService(service) {
        this._services.set(service.name, service);
        this._dispatch("updated", this);
    }


    unlinkService(service) {

        if (JSHelpers.isString(service)) {
            service = this.findService(service);
            if (!service) {
                throw new Error(`No RPC with name ${service} was found in service ${this._name}`);
                return;

            }
        }

        if (!this._services.delete(service.name))
            return;

        this._dispatch("updated", this);

        return service;
    }


    has(service) {

        if (JSHelpers.isString(service))
            return this._services.has(service);
        else
            return this._services.has(service.name);
    }


    serialize() {

        console.group("HOW THE PACKAGE LOOKS AFTER SERIALIZATION");
        console.log(Array.from(this._services.values()));
        console.groupEnd()
        return {
            name: this._name,
            description: this.description,
            services: Array.from(this._services.values())
        }
    }


}