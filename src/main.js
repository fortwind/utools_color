"use strict";
var _a;
class myElement {
    constructor(tagName, props, children) {
        this.count = 0;
        this.tagName = tagName;
        this.props = props || {};
        this.children = children || [];
        this.key = props ? props['key'] : undefined;
        this.children.map((child) => {
            if (child instanceof myElement) {
                this.count += child['count'];
            }
            this.count++;
        });
    }
    render() {
        const el = document.createElement(this.tagName);
        const props = this.props;
        const children = this.children;
        for (const prop in props) {
            el.setAttribute(prop, props[prop]);
        }
        children.map((child) => {
            const childel = (child instanceof myElement) ? child.render() : document.createTextNode(child);
            el.appendChild(childel);
        });
        return el;
    }
}
console.log(window.test);
const tree = new myElement('div', { id: 'virtual' }, [
    new myElement('p', {}, ['virtual dom']),
    new myElement('div', {}, ['before']),
    new myElement('ul', {}, [
        new myElement('li', { class: 'item' }, ['Item 1']),
        new myElement('li', { class: 'item' }, ['Item 2']),
        new myElement('li', { class: 'item' }, ['Item 3'])
    ])
]);
const root = tree.render();
(_a = document.querySelector('#app')) === null || _a === void 0 ? void 0 : _a.appendChild(root);
