import JSHelpers from "./Helpers.js";
import {getAvailableMessages} from "./REST_API_Calls.js";
/**
 * @fileoverview Contains the code for the client UI used to define a Grpc Message type
 * Objectives:
 * - Functions that dynamically generate form fields to allow the user to define complex types.
 * - Link functionality to buttons to add/remove fields.
 */

console.log(`LOADED MessageEdit.js`)


/* This function gets executed as soon as this script is loaded */
async function main() {


    // Get insert button + Deactivate Submit
    const MessageCreateForm = document.querySelector("#msg-create-form");


    const MessageAttributesDiv = MessageCreateForm.querySelector("#message-field-container");


    document.querySelector("#add_attribute").addEventListener("click", () => {
        console.log("CLICKED MESSAGE ADD ATTRIBUTE");
        addMessageNewField(MessageAttributesDiv);
    })


    // EnableTransformToMatchConvention(MessageCreateForm.querySelector("input"))


}


/**
 * Generates the HTML for a single field of a message
 * Users will use a <select> to choose the type of the field (e.g., int, bool, float...) and an <input> to choose the name of the field
 */
async function addMessageNewField(appendTo) {

    // getExisting messages
    let allMessages = await getAvailableMessages()


    // Figure out the types that are available
    let options = ["string", "int32", "bool"];
    allMessages.forEach(m => options.push(m.messageName));

    // Text template
    const option_HTMLTemplate = `<option value="{{value}}">{{displayname}}</option>`;

    //Full div template to add a new message variable
    const messageFieldInput_HTMLTemplate = JSHelpers.txtToHtmlNode(
        `
        <div class="row mb-3 message-field-template">
            <div class="col">
                <select name="messageFieldsInfo[]" class="form-select" required>
                    <!-- Here the available options will be placed -->
                </select>
            </div>
            <div class="col-sm-8">
                <input type="text" name="messageFieldsInfo[]" class="form-control" 
                       placeholder="Choose a representative name for this argument (e.g. id)" required>
                       <!-- Here fields will be placed -->
            </div>
            
            <!-- The remove field button -->
            <div class="col"> 
                 <button class="btn  bi-trash remove-msg-button" type="button" > </button>
            </div>
            
        </div>
        
    </div>`);


    options.forEach(opt => {

            const selectField = messageFieldInput_HTMLTemplate.querySelector("select")

            selectField.appendChild(
                JSHelpers.txtToHtmlNode(JSHelpers.replaceTemplatePlaceholders(option_HTMLTemplate, {
                    value: opt,
                    displayname: opt
                })));


        }
    );


    //Add remove functionality


    const RemoveMessageFieldButton = messageFieldInput_HTMLTemplate.querySelector(".remove-msg-button");
    RemoveMessageFieldButton.addEventListener("click", (e) => {
        e.target.closest(".message-field-template").remove();

    });


    appendTo.appendChild(messageFieldInput_HTMLTemplate);


}


function EnableTransformToMatchConvention(inputField) {


    // Add an input event listener to the input field
    inputField.addEventListener('input', function () {
        // Update the content of the output element when the input value changes
        const currentValue = inputField.value;
        alert("YOU CHANGED A FIELD TO " + currentValue)
        // outputElement.textContent = `Input value changed to: ${currentValue}`;
    });
}


/*
Should do:
- First Letter Will Be Capital
- remove Spaces
- letter after space will be capital
- should make sure it contains no
 */
function TransformToMatchConventions(type) {


    // constraints are different for different things
    // Packages, Messages, RPCs, etc.


    /* PACKAGES
        name in lowercase.
     */

    /*
        SERVICES:
        - Pascal Case para el nombre (e.g., MiServicio)
     */

    /*
        RPCS:
        - PascalCase para el nombre (e.g., MiRPC)
     */


    /*
        MESSAGES:
        - Pascal case para nombre del mensaje (e.g., MiMensaje)
        - Lower snake case for field names (e.g., mi_campo)
     */


}

function toLowerSnakeCase(str) {
    // Split input into words (removing accidental spaces)
    const lowercaseWords = str.trim().toLowerCase().split(' ');
    return lowercaseWords.join("_")
}

function toCapitalizedPascalCase(str) {

    // Split input into words (removing accidental spaces)
    const words = str.trim().split(' ');
    //Capitalize first letter of each words
    const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return capitalizedWords.join('');
}

//
// console.log(toCapitalizedPascalCase("what if you are a whore"));
// console.log(toLowerSnakeCase("what If yOu are a whore"));


main();
