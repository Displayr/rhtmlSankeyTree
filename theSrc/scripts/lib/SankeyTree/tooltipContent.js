import d3 from 'd3'
import _ from 'lodash'

const realFormatter = d3.format(',.1f')
const intFormatter = d3.format(',d')

function createClTips (data, scale) {
  if (data.nodeDistribution) {
    let rowData = _.zip(data.nodeDistribution, data.nodeVariables, data.nodeDistribution.map(scale))
    let rows = _(rowData).map(createCLTipRow).value().join('')
    return `
      n: ${intFormatter(data.n)}<br>
      Description: 
      <div class='tipTableContainer' style='white-space:nowrap;'>
        <table class='tipTable'>${rows}</table>
      </div>`
  }

  return ''
}

function createCLTipRow ([distribution, variable, scaledDistribution]) {
  return `
    <tr>
      <td class='tipDClassification num' style='white-space:nowrap;'>${intFormatter(Math.round(distribution * 100))}%</td>
      <td class='tipDClassification' style='white-space:nowrap;'>${variable}</td>
      <td class='tipDClassification' style='white-space:nowrap;'>
        <div style='width:${scaledDistribution}px;height:8px;background-color:steelblue'></div>
      </td>
    </tr>`
}

function createRgTips (data, scale, maxL) {
  const maxDomain = Math.max(d3.max(data.overallDistribution || []), d3.max(data.nodeDistribution || []))
  scale.domain([0, maxDomain])

  let tableContent = ''
  if (data.nodeDistribution) {
    const scaledNodeDistribution = _(data.nodeDistribution).map(scale).map(Math.floor).value()
    const scaledOverallDistribution = _(data.overallDistribution).map(scale).map(Math.floor).value()
    const columnData = _.zip(scaledNodeDistribution, scaledOverallDistribution)
    const columns = _.range(columnData.length).map(index => createRgTableColumn(index, columnData, maxL)).join('')

    tableContent = `
      <div class='tipTableContainer' style='white-space:nowrap;'>
        <table class='tipTable'>
          <tr>${columns}</tr>
        </table>
      </div>      
    `
  }

  const { y, y0, n } = data.regressionData
  const postTableContent = `<div class='tipTextAfterTable'>Node Mean = ${realFormatter(y)}, Global Mean = ${realFormatter(y0)}, n = ${realFormatter(n)}</div>`

  return `${tableContent}${postTableContent}`
}

