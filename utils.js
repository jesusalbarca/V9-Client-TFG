//
// Utils
//
module.exports = {execInSecs}


/***
 * Promise based wrapper of setTimeout()
 * @param delaySecs - delay in seconds
 * @param func - the name of a function of a lambda expression
 * @returns {Promise<unknown>}
 */
async function execInSecs(delaySecs, func) {
    return new Promise(
        (resolve, reject) => {
            setTimeout(() => {
                    try {
                        resolve(func());

                    } catch (error) {
                        console.log("error " + error)
                        reject();
                    }
                }
                ,
                delaySecs * 1000
            )

        }
    )
        ;
}

