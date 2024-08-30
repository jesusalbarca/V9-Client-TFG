import InputValidation from "../../client/js/Classes/InputValidation";
import exp from "constants";
import {expectedError} from "@babel/core/lib/errors/rewrite-stack-trace";


describe("User Input Validation functions", () => {

    test("isLowerSnakeCase", () => {
        expect(InputValidation.isValidFieldName("lower_snake_case")).toBeTruthy();
        expect(InputValidation.isValidFieldName("NotLowerSnakeCase")).toBeFalsy();
    })

    test("isLowercase", () => {
        expect(InputValidation.isValidPackageName("lowercase")).toBeTruthy();
        expect(InputValidation.isValidPackageName("lowercase_fail")).toBeFalsy();
        expect(InputValidation.isValidRPCName("lowercaseFail")).toBeFalsy();

    });

    test("isPascalCase", () => {
        expect(InputValidation.isValidMessageName("PascalCase")).toBeTruthy();
        expect(InputValidation.isValidServiceName("PascalCasePascal")).toBeTruthy();
        expect(InputValidation.isValidRPCName("PascalCasePascalPascal")).toBeTruthy();
    });


    test("isEmptyLike", () => {
        expect(InputValidation.isEmptyLike("")).toBeTruthy();
        expect(InputValidation.isEmptyLike(" ")).toBeTruthy();
        expect(InputValidation.isEmptyLike(null)).toBeTruthy();
        expect(InputValidation.isEmptyLike(undefined)).toBeTruthy();
    })

    test("toLowerSnakeCase", () => {
        expect(InputValidation.toLowerSnakeCase("buenas tardes Hola")).toBe("buenas_tardes_hola");
    });

    test("toPascalCase", () => {
        expect(InputValidation.toPascalCase("no pascal case")).toBe("NoPascalCase");

    });


});