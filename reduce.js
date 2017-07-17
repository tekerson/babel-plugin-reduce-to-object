module.exports = function (babel) {
  let t = babel.types
  return {
    visitor: {
      CallExpression (path) {
        const node = path.node
        const callee = node.callee
        if (!t.isMemberExpression(callee)) return

        const method = callee.property
        const obj = callee.object
        if (!t.isIdentifier(method) || method.name !== 'reduce') return

        const args = node.arguments
        if (args.length !== 2) return

        const iterator = args[0]
        const initialValue = args[1]
        if (!t.isArrowFunctionExpression(iterator) && !t.isFunctionExpression(iterator)) return
        if (!t.isObjectExpression(initialValue)) return

        const iteratorParams = iterator.params
        if (iteratorParams.length !== 2) return

        const accumulator = iterator.params[0]
        if (!t.isIdentifier(accumulator)) return

        if (!t.isObjectExpression(iterator.body)) return

        const targetObject = iterator.body
        const properties = targetObject.properties
        if (properties.length < 1) return

        if (!t.isSpreadProperty(properties[0])) return

        const spreadValue = properties[0].argument
        if (!t.isIdentifier(spreadValue)) return

        if (spreadValue.name !== accumulator.name) return

        path.replaceWith(
          t.callExpression(t.memberExpression(obj, t.identifier('reduce')), [
            t.functionExpression(null, iteratorParams, t.blockStatement([
              t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), [
                t.identifier(accumulator.name),
                t.objectExpression(properties.slice(1))
              ])),
              t.returnStatement(t.identifier(accumulator.name))
            ])),
            args[1]])
        )
      }
    }
  }
}
