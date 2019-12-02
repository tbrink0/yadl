import VElement from './VElement'

let yadlDocument = window.document

export function create(type) {
  return new VElement(type, yadlDocument)
}

export function select(query) {
  return VElement.wrap(yadlDocument)
    .select(query)
}

export function wrap(element) {
  return VElement.wrap(element)
}

export function setDocument(newDocument) {
  yadlDocument = newDocument
}