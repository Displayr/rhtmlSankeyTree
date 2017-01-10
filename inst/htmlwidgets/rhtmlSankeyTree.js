function Sankey() {

    var data,
        opts,
        maxBarLength,
        treeMargins = {top: 5, left: 10, bottom: 5, right: 10},
        treeDim,
        newTreeDim,
        xscale = 1,
        yscale = 1,
        x,
        y,
        scale,
        newScale,
        svgTrans,
        svgGroup,
        zoomListener,
        init = true,
        realFormatter = d3.format(",.1f"),
        intFormatter = d3.format(",d"),
        width = 500,
        height = 500,
        prevWidth,
        prevHeight;

    var tooltip = {

        createClTips: function(data, scale, maxL) {

            if (data.nodeDistribution) {
                data.tooltip = "";
                nval = data.nodeDistribution.length;

                var t = "n: " + intFormatter(data.n) + "<br>";
                t = t + "Description: ";
                t = t + "<div class='tipTableContainer'><table class='tipTable'>";
                // main tip table
                for (var i = 0; i < nval; i++) {
                    t = t + "<tr>";
                    t = t + "<td class='tipDClassificationNum'>" + intFormatter(Math.round(data.nodeDistribution[i]*100)) + "%</td>";
                    t = t + "<td class='tipDClassification'>" + data.nodeVariables[i] + "</td>";
                    t = t + "<td class='tipDClassification'>";
                    t = t + "<div style='width:" + scale(data.nodeDistribution[i]) + "px;height:8px;background-color:steelblue'></div>" + "</td>";
                    t = t + "</tr>";
                }

                t = t + "</table></div>";
                data.tooltip = t;
            }

            if (data[opts.childrenName]) {
                tooltip.createClTips(data[opts.childrenName][0], scale, maxL);
                tooltip.createClTips(data[opts.childrenName][1], scale, maxL);
            }
        },


        createRgTips: function(data, scale, maxL) {
            if (data.nodeDistribution !==  0) {
                data.tooltip = "";
                nval = data.overallDistribution.length;
                var maxDomain = Math.max(d3.max(data.overallDistribution), d3.max(data.nodeDistribution));
                scale.domain([0, maxDomain]);
                var t = "<div class='tipTableContainer'><table class='tipTable'>";
                t = t + "<tr>";
                var prevDistH, prevdashDistH, solidDistH, dashDistH, nextDistH, nextdashDistH;
                for (var i = 0; i < nval; i++) {
                    t = t + "<td class='tipD' style='height:" + maxL +"px'>";
                    solidDistH = Math.floor(scale(data.nodeDistribution[i]));
                    dashDistH = Math.floor(scale(data.overallDistribution[i]));

                    if (i === 0) {
                        nextDistH = Math.floor(scale(data.nodeDistribution[i+1]));
                        nextdashDistH = Math.floor(scale(data.overallDistribution[i+1]));
                        if (solidDistH < dashDistH) {
                            if (dashDistH < nextdashDistH) {
                                t = t + "<div class='tipNocolRightDash' style='height:" + (nextdashDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipNocolTopLeftDash' style='height:" + (dashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftDash' style='height:" + (solidDistH) + "px'></div>";
                            } else if (solidDistH < nextdashDistH && nextdashDistH <= dashDistH ) {
                                t = t + "<div class='tipNocolTopLeftRightDash' style='height:" + (dashDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipNocolLeftDash' style='height:" + (nextdashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftDash' style='height:" + (solidDistH) + "px'></div>";
                            } else if (nextdashDistH <= solidDistH) {
                                t = t + "<div class='tipNocolTopLeftRightDash' style='height:" + (dashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftRightDash' style='height:" + (solidDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftDash' style='height:" + (nextdashDistH) + "px'></div>";
                            }

                        } else {
                            if (solidDistH < nextdashDistH) {
                                t = t + "<div class='tipNocolRightDash' style='height:" + (nextdashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (solidDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopLeftDash' style='height:" + (dashDistH) + "px'></div>";
                            } else if (dashDistH < nextdashDistH && nextdashDistH <= solidDistH ) {
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (nextdashDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopLeftDash' style='height:" + (dashDistH) + "px'></div>";
                            } else if (nextdashDistH <= dashDistH) {
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopLeftRightDash' style='height:" + (dashDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftDash' style='height:" + (nextdashDistH) + "px'></div>";
                            }
                        }
                    } else if (i === nval-1){

                        if (solidDistH < dashDistH) {

                            if (dashDistH < prevdashDistH) {
                                t = t + "<div class='tipNocolTopRightDash' style='height:" + (dashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (solidDistH) + "px'></div>";
                            } else if (solidDistH < prevdashDistH && prevdashDistH <= dashDistH ) {
                                t = t + "<div class='tipNocolTopLeftRightDash' style='height:" + (dashDistH - prevdashDistH) + "px'></div>";
                                t = t + "<div class='tipNocolRightDash' style='height:" + (prevdashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (solidDistH) + "px'></div>";
                            } else if (prevdashDistH <= solidDistH) {
                                t = t + "<div class='tipNocolTopLeftRightDash' style='height:" + (dashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftRightDash' style='height:" + (solidDistH - prevdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (prevdashDistH) + "px'></div>";
                            }

                        } else {

                            if (solidDistH < prevdashDistH) {
                                t = t + "<div class='tipBlueLeftDash' style='height:" + (solidDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopRightDash' style='height:" + (dashDistH) + "px'></div>";
                            } else if (dashDistH < prevdashDistH && prevdashDistH <= solidDistH ) {
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH - prevdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueLeftDash' style='height:" + (prevdashDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopRightDash' style='height:" + (dashDistH) + "px'></div>";
                            } else if (prevdashDistH <= dashDistH) {
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopLeftRightDash' style='height:" + (dashDistH - prevdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (prevdashDistH) + "px'></div>";
                            }

                        }

                    } else {

                        nextDistH = Math.floor(scale(data.nodeDistribution[i+1]));
                        nextdashDistH = Math.floor(scale(data.overallDistribution[i+1]));
                        if (solidDistH < dashDistH) {
                            if (dashDistH < nextdashDistH) {
                                t = t + "<div class='tipNocolRightDash' style='height:" + (nextdashDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipNocolTopDash' style='height:" + (dashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH) + "px'></div>";
                            } else if (solidDistH < nextdashDistH && nextdashDistH <= dashDistH ) {
                                t = t + "<div class='tipNocolTopRightDash' style='height:" + (dashDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipNocolNoDash' style='height:" + (nextdashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH) + "px'></div>";
                            } else if (nextdashDistH <= solidDistH) {
                                t = t + "<div class='tipNocolTopRightDash' style='height:" + (dashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (solidDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueNoDash' style='height:" + (nextdashDistH) + "px'></div>";
                            }
                        } else {
                            if (solidDistH < nextdashDistH) {
                                t = t + "<div class='tipNocolRightDash' style='height:" + (nextdashDistH - solidDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (solidDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopDash' style='height:" + (dashDistH) + "px'></div>";
                            } else if (dashDistH < nextdashDistH && nextdashDistH <= solidDistH ) {
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueRightDash' style='height:" + (nextdashDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopDash' style='height:" + (dashDistH) + "px'></div>";
                            } else if (nextdashDistH <= dashDistH) {
                                t = t + "<div class='tipBlueNoDash' style='height:" + (solidDistH - dashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueTopRightDash' style='height:" + (dashDistH - nextdashDistH) + "px'></div>";
                                t = t + "<div class='tipBlueNoDash' style='height:" + (nextdashDistH) + "px'></div>";
                            }
                        }
                    }
                    t = t  + "</td>";
                    prevDistH = solidDistH;
                    prevdashDistH = dashDistH;
                }
                t = t + "</tr>";
                t = t + "</table></div>";
                t = t + "<div class='tipTextAfterTable'>"
                        + "Node Mean = " + realFormatter(data.y)
                        + ", Global Mean = " + realFormatter(data.y0)
                        + ", n = " + realFormatter(data.n) + "</div>";
                data.tooltip = t;
            } else {
                data.tooltip = "<div class='tipTableContainer'>"
                        + "Node Mean = " + realFormatter(data.y)
                        + ", Global Mean = " + realFormatter(data.y0)
                        + ", n = " + realFormatter(data.n) + "</div>";
            }

            if (data[opts.childrenName]) {
                tooltip.createRgTips(data[opts.childrenName][0], scale, maxL);
                tooltip.createRgTips(data[opts.childrenName][1], scale, maxL);
            }

        }

    };

    // Define the zoom function for the zoomable tree
    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function resizeChart(el) {
        if (init) {
            return;
        }
        svgTrans = d3.transform(svgGroup.attr("transform"));
        scale = svgTrans.scale[0];
        newScale = scale;
        x = svgTrans.translate[0];
        y = svgTrans.translate[1];

        var boxWidth = width - treeMargins.left - treeMargins.right - 20,
            boxHeight = height - treeMargins.top - treeMargins.bottom - 10,
            treeWidth = treeDim.width,
            treeHeight = treeDim.height;

        xscale = (boxWidth)/(prevWidth - treeMargins.left - treeMargins.right - 20)*scale;
        yscale = (boxHeight)/(prevHeight - treeMargins.top - treeMargins.bottom - 10)*scale;

        if (boxWidth >= treeWidth*xscale) {
            if (boxHeight >= treeHeight*yscale) {
                newScale = Math.min(Math.max(xscale, yscale), 3);
            } else {
                newScale = Math.min(yscale, 3);
            }
        } else {
            if (boxHeight >= treeHeight*yscale) {
                newScale = Math.min(xscale, 3);
            } else {
                newScale = Math.min(xscale, yscale, 3);
            }
        }

        svgGroup.attr("transform", "translate(" + x + "," + y + ")scale(" + newScale + ")")
        .each(function() {
            newTreeDim = this.getBoundingClientRect();
        });

        svgGroup.attr("transform", "translate(" + x + "," + y + ")scale(" + newScale + ")");
        treeDim = newTreeDim;
        zoomListener.scale(newScale);
        zoomListener.translate([x, y]);
        prevWidth = width;
        prevHeight = height;
    }

    function chart(selection) {

        var treeData = data;

        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 0;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        // Misc. variables
        var i = 0;
        var duration = 400;
        var root;
        var pxPerChar = 7;
        var nodeTextSize = 10; // initial node text size in pixcels
        var newWidth;
        var newHeight;
        var nodeScale;
        var heightScale;
        var nodeRectWidth = 5;
        var nodeTextDx = 10;


        // add treeColors if told yes
        if(opts.treeColors){
          var tc = TreeColors("add");
          tc.children(opts.childrenName);
          tc(treeData);
        }

        // work on tooltip
        var tip = {};

        if(opts.tooltip){
          tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .html(function(d) {return d[opts.tooltip]; });

            var tipTriangle = d3.select("body")
                            .append("div")
                            .attr("id", "littleTriangle")
                            .style("visibility", "hidden");
            if (opts.numericDistribution) {
                var tipBarScale;
                if (treeData.treeType === "Classification") {
                    maxBarLength = 40;
                    tipBarScale = d3.scale.linear().domain([0, 1]).range([0, maxBarLength]);
                    tooltip.createClTips(treeData, tipBarScale, maxBarLength);
                } else if (treeData.treeType === "Regression") {
                    maxBarLength = 50;
                    tipBarScale = d3.scale.linear().domain([0, 1]).range([0, maxBarLength]);
                    tooltip.createRgTips(treeData, tipBarScale, maxBarLength);
                }
            }

          /*if(Array.isArray(opts.tooltip)){
            tip.html(function(d){
              var htmltip = [];
              opts.tooltip.forEach(function(ky){
                htmltip.push( ky + ": " + d[ky] );
              });
              return htmltip.join("<br/>");
            });
          } else if(typeof(opts.tooltip) === "function"){
            tip.html(opts.tooltip);
          } else {
            tip.html(function(d) {
              return d[opts.tooltip];
            });
          }*/
        }

        // size of the diagram
        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = selection.select("svg");

        var tree = d3.layout.tree()
            .size([height, width])
            .children(function(d){return d[opts.childrenName]});

        // define a d3 diagonal projection for use by the node paths later on.
        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            })
            .source(function(d){
              if(d.ystacky) return d;
              return d.source;
            });

        var nodeHeightRatio = getNodeHeightRatio();

        var nhScale = d3.scale.pow()
                      .exponent(2).domain([0.5,1]).range([1,2]);
        nodeHeightRatio = nhScale(nodeHeightRatio);
        //nodeHeightRatio = 1;
        /*function attachLegend(){
          // assumes two sets of data, color and text of the legend, has been passed on
          // as input from the R binding
          var legendColor = treeData.legendColor.reverse();
          var legendText = treeData.legendText.reverse();

          // fixed dimensions
          // Y
          var leftY = height*0.35;
          var legendBoxHeight = height*0.3;
          var txtHeight = legendBoxHeight/legendText.length;
          var fontSize = txtHeight*0.7;

          // X
          var rectWidth = width*0.025;
          var textLength = 3;
          legendText.forEach(function(d){
            if (d.length > textLength) {
              textLength = d.length;
            }
          });
          var legendBoxWidth = rectWidth + textLength*fontSize;
          var leftX = width*0.99-legendBoxWidth;
          var rectX = leftX + textLength*fontSize*0.1;
          var textX = leftX + rectWidth + textLength*fontSize*0.3;

          // Y
          var rectHeight = (legendBoxHeight - fontSize)/legendColor.length;
          var rectY = d3.range(fontSize/2, legendColor.length*rectHeight + fontSize/2 - rectHeight/2, rectHeight);
          var txtY = d3.range(txtHeight/2, legendText.length*txtHeight, txtHeight);

          var legendBorder = legendBox.append("rect")
                              .attr("x", leftX)
                              .attr("y", leftY)
                              .attr("width", legendBoxWidth)
                              .attr("height", legendBoxHeight)
                              .style("stroke-width", Math.min(1, fontSize/12))
                              .style("stroke","black")
                              .style("fill","transparent");

          var legendRec = legendBox.selectAll("g.rec")
                          .data(legendColor)
                          .enter()
                          .append("rect");

          var legendRecAttr = legendRec
                              .attr("x", rectX)
                              .attr("y", function(d,i) { return rectY[i]+leftY; })
                              .attr("width", rectWidth)
                              .attr("height", rectHeight)
                              .style("fill", function(d) { return d; });

          var legendTxt = legendBox.selectAll("lg.text")
                          .data(legendText)
                          .enter()
                          .append("text");

          var legendTxtAttr = legendTxt
                              .attr("x", textX)
                              .attr("y", function(d,i) { return txtY[i]+leftY; })
                              .attr("dy", "0.35em")
                              .text(function(d) { return d; })
                              .style("font-size",fontSize)
                              .style("text-align", "center")
                              .style("font-family", "sans-serif");

        }

        function attachCategoryLegend(){

          // independent
          var catLegend = treeData.categoryLegend;
          var rectX = Math.min(width*0.02, 5);
          var maxRectWidth = width*0.9;
          var maxRectHeight = height*0.15;
          var maxFontSize = 14;

          // work out a proper font size
          var textLength = 0.0;
          for (i = 0; i < catLegend.length; i++) {
            textLength = Math.max(textLength, catLegend[i].length);
          }

          // dependent
          var textSize = Math.min(maxRectWidth*1.8/textLength, maxFontSize);
          var deltaY = textSize*1.5;
          var rectHeight = deltaY*catLegend.length;

          if (rectHeight > maxRectHeight) {
            rectHeight = maxRectHeight;
            deltaY = rectHeight/catLegend.length;
            textSize = deltaY/1.5;
          }

          var rectY = height*0.99-rectHeight;
          var padding = textSize/2;

          //var txtY = d3.range(0,(height+1)/3.0, txtHeight);


          //var wdithScale = d3.scale.linear()
          //                .range([0,50])
          //                .domain([0,treeData[opts.value]]);
          var legendTxt = catLegendBox.selectAll("lg.text")
                          .data(catLegend)
                          .enter()
                          .append("text");


          var legendTxtAttr = legendTxt
                              .attr("x", rectX + padding)
                              .attr("y", function(d,i) { return rectY + deltaY*i})
                              .append("tspan")
                              .attr("dy", "1em")
                              .text(function(d) {return d.split(" ")[0];})
                              .style("font-size", textSize +"px")
                              .style("font-family", "sans-serif")
                              .style("font-weight", "bold")
                              .append("tspan")
                              .text(function(d) {
                                var idx = d.search(" ");
                                return d.slice(idx,d.length);
                              })
                              .style("font-size", textSize +"px")
                              .style("font-family", "sans-serif")
                              .style("font-weight", "normal");
          var maxTextPx = 0;
          catLegendBox.selectAll("text").each(function(d) {
            maxTextPx = Math.max(maxTextPx, this.getComputedTextLength());
          });

          rectWidth = Math.min(maxRectWidth, maxTextPx+padding*2);
          var legendBorder = catLegendBox.append("rect")
                              .attr("x", rectX)
                              .attr("y", rectY)
                              .attr("width", rectWidth)
                              .attr("height", rectHeight)
                              .style("stroke-width", Math.min(1, textSize/10))
                              .style("stroke","black")
                              .style("fill","transparent");


        }*/

        function getNodeHeightRatio() {
          var nRatio = 0.0;
          var maxRatio = 0.0;
          if (treeData[opts.childrenName]) {
            var count = treeData[opts.childrenName].length;
            for (var i = 0; i < count; i++) {
              nRatio = treeData[opts.childrenName][i][opts.value]/treeData[opts.value];
              if (nRatio > maxRatio) {
                maxRatio = nRatio;
              }
            }
          }
          return maxRatio;
        }

        // A recursive helper function for performing some setup by walking through all nodes
        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        }


        // Call visit function to establish maxLabelLength
        var meanLabelLength = 0.0;
        visit(treeData, function(d) {
            totalNodes++;
            maxLabelLength = opts.maxLabelLength || Math.max(d[opts.name].length, 0);
            meanLabelLength = meanLabelLength + d[opts.name].length;
        }, function(d) {
            return d[opts.childrenName] && d[opts.childrenName].length > 0 ? d[opts.childrenName] : null;
        });
        meanLabelLength = (meanLabelLength/totalNodes) | 0 + 1;
        meanLabelLength = meanLabelLength > 12 ? meanLabelLength : 12;
        if (meanLabelLength < maxLabelLength) {
            maxLabelLength = meanLabelLength;
        }
        // sort the tree according to the node names
        tree.sort(function(a, b) {
            return b[opts.name].toLowerCase() < a[opts.name].toLowerCase() ? 1 : -1;
        });
        zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    function wrap(text, width) {
        var separators = {"-": 1, " ": 1};
        var lineNumbers = [];
        text.each(function() {
            var text = d3.select(this),
                chars = text.text().split("").reverse(),
                c,
                nextchar,
                sep,
                newline = [];
                lineTemp = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (c = chars.pop()) {
                // remove leading space
                if (lineTemp.length === 0 && c === " ") {
                    continue;
                }
                lineTemp.push(c);
                tspan.text(lineTemp.join(""));
                if (tspan.node().getComputedTextLength() > width) {

                    // if no separator detected before c, wait until there is one
                    // otherwise, wrap texts
                    if (sep === undefined) {
                        if (c in separators) {
                            if (c === " ") {
                                lineTemp.pop();
                            }
                            // make new line
                            sep = undefined;
                            tspan.text(lineTemp.join(""));
                            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text("");
                            lineTemp = [];
                            newline = [];
                        }

                    } else {
                        // pop out chars until reaching sep
                        if (c in separators) {
                            newline.push(lineTemp.pop());
                        }
                        nextchar = lineTemp.pop();
                        while (nextchar !== sep && lineTemp.length > 0) {
                            newline.push(nextchar);
                            nextchar = lineTemp.pop();
                        }
                        newline.reverse();
                        while (nextchar = newline.pop()) {
                            chars.push(nextchar);
                        }

                        if (sep !== " ") {
                            lineTemp.push(sep);
                        }

                        // make new line
                        sep = undefined;
                        tspan.text(lineTemp.join(""));
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text("");
                        lineTemp = [];
                        newline = [];
                    }
                } else {
                    if (c in separators) {
                        sep = c;
                    }
                }
            }
            lineNumbers.push(lineNumber + 1);
        });
    }
        /*
        // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
        function centerNode(source) {
            var scale = zoomListener.scale();
            var trans = zoomListener.translate();
            var t = d3.transform(svgGroup.attr("transform")),
                x = t.translate[0],
                y = t.translate[1];
            var centering = svgGroup.transition()
                .duration(duration)
                .attr("transform", "translate(" + (x) + "," + (y) + ")scale(" + scale + ")")
                .each("end", function(d) {
                    treeDim = this.getBoundingClientRect();
                    x = (width/2 - treeDim.width/2) - treeDim.left + x;
                    y = (height/2 - treeDim.height/2) - treeDim.top + y;
                    d3.select(this).transition()
                    .duration(400)
                    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");

                    zoomListener.scale(scale);
                    zoomListener.translate([x, y]);
                });
            //x = -source.y0;
            //y = -source.x0;
            //x = x * scale + ( source[opts.name] !== root[opts.name] ?  width / 2 : width / 4 );
            //centering.transition().duration(200).attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        }*/

        // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
        function centerNodeFit(source) {

            if (init) {
                scale = zoomListener.scale();
                newScale = scale;
                x = -source.y0 * scale + width / 4;
                y = -source.x0 * scale + height / 2;
            } else {
                svgTrans = d3.transform(svgGroup.attr("transform"));
                scale = svgTrans.scale[0];
                newScale = scale;
                x = svgTrans.translate[0];
                y = svgTrans.translate[1];
            }
            var centering = svgGroup
                .transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")")
                //.each(function(d) {
                .each("end", function(d) {
                    treeDim = this.getBoundingClientRect();
                    xscale = (width - treeMargins.left - treeMargins.right - 20)/(treeDim.width/scale);
                    yscale = (height - treeMargins.top - treeMargins.bottom - 10)/(treeDim.height/scale);
                    newScale = Math.min(xscale, yscale, 3);
                    d3.select(this).attr("transform", "translate(" + x + "," + y + ")scale(" + newScale + ")");
                    newTreeDim = this.getBoundingClientRect();
                    treeDim = newTreeDim;
                    d3.select(this).attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
                    x = (width/2 - newTreeDim.width/2 ) - newTreeDim.left + x;
                    y = (height/2 - newTreeDim.height/2 ) - newTreeDim.top + y;
                    d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("transform", "translate(" + x + "," + y + ")scale(" + newScale + ")");
                    zoomListener.scale(newScale);
                    zoomListener.translate([x, y]);
                });
        }

        // Toggle children function
        function toggleChildren(d) {
            if (d[opts.childrenName]) {
                d._children = d[opts.childrenName];
                d[opts.childrenName] = null;
            } else if (d._children) {
                d[opts.childrenName] = d._children;
                d._children = null;
            }
            return d;
        }

        // Toggle children on click.

        function click(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            update(d);
            //centerNode(d);
            centerNodeFit(d);
        }

        function toggleText(selector_hide, selector_show) {
            if (d3.event.defaultPrevented) return; // click suppressed
            svgGroup.select(selector_hide).style("display", "none");
            svgGroup.select(selector_show).style("display", "inline");
        }

        /*function clickText(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            d.hidden = true;
            //d3.select(this).style("display", "none");
            svgGroup.select("#ndTxtGp1_" + this.id.substring(1)).style("display", "none");
            //var selector = "#c" + this.id.substring(1);
            //svgGroup.select(selector).style("display", "inline");
            svgGroup.select("#ndTxtGp2_" + this.id.substring(1)).style("display", "inline");
        }

        function clickHiddenText(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            d.hidden = false;
            //d3.select(this).style("display", "none");
            svgGroup.select("#ndTxtGp2_" + this.id.substring(1)).style("display", "none");
            //var selector = "#t" + this.id.substring(1);
            //svgGroup.select(selector).style("display", "inline");
            svgGroup.select("#ndTxtGp1_" + this.id.substring(1)).style("display", "inline");
        }*/

        function mouseOverNode(d, el, sel) {
            var tipRect = sel.select("#nodeRect" + d[opts.id]);
            var tipNode = sel.select("#node" + d[opts.id]);
            var thisTip = tip.show(d, tipRect);

            var x = Number(sel.select("#nodeRect" + d[opts.id]).attr("x")),
                y = Number(sel.select("#nodeRect" + d[opts.id]).attr("y")),
                w = Number(sel.select("#nodeRect" + d[opts.id]).attr("width")),
                h = Number(sel.select("#nodeRect" + d[opts.id]).attr("height"));

            // height of the tip
            var tipHeight = parseFloat(thisTip.style("height"));
            // width of the tip
            var tipWidth = parseFloat(thisTip.style("width"));
            var clientRect = el.getBoundingClientRect();
            // southward and northward tip top y position
            var tipSouth = clientRect.bottom + 5;
            var tipNorth = clientRect.top - 5;
            var tipEast = clientRect.right + 5;
            var tipWest = clientRect.left - 5;

            if (tipNorth - tipHeight >= 0) {
                // northward tip
                thisTip = thisTip.direction("n").offset([-10,0]).show(d, tipRect);
                d3.select("#littleTriangle")
                .attr("class", "northTip")
                .style("visibility", "visible")
                .style("top", (clientRect.top - 12.5) + "px")
                .style("left", (clientRect.left + clientRect.width/2 - 5) + "px");

                if (parseFloat(thisTip.style("left")) < 0) {
                    thisTip.style("left", "5px");
                } else if (parseFloat(thisTip.style("left")) + tipWidth > width) {
                    thisTip.style("left", (width - 5 - tipWidth) + "px");
                }

            } else if (height - tipSouth >= tipHeight) {

                thisTip = thisTip.direction("s").offset([10,0]).show(d, tipRect);
                d3.select("#littleTriangle")
                .attr("class", "southTip")
                .style("visibility", "visible")
                .style("top", (clientRect.bottom + 2.5) + "px")
                .style("left", (clientRect.left + clientRect.width/2 - 5) + "px");

                if (parseFloat(thisTip.style("left")) < 0) {
                    thisTip.style("left", "5px");
                } else if (parseFloat(thisTip.style("left")) + tipWidth > width) {
                    thisTip.style("left", (width - 5 - tipWidth) + "px");
                }

            } else if (tipEast >= width * 0.5) {

                thisTip = thisTip.direction("w").offset([0,-10]).show(d, tipRect);
                d3.select("#littleTriangle")
                .attr("class", "westTip")
                .style("visibility", "visible")
                .style("top", (clientRect.top + clientRect.height/2 - 5) + "px")
                .style("left", (clientRect.left - 12.5) + "px");

                if (parseFloat(thisTip.style("top")) < 0) {
                    thisTip.style("top", "5px");
                } else if (parseFloat(thisTip.style("top")) + tipHeight > height) {
                    thisTip.style("top", (height - tipHeight - 5) + "px");
                }

            } else {
                thisTip = thisTip.direction("e").offset([0,10]).show(d, tipRect);
                d3.select("#littleTriangle")
                .attr("class", "eastTip")
                .style("visibility", "visible")
                .style("top", (clientRect.top + clientRect.height/2 - 5) + "px")
                .style("left", (clientRect.right + 2.5) + "px");

                if (parseFloat(thisTip.style("top")) < 0) {
                    thisTip.style("top", "5px");
                } else if (parseFloat(thisTip.style("top")) + tipHeight > height) {
                    thisTip.style("top", (height - tipHeight - 5) + "px");
                }
            }

        }

        function mouseOutNode(d) {
            d3.select("#littleTriangle").style("visibility", "hidden");
            tip.hide(d);
        }

        function update(source) {
            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.
            var levelWidth = [1];
            var childCount = function(level, n) {

                if (n[opts.childrenName] && n[opts.childrenName].length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[level + 1] += n[opts.childrenName].length;
                    n[opts.childrenName].forEach(function(d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            newHeight = d3.max(levelWidth) * ( opts.nodeHeight || 25 ); // 25 pixels per line

            //if (opts.maxLabelLength) {
            newWidth = levelWidth.length * maxLabelLength * pxPerChar +
                        levelWidth.length * 10; // node link size + node rect size

            if (newHeight/newWidth < 0.5) {
                newHeight = 0.5 * newWidth;
            }
            //} else {
            //  newWidth = levelWidth.length * meanLabelLength * pxPerChar +
            //            levelWidth.length * 10; // node link size + node rect size
            //}

            //dummyRect.attr("width", newWidth + meanLabelLength*pxPerChar).attr("height", newHeight);

            // Size link width according to n based on total n
            var wscale = d3.scale.linear()
                .range([0,opts.nodeHeight/nodeHeightRatio || 25])
                //.range([0,opts.nodeHeight || 25])
                .domain([0,treeData[opts.value]]);

            tree = tree.size([newHeight, newWidth]);

            // Compute the new tree layout.
            var nodes = tree.nodes(root),
                links = tree.links(nodes);

            //console.log(nodes);

            // Set widths between levels based on maxLabelLength.


            //if (opts.maxLabelLength) {
                nodes.forEach(function(d) {
                    d.y = (d.depth * (maxLabelLength * pxPerChar) + nodeTextDx);  //maxLabelLength * 10px
                });
            //} else {
            //    nodes.forEach(function(d) {
            //        d.y = (d.depth * (meanLabelLength * pxPerChar) + nodeTextDx); //meanLabelLength * 5px
            //    });
            //}

            // flip the tree up and down to conform with R plot
            var initNodeX = nodes[nodes.length-1].x;
            nodes.forEach(function(d) {
                d.x = initNodeX + initNodeX - d.x;
            });

            // Update the nodes…
            var node = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d[opts.id] || (d[opts.id] = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
               // .call(dragListener)
                .attr("class", "node")
                .style("opacity", 0)
                .attr("id", function(d) { return "node" + d[opts.id];})
                .attr("transform", function(d) {
                    return "translate(" + (source.y0) + "," + source.x0 + ")";
                });

            nodeEnter.append("rect")
                .attr("class", "nodeRect")
                .attr("id", function(d,i) { return "nodeRect" + d[opts.id];})
                .attr("x", -nodeRectWidth/2)
                .attr("y", function(d){return -wscale(d[opts.value])/2})
                .attr("height", function(d){return wscale(d[opts.value])})
                .attr("width", nodeRectWidth)
                .on('click', click)
                .on('mouseover', opts.tooltip ? function(d) { mouseOverNode(d,this,baseSvg);} : null)
                .on('mouseout', opts.tooltip ? function(d) { mouseOutNode(d);} : null);

            var nodeTextGroup1 = nodeEnter.append("g")
                                    .attr("class", "nodeTextGroup1")
                                    .attr("id", function(d) { return "ndTxtGp1_" + d[opts.id];})
                                    .on("click", function(d) {
                                        if (d.hidden) {
                                            d.hidden = false;
                                        } else {
                                            d.hidden = true;
                                        }
                                        var selector_hide = "#ndTxtGp1_" + d[opts.id];
                                        var selector_show = "#ndTxtGp2_" + d[opts.id];
                                        toggleText(selector_hide, selector_show);
                                    });

            var nodeTextGroup2 = nodeEnter.append("g")
                                    .attr("class", "nodeTextGroup2")
                                    .attr("id", function(d) { return "ndTxtGp2_" + d[opts.id];})
                                    .on("click", function(d) {
                                        if (d.hidden) {
                                            d.hidden = false;
                                        } else {
                                            d.hidden = true;
                                        }
                                        var selector_hide = "#ndTxtGp2_" + d[opts.id];
                                        var selector_show = "#ndTxtGp1_" + d[opts.id];
                                        toggleText(selector_hide, selector_show);
                                    });

            var nrect1 = nodeTextGroup1.append("rect")
                            .attr("class", "nodeTextBg1")
                            .attr("id", function(d) { return "bgt" + d[opts.id];});;

            var nrect2 = nodeTextGroup2.append("rect")
                            .attr("class", "nodeTextBg2")
                            .attr("id", function(d) { return "bgc" + d[opts.id];});

            var ntxt1 = nodeTextGroup1.append("text")
                .attr("id", function(d) { return "t" + d[opts.id];})
                .attr("x", -nodeTextDx)
                .attr("dy", ".35em")
                .attr('class', 'nodeText1')
                .attr("text-anchor", "end")
                .text(function(d) {return d[opts.name]})
                .style("fill-opacity", 0)
                .text(function(d) {
                  if (this.getComputedTextLength() > maxLabelLength*pxPerChar - nodeTextDx - nodeRectWidth) {
                    return d[opts.name].substring(0, maxLabelLength-3) + "...";
                  } else {
                    return d[opts.name];
                  }
                });

            svgGroup.selectAll(".nodeText1")
                .each(function(d) {
                    d.shortNodeTextDim = { width: this.getBBox().width, height: this.getBBox().height};
                    d.nodeTextPos = {
                        left: d.y - nodeRectWidth/2 - nodeTextDx - this.getBBox().width,
                        top: d.x - this.getBBox().height/2,
                        bottom: d.x + this.getBBox().height/2,
                        rectLeft: d.y - nodeRectWidth/2,
                        rectTop: d.x - this.parentNode.getBBox().height/2,
                        rectBottom: d.x + this.parentNode.getBBox().height/2,
                    };
                });

            var ntxt2 = nodeTextGroup2.append("text")
                .attr("id", function(d) { return "c" + d[opts.id];})
                .attr("x", -nodeTextDx)
                .attr("y", 0)
                .attr("dy", "0.95em")
                .attr('class', 'nodeText2')
                .attr("text-anchor", "end")
                .text(function(d) {
                    return d[opts.name];
                });

            ntxt2.call(wrap, maxLabelLength*pxPerChar - nodeTextDx - nodeRectWidth);
            ntxt2.attr("y", function() { return -this.getBBox().height/2;});
            ntxt2.each(function(d) {
                    var self = this;
                    d3.select(this)
                        .selectAll("tspan")
                        .attr("y", function() { return d3.select(self).attr("y");});
                    d.longNodeTextDim = { width: this.getBBox().width, height: this.getBBox().height};
                });

            nrect1.attr("x", function(d) { return -d.shortNodeTextDim.width - nodeTextDx;})
                  .attr("y", function(d) { return -d.shortNodeTextDim.height/2;})
                  .attr("width", function(d) { return d.shortNodeTextDim.width;})
                  .attr("height", function(d) { return d.shortNodeTextDim.height;});

            nrect2.attr("x", function(d) { return -d.longNodeTextDim.width - nodeTextDx;})
                  .attr("y", function(d) { return -d.longNodeTextDim.height/2;})
                  .attr("width", function(d) { return d.longNodeTextDim.width;})
                  .attr("height", function(d) { return d.longNodeTextDim.height;});

            node.each(function(d) {
                d.hidden = false;
            });

            nodeTextGroup1.style("display", function(d) {
                if (d.hidden) {
                    return "none";
                } else {
                    return "inline";
                }
            });

            nodeTextGroup2.style("display", function(d) {
                if (d.hidden) {
                    return "inline";
                } else {
                    return "none";
                }
            });

            if (opts.terminalDescription) {
                nodeEnter.append("text")
                    .attr("id", function(d) { return "terminal" + d[opts.id];})
                    .attr("x", nodeTextDx)
                    .attr("dy", ".35em")
                    .attr('class', 'nodeText')
                    .attr("text-anchor", "start")
                    .attr("font-weight", function(d) {
                        return d[opts.childrenName] || d._children ? "normal" : "bold";
                    })
                    .text(function(d) {
                      if (d.terminalDescription.length > opts.maxLabelLength) {
                        d.terminalWrapped = true;
                        return d.terminalDescription.substring(0, maxLabelLength-3) + "...";
                      } else {
                        d.terminalWrapped = false;
                        return d.terminalDescription;
                      }
                    })
                    .on("click", function(d) {
                        var selector_hide = "#terminal" + d[opts.id];
                        var selector_show = "#terminalLong" + d[opts.id];
                        toggleText(selector_hide, selector_show);
                    });

                var terTxt2 = nodeEnter.append("text")
                    .attr("id", function(d) { return "terminalLong" + d[opts.id];})
                    .attr("x", nodeTextDx)
                    .attr("y", 0)
                    .attr("dy", ".35em")
                    .attr('class', 'nodeTextLong')
                    .attr("text-anchor", "start")
                    .text(function(d) {
                        return d.terminalDescription;
                    })
                    .attr("font-weight", function(d) {
                        return d[opts.childrenName] || d._children ? "normal" : "bold";
                    })
                    .on("click", function(d) {
                        var selector_hide = "#terminalLong" + d[opts.id];
                        var selector_show = "#terminal" + d[opts.id];
                        toggleText(selector_hide, selector_show);
                    });

                terTxt2.each(function(d) {
                    var self = this;
                    if (d.terminalWrapped) {
                        d3.select(self).attr("dy", ".95em");
                        wrap(d3.select(self), maxLabelLength*pxPerChar - nodeTextDx - nodeRectWidth);
                        d3.select(self)
                            .attr("y", function() { return -self.getBBox().height/2;})
                            .selectAll("tspan")
                            .attr("y", function() { return d3.select(self).attr("y");});
                    }
                })
                terTxt2.style("display", "none");

                svgGroup.selectAll(".nodeText")
                    .each(function(d) {
                        if (! (d[opts.childrenName] || d._children)) {
                            d.termTextPos = { right: d.y + nodeRectWidth/2 + nodeTextDx + this.getBBox().width,
                                            top: d.x - this.getBBox().height/2,
                                            bottom: d.x + this.getBBox().height/2};
                        }
                    });

                var collided = {value: 0}, itr = 0;
                do {
                    collided.value = 0;
                    itr++;
                    resolveCollision(root, nodes, collided);
                    //console.log(collided.value + " " + itr);
                } while (collided.value > 0 && itr < 7)

                if (itr >= 7) {
                    console.log("Node text collision failed to resolve. Try increasing maxLabelLength when calling SankeyTree")
                }

            }

            // Change the circle fill depending on whether it has children and is collapsed
            node.select("circle.nodeCircle")
                .attr("r", 4.5)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            // Transition nodes to their new position.
            var nodeUpdate = node
                .transition()
                .duration(duration)
                .style("opacity", 1)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit()
                .transition()
                .duration(duration)
                .style("opacity", 0)
                .attr("transform", function(d) {
                    return "translate(" + (source.y) + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 0);

            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Update the links…


            // probably not the best way or place to do this
            //   but start here with adjusting paths higher
            //   or lower to do like a stacked bar
            //   since our stroke-width will reflect size
            //   similar to a Sankey

            // 1. start by nesting our link paths by source
            var link_nested = d3.nest()
                                .key(function(d){
                                  return d.source[opts.id];
                                })
                                .entries(links);
            // 2. manual method for stacking since d3.layout.stack
            //      did not work
            link_nested.forEach(function(d){
              var ystacky = 0;
              d.values.forEach(function(dd){
                var ywidth = wscale(dd.target[opts.value]);
                var srcwidth = wscale(dd.source[opts.value]);
                srcwidth = isNaN(srcwidth) ? wscale.range()[1]/2 : srcwidth;
                ystacky = ystacky + ywidth;
                // dd.x = dd.source.x;
                dd.x = dd.source.x + srcwidth/2 - ystacky + ywidth/2;
                dd.y = dd.source.y;
                dd.ystacky = ystacky;
              });
            });

            var link = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                  return d.target[opts.id];
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            link.style("stroke-width",function(d){
              return wscale( d.target[opts.value] );
            });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal)
                .style("stroke",function(d){
                  if(d.target.color){
                    if (typeof d.target.color === 'string'){
                      return d3.lab(d.target.color);
                    } else {
                      return d3.hcl(
                        d.target.color.h,
                        d.target.color.c,
                        d.target.color.l
                      );
                    }
                  } else {
                    return "#ccc";
                  }
                });

            // Transition exiting nodes to the parent's new position.
            link.exit()
                .transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function updateNodePos (source, value) {
            source.x = source.x + value;
            source.nodeTextPos.bottom = source.nodeTextPos.bottom + value;
            source.nodeTextPos.rectBottom = source.nodeTextPos.rectBottom + value;
            source.nodeTextPos.top = source.nodeTextPos.top + value;
            source.nodeTextPos.rectTop = source.nodeTextPos.rectTop + value;
            if (! (source[opts.childrenName] || source._children)) {
                source.termTextPos.bottom = source.termTextPos.bottom + value;
                source.termTextPos.top = source.termTextPos.top + value;
            }
        }

        function moveParents (source, value) {
            // TODO move the parent nodes of the colliding nodes
            // so far only child nodes are moved, which can potentially be a problem
        }

        function moveChildren (source, value) {

            updateNodePos(source, value);

            if (source[opts.childrenName]) {
                moveChildren(source[opts.childrenName][0], value);
                moveChildren(source[opts.childrenName][1], value);
            }
        }

        function moveNodes (source, target) {

            var dx = (target.termTextPos.bottom - target.termTextPos.top)*0.7;
            if (source.parent.x < target.parent.x) {
                // source is on the top branch, move source up
                updateNodePos(source, -dx);
                updateNodePos(target, dx);
                if (source[opts.childrenName]) {
                    moveChildren(source[opts.childrenName][0], -dx);
                    moveChildren(source[opts.childrenName][1], -dx);
                }
                moveParents(source, -dx);
                moveParents(target, dx);
            } else {
                // source is on the bottom branch, move it down
                updateNodePos(source, dx);
                updateNodePos(target, -dx);
                if (source[opts.childrenName]) {
                    moveChildren(source[opts.childrenName][0], dx);
                    moveChildren(source[opts.childrenName][1], dx);
                }
                moveParents(source, dx);
                moveParents(target, -dx);
            }
        }

        // since the tree is drawn from left to right, the target is always on the left
        // of the source
        function nodeCollide (source, target) {
            if ( (source.nodeTextPos.left - 5 < target.termTextPos.right &&
                    ((source.nodeTextPos.bottom >= target.termTextPos.top && source.nodeTextPos.top <= target.termTextPos.top) ||
                    (source.nodeTextPos.top <= target.termTextPos.bottom && source.nodeTextPos.bottom >= target.termTextPos.bottom))) ||
                (source.nodeTextPos.rectLeft < target.termTextPos.right &&
                    ((source.nodeTextPos.rectBottom >= target.termTextPos.top && source.nodeTextPos.rectTop <= target.termTextPos.top) ||
                    (source.nodeTextPos.rectTop <= target.termTextPos.bottom && source.nodeTextPos.rectBottom >= target.termTextPos.bottom))) ) {
                return true;
            } else {
                return false;
            }
        }

        function resolveCollision (thisNode, nodesArray, collided) {
            // resolve collision from root node to leaf node
            // larger branches are moved first
            // only check collision with lower level nodes
            // empirically if root has depth 1, only nodes with depth 4 or above
            // will collide with previous nodes
            if (thisNode.depth >= 2) {
                // collision is only possible with nodes having depth - 1 of current
                // and that node must be a terminal node
                for (var i = 0; i < nodesArray.length; i++) {
                    var targetNode = nodesArray[i];
                    if (targetNode.id !== thisNode.id && targetNode.depth < thisNode.depth &&
                        !(targetNode[opts.childrenName] || targetNode._children)) {
                        if (nodeCollide(thisNode, targetNode)) {
                            // move nodes to the side
                            collided.value += 1;
                            moveNodes(thisNode, targetNode);
                        }
                    }
                }
            }

            // only run the recursion when there is children
            if (thisNode[opts.childrenName]) {
                resolveCollision(thisNode[opts.childrenName][0], nodesArray, collided);
                resolveCollision(thisNode[opts.childrenName][1], nodesArray, collided);
            }
        }

        // Append a group which holds all nodes and which the zoom Listener can act upon.
        svgGroup = baseSvg.call(zoomListener)
                    .on("dblclick.zoom", null)
                    .append("g")
                    .attr("class", "treeGroup");

        // if tooltip then set it up
        if(opts.tooltip){
            svgGroup.call(tip);
        }

        // Define the root
        root = treeData;
        root.x0 = height / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);

        // since we can override node height and label length (width)
        // if zoom scale == 1 then auto scale to fit tree in container
        var treeSize = tree.size();
        var headLength = svgGroup.select("#t1").node().getComputedTextLength();
        headLength = headLength ? headLength : 0;
        var tailLength = 0;
        svgGroup.selectAll(".nodeText").each(function(d) {
            tailLength = Math.max(tailLength, this.getComputedTextLength());
        });

        if (zoomListener.scale() == 1) {
            xscale = (width - treeMargins.left - treeMargins.right - headLength - tailLength)/treeSize[1];
            yscale = (height - treeMargins.top - treeMargins.bottom)/treeSize[0];
            scale = xscale > yscale ? yscale : xscale;
            zoomListener.scale(scale);
        }

        /*if (zoomListener.scale() == 1) {
          var xscale = height/tree.size()[0]*0.85,
              yscale = width/tree.size()[1]*0.75;
          if (xscale < yscale) {
            zoomListener.scale( xscale );
          } else {
            zoomListener.scale( yscale );
          }

        }*/
        centerNodeFit(root);
        prevWidth = width;
        prevHeight = height;
        setTimeout(function() {init = false;}, duration*3);



        /*if (opts.colorLegend) {
          var legendBox = baseSvg.append("g")
                          .attr("id", "colorLegend")
                          .style("cursor", "move")
                          .call(zoomListenerLegend)
                          .on("dblclick.zoom", null)
                          //.on("wheel.zoom", null)
                          .on("mousemove.zoom", null)
                          .on("touchstart.zoom", null)
                          //.on("mousewheel.zoom", null)
                          .on("MozMousePixelScroll.zoom", null)
                          .append("g");
          attachLegend();
        }*/

        /*if (opts.categoryLegend && treeData.categoryLegend) {
          var catLegendBox = baseSvg.append("g")
                            .attr("id", "catLegend")
                             .style("cursor", "move")
                            .call(zoomListenerCatLegend)
                            .on("dblclick.zoom", null)
                            //.on("wheel.zoom", null)
                            .on("mousemove.zoom", null)
                            .on("touchstart.zoom", null)
                            //.on("mousewheel.zoom", null)
                            .on("MozMousePixelScroll.zoom", null)
                            .append("g");
          attachCategoryLegend();
        }*/


    }

    // getter/setter
    chart.data = function(v) {
        if (!arguments.length) return data;
        data = v;
        return chart;
    };

    chart.opts = function(v) {
        if (!arguments.length) return opts;
        opts = v;
        return chart;
    };

    chart.resize = function(el) {
        resizeChart(el);
    };

    chart.width = function(v) {
        // width getter/setter
        if (!arguments.length) return width;
        width = v;
        return chart;
    };

    // height getter/setter
    chart.height = function(v) {
        if (!arguments.length) return height;
        height = v;
        return chart;
    };

    return chart;
}


HTMLWidgets.widget({

  name: 'rhtmlSankeyTree',

  type: 'output',

  initialize: function(el, w, h) {

        var width,
            height;

        width = w < 200 ? 200 : w;
        height = h < 100 ? 100 : h;

        d3.select(el)
            .append("svg")
            .attr("class", "svg-content-responsive")
            .attr("width", width)
            .attr("height", height);

        return Sankey().width(width).height(height);

  },

  renderValue: function(el, x, instance) {
    // ATTRIBUTION:  much of this JavaScript code
    //  came from http://bl.ocks.org/robschmuecker/0f29a2c867dcb1b44d18

        instance = instance.opts(x.opts);
        instance = instance.data(x.data);

        d3.select(el).select('g').remove();
        d3.select(el).call(instance);

  },

  resize: function(el, width, height, instance) {

        d3.select(el).select("svg")
            .attr("width", width)
            .attr("height", height);

        return instance.width(width).height(height).resize(el);
        //d3.select(el).select("svg").attr("viewBox", "0 0 " + width + " " + height);

  }

});
