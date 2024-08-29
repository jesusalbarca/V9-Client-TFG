import JSHelpers from "./Helpers.js";
import {addService, getAvailableRPCs} from "./REST_API_Calls.js";
import {getJWTtoken} from "./JWT.js";
import {showRPCInfoHTML} from "./GrpcEdit.js"
import {Service} from "./Classes/Service.js";


let service_tmp = new Service();


async function main() {


    //TESTING isString
    const myArray = [1, "hola", "me cago en tus muertos", 123123, 111.3, "hijueputa"];
    for (let i = 0; i < myArray.length; i++)
        console.log(`EL DATO ${myArray[i]} es un string?? ${JSHelpers.isString(myArray[i])}`);


    /* Authentication first, we need to be able to access the REST APIs*/
    await getJWTtoken();

    /* Get all the available RPCs */
    const allRPCs = await getAvailableRPCs();


    const ServiceCreateForm = document.querySelector("#service-create-form");

    const addRPCToServiceButton = document.querySelector("#add-rpc-to-service")


    const selectGrpc_HTMLItem = ServiceCreateForm.querySelector("select");


    console.log("SELECTS OPTIONS SHOULD BE GENERATED")
    setRPCTypesAsSelectOptions(selectGrpc_HTMLItem, allRPCs);


    service_tmp.subscribe("service_updated", async (service) => {

        console.group("SERVICE DEFINITION WAS UPDATED BY THE USER")

        const option_count = await setRPCTypesAsSelectOptions(selectGrpc_HTMLItem, allRPCs, Array.from(service._rpcs.keys()));
        await HandleGrpcPreviewToServiceDescription_GUI(service._rpcs);

        function disableButtonsIfNecessary() {
            if (option_count === 0)
                addRPCToServiceButton.disabled = true;
            else
                addRPCToServiceButton.disabled = false;
        }

        disableButtonsIfNecessary();

        console.groupEnd();

    });

    //Add
    addRPCToServiceButton.addEventListener("click", () => {


        console.log("CLICKED ADD RPC TO SERVICE")

        //get select value
        const grpcSeleccionada = selectGrpc_HTMLItem.value;
        const chosenRPCData = allRPCs.find(rpc => rpc.rpcName === grpcSeleccionada);


        let serviceName = ServiceCreateForm.querySelector('input[name="name"]').value;
        let desc = ServiceCreateForm.querySelector('[name="description"]').value;

        service_tmp.name = serviceName;
        service_tmp.description = desc;
        service_tmp.addRPC(chosenRPCData);


    })


    // Botón de confirmación de crear un servicio
    const createServiceButton = document.querySelector("#add_new_service");


    createServiceButton.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.log("CLICKED ADD SERVICE BUTTON")
        await CommitServiceViaAPI(service_tmp);
        // service_tmp = new Service();
    });


    // setInterval(async () => {
    //     console.group("Service being created: ")
    //     console.log("SERVICE ", service_tmp);
    //     // console.log(rpcsInServiceBeingCreated)
    //     console.groupEnd()
    // }, 5000);


}


/* Sends the info to create a service to the REST API */
async function CommitServiceViaAPI(service) {

    console.dir(service);


    const myToken = getJWTtoken();
    //Send the info to the rest endpoint for creating services

    const serviceData = {
        name: service._name,
        description: service._description,
        rpcs: Array.from(service._rpcs.keys())
    };

    await addService(serviceData, myToken);
}


/**
 * @description: On every update of the service data it refreshes the UI to show
 * the RPCs that are part of a service in the HTML and allows to remove them from the service through a button
 * @param rpcsInService  Map of RPCs that are part of the service being created at the moment.
 *
 */
async function HandleGrpcPreviewToServiceDescription_GUI(rpcsInService) {

    const serviceRPCsGUIContainer = document.querySelector("#rpcs-in-service");

    // Updates the HTML to show the RPCs that are part of the service
    await showRPCInfoHTML(serviceRPCsGUIContainer, rpcsInService);

    let removeRPCButtons = serviceRPCsGUIContainer.querySelectorAll('[data-action="remove-from-tmp-service"]');

    await removeRPCButtons.forEach(button => {

        const doRemoveRPCFromService = (ev) => {
            ev.preventDefault();
            const rpcName = ev.target.dataset.rpcName;
            console.log("SHOULD REMOVE  THE RPC from the service", rpcName)
            service_tmp.removeRPCByName(rpcName);
        };

        button.removeEventListener("click", doRemoveRPCFromService);
        button.addEventListener("click", doRemoveRPCFromService);


    });

}


/***
 * Fills a provided <select> HTML element with a set of option values
 * If no options are available, the <select> element is disabled to avoid input from the user
 * @param selectHTMLItem
 * @param rpcs
 * @returns {Promise<number>} Number of options that were added to the select element
 */
async function setRPCTypesAsSelectOptions(selectHTMLItem, rpcs, blacklist = []) {

    let option_HTMLTemplate = `<option value="{{type}}">{{displayType}}</option>`

    let optionsList = [];
    let option_count = 0;

    await rpcs.forEach(rpc => {


        if (blacklist.includes(rpc.rpcName))
            return;

        const actualOption = JSHelpers.replaceTemplatePlaceholders(option_HTMLTemplate,
            {
                type: rpc.rpcName,
                displayType: rpc.rpcName
            });

        optionsList.push(JSHelpers.txtToHtmlDocumentFragment(actualOption));
        option_count++;
    })


    selectHTMLItem.disabled = option_count === 0 ? true : false;

    // If there are no more RPCs available, disable the select element completely
    if (option_count === 0) {

        optionsList.push(JSHelpers.txtToHtmlDocumentFragment(`<option selected="true" selected disabled>No more RPCs available</option>`));
    }

    selectHTMLItem.replaceChildren(...optionsList)

    return option_count;


}


main();