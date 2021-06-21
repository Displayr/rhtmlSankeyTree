// NB This util is duplicated between Displayr/rhtmlHeatMap and Displayr/rhtmlPalmTrees and many others

import _ from 'lodash'

let uniqueId = 0
function getUniqueId () { return uniqueId++ }
function toRadians (degrees) { return degrees * (Math.PI / 180) }

function getLabelDimensionsUsingSvgApproximation ({ parentContainer, text, fontSize, fontFamily, fontWeight, rotation = 0 }) {
  const uniqueId = `tempLabel-${getUniqueId()}`

  const container = parentContainer.append('g')
    .attr('class', 'tempLabel')
    .attr('id', uniqueId)

  const textElement = container.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', 0)
    .attr('transform', `rotate(${rotation})`)

  textElement.append('tspan')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', `${fontSize}px`)
    .style('font-family', fontFamily)
    .style('font-weight', fontWeight)
    .style('dominant-baseline', 'text-before-edge')
    .text(text)

  const { x, y, width: unadjustedWidth, height: unadjustedHeight } = textElement.node().getBBox()

  // NB on some window sizes getBBox will return negative y offsets. Add them to returned value for consistent behaviour
  // across all window sizes
  const unrotatedWidth = unadjustedWidth + x
  const unrotatedHeight = unadjustedHeight + y

  parentContainer.selectAll(`#${uniqueId}`).remove()

  const angleInRads = toRadians(Math.abs(rotation))
  const height = Math.sin(angleInRads) * unrotatedWidth + Math.cos(angleInRads) * unrotatedHeight
  const width = Math.cos(angleInRads) * unrotatedWidth + Math.sin(angleInRads) * unrotatedHeight
  const xOffset = unrotatedHeight * Math.sin(angleInRads)
  const yOffset = -1 * (unrotatedHeight - unrotatedHeight * Math.cos(angleInRads))

  return { width, height, xOffset, yOffset }
}

function wordTokenizer (inputString) {
  const inputString2 = inputString.replace(/<br>/g, ' <br> ')
  return inputString2.split(' ').map(_.trim).filter((token) => !_.isEmpty(token))
}

function splitIntoLinesByWord ({ parentContainer, text, fontSize = 12, fontFamily = 'sans-serif', fontWeight = 'normal', maxWidth, maxHeight, maxLines = null, rotation = 0 } = {}) {
  let tokens = wordTokenizer(text)
  return _splitIntoLines({
    parentContainer,
    text,
    fontSize,
    fontFamily,
    fontWeight,
    maxWidth,
    maxHeight,
    maxLines,
    tokens,
    joinCharacter: ' ',
    rotation,
  })
}

function splitIntoLinesByCharacter ({ parentContainer, text, fontSize = 12, fontFamily = 'sans-serif', fontWeight = 'normal', maxWidth, maxHeight, maxLines = null, rotation = 0 } = {}) {
  let tokens = text.split('')
  return _splitIntoLines({
    parentContainer,
    text,
    fontSize,
    fontFamily,
    fontWeight,
    maxWidth,
    maxHeight,
    maxLines,
    tokens,
    joinCharacter: '',
    rotation,
  })
}

function _splitIntoLines ({ parentContainer, text, fontSize = 12, fontFamily = 'sans-serif', fontWeight = 'normal', maxWidth = null, maxHeight = null, maxLines = null, tokens, joinCharacter, rotation } = {}) {
  if (text.length === 0) { return [text] }
  let currentLine = []
  let lines = []
  let totalHeight = 0
  const truncationString = '...'
  let token = null

  const horizontalAndOnFirstLine = () => rotation === 0 && lines.length === 0
  const widthExceeded = (width) => !_.isNull(maxWidth) && width > maxWidth
  const heightExceeded = (height) => !_.isNull(maxHeight) && height > maxHeight
  const getDimensionsFromString = (string) => getLabelDimensionsUsingSvgApproximation({
    parentContainer,
    text: string,
    fontSize,
    fontFamily,
    fontWeight,
    rotation,
  })
  const getDimensionsFromArray = (tokenArray) => getDimensionsFromString(tokenArray.join(joinCharacter))
  const getDimensions = (arrayOrString) => (_.isArray(arrayOrString))
    ? getDimensionsFromArray(arrayOrString)
    : getDimensionsFromString(arrayOrString)

  function truncateWith () {
    let lastLine = lines[lines.length - 1]
    const numTruncationCharacters = truncationString.length
    lastLine = `${lastLine}${truncationString}`
    let tooBig = true
    while (tooBig && lastLine.length > 0 && lastLine !== truncationString) {
      const { width } = getDimensions(lastLine)
      tooBig = widthExceeded(width)
      if (!tooBig) { break }
      lastLine = lastLine.slice(0, lastLine.length - (numTruncationCharacters + 1)) + truncationString
    }

    lines[lines.length - 1] = lastLine
  }

  while (token = tokens.shift()) { // eslint-disable-line no-cond-assign
    if (token === '<br>') {
      const { height } = getDimensions(currentLine)
      lines.push(`${currentLine.join(joinCharacter)}`)
      totalHeight += height
      currentLine = []
      continue
    }

    currentLine.push(token)

    const { width, height } = getDimensions(currentLine)
    if (heightExceeded(totalHeight + height) && !horizontalAndOnFirstLine()) {
      if (lines.length === 0) {
        // TODO check if the current line still fits, and if not delete characters
        lines.push(`${currentLine.join(joinCharacter)}`)
        truncateWith()
        currentLine = []
        break
      } else {
        // TODO check if the modified last line still fits, and if not delete characters
        truncateWith()
        currentLine = []
        break
      }
    }

    // this still allows height to be exceeded ...
    if ((widthExceeded(width)) && currentLine.length > 1) {
      if (maxLines && lines.length === maxLines - 1) {
        currentLine.pop()
        lines.push(`${currentLine.join(joinCharacter)}`)
        truncateWith()
        currentLine = []
        break
      } else {
        tokens.unshift(currentLine.pop())
        lines.push(`${currentLine.join(joinCharacter)}`)
        totalHeight += height
        currentLine = []
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(`${currentLine.join(joinCharacter)}`)
  }

  const finalResult = (lines.length === 0)
    ? ['...']
    : lines

  return finalResult
}

module.exports = {
  getLabelDimensionsUsingSvgApproximation,
  splitIntoLinesByWord,
  splitIntoLinesByCharacter,
}
