import JSHelpers from "./Helpers.js";
import {getAvailableMessages, getAvailableRPCs, removeRPC} from "./REST_API_Calls.js";
import {getJWTtoken} from "./JWT.js";
/**
 * @fileoverview Contains the code for the client UI used to define a Remote Function call
 */


console.log(`LOADED GrpcEdit.js`)


async function main() {


    await getJWTtoken();


    const allMessages = await getAvailableMessages();


    const MessageCreateForm = document.querySelector("#rpc-create-form");

    console.log(MessageCreateForm)
    const selectsInForm = MessageCreateForm.querySelectorAll("select");

    console.log(selectsInForm)
    selectsInForm.forEach(select => {
        console.log("SELECTS OPTIONS SHOULD BE GENERATED")
        setMessageTypesAsSelectOptions(select, allMessages);
    })


    const allRPCs = await getAvailableRPCs()

    showRPCListTableContent(document.querySelector("#tabla_rpcs"), allRPCs);


}


main();


/***
 * Fills a provided <select> HTML element with a set of option values
 * @param selectHTMLItem
 * @param messages these are the values to show
 */
function setMessageTypesAsSelectOptions(selectHTMLItem, messages) {

    let option_HTMLTemplate = `<option value="{{type}}">{{displayType}}</option>`

    console.log("MESSAGES", messages)
    messages.forEach(msg => {

        const actualOption = JSHelpers.replaceTemplatePlaceholders(option_HTMLTemplate,
            {
                type: msg.messageName,
                displayType: msg.messageName
            });


        selectHTMLItem.append(
            JSHelpers.txtToHtmlDocumentFragment(actualOption));
    })

}


/**
 * Despliega un div que muestra los datos desgranados sobre una RPC
 * */
export async function showRPCInfoHTML(whereTo, rpcs) {

    const rpcINfoDisplay_HTMLTemplate =
        `<div class="flex-row" style="padding:1em;">
            <span class="grpc-return datatype-display">{{returnType}} </span>
            <span class="rpc-name variable-name-display">{{grpcName}}</span> 
            <span class="grpc-arg datatype-display">{{argType}}</span>
            <button class="remove-preview-btn bi-trash" type="button"  data-action="remove-from-tmp-service"  data-rpc-name="{{grpcName}}" > Remove preview rpc </button>
        </div>`;


    let rpcsInfoListToDisplay = [];

    await rpcs.forEach(rpc => {

        rpcsInfoListToDisplay.push(
            JSHelpers.txtToHtmlDocumentFragment(JSHelpers.replaceTemplatePlaceholders(rpcINfoDisplay_HTMLTemplate, {
                returnType: rpc.returnType.messageName,
                grpcName: rpc.rpcName,
                argType: rpc.argsType.messageName
            })));


    });


    // console.log(rpcsInfoListToDisplay);

    whereTo.replaceChildren(...rpcsInfoListToDisplay);

}


/**
 * Fills in a <table> element with all the RPCs that exist as well as a button to remove each one
 * @param table HTML table element to fill with the information about the existing RPCs
 * @param rpcs array of RPCs to display
 */
export function showRPCListTableContent(table, rpcs) {


    //The headers of the table and empty body of the
    const rpcTableContent_HTML =
        `<thead> <tr>
                <th style="display:none">Id</th>
                <th>Return type</th>
                <th>Function Name</th>
                <th>Parameter type</th>
                <th></th>
            </tr>
        </thead>`;

    table.innerHTML += rpcTableContent_HTML;
    const tBodyReference = table.appendChild(document.createElement("tbody"));

    const rpcRowDisplay_HTMLTemplate =
        `<tr class="flex-row" style="padding:1em;">
            <td style="display:none">{{id}}</td>
            <td class="grpc-return datatype-display">{{returnType}} </td>
            <td class="rpc-name variable-name-display">{{grpcName}}</td> 
            <td class="grpc-arg datatype-display">{{argType}}</td>
            <td> <button type="button" class="remove-btn bi-trash" data-id="{{id}}" data-name="{{grpcName}}" > Delete </button>  </td>
        </tr>`;


    console.log(tBodyReference)

    //Add a row displaying the data of each RPC
    rpcs.forEach(rpc => {
        tBodyReference.innerHTML += JSHelpers.replaceTemplatePlaceholders(rpcRowDisplay_HTMLTemplate, {
            id: rpc._id,
            returnType: rpc.returnType.messageName,
            grpcName: rpc.rpcName,
            argType: rpc.argsType.messageName
        });
    })


    //Add functionality to the remove button of each rpc
    const buttonsRemoveRPCs = tBodyReference.querySelectorAll(".remove-btn");
    buttonsRemoveRPCs.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            if (!confirm(`Do you want to remove the RPC ${e.target.dataset.name} ID = ${e.target.dataset.id}`))
                return;
            await removeRPC(e.target.dataset.id)

        });
    });


}