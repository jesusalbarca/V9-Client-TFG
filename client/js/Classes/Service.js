import {EventManager} from "./EventManager.js";
import JSHelpers from "../Helpers.js";

/**
 * Represents a service (a set of RPCs) in the client side
 */
export class Service extends EventManager {

    constructor(name = "", description = "") {
        super();
        this._name = name;
        this._description = description;
        this._rpcs = new Map();

        this.subscribe("service_updated", (s) => {
            console.log("@state - Service Updated: ", s);
        });
    }
    
    set name(value) {
        if (value === this._name || value === "")
            return;
        this._name = value;
        this._dispatch("service_updated", this);
    }

    set description(value) {
        if (value === this._description || value === "")
            return;

        this._description = value;
        this._dispatch("service_updated", this);
    }

    findRPC(rpcName) {
        return this._rpcs.get(rpcName);
    }


    /*
    * @param rpc: RPC object to add to the service
     */
    addRPC(rpc) {
        this._rpcs.set(rpc.rpcName, rpc);
        this._dispatch("rpc_added", rpc);
        this._dispatch("service_updated", this);
    }

    //One can specify the RPC to remove by its name or by the RPC object itself
    removeRPC(rpc) {

        if (rpc instanceof String) {
            rpc = this.findRPC(rpc);
            if (!rpc) {
                throw new Error(`No RPC with name ${rpc} was found in service ${this._name}`);
                return;

            }
        }

        if (!this._rpcs.delete(rpc.rpcName))
            return;

        this._dispatch("rpc_removed", rpc);
        this._dispatch("service_updated", this);

        return rpc;
    }


    removeRPCByName(rpcName) {


        console.log(` is '${rpcName} a string ? ${JSHelpers.isString(rpcName)}`)


        const rpc = this.findRPC(rpcName);
        if (!rpc) {
            throw new Error(`No RPC with name ${rpc} was found in service ${this._name}`);
            return;

        }
        if (!this._rpcs.delete(rpc.rpcName))
            return;

        this._dispatch("rpc_removed", rpc);
        this._dispatch("service_updated", this);

    }


    has(rpc) {
        return this._rpcs.has(rpc.rpcName);
    }

    hasName(rpcName) {
        return this._rpcs.has(rpcName);
    }

}