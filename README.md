![npm (scoped)](https://img.shields.io/npm/v/@tbrink/yadl)

# YADL (Yet Another DOM Library)

yadl is a tiny DOM library, created specifically for my Visual HTML editor. The intent is to have a simple method of manipulating the DOM, with hooks on all DOM updates, and the ability to carry a persistant virtual DOM. I like chain syntax (d3, for example), so that's what we're doing here.

# Use

`npm install @tbrink/yadl`

# API

The main script exposes a global (in environments with windows) object, yadl. In CommonJS environments, it exports the global.
The global object has the following properties and methods:

## Properties
 - `yadl.document` - The global `HTMLDocument` object for yadl to use in creating and selecting elements. A little bit redundant in persistent mode, but whatever. In non-persistent mode, use this if you want to change the default (window.document), for example if you want to use yadl only in an iframe rather than globally (e.g. `yadl.document = iframe.contentWindow.document`).
 - `yadl.persistant` - Default `false`. Indicates if yadl is in persistent mode (i.e. where it keeps references to `yadl.Element`s for the entire DOM). If you want to turn on persistent mode, use `yadl.init()`.
 - `yadl.root` - Default `null`. If persistent is `true`, this will hold the `yadl.Element` that is the root of the persistent virtual DOM. Usually this is a wrapped `HTMLDocument` element. Has a special property `yadl.root.body` which returns the `yadl.Element` for the body element, for convenience.

## Classes

### `yadl.Element`

This is the class that every element you create, select, or wrap with yadl takes on.

Constructor
 - `yadl.Element(type, doc)` - Creates a new yadl.Element with the given type and parent document. The type argument is parsed for tagname, id, and classes, so you can pass in things like `'#main.class'` and `'button.some-class'`. If the tag is omitted, a div will be used. Generally you shouldn't need to use this constructor directly; `yadl.create()` is simpler and takes care of the document for you.

Properties:

 - `yadl.Element.parent` - Returns this element's parent. In non-persistent mode (the default), this simply wraps the `HTMLElement.parentElement` and returns it. In persistent mode, this returns the instance of `yadl.Element` that corresponds to this elements parent in the virtual DOM.
 - `yadl.Element.children` - Returns an array of the element's children. In non-perstent mode, this will simply be the children wrapped with `yadl.wrap()`; in persistent mode, this will be the actual instances of `yadl.Element` that are persistently associated with this element.
 - `yadl.Element.classList` - Returns the native ClassList object for the Element.

Properties that exist but aren't really meant for common usage:

 - `yadl.Element.document` - The document this element is to be associated with. Usually set appropriately with `yadl.create()`.
 - `yadl.Element.isMounted` - Whether this element has been attached to a parent element yet.
 - `yadl.Element.hooks` - A list of the hooks that have been registered with this element. See `yadl.Element.addHook()` for more information.

Methods

In these methods, hooks refer to a sort of event that provides a way to determine when an element has changed state. For example, if you wanted to know when an element's textContent was changed via `yadl.Element.text()`, you would use `yadl.Element.addHook()` to attach a function that would be called when `yadl.Element.text()` was called. These hooks are one of the main reasons I built this library, because it is a somewhat niche feature that I needed for another project ([visual-html](https://github.com/timothybrink/visual-html)).

Also, all these functions except for the remove() function return `this`, meaning that they are chainable.

 - `yadl.Element.get(propertyName)` - Returns the value of propertyName on the underlying DOM Element, and calls associated hooks.
 - `yadl.Element.set(propertyName, value)` - Sets the value of propertyName on the underlying DOM Element to value, and calls associated hooks.
 - `yadl.Element.style(propertyName, value)` - Sets the given CSS property to the given value on the underlying DOM Element, via the  Element.style object, and calls associated hooks ('style.propertyName').
 - `yadl.Element.text(value)` - Sets Element.textContent to the given value, and calls associated hooks ('textContent').
 - `yadl.Element.addHook(attribute, handler)` - Adds a hook to the given attribute, with the given handler. The handler function will get called with `handler(name, value)` where name is the attribute name and value is the new value it has been set to.
 - `yadl.Element.listen(event, handler)` - Wrapper for `HTMLElement.addEventListener(event, handler)`. Nothing special here.
 - `yadl.Element.select(query)` - Selects elements by the given query. If there are no results, returns an empty array. If there is one result, returns that result. If there are more than one results, returns an array of those results. In non-persistent mode (the default), this just calls the native querySelector method and returns the results, wrapped in `yadl.Element` instances. In persistent mode, this returns the persistant `yadl.Element` instances associated with the given query.
 - `yadl.Element.matches(query)` - Wrapper for the native `HTMLElement.matches(query)` function. Used internally by `yadl.Element.select()` in persistent mode.
 - `yadl.Element.append(element)` - Appends the given `HTMLElement` or `yadl.Element` to the children of this element, and calls handlers associated with the 'newChild' hook. In persistent mode, also addes the given element to the persistent virtual DOM.
 - `yadl.Element.attach(element?)` - Attaches the current element to the given `HTMLElement` or `yadl.Element`, by appending it to the given element's children. Also calls handlers on the given (parent) element's 'newChild' hook. If element is not given, defaults to yadl.document.body (in non-persistent mode, which is the default) or yadl.root.body (in persistent mode)
 - `yadl.Element.remove()` - Wrapper for `HTMLElement.remove()`. Also calls 'remove' hooks on the element, and, in persistent mode, removes this `yadl.Element` from the parent.
 - `yadl.Element.removeChild(childNode)` - Wrapper for `HTMLElement.removeChild(childNode)`. childNode can be either an `HTMLElement` or a `yadl.Element`. Also calls 'removeChild' hooks on the element, and, in persistent mode, removes the `yadl.Element` from the list of children.
 - `yadl.Element.init()` - Called by `yadl.init()`. In persistent mode, populates this elements children with `yadl.Element` instances of the underlying `HTMLElement`s children.

## Methods
 - `yadl.wrap(htmlElement)` - Returns htmlElement, wrapped in a `yadl.Element` instance.
 - `yadl.create(type)` - Returns a new `yadl.Element` instance to be manipulated and attached/appended as you like. The type argument is passed directly to `yadl.Element()`, so you can pass in strings like `'.class'` and `'a#main.class'` (see description above).
 - `yadl.select(query)` - Returns the result of `yadl.wrap(yadl.document).select(query)` in non-persistant mode or `yadl.root.select(query)` in persistant mode. This means that in non-persistant mode it will return a newly-wrapped `yadl.Element` instance(s), whereas in persistant mode it will return the persistant `yadl.Element` instance(s) associated with that selector.
 - `yadl.init(document)` - Turns on persistent mode. This is the best way to turn on persistent mode if you want it. yadl.document is set to the document argument. Also walks the DOM tree and puts it all into the virtual DOM (found at yadl.root). 