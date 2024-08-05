import {addService, commitPackage, getAvailablePackages, getAvailableServices} from "./REST_API_Calls.js";
import JSUtils from "./Helpers.js";
import {getJWTtoken} from "./JWT.js";
import {Package} from "./Classes/Package.js";


// Representa el estado del formulario de crear paquete
var package_tmp = new Package();


async function main() {


    //Conseguir todos los datos necesarios para mostrar los servicios existentes y poder añadirlos al paquete nuevo.
    await getJWTtoken();
    const allServices = await getAvailableServices();
    console.log("ALLSERVICES:", allServices)


    const packageEdit_form = document.querySelector("#package-create-form");

    //Cargar opciones para añadir al paquete
    const selectHTMLElement = packageEdit_form.querySelector("select");
    await ShowAvailableServiceOptions(selectHTMLElement, allServices);


    //Sincronizar cambios de UI con cambios de representación por detrás
    let packageName_inputField = packageEdit_form.querySelector("input[name='package_name']");
    let description_inputField = packageEdit_form.querySelector("textarea[name='package_description']")


    packageName_inputField.addEventListener("input", function (ev) {
        package_tmp.name = ev.target.value;
    });
    description_inputField.addEventListener("input", function (ev) {
        package_tmp.description = ev.target.value;
    });


    let addServiceToPackage_Button = packageEdit_form.querySelector("#add-service-to-package");

    //Gestionar añadido de paquetes UI + Status
    addServiceToPackage_Button.addEventListener("click", function () {

        let selectedOption = selectHTMLElement.value;

        console.log("SELECTED OPTION WILL BE ADDED ", selectedOption);


        const selectServiceDescription = allServices.filter(s => s.name == selectedOption)[0];

        console.log("SELECTED FULL SERVICE DESC: ", selectServiceDescription)

        let chosenPackageToAdd = package_tmp.linkService(selectServiceDescription)


        //Show preview (UPDATE HTML)
        generateServicePreview_HTML(selectServiceDescription, document.querySelector("#here"));


    });


    packageEdit_form.querySelector("button[data-action='commit']").addEventListener("click", function (ev) {
        console.log("COMMITING PACKAGE TO SERVER");
        CommitPackage(package_tmp);


    });


    setInterval(() => {
        console.log(package_tmp)
    }, 3000);
};


async function showAllPackages() {


    console.log(await getJWTtoken())


    const packages = await getAvailablePackages();
    const services = await getAvailableServices();

    console.log("SERVICES", services);
    console.log("PACKAGES", packages);

    const p = document.createElement("p");
    p.textContent = JSON.stringify(packages);

    document.querySelector("#here").appendChild(p);


}


/**
 * gEnera una previsualización del servicio añadido, insertando contenido en el html en el lugar indicado.
 * @param serviceObj
 * @param appendTo
 * @returns {Promise<void>}
 */
async function generateServicePreview_HTML(serviceObj, appendTo) {


    const {name, description, rpcs} = serviceObj;


    //Full div template to preview a service
    const servicePreview_HTMLTemplate = JSUtils.txtToHtmlNode(
        `<div id='service-preview-box' style="background-color: #1d61d8; display:flex;">
                <h3> ${name} </h3>
                <h2> ${description} </h2>
                <div class="rpc-listing">
                 <!--RPCs should appear here -->
                </div>
                <button type="button" id="service-in-package-remove-X"> Remove me</button>
            </div>`
    );


    // // Add each grpc in a separate set of HTML elements
    // await grpcs.forEach(grpc => {
    //
    //     const container = servicePreview_HTMLTemplate.querySelector(".rpc-listing");
    //
    //     const rpcPreview_HTMLTemplate = JSUtils.txtToHtmlNode(
    //         `<span class="return-type-display"> (${grpc.returnType.messageName})</span>
    //         <span class="rpc-name-display"> ${grpc.rpcName}</span>
    //         <span class="arg-type-display"> (${grpc.argsType.messageName})</span>`
    //     );
    //     container.appendChild(rpcPreview_HTMLTemplate);
    // })

    appendTo.appendChild(servicePreview_HTMLTemplate)

};


// Muestra los servicios disponibles como opciones de un elemento <select>
function ShowAvailableServiceOptions(selectHTMLItem, serviceOptions) {


    let option_HTMLTemplate = `<option value="{{type}}">{{displayType}}</option>`

    let optionsList_HtmlNodes = []

    serviceOptions.forEach(s => {
        optionsList_HtmlNodes.push(JSUtils.txtToHtmlNode(JSUtils.replaceTemplatePlaceholders(option_HTMLTemplate,
            {
                type: s.name,
                displayType: s.name
            })));
    })

    // Añadir campo select con los servicios disponibles
    // - Cuando el usuario selecciona uno, se carga la descripción del mismo debajo, junto a un botón de añadir.


    selectHTMLItem.replaceChildren(...optionsList_HtmlNodes);

}


async function CommitPackage(grpcPackage) {

    console.dir(grpcPackage);


    const myToken = getJWTtoken();
    //Send the info to the rest endpoint for creating services


    await commitPackage(grpcPackage);
}


main();