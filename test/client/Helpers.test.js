import JSUtils from "../../client/js/Helpers";
import {expectedError} from "@babel/core/lib/errors/rewrite-stack-trace";


// Estructura habitual de un test
test("replaceTemplatePlaceholders test ", () => {

    let template = "Hola {{nombre}} qué tal estás";

    const result = JSUtils.replaceTemplatePlaceholders(template, {nombre: "Alejandro"})

    expect(result).toBe("Hola Alejandro qué tal estás")


});

