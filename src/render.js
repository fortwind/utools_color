const { jsonData } = window

// const colorTree = jsonData.map(({ url, inner }) =>
//   new myElement('div', { class: 'container' },
//     [
//       ['div', { class: 'site-url' }, [url]],
//       ...inner.map(v => [
//         'div', { class: 'small-palette' }, [
//           ['div', { class: 'smallpalette-container' }, [
//             ['div', { class: 'colors' }, [
//               ...colors.map(v => ['div', { class: 'color', style: 'background-color:' + color }, ['']]),
//               ['div', { class: 'name' }, [name]]
//             ]]
//           ]]
//         ]])
//     ]
//   )
// )

// const colorTree = jsonData.map(({ url, inner }) =>
//   new myElement(
//     'div',
//     { class: 'container' },
//     [
//       new myElement('div', { class: 'site-url' }, [url]),
//       ...inner.map(({ name, colors }) =>
//         new myElement(
//           'div',
//           { class: 'small-palette' },
//           [new myElement(
//             'div',
//             { class: 'smallpalette-container' },
//             [new myElement(
//               'div',
//               { class: 'colors' },
//               [
//                 ...colors.map(color => new myElement('div', { class: 'color', style: 'background-color:' + color }, [''])),
//                 new myElement('div', { class: 'name' }, [name])
//               ]
//             )]
//           )]
//         ))
//     ]
//   )
// )

const tree = new myElement('div', { id: 'virtual' }, [
  new myElement('p', {}, ['virtual dom']),
  new myElement('div', {}, ['before']),
  new myElement('ul', {}, [
    new myElement('li', { class: 'item' }, ['Item 1']),
    new myElement('li', { class: 'item' }, ['Item 2']),
    new myElement('li', { class: 'item' }, ['Item 3'])
  ])
])

const root = tree.render()
document.querySelector('#app').appendChild(root)

console.log(999)
