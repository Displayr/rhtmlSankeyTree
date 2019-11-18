class BaseComponent {
  computePreferredDimensions () {
    return { width: 0, height: 0 }
  }

  buildTransform ({ left, top }) {
    return `translate(${left},${top})`
  }

  draw (bounds) {
    throw new Error('must be defined by subclass')
  }
}

module.exports = BaseComponent
