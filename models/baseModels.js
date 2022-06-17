const baseModels = {};
const defaultValuesModels = {};

defaultValuesModels.peticiones = () => {
    return { estado: "Pendiente" }
}

defaultValuesModels.articulos = (valorInicial) => {
    const comision = 0.1
    return {
        comision: comision * 100,
        valorTotal: valorInicial * (1 + comision) 
    }
}

baseModels.detalleVenta = {
    idVenta: "number",
    idArticulo: "number",
    cantidad: "number",
    valorUnitario: "number",
    valorTotal: "number"
}

module.exports = { baseModels , defaultValuesModels};