const { query, queryWithParams } = require("../connection/connection");

const replaceObjectValues = async (object, idUsuario, conn) => {
    const modelRol = {...object};

    for (const key of Object.keys(modelRol)) {
        if (modelRol[key].tabla) {
            if (modelRol[key].args) {
                const finalQuery = await queryWithParams(`SELECT ${modelRol[key].campo} FROM ${modelRol[key].tabla} ${modelRol[key].args}`, [idUsuario], conn)
                modelRol[key] = finalQuery.map(item => item[modelRol[key].campo]);
            } else {
                const finalQuery = await query(`SELECT ${modelRol[key].campo} FROM ${modelRol[key].tabla}`, conn);
                console.log(finalQuery);
                modelRol[key] = finalQuery.map(item => item[modelRol[key].campo]);
            }
        }
    }

    return modelRol
}

const getLastId = async (table, conn) => {
    try {
        const lastId = await query(`SELECT COUNT(*) AS lastId FROM ${table}`, conn);
        if (lastId.length > 0 && lastId[0]?.lastId) {
            const { lastId: finalId } = lastId[0];
            return finalId + 1;
        } else {
            return 1;
        }
    } catch (e) {
        console.log(e + ". No se encuentra id")
    }
}

const getFullDate = () => {
    const date = new Date();
    const month = date.getMonth() + 1;
    return `${date.getFullYear()}-${date.getMonth() < 9 ? "0" + month : month}-${date.getDate()}`
}

const remapObjectProps = (object, baseObject) => {
    return Object.keys(baseObject).reduce((obj, key) => {
        if (object[key]) obj[key] = object[key];
        return obj;
    }, {})
}

module.exports = { replaceObjectValues, getLastId, getFullDate, remapObjectProps };