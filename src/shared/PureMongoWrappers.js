// --------------------------------------------------------------------
// @alreylz - MONGO DB WRAPPERS to ease working with the mongodb driver
// --------------------------------------------------------------------

module.exports = {
    mongow: mongoDBDo,
    operations: {
        insertRecord,
        updateRecord,
        findById,
        findAll,
        findByField,
        removeAll,
        findByName
    }
};


// --------------------------------------------------------------------
// Library initialization
// --------------------------------------------------------------------

// A) Importamos el driver de mongo
const {ObjectId, MongoClient} = require('mongodb');
require('dotenv').config()
// B) Cargamos la configuración de mongo (uri y nombre de BBDD)
const dbUri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`;
const dbName = process.env.MONGO_DB_NAME;
// C) Creamos una instancia de MongoCLient (objeto que se comunica con la base de datos como tal)
const dbClient = new MongoClient(dbUri);


const LogType = {
    Operation: "OPERATION",
    Result: "RESULT",
    Error: "ERROR",
    Warning: "WARNING"
}

// Conecta con la base de datos que está configurada por defecto y ejecuta una operación
/**
 * Main function
 * @param collectionName name of the collection to perform the operation on
 * @param callback binding to one of the functions defined in this file representing operations (findById, findByField,insertRecord...)
 * @param args depending on the operation, the set of expected arguments
 * @returns {Promise<*|null>}
 */
async function mongoDBDo(collectionName, callback, ...args) {

    try {
        //1. Conexión con base de datos
        await dbClient.connect();
        console.log('[MONGODB] -- Connected successfully to server');
        //2. Selección de base de datos.
        const db = await dbClient.db(dbName);
        console.log(`[MONGODB] Connected to ${dbName} database`)
        //
        // console.log(`[MONGODB] Connected to ${db.s.namespace.db} database`)
        //3. Selección de colección
        const collection = await db.collection(collectionName);
        //console.dir(collection)
        //4. Ejecutar función deseada pasada como callback y con los argumentos en ...args
        return await callback(collection, ...args);
    } finally {
        dbClient.close();
        console.log("[MONGODB] -- Closed connection")
    }
    return null;
}


// ------------------------------------------------------
// MONGO DB OPERATIONS DEFINED FROM HERE ON
// --> Use in combination with mongoDBDo (as callback)
// ------------------------------------------------------


/**
 *
 * @param collection a Collection object from mongodb
 * @param args An object or array of objects to insert in the database.
 * @returns {Promise<*|null>} Eventually, returns the object or array of objects inserted successfully.
 */
async function insertRecord(collection, ...args) {
    console.log(`[MONGODB][OPERATION] Inserting into database='${collection.s.namespace.db}'; collection='${collection.s.namespace.collection}'`)
    try {
        let result = undefined;
        if (Array.isArray(args[0])) {
            result = await collection.insertMany(args[0])
        } else {
            result = await collection.insertOne(args[0])
        }
        return result;
    } catch (e) {

        printMongoOpStatus(collection, LogType.Error, "Insertion")
        return null;
    }
}


async function updateRecord(collection, ...args) {
    try {
        printMongoOpStatus(collection, LogType.Operation, "Update")
        let filter = args[0].filter;
        let update = args[0].update;

        console.log("FILTER:")
        console.dir(filter)
        console.log("UPDATE:")
        console.dir(update);
        const result = await collection.updateOne(filter, {$set: update});
        printMongoOpStatus(collection, LogType.Result, "Update", {result: `Successfully modified ${result.modifiedCount} document/s`})
        return result;
    } catch (e) {
        printMongoOpStatus(collection, LogType.Error, "Update")
        return null;
    }
}


async function findAll(collection, ...args) {
    try {
        printMongoOpStatus(collection, LogType.Operation, "FindAll")
        const cursor = await collection.find({})
        const arrayObjs = cursor.toArray()
        return arrayObjs;
    } catch (e) {
        printMongoOpStatus(collection, LogType.Error, "FindAll")
        return null;
    }
}


async function findByName(collection, name, match = "contained") {
    try {

        let cursor = undefined;
        let arrayObjs = undefined;
        printMongoOpStatus(collection, LogType.Operation, `FindByName(${name}, match='${match}')`)

        if (match === "exact") {
            cursor = await collection.find({name: name})
        } else {

            const regexPatternBegins = `^${name}`; // ^ -> Starts by
            const regexPatternEnds = `$${name}`; // $ -> Ends by
            const regexPatternAppears = `${name}`; // ** -> Appears
            cursor = await collection.find({name: {$regex: regexPatternAppears, $options: "ixm"}})
            arrayObjs = await cursor.toArray();
            printMongoOpStatus(collection, LogType.Result, `FindByName(${name}, match='${match}')`, {result: arrayObjs})
        }
        return arrayObjs;
    } catch (e) {
        printMongoOpStatus(collection, LogType.Error, `FindByName(${name})`)
        return null;
    }
}

async function findByField(collection, fieldName, value, limit = 0) {
    let cursor = undefined;
    let result = undefined;

    try {
        printMongoOpStatus(collection, LogType.Operation, `findByField(field=${fieldName}, value='${value}')`)
        const queryString = {};
        queryString[`${fieldName}`] = value;
        console.dir(queryString)

        cursor = await collection.find(queryString, {limit: limit})


        let arrayObjs = await cursor.toArray();
        result = arrayObjs;
        console.dir(arrayObjs)
        if (limit === 1 && arrayObjs != undefined) {
            result = arrayObjs.pop();
        }


    } catch (e) {
        printMongoOpStatus(collection, LogType.Error, `findByField(field=${fieldName}, value='${value}')`)
    }

    return result;
}


async function findById(collection, id) {
    try {
        printMongoOpStatus(collection, LogType.Operation, `FindById(${id})`)

        // const queryString = {"_id": ObjectId("6266cbd12f6c9ac87022656a")}
        const queryString = {"_id": new ObjectId(id)}
        const cursor = await collection.find(queryString, {limit: 1});

        const arrayObjs = await cursor.toArray();
        console.dir(arrayObjs);
        return arrayObjs.pop();
    } catch (e) {
        console.error(e)
        printMongoOpStatus(collection, LogType.Error, `FindById(${id})`)
        return null;
    }
}


async function removeAll(collection) {

    try {
        printMongoOpStatus(collection, LogType.Operation, "RemoveAll");
        let result = await collection.deleteMany({});
        console.log(result);
        return result;
    } catch (e) {
        printMongoOpStatus(collection, LogType.Error, "RemoveAll")
        return undefined;
    }
}


function printMongoOpStatus(collectionObj, logType, operationName, ...args) {


    console.log(logType)


    if (logType !== LogType.Result) {
        console.log(`[MONGODB][${logType}] --${operationName}--  (database='${collectionObj.s.namespace.db}';collection='${collectionObj.s.namespace.collection}')`);
    } else {
        console.group();
        console.log(`[MONGODB][${logType}] --${operationName}--  (database='${collectionObj.s.namespace.db}';collection='${collectionObj.s.namespace.collection}')`);
        if ("result" in args[0]) {
            console.log(">>")
            console.dir(args[0].result)
        } else {
            console.dir(args)
        }
        console.groupEnd();
    }

}