function createRgTableColumn (index, columnData, maxL) {
  const parts = []
  parts.push(`<td class='tipColumn' style='height:${maxL}px'>`)

  const isFirst = index === 0
  const isLast = index === columnData.length - 1

  const solidDistH = columnData[index][0]
  const dashDistH = columnData[index][1]
  const prevDashDistH = (isFirst) ? null : columnData[index - 1][1]
  const nextDashDistH = (isLast) ? null : columnData[index + 1][1]

  const makeGraphPart = (cssClass, height) => `<div class='regressionTipSection ${cssClass}' style='height:${height}px'></div>`

  // TODO: clean this up? probably not worth it
  if (isFirst) {
    if (solidDistH < dashDistH) {
      if (dashDistH < nextDashDistH) {
        parts.push(makeGraphPart('transparent rightDash', nextDashDistH - dashDistH))
        parts.push(makeGraphPart('transparent leftDash topDash', dashDistH - solidDistH))
        parts.push(makeGraphPart('blue leftDash', solidDistH))
      } else if (solidDistH < nextDashDistH && nextDashDistH <= dashDistH) {
        parts.push(makeGraphPart('transparent leftDash topDash rightDash', dashDistH - nextDashDistH))
        parts.push(makeGraphPart('transparent leftDash', nextDashDistH - solidDistH))
        parts.push(makeGraphPart('blue leftDash', solidDistH))
      } else if (nextDashDistH <= solidDistH) {
        parts.push(makeGraphPart('transparent leftDash topDash rightDash', dashDistH - solidDistH))
        parts.push(makeGraphPart('blue leftDash rightDash', solidDistH - nextDashDistH))
        parts.push(makeGraphPart('blue leftDash', nextDashDistH))
      }
    } else {
      if (solidDistH < nextDashDistH) {
        parts.push(makeGraphPart('transparent rightDash', nextDashDistH - solidDistH))
        parts.push(makeGraphPart('blue rightDash', solidDistH - dashDistH))
        parts.push(makeGraphPart('blue leftDash topDash', dashDistH))
      } else if (dashDistH < nextDashDistH && nextDashDistH <= solidDistH) {
        parts.push(makeGraphPart('blue', solidDistH - nextDashDistH))
        parts.push(makeGraphPart('blue rightDash', nextDashDistH - dashDistH))
        parts.push(makeGraphPart('blue leftDash topDash', dashDistH))
      } else if (nextDashDistH <= dashDistH) {
        parts.push(makeGraphPart('blue', solidDistH - dashDistH))
        parts.push(makeGraphPart('blue leftDash topDash rightDash', dashDistH - nextDashDistH))
        parts.push(makeGraphPart('blue leftDash', nextDashDistH))
      }
    }
  } else if (isLast) {
    if (solidDistH < dashDistH) {
      if (dashDistH < prevDashDistH) {
        parts.push(makeGraphPart('transparent topDash rightDash', dashDistH - solidDistH))
        parts.push(makeGraphPart('blue rightDash', solidDistH))
      } else if (solidDistH < prevDashDistH && prevDashDistH <= dashDistH) {
        parts.push(makeGraphPart('transparent leftDash topDash rightDash', dashDistH - prevDashDistH))
        parts.push(makeGraphPart('transparent rightDash', prevDashDistH - solidDistH))
        parts.push(makeGraphPart('blue rightDash', solidDistH))
      } else if (prevDashDistH <= solidDistH) {
        parts.push(makeGraphPart('transparent leftDash topDash rightDash', dashDistH - solidDistH))
        parts.push(makeGraphPart('blue leftDash rightDash', solidDistH - prevDashDistH))
        parts.push(makeGraphPart('blue rightDash', prevDashDistH))
      }
    } else {
      if (solidDistH < prevDashDistH) {
        parts.push(makeGraphPart('blue leftDash', solidDistH - dashDistH))
        parts.push(makeGraphPart('blue topDash rightDash', dashDistH))
      } else if (dashDistH < prevDashDistH && prevDashDistH <= solidDistH) {
        parts.push(makeGraphPart('blue', solidDistH - prevDashDistH))
        parts.push(makeGraphPart('blue leftDash', prevDashDistH - dashDistH))
        parts.push(makeGraphPart('blue topDash rightDash', dashDistH))
      } else if (prevDashDistH <= dashDistH) {
        parts.push(makeGraphPart('blue', solidDistH - dashDistH))
        parts.push(makeGraphPart('blue leftDash topDash rightDash', dashDistH - prevDashDistH))
        parts.push(makeGraphPart('blue rightDash', prevDashDistH))
      }
    }
  } else {
    if (solidDistH < dashDistH) {
      if (dashDistH < nextDashDistH) {
        parts.push(makeGraphPart('transparent rightDash', nextDashDistH - dashDistH))
        parts.push(makeGraphPart('transparent topDash', dashDistH - solidDistH))
        parts.push(makeGraphPart('blue', solidDistH))
      } else if (solidDistH < nextDashDistH && nextDashDistH <= dashDistH) {
        parts.push(makeGraphPart('transparent topDash rightDash', dashDistH - nextDashDistH))
        parts.push(makeGraphPart('transparent', nextDashDistH - solidDistH))
        parts.push(makeGraphPart('blue', solidDistH))
      } else if (nextDashDistH <= solidDistH) {
        parts.push(makeGraphPart('transparent topDash rightDash', dashDistH - solidDistH))
        parts.push(makeGraphPart('blue rightDash', solidDistH - nextDashDistH))
        parts.push(makeGraphPart('blue', nextDashDistH))
      }
    } else {
      if (solidDistH < nextDashDistH) {
        parts.push(makeGraphPart('transparent rightDash', nextDashDistH - solidDistH))
        parts.push(makeGraphPart('blue rightDash', solidDistH - dashDistH))
        parts.push(makeGraphPart('blue topDash', dashDistH))
      } else if (dashDistH < nextDashDistH && nextDashDistH <= solidDistH) {
        parts.push(makeGraphPart('blue', solidDistH - nextDashDistH))
        parts.push(makeGraphPart('blue rightDash', nextDashDistH - dashDistH))
        parts.push(makeGraphPart('blue topDash', dashDistH))
      } else if (nextDashDistH <= dashDistH) {
        parts.push(makeGraphPart('blue', solidDistH - dashDistH))
        parts.push(makeGraphPart('blue topDash rightDash', dashDistH - nextDashDistH))
        parts.push(makeGraphPart('blue', nextDashDistH))
      }
    }
  }

  parts.push('</td>')
  return parts.join('')
}

module.exports = { createClTips, createRgTips }
