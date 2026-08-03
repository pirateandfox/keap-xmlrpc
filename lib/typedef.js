'use strict'

// The generated XML-RPC definitions use the small fluent subset of
// typedef@0.13: class(), interface(), and signature(). Later typedef releases
// removed that API entirely. Keeping the compatibility surface here avoids a
// dependency on an obsolete package and its old transitive dependencies.

function defineHidden (target, properties) {
  Object.keys(properties).forEach(function (key) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      value: properties[key],
      writable: false
    })
  })
}

function processDecorations (definition) {
  var signature = {}

  Object.keys(definition || {}).forEach(function (decoratedKey) {
    var match = decoratedKey.toUpperCase().match(/^__([A-Z_]+)__/)
    var decorations = {PUBLIC: true}
    var key = decoratedKey

    if (match) {
      key = decoratedKey.substring(match[0].length)
      match[1].split('__').forEach(function (decoration) {
        decorations[decoration] = true
      })
    }

    // Keys such as __constructor__ are metadata, not public members.
    if (!key) return

    signature[key] = {
      value: definition[decoratedKey],
      decorations: decorations
    }
  })

  return signature
}

function addMetadata (thing, name, signature, kind) {
  Object.keys(signature).forEach(function (key) {
    signature[key].inheritedFrom = thing
  })

  var metadata = {
    __name__: name,
    __parents__: [],
    __signature__: signature
  }
  metadata[kind] = true
  defineHidden(thing, metadata)
  return thing
}

function attachMember (target, key, info) {
  var hidden = Boolean(info.decorations.HIDDEN)
  var readOnly = typeof info.value === 'function' || info.decorations.READONLY

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !hidden,
    value: info.value,
    writable: !readOnly
  })
}

function createClass (name, definition) {
  definition = definition || {}
  var constructor = definition.__constructor__
  var Type = function () {
    if (constructor) constructor.apply(this, arguments)
  }
  var signature = processDecorations(definition)

  addMetadata(Type, name, signature, '__class__')

  Object.keys(signature).forEach(function (key) {
    var info = signature[key]
    var target = info.decorations.STATIC ? Type : Type.prototype
    attachMember(target, key, info)
  })

  return Type
}

function createInterface (name, definition) {
  return addMetadata({}, name, processDecorations(definition || {}), '__interface__')
}

module.exports = {
  class: function (name) {
    return {
      define: function (definition) {
        return createClass(name, definition)
      }
    }
  },

  interface: function (name) {
    return {
      define: function (definition) {
        return createInterface(name, definition)
      }
    }
  },

  signature: function (thing) {
    return thing && thing.__signature__
  }
}
