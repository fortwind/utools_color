export class myElement {
  tagName: string
  props: object
  children: (myElement | string)[]
  key: string
  count: number = 0

  constructor(tagName: string, props: object, children: (myElement | string)[]) {
    this.tagName = tagName
    this.props = props || {}
    this.children = children || []
    this.key = props ? props['key'] : undefined
    this.children.map((child: myElement | string) => {
      if (child instanceof myElement) {
        this.count += child['count']
      }
      this.count++
    })
  }

  render () {
    const el = document.createElement(this.tagName)
    const props = this.props
    const children = this.children
    for (const prop in props) {
      el.setAttribute(prop, props[prop])
    }
    children.map((child: string | myElement) => {
      const childel: Node = (child instanceof myElement) ? child.render() : document.createTextNode(child)
      el.appendChild(childel)
    })

    return el
  }
}
