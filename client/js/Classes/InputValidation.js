export default class InputValidation {


    static isValidMessageName(name) {
        return this.#isPascalCase(name);
    }

    static isValidFieldName(name) {
        return this.#isLowerSnakeCase(name)
    }

    static isValidServiceName(name) {
        return this.#isPascalCase(name);
    }

    static isValidRPCName(name) {
        return this.#isPascalCase(name);
    }

    static isValidPackageName(name) {
        return this.#isLowercase(name);
    }

    static isEmptyLike(value) {
        if (!value)
            return !value;
        if (typeof value !== "string") {
            throw new Error("Can't check if non-string datum is empty")
        }
        return value.trim().length === 0;
    }

    static #isPascalCase(value) {
        if (typeof value !== "string") {
            throw new Error("Can't check if non-string value is PascalCase")
        }
        const regExp = new RegExp("^[A-Z][A-Za-z]+$");
        return regExp.test(value);
    }

    static #isLowercase(value) {
        if (typeof value !== "string") {
            throw new Error("Can't check if non-string value is Lowercase")
        }
        const regExp = new RegExp("^[a-z]+$");
        return regExp.test(value);
    };

    static #isLowerSnakeCase(value) {
        if (typeof value !== "string") {
            throw new Error("Can't check if non-string value is lower_snake_case")
        }
        const regExp = new RegExp("^([a-z]+_?[a-z])+$");
        return regExp.test(value);
    };


    // CONVERTERS

    static toLowerSnakeCase(str) {
        // Split input into words (removing accidental spaces)
        const lowercaseWords = str.trim().toLowerCase().split(' ');
        return lowercaseWords.join("_")
    }

    static toPascalCase(str) {
        // Split input into words (removing accidental spaces)
        const words = str.trim().split(' ');
        //Capitalize first letter of each words
        const capitalizedWords = words.map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        });
        return capitalizedWords.join('');
    }


}