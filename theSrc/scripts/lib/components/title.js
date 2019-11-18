import BaseComponent from './baseComponent'
import _ from 'lodash'
import { getLabelDimensionsUsingSvgApproximation, splitIntoLinesByWord } from '../labelUtils'

// TODO preferred dimensions must account for maxes
class Title extends BaseComponent {
  constructor ({ parentContainer, text, fontSize, fontFamily, fontColor, bold = false, maxWidth, maxHeight, maxLines, innerPadding }) {
    super()
    _.assign(this, { parentContainer, text, fontSize, fontFamily, fontColor, bold, maxWidth, maxHeight, maxLines, innerPadding })
  }

  computePreferredDimensions () {
    const lines = splitIntoLinesByWord({
      parentContainer: this.parentContainer,
      text: this.text,
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight,
      maxLines: this.maxLines,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontWeight: (this.bold) ? 'bold' : 'normal'
    })
    const lineDimensions = lines.map(text => getLabelDimensionsUsingSvgApproximation({
      text,
      parentContainer: this.parentContainer,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontWeight: (this.bold) ? 'bold' : 'normal'
    }))

    return {
      width: 0, // NB title width takes what is given, and does not force width on the chart
      height: _(lineDimensions).map('height').sum() + (lines.length - 1) * this.innerPadding
    }
  }

  draw (bounds) {
    const titleContainer = this.parentContainer.append('g')
      .classed('title', true)
      .attr('transform', this.buildTransform(bounds))

    const lines = splitIntoLinesByWord({
      parentContainer: this.parentContainer,
      text: this.text,
      maxWidth: bounds.width, // NB not using this.maxWidth
      maxHeight: bounds.height, // NB not using this.maxHeight
      maxLines: this.maxLines,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontWeight: (this.bold) ? 'bold' : 'normal'
    })

    const textElement = titleContainer.append('text')
      .attr('transform', `translate(${bounds.width / 2}, 0)`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', 0)
      .style('text-anchor', 'middle')
      .style('font-weight', (this.bold) ? 'bold' : 'normal')
      .style('font-size', this.fontSize)
      .style('fill', this.fontColor)
      .style('font-family', this.fontFamily)

    _(lines).each((lineText, i) => {
      textElement.append('tspan')
        .style('dominant-baseline', 'text-before-edge')
        .attr('x', 0)
        .attr('y', i * (this.fontSize + this.innerPadding))
        .text(lineText)
    })
  }
}

module.exports = Title
