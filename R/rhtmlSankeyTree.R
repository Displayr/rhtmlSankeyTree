#' Interactive d3.js Sankey Tree Visualization
#'
#' Create interactive d3.js visualizations of hierarchical data combining
#' Sankey diagrams with tree layout.
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
  maxLabelLength = NULL,
  nodeHeight = NULL,
  tooltip = NULL,
  colorLegend = FALSE,
  categoryLegend = FALSE,
  terminalDescription = FALSE,
  numeric.distribution = TRUE,
  width = NULL, 
  height = NULL) {
  
  # convert rpart data
  if(inherits(data,"rpart")){
    data <- convert_rpart(data)
    name <- "description"
    value <- "n"
    childrenName = "kids"
  }
  
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
      colorLegend = colorLegend,
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