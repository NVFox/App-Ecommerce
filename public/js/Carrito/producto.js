import { createNewElement, addAttributes, appendChained, generateTextContent } from "../Utilities/utilities"

const crearProducto = (producto, n, fragment) => {
    const container = createNewElement("div", "producto")
    addAttributes(container, {alt: "producto"});

    const primerSubcontainer = createNewElement("div", "est", "est1");
    const imageContainer = createElement("div", "img");

    const imgElement = createNewElement("img");
    addAttributes(imgElement, {src: producto.imagen});

    appendChained([imageContainer, imgElement], 
        [primerSubcontainer, imageContainer]);

    const segundoSubcontainer = createNewElement("div", "est", "est2");
    const textContainer = createNewElement("div", "text");

    const children = [
        {
            child: ["span", "h1"],
            text: ["", producto.nombre],
            classNames: []
        },
        {
            child: ["span", "h1", "i"],
            text: ["", "", producto.valorTotal],
            classNames: ["", "", ["bi", "bi-tags-field"]]
        },
        {
            child: ["span", "h2"],
            text: ["", producto.nombreVendedor],
            classNames: []
        }

    ]

    generateTextContent(textContainer, children);

    appendChained([segundoSubcontainer, textContainer]);

    const tercerSubcontainer = createNewElement("div", "est", "est3");
    const spanBtn = createNewElement("span", "text");
    const borrarBtn = createNewElement("input", "btn1");

    addAttributes(borrarBtn, {type: "button", value: "ELIMINAR", id: `btn-eliminar-${n}`});

    appendChained([spanBtn, borrarBtn], 
        [tercerSubcontainer, spanBtn]);

    fragment.appendChild(container);
}

export { crearProducto };