const createNewElement = (element, ...classNames) => {
    const newElement = document.createElement(element);
    classNames && element.classList.add(classNames);
    return newElement;
}

const addAttributes = (element, attributes) => {
    Object.keys(attributes).map(item => {
        element[item] = attributes[item];
    })
}

const appendChained = (...elements) => {
    elements.map(element => {
        element[0].appendChild(element[1]);
    })
}

const generateTextContent = (baseElement, ...children) => {
    return children.map(({child, classNames, text}) => {
        const allChildren = child.map((item, i) => createNewElement(item, classNames[i]));
        const finalChild = allChildren.reduce((acc, item, i) => {
            item.textContent = text[i]
            if (i < (allChildren.length - 1)) {
                acc.appendChild(allChildren[i + 1])
                return allChildren[i + 1]
            }
            return allChildren[0]
        }, allChildren[0]);
        baseElement.appendChild(finalChild);
    })
}

export { createNewElement, addAttributes, appendChained, generateTextContent };