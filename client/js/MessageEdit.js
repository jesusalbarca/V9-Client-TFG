import JSHelpers from "./Helpers.js";
import {getAvailableMessages} from "./REST_API_Calls.js";
import InputValidation from "./Classes/InputValidation.js";
import * as fv from "./FormValidator.js"
import {addValidationToField} from "./FormValidator.js";
import JSUtils from "./Helpers.js";
import {fadeIn, fadeOut} from "./Animate.js";
/**
 * @fileoverview Contains the code for the client UI used to define a Grpc Message type
 * Objectives:
 * - Functions that dynamically generate form fields to allow the user to define complex types.
 * - Link functionality to buttons to add/remove fields.
 */

console.log(`🟢 LOADED MessageEdit.js`)

/* This function gets executed as soon as this script is loaded */
async function main() {

    // Get insert button + Deactivate Submit
    const MessageCreateForm = document.querySelector("form#msg-create-form");
    const MessageAttributesDiv = MessageCreateForm.querySelector("#message-field-container");


    // Add new field  functionality
    const addFieldButton = document.querySelector("#add_attribute");
    addFieldButton.addEventListener("click", () => {
        addMessageNewField(MessageAttributesDiv);
    })
    fv.setupValidation(MessageCreateForm);


    // Handle validation
    const messageNameTextBox = MessageCreateForm.querySelector("input[name='messageName']");

    // Validation on submit
    MessageCreateForm.addEventListener("submit", (ev) => {
        console.group("Tried to submit Message")
        ev.preventDefault(); // Prevent auto submit

        // Clear all feedback messags
        MessageCreateForm.querySelectorAll("input.has-validation").forEach((input) => {
                fv.unsetInlineValidation(input);
            }
        )

        // fv.unsetInlineValidation(messageNameTextBox);

        let valid = true;

        // A) Validate Message name
        if (InputValidation.isEmptyLike(messageNameTextBox.value)) {
            console.log("THE MESSAGE NAME IS EMPTY")
            fv.setInlineValidation(messageNameTextBox, "error", "Message name can't be empty");
            valid = false;
        }
        if (!InputValidation.isValidMessageName(messageNameTextBox.value)) {
            console.log("THE MESSAGE NAME IS INVALID")
            fv.setInlineValidation(messageNameTextBox, "error", "Message name is invalid, should be PascalCase")
            valid = false;
        }


        // B) Validate message fields
        const messageFieldInputs = MessageCreateForm.querySelectorAll("input.has-validation:not([name='messageName'])");
        console.log(messageFieldInputs)
        if (!messageFieldInputs || messageFieldInputs.length === 0) {
            valid = false;
        }
        messageFieldInputs.forEach(input => {

            if (!InputValidation.isValidFieldName(input.value)) {
                fv.setInlineValidation(input, "error", "invalid message name (should be lower_snake_case) ");
                valid = false;

            }
            if (InputValidation.isEmptyLike(input.value)) {
                fv.setInlineValidation(input, "error", "can't be empty ")
                valid = false;
            }
        })

        if (valid) {
            // MessageCreateForm.submit();
            console.log("Should be able to submit")
        } else {
            console.error("There were errors validating the input of the user for Message form")
        }

        console.groupEnd()
    })

    messageNameTextBox.addEventListener("change", () => {
        console.log("change eventListener (user stopped interacting with the elem)")
        console.log(messageNameTextBox.value)

    });


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
    const messageFieldInput_HTMLTemplate = JSHelpers.txtToHTMLNode(
        `
        <div class="message-field-template">
           
                <select name="messageFieldsInfo[]" class="form-select" required>
                    <!-- Here the available options will be placed -->
                
                <input type="text" name="messageFieldsInfo[]" class="form-control" 
                       placeholder="Choose a representative name for this argument (e.g. id)" required>
                       <!-- Here fields will be placed -->
            
            <!-- The remove field button -->
                 <button class="btn  bi-trash remove-msg-button" type="button" > </button>
            
            
        </div>
        
    </div>`);


    options.forEach(opt => {

            const selectField = messageFieldInput_HTMLTemplate.querySelector("select")

            selectField.appendChild(
                JSHelpers.txtToHtmlDocumentFragment(JSHelpers.replaceTemplatePlaceholders(option_HTMLTemplate, {
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

    //Finally insert the full element in the DOM
    appendTo.appendChild(messageFieldInput_HTMLTemplate);


    const toValidateInput = messageFieldInput_HTMLTemplate.querySelector("input[type='text']")
    fv.addValidationToField(toValidateInput);
    fv.setupValidation(messageFieldInput_HTMLTemplate.closest("form"))


}


main();


function loadCSSDynamically(filename) {
    let fileRef = document.createElement("link");
    fileRef.rel = "stylesheet";
    fileRef.type = "text/css";
    fileRef.href = filename;
    document.getElementsByTagName("head")[0].appendChild(fileRef)
};