"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.myElement = myElement;
