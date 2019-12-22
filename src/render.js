const { jsonData } = window

class myElement {
  constructor(tagName, props, children) {
    this.tagName = tagName
    this.props = props || {}
    this.children = children || []
    this.key = props ? props['key'] : undefined
    this.children.map((child) => {
      if (child instanceof myElement) {
        this.count += child['count']
      }
      this.count++
    })
  }

  render() {
    const el = document.createElement(this.tagName)
    const props = this.props
    const children = this.children
    for (const prop in props) {
      el.setAttribute(prop, props[prop])
    }
    children.map((child) => {
      const childel = (child instanceof myElement) ? child.render() : document.createTextNode(child)
      el.appendChild(childel)
    })

    return el
  }
}


const colorTree = jsonData.map(({ url, inner }) =>
  new myElement(
    'div',
    { class: 'container' },
    [
      new myElement('div', { class: 'site-url' }, [url]),
      ...inner.map(({ name, colors }) =>
        new myElement(
          'div',
          { class: 'small-palette' },
          [new myElement(
            'div',
            { class: 'smallpalette-container' },
            [new myElement(
              'div',
              { class: 'colors' },
              [
                ...colors.map(color => new myElement('div', { class: 'color', style: 'background-color:' + color }, [''])),
                new myElement('div', { class: 'name' }, [name])
              ]
            )]
          )]
        ))
    ]
  )
)

// const tree = new myElement('div', { id: 'virtual' }, [
//   new myElement('p', {}, ['virtual dom']),
//   new myElement('div', {}, ['before']),
//   new myElement('ul', {}, [
//     new myElement('li', { class: 'item' }, ['Item 1']),
//     new myElement('li', { class: 'item' }, ['Item 2']),
//     new myElement('li', { class: 'item' }, ['Item 3'])
//   ])
// ])

const root = tree.render()
document.querySelector('#app').appendChild(root)
