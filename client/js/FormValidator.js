import JSUtils from "./Helpers.js";
import {fadeIn, fadeOut} from "./Animate.js";


// Subscribe to validation during user input
// toValidateInputFields.forEach(field => {
//     field.addEventListener("input", duringInputValidation);
//     field.addEventListener("blur", duringInputValidation);
// });


// FUNCTIONS FOR THE VALIDATION FEEDBACK
export function unsetInlineValidation(input) {
    const inlineStatusContainerHTML_Node = input.parentNode.querySelector("input+.inline-status");
    input.classList.remove("invalid");
    inlineStatusContainerHTML_Node.classList.add("hide");
}

export function setInlineValidation(input, type, message) {

    const inlineStatusContainerHTML_Node = input.parentNode.querySelector("input+.inline-status");

    //make sure it is displayed
    inlineStatusContainerHTML_Node.classList.remove("hide");


    const iconsHTML_Nodes = inlineStatusContainerHTML_Node.querySelectorAll(".inline-status-icon")
    const messageContainerHTML_Node = inlineStatusContainerHTML_Node.querySelector(".status-message")


    inlineStatusContainerHTML_Node.classList.remove("info");
    inlineStatusContainerHTML_Node.classList.remove("correct");
    inlineStatusContainerHTML_Node.classList.remove("error");
    inlineStatusContainerHTML_Node.classList.remove("minus");

    switch (type) {
        case "correct":
            inlineStatusContainerHTML_Node.classList.add("correct");
            input.classList.add("valid");
            input.classList.remove("invalid");
            break;
        case "minus":
            inlineStatusContainerHTML_Node.classList.add("minus");
            break;
        case "error":
            inlineStatusContainerHTML_Node.classList.add("error");
            input.classList.remove("valid");
            input.classList.add("invalid");
            break;
        case "info":
            inlineStatusContainerHTML_Node.classList.add("info");
            break;

    }
    messageContainerHTML_Node.textContent = message;


}


function isFieldEmpty(input) {
    return (input.value.trim().length === 0);
}

/*Examples of validation */
const checkIconSVG = `<span class="inline-status-icon correct">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                           <title>Check circle icon</title>
                            <g fill="currentColor">
                                <path d="M10.2,5.4,7.1,9.53,5.67,8.25a1,1,0,1,0-1.34,1.5l2.05,1.82a1.29,1.29,0,0,0,.83.32h.12a1.23,1.23,0,0,0,.88-.49L11.8,6.6a1,1,0,1,0-1.6-1.2Z"></path>
                                <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM8,14a6,6,0,1,1,6-6A6,6,0,0,1,8,14Z"></path>
                            </g>
                        </svg>
                    </span>`;
const minusIconSVG = `<span class="inline-status-icon minus">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                            <g fill="currentColor">
                                <path d="M11,9H5A1,1,0,0,1,5,7h6a1,1,0,0,1,0,2Z"></path>
                                <path d="M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM8,2a6,6,0,1,0,6,6A6,6,0,0,0,8,2Z"></path>
                            </g>
                        </svg>
                    </span>`
const errorIconSVG = `<span class="inline-status-icon error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                            <g fill="currentColor">
                                <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM8,14a6,6,0,1,1,6-6A6,6,0,0,1,8,14Z"></path>
                                <path d="M10.83,5.17a1,1,0,0,0-1.41,0L8,6.59,6.59,5.17A1,1,0,0,0,5.17,6.59L6.59,8,5.17,9.41a1,1,0,1,0,1.41,1.41L8,9.41l1.41,1.41a1,1,0,0,0,1.41-1.41L9.41,8l1.41-1.41A1,1,0,0,0,10.83,5.17Z"></path>
                            </g>
                        </svg>
                    </span>`;
const infoIconSVG = `<span class="inline-status-icon info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                            <g fill="currentColor">
                                <path d="M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM8,2a6,6,0,1,0,6,6A6,6,0,0,0,8,2Z"></path>
                                <path d="M8,12a1,1,0,0,1-1-1V8A1,1,0,0,1,9,8v3A1,1,0,0,1,8,12Z"></path>
                                <circle cx="8" cy="5" r="1"></circle>
                            </g>
                        </svg>
                    </span>`;

const statusMessage = `<span class="status-message"></span>`


/**
 * Given a form, checks for input elements that are supposed to have inline validation and initializes them (adding appropiate content)
 * @param form {HTMLFormElement}
 */
export function setupValidation(form) {


    console.log("Called Setup validation");

    //Each input implementing validation should be marked with .has-validation
    //This will initialize the inline-status span to display contextual info
    form.querySelectorAll("input.has-validation + .inline-status").forEach((i) => {

        if (i.hasChildNodes()) {
            return;
        }
        let check = JSUtils.txtToHtmlDocumentFragment(checkIconSVG);
        let minus = JSUtils.txtToHtmlDocumentFragment(minusIconSVG);
        let error = JSUtils.txtToHtmlDocumentFragment(errorIconSVG);
        let info = JSUtils.txtToHtmlDocumentFragment(infoIconSVG);

        i.appendChild(check);
        i.appendChild(minus);
        i.appendChild(error);
        i.appendChild(info);

        let messageElement = JSUtils.txtToHtmlDocumentFragment(statusMessage);
        let textElem = document.createTextNode("Ejemplo de error");
        messageElement.querySelector("span").appendChild(textElem);
        i.appendChild(messageElement);

        i.classList.add("hide");

    });

}


export function addValidationToField(input) {


    const inlineStatusElement = `<span class="inline-status"></span>`
    const inlineStatusHTML = JSUtils.txtToHTMLNode(inlineStatusElement);


    if (!input.classList.contains("has-validation")) {
        input.classList.add("has-validation");
    }

    // This inserts the validation right next to the input itself
    input.parentNode.insertBefore(inlineStatusHTML, input.nextSibling);

    setupValidation(input.closest("form"))
}




