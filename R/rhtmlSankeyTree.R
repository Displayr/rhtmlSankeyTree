#' Interactive d3.js Sankey Tree Visualization
#'
#' Create interactive d3.js visualizations of hierarchical data combining
#' Sankey diagrams with tree layout.
#' @param data Input. Should be a list with fields specified below.
#' @param name The variable name of the field that specifies node name in \code{data}. Defaults to "name".
#' @param id Should not change this.
#' @param value The variable name of the field that specifies counts in \code{data}. Defaults to "size".
#' @param childrenName The variable name of the field that specifies children in \code{data}. Defaults to "children".
#' @param treeColors Logical. Colored tree? 
#' @param maxLabelLength Integer. Line wrapping will occur when the label of the node has width more than this value * 8 (pixels per char). Defaults to 20.
#' @param nodeHeight Height of each node in pixels. Defaults to 100 pixels.
#' @param tooltip Tooltip to attach to each node. 
#' @param categoryLegend Logical. Attach a category legend? (Not used at the moment).
#' @param terminalDescription Logical. Add description for terminal nodes? Defaults to FALSE.
#' @param numeric.distribution Logical. Show numerical distribution for each node? If regression tree, then a histogram is plotted. If classification tree, then a horizontal bar plot is drawn.
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
  treeColors = TRUE,
  maxLabelLength = 25,
  nodeHeight = 100,
  tooltip = NULL,
  categoryLegend = FALSE,
  terminalDescription = FALSE,
  numeric.distribution = TRUE,
  width = NULL, 
  height = NULL) {

  # if color is already specified by RGB format, not re-computing again
  if (!is.null(data$color) && 
      is.character(data$color) && 
      grepl("^#[abcdef0-9][abcdef0-9]?[abcdef0-9]?[abcdef0-9]?[abcdef0-9]?[abcdef0-9]?$",
            data$color, ignore.case = TRUE)){
    treeColors = FALSE
  }

  # forward options using x
  x = list(
    data = data,
    opts = list(
      name = name,
      id = id,
      value = value,
      childrenName = childrenName,
      treeColors = treeColors,
      maxLabelLength = maxLabelLength,
      nodeHeight = nodeHeight,
      categoryLegend = categoryLegend,
      terminalDescription = terminalDescription,
      numericDistribution = numeric.distribution,
      tooltip = tooltip
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
