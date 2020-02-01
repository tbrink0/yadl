const assert = require('assert')

const yadl = require('./yadl')

describe('yadl', function () {
  describe('yadl.wrap', function () {
    it('returns a yadl.Element', function () {
      let e = yadl.wrap(document.createElement('div'))
      assert(e._element)
    })
  })

  describe('yadl.create', function () {
    it('returns a yadl.Element', function () {
      assert(yadl.create('div')._element)
    })
  })

  describe('yadl.select', function () {
    it('returns empty with no results', function () {
      assert.equal(yadl.select('div').length, 0)
    })

    it('returns a yadl.Element with one result', function () {
      yadl.create('div').attach()
      assert(yadl.select('div')._element)
    })

    it('returns an Array with more than one result', function () {
      yadl.create('div').attach()
      yadl.create('div').attach()
      assert(yadl.select('div').length > 1)
    })

    beforeEach(function () {
      for (let child of document.body.children) {
        child.remove()
      }
    })
  })

  describe('yadl.init', function () {
    it('sets globals properly', function () {
      yadl.init()
      assert(yadl.persistant && yadl.root)
    })

    after(function () {
      yadl.persistant = false
      yadl.root = null
      yadl.document = document
    })
  })
})

describe('yadl.Element', function () {
  describe('.parseTypeString()', function () {
    it('parses just a tagname properly', function () {
      let result = yadl.Element.parseTypeString('div')
      assert.deepStrictEqual(result, { tagName: 'div' })
    })

    it('parses a missing tagname as div', function () {
      let result = yadl.Element.parseTypeString('')
      assert.deepStrictEqual(result, { tagName: 'div' })
    })

    it('parses with only id', function () {
      let result = yadl.Element.parseTypeString('#id')
      assert.deepStrictEqual(result, { tagName: 'div', id: 'id' })
    })

    it('parses a tagname and an id properly', function () {
      let result = yadl.Element.parseTypeString('span#id')
      assert.deepStrictEqual(result, { tagName: 'span', id: 'id' })
    })

    it('uses the first id', function () {
      let result = yadl.Element.parseTypeString('span#a#b')
      assert.deepStrictEqual(result, { tagName: 'span', id: 'a' })
    })

    it('uses the first id with no tagname', function () {
      let result = yadl.Element.parseTypeString('#a#b')
      assert.deepStrictEqual(result, { tagName: 'div', id: 'a' })
    })

    it('parses with tagname and class', function () {
      let result = yadl.Element.parseTypeString('span.c')
      assert.deepStrictEqual(result, { tagName: 'span', classes: ['c'] })
    })

    it('parses with tagname and multiple classes', function () {
      let result = yadl.Element.parseTypeString('span.a.b.c')
      assert.deepStrictEqual(result, { tagName: 'span', classes: ['a', 'b', 'c'] })
    })

    it('parses with only a class', function () {
      let result = yadl.Element.parseTypeString('.c')
      assert.deepStrictEqual(result, { tagName: 'div', classes: ['c'] })
    })

    it('parses with no tag and multiple classes', function () {
      let result = yadl.Element.parseTypeString('.a.b.c')
      assert.deepStrictEqual(result, { tagName: 'div', classes: ['a', 'b', 'c'] })
    })

    it('parses with tag, class, and id', function () {
      let result = yadl.Element.parseTypeString('span.c#id')
      assert.deepStrictEqual(result, { tagName: 'span', id: 'id', classes: ['c'] })
    })

    it('parses with tag, id, and class', function () {
      let result = yadl.Element.parseTypeString('span#id.c')
      assert.deepStrictEqual(result, { tagName: 'span', id: 'id', classes: ['c'] })
    })

    it('parses with only class and id', function () {
      let result = yadl.Element.parseTypeString('.c#id')
      assert.deepStrictEqual(result, { tagName: 'div', id: 'id', classes: ['c'] })
    })

    it('parses with only id and class', function () {
      let result = yadl.Element.parseTypeString('#id.c')
      assert.deepStrictEqual(result, { tagName: 'div', id: 'id', classes: ['c'] })
    })

    it('parses with lots of stuff', function () {
      let result = yadl.Element.parseTypeString('span#a#b.a.c.d.e')
      assert.deepStrictEqual(result, { tagName: 'span', id: 'a', classes: ['a', 'c', 'd', 'e'] })
    })
  })

  describe('constructor()', function () {
    it('creates a null element with no arguments', function () {
      let e = new yadl.Element()
      assert.equal(e._element, null)
    })

    it('creates a valid element with arguments', function () {
      let e = new yadl.Element('span')
      assert.equal(e._element.tagName, 'SPAN')
    })

    it('works with css query selectors tag, id, class', function () {
      let e = new yadl.Element('span#id.class')
      assert.equal(e._element.tagName, 'SPAN')
      assert.equal(e._element.id, 'id')
      assert(e._element.classList.contains('class'))
    })
  })

  describe('#get()', function () {
    it('returns without error', function () {
      let e = yadl.create('div')
      assert.equal(e.get('tagName'), 'DIV')
    })
  })

  describe('#set()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.set('textContent', 'test'), e)
    })

    it('sets properties correctly', function () {
      let e = yadl.create('div').set('textContent', 'test')
      assert.equal(e._element.textContent, 'test')
    })
  })

  describe('#style()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.style('color', 'black'), e)
    })

    it('sets properties correctly', function () {
      assert.equal(yadl.create('div').style('color', 'black')._element.style.color, 'black')
    })
  })

  describe('#text()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.text('test'), e)
    })

    it('sets properties correctly', function () {
      assert.equal(yadl.create('div').text('test')._element.textContent, 'test')
    })
  })

  describe('#addHook()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.addHook('textContent', function () { }), e)
    })

    it('adds hook to this.hooks', function () {
      let e = yadl.create('div').addHook('textContent', function () { })
      assert(e.hooks.length)
    })

    it('throws with bad attr', function () {
      assert.throws(() => {
        yadl.create('div').addHook(0, function () { })
      })
    })

    it('throws with bad handler', function () {
      assert.throws(() => {
        yadl.create('div').addHook('test')
      })
    })
  })

  describe('#listen()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.listen('click', function () { }), e)
    })
  })

  describe('#matches()', function () {
    it('returns true with matching query', function () {
      assert.strictEqual(yadl.create('div').set('className', 'test').matches('div.test'), true)
    })

    it('returns false with non-matching query', function () {
      assert.strictEqual(yadl.create('div').matches('div.test'), false)
    })
  })

  describe('#append()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert(e.append(yadl.create('div')), e)
    })

    it('adds the element (non-persistant)', function () {
      assert(yadl.create('div').append(yadl.create('div'))._element.children.length)
    })

    it('adds the element (persistant)', function () {
      yadl.init()
      let e1 = yadl.create('div')
      let e2 = yadl.create('div').append(e1)
      assert.equal(e2.children[0], e1)
    })

    after(function () {
      yadl.root = null
      yadl.persistant = false
    })
  })

  describe('#attach()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert(e.attach(), e)
    })

    it('attaches to default element', function () {
      let e = yadl.create('div').attach()
      // not sure why but for some reason an empty document.body seems to have one child still.
      assert.strictEqual(document.body.children.length, 2)
    })

    it('attaches to specified element', function () {
      let e = yadl.create('div')
      yadl.create('div').attach(e)
      assert.strictEqual(e._element.children.length, 1)
    })

    beforeEach(function () {
      for (let child of document.body.children) {
        child.remove()
      }
    })
  })

  describe('#init()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.init(), e)
    })

    it('adds DOM children to _children', function () {
      let e = document.createElement('div')
      e.appendChild(document.createElement('span'))
      let yE = yadl.wrap(e).init()
      assert.strictEqual(yE._children.length, 1)
    })

    it('correctly adds DOM children to _children', function () {
      let e = document.createElement('div')
      e.appendChild(document.createElement('span'))
      let yE = yadl.wrap(e).init()
      assert.strictEqual(yE._children[0].get('tagName'), 'SPAN')
    })
  })

  describe('#children', function () {
    it('returns correct number of children in non-persistent', function () {
      let e = yadl.create('div').append(yadl.create('div'))
      assert.strictEqual(e.children.length, 1)
    })

    it('returns correct number of children in persistent', function () {
      yadl.init()
      let e = yadl.create('div').append(yadl.create('div'))
      assert.strictEqual(e.children.length, 1)
    })

    after(function () {
      yadl.root = null
      yadl.persistant = false
    })
  })

  describe('#parent', function () {
    it('returns parent (non-persistent)', function () {
      let child = yadl.create('div')
      let parent = yadl.create('div').append(child)
      assert.equal(child.parent._element, parent._element)
    })

    it('returns parent (persistant)', function () {
      yadl.init()
      let child = yadl.create('div')
      let parent = yadl.create('div').append(child)
      assert.equal(child.parent, parent)
    })

    after(function () {
      yadl.persistant = false
      yadl.root = null
    })
  })

  describe('#classList', function () {
    it('returns classList', function () {
      let e = yadl.create('div')
      assert.equal(e.classList, e._element.classList)
    })
  })

  describe('#removeChild()', function () {
    it('returns this', function () {
      let child = yadl.create('div')
      let e = yadl.create('div').append(child)
      assert.equal(e.removeChild(child), e)
    })

    it('removes child properly (non-persistant)', function () {
      let child = yadl.create('div')
      let e = yadl.create('div').append(child)
      assert.equal(e.removeChild(child).children.length, 0)
    })

    it('removes child properly (persistant)', function () {
      yadl.init()
      let child = yadl.create('div')
      let e = yadl.create('div').append(child)
      assert.equal(e.removeChild(child).children.length, 0)
    })

    after(function () {
      yadl.root = null
      yadl.persistant = false
    })
  })

  describe('#remove()', function () {
    it('removes properly (non-persistant)', function () {
      let child = yadl.create('div')
      let e = yadl.create('div').append(child)
      child.remove()
      assert.equal(e.children.length, 0)
    })
    it('removes properly (persistant)', function () {
      yadl.init()
      let child = yadl.create('div')
      let e = yadl.create('div').append(child)
      child.remove()
      assert.equal(e.children.length, 0)
    })

    after(function () {
      yadl.root = null
      yadl.persistant = false
    })
  })

  describe('#setClass()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.setClass('a'), e)
    })

    it('adds single class properly', function () {
      let e = yadl.create('div')
      e.setClass('a')
      assert(e.classList.contains('a'))
    })

    it('adds multiple classes properly', function () {
      let e = yadl.create('div')
      e.setClass('a', 'b')
      assert(e.classList.contains('a') && e.classList.contains('b'))
    })
  })

  describe('#removeClass()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.removeClass('a'), e)
    })

    it('removes single class properly', function () {
      let e = yadl.create('div')
      e._element.classList.add('a')
      e.removeClass('a')
      assert(e.classList.contains('a') === false)
    })

    it('removes multiple classes properly', function () {
      let e = yadl.create('div')
      e._element.classList.add('a', 'b')
      e.removeClass('a', 'b')
      assert((e.classList.contains('a') || e.classList.contains('b')) === false)
    })
  })

  describe('#setId()', function () {
    it('returns this', function () {
      let e = yadl.create('div')
      assert.equal(e.setId('a'), e)
    })

    it('sets id properly', function () {
      let e = yadl.create('div')
      e.setId('a')
      assert.equal(e._element.id, 'a')
    })
  })
})