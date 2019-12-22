const diffProps = (oldNode, newNode) => {
  const oldProps = oldNode.props
  const newProps = newNode.props
  const propsPatches = {}
  let isSame = true
  for (let key in oldProps) {
    if (newProps[key] !== oldProps[key]) {
      isSame = false
      propsPatches[key] = newProps[key]
    }
  }

  for (let key in newProps) {
    if (!oldProps.hasOwnProperty(key)) {
      isSame = false
      propsPatches[key] = newProps[key]
    }
  }

  return isSame ? null : propsPatches
}

const dfsWalk = (node, walker, patches) => {
  const currentPatches = patches[walker.index]
  node.childNodes && node.childNodes.map(v => {
    walker.index++
    dfsWalk(v, walker, patches)
  })

  currentPatches && applyPatches(node, currentPatches)
}

const applyPatches = (node, currentPatches) => {
  currentPatches.map(currentPatch => {
    switch (currentPatch) {
      case 'REPLACE':
        const newNode = (typeof currentPatch.node === 'string')
          ? document.createTextNode(currentPatch.node)
          : currentPatch.node.render()
        node.parentNode.repaceChild(newNode, node)
        break
      case 'REORDER':
        reorderChildren(node, currentPatch.moves)
        break
      case 'PROPS':
        setProps(node, currentPatch.props)
        break
      case 'TEXT':
        if (node.textContent) {
          node.textContent = currentPatch.content
        } else {
          node.nodeValue = currentPatch.content
        }
        break
      default:
        throw new Error('error')
    }
  })
}