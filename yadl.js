const yadl = {}

if (typeof window != 'undefined')
  yadl.document = window.document

/**
 * The base yadl.Element class.
 */
yadl.Element = class {
  /**
   * @param {string} type The type of the element to create. Passed to document.createElement.
   */
  constructor(type, doc) {
    if (type)
      this._element = document.createElement(type)
    else
      this._element = null

    this.hooks = []
    this.isMounted = false
    this.document = doc
  }

  /**
   * Get element property
   * @param {string} name The property to look up
   */
  get(name) {
    if (!(name in this._element)) {
      throw new Error(`${name} is not defined on this element`)
    }

    return this._element[name]
  }

  /**
   * set element property
   * @param {string} name The property to update
   * @param {any} value The value to update to
   */
  set(name, value) {
    if (!(name in this._element)) {
      throw new Error(`${name} is not defined on this element`)
    }

    this._element[name] = value

    let hook = this.hooks.find(i => i.attr == name)
    if (hook) {
      hook.handler(name, value)
    }

    return this
  }

  style(name, value) {
    if(!(name in this._element.style)) {
      throw new Error(`${name} is not defined in this style object`)
    }

    this._element.style[name] = value

    let hook = this.hooks.find(i => i.attr == 'style.' + name)
    if (hook) {
      hook.handler('style.' + name, value)
    }

    return this
  }

  /**
   * Add hooks
   * @param {string} attr The attribute to listen on
   * @param {function} handler The handler to execute
   */
  addHook(attr, handler) {
    if (typeof attr !== 'string')
      throw new TypeError('attr is not a string!')
    if (typeof handler !== 'function')
      throw new TypeError('handler is not a function!')

    this.hooks.push({ attr, handler })
    return this
  }

  /**
   * addEventListener wrapper
   * @param {string} event The event to listen for
   * @param {function} handler The event handler
   */
  listen(event, handler) {
    this._element.addEventListener(event, handler)
    return this
  }

  /**
   * querySelector wrapper
   * @param {string} query The query to search
   */
  select(query) {
    let elements = this._element.querySelectorAll(query)

    if (elements.length == 0)
      return []

    if (elements.length == 1)
      return yadl.wrap(elements[0])

    return Array.prototype.map.call(elements, yadl.wrap)
  }

  /**
   * Append a new child to this element
   * @param {yadl.Element} element The element to append to this element
   */
  append(element) {
    if (element.isMounted)
      throw new Error('Element already mounted')

    if (element._element) {
      this._element.appendChild(element._element)
      element.isMounted = true
    } else {
      this._element.appendChild(element)
    }

    let appendHook = this.hooks.find(i => i.attr = 'newChild')
    if (appendHook)
      appendHook.handler('newChild', element)

    return this
  }

  /**
   * Attach this element to a parent
   * @param {yadl.Element} parent The parent to attach this element to
   */
  attach(parent) {
    if (!parent)
      parent = this.document.body

    if (this.isMounted)
      throw new Error('Element already mounted')

    if (typeof parent._element == 'undefined')
      parent.appendChild(this._element)
    else
      parent._element.appendChild(this._element)
    this.isMounted = true

    if (typeof parent.hooks != 'undefined') {
      let appendHook = parent.hooks.find(i => i.attr == 'newChild')
      if (appendHook)
        appendHook.handler('newChild', this)
    }

    return this
  }

  /**
   * Return the children of this element, wrapped.
   */
  get children() {
    let children = this._element.children

    return Array.prototype.map.call(children, yadl.wrap)
  }

  /**
   * Expose the native classList API
   */
  get classList() {
    return this._element.classList
  }
}

yadl.wrap = function (htmlElement) {
  let vElement = new yadl.Element()
  vElement._element = htmlElement
  vElement.document = htmlElement.ownerDocument || htmlElement  // If the document is null, hopefully the element is a Document instance
  return vElement
}

yadl.create = function (type) {
  return new yadl.Element(type, yadl.document)
}

yadl.select = function (query) {
  return yadl.wrap(yadl.document)
    .select(query)
}

module.exports = yadl