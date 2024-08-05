// ------------------------------------------
// SUBIDA ARCHIVOS (Uso biblioteca multer)
// -----------------------------------------
const multer = require('multer');
const path = require("path");
const fs = require("fs"); // Library to process multipart requests

// A) Storage object
// -> Sets where received files will be stored.
const multerStorageConfiguration =
    multer.diskStorage({
        destination: // Specifies via a function where uploaded files are stored
            async function (req, file, cb) {
                // By default, files are stored in the /uploads folder
                let saveFolder = `${global.__basedir}/uploads`;

                //If 'saveTo' attribute is specified in the request, it means the upload folder must change
                // - the directory/directories are created if not present
                if ("saveTo" in req) {
                    saveFolder = path.join(saveFolder, req.saveTo);
                    req.saveFolder = saveFolder;
                    await fs.promises.mkdir(saveFolder, {recursive: true})
                }

                console.log("\t\tmulter config ".red() + ` - Incoming file will be saved to: ${saveFolder}`.green())

                cb(null, saveFolder);

            },
        filename: //Specifies via a function the naming strategy for the incoming file in the receiving FS
            async function (req, file, cb) {

                let uploadFileName = file.originalname;


                const saveTarget = path.join(req.saveFolder, file.originalname);
                //Check if file exists already and warns that it won't be overwritten (adds suffix)
                if (await checkFileExists(saveTarget)) {
                    console.log(`\t\tCareful! a file with the same name exists: ${saveTarget}.\n\t\tAnother with a suffix will be created`.yellow())

                    let {ext, name} = path.parse(file.originalname);

                    uploadFileName = name + Date.now() + ext;
                }

                cb(null, uploadFileName);
            }
    })


// B) File Filter
/***
 * uploadFileFilterByExtension:
 * Multer configuration function that filters the uploaded files so that only supported extensions
 * can be uploaded (there is an array where the valid extensions are placed)
 * @param req
 * @param file
 * @param callback
 * @returns {*}
 */
function uploadFileFilterByExtension(req, file, callback) {

    const supportedFileExtensions = ["experiment", "png", "jpg", "gif", "json", "txt", "csv"]

    //Extract file extension
    let re = /(?:\.([^.]+))?$/;
    let extension = re.exec(file.originalname);
    console.log(`\t\tReceived file '${file.originalname}' with extension: ${extension[1]}`.yellow());

    //Check if extension is supported
    let success = false;
    for (let idx in supportedFileExtensions) {

        // console.log(`is ${supportedFileExtensions[idx]} === ${extension[1]}`)
        if (extension[1] === supportedFileExtensions[idx]) {

            success = true;
            break;
        }
    }
    if (success === false) callback(new Error(`Attempt to upload file with unsupported extension '${extension[1]}'`), false)

    callback(null, true)
}


// C) Middleware for folder separation
// Middleware que permite guardar los archivos que vienen en una subcarpeta
// (añade un atributo que luego lee multer antes de guardar)
const preuploadMiddlewareExperimentFolderOrganization = (req, res, next) => {

    let experimentName = req.params.experiment;
    req.saveTo = path.join("experiments", experimentName);
    console.log(`preuploadMiddlewareExperimentFolderOrganization -> req.saveTo  set to ${experimentName} `)

    next();
};


// --------------------------------------------------------------
// MAIN MULTER MIDDLEWARE (FOR USE DIRECTLY IN EXPRESS ROUTES)
// --------------------------------------------------------------
const upload = multer({
    storage: multerStorageConfiguration, //Filtro para que solo se acepten ciertas extensiones de archivo.
    fileFilter: uploadFileFilterByExtension
});
