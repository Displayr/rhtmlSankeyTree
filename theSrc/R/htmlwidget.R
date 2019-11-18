#' Interactive d3.js Sankey Tree Visualization
#'
#' Create interactive d3.js visualizations of hierarchical data combining
#' Sankey diagrams with tree layout.
#' @param data Input. Should be a list with fields specified below.
#' @param name The variable name of the field that specifies node name in \code{data}. Defaults to "name".
#' @param id Should not change this.
#' @param value The variable name of the field that specifies counts in \code{data}. Defaults to "size".
#' @param childrenName The variable name of the field that specifies children in \code{data}. Defaults to "children".
#' @param maxLabelLength Integer. Line wrapping will occur when the label of the node has width more than this value * 8 (pixels per char). Defaults to 25.
#' @param nodeHeight Height of each node in pixels. Defaults to 100 pixels.
#' @param tooltip Tooltip to attach to each node.
#' @param terminalDescription Logical. Add description for terminal nodes? Defaults to FALSE.
#' @param numeric.distribution Logical. Show numerical distribution for each node? If regression tree, then a histogram is plotted. If classification tree, then a horizontal bar plot is drawn. Defaults to TRUE.
#' @param footer character. Sets the footer of the chart, defaults to NULL. The footer is left-aligned.
#' @param footer.font.size integer. Font size of the chart footer.font.size, defaults to 11 pixcels.
#' @param footer.font.family character. Font family of the chart footer.font.family, defaults to "sans-serif".
#' @param footer.font.color An RGB character to set the color of the chart footer.font.color. Defaults to "#000000".
#' @param subtitle character. Sets the subtitle of the chart, defaults to NULL. The subtitle is centred.
#' @param subtitle.font.size integer. Font size of the chart subtitle, defaults to 18 pixcels.
#' @param subtitle.font.family character. Font family of the chart subtitle, defaults to "sans-serif".
#' @param subtitle.font.color An RGB character to set the color of the chart subtitle. Defaults to "#000000".
#' @param title character. Sets the title of the chart, defaults to NULL. The title is centred.
#' @param title.font.size integer. Font size of the chart title, defaults to 24 pixcels.
#' @param title.font.family character. Font family of the chart title, defaults to "sans-serif".
#' @param title.font.color An RGB character to set the color of the chart title. Defaults to "#000000".
#' 
#' 
#' @import htmlwidgets
#'
#' @export
SankeyTree <- function(
  data = NULL,
  name = "name",
  id = "id",
  value = "size",
  childrenName = "children",
  maxLabelLength = 25,
  nodeHeight = 100,
  tooltip = NULL,
  treeColors = FALSE, # TODO. not used. remove from callees
  categoryLegend = FALSE, # TODO. not used. remove from callees
  terminalDescription = FALSE,
  numeric.distribution = TRUE,
  footer = NULL,
  footer.font.size = 11,
  footer.font.family = "sans-serif",
  footer.font.color = "#000000",
  subtitle = NULL,
  subtitle.font.size = 18,
  subtitle.font.family = "sans-serif",
  subtitle.font.color = "#000000",
  title = NULL,
  title.font.size = 24,
  title.font.family = "sans-serif",
  title.font.color = "#000000",
  width = NULL, 
  height = NULL) {

  # forward options using x
  x = list(
    data = data,
    opts = list(
      name = name,
      id = id,
      value = value,
      childrenName = childrenName,
      maxLabelLength = maxLabelLength,
      nodeHeight = nodeHeight,
      terminalDescription = terminalDescription,
      numericDistribution = numeric.distribution,
      tooltip = tooltip,
      title = title,
      titleFontSize = title.font.size,
      titleFontFamily = title.font.family,
      titleFontColor = title.font.color,
      subtitle = subtitle,
      subtitleFontSize = subtitle.font.size,
      subtitleFontFamily = subtitle.font.family,
      subtitleFontColor = subtitle.font.color,
      footer = footer,
      footerFontSize = footer.font.size,
      footerFontFamily = footer.font.family,
      footerFontColor = footer.font.color,
    )
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'rhtmlSankeyTree',
    x,
    width = width,
    height = height,
    sizingPolicy = htmlwidgets::sizingPolicy(
      padding = 5,
      browser.fill = TRUE, # resizing will not work if FALSE
      viewer.fill = TRUE
    ),
    package = 'rhtmlSankeyTree'
  )
}

#' Shiny bindings for sankeytree
#'
#' Output and render functions for using sankeytree within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a sankeytree
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name sankeytree-shiny
#'
#' @export
sankeytreeOutput <- function(outputId, width = '100%', height = '400px'){
  shinyWidgetOutput(outputId, 'rhtmlSankeyTree', width, height, package = 'rhtmlSankeyTree')
}

#' @rdname sankeytree-shiny
#' @export
renderSankeytree <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, sankeytreeOutput, env, quoted = TRUE)
}
