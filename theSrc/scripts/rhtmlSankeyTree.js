HTMLWidgets.widget({

  name: 'rhtmlSankeyTree',

  type: 'output',

  initialize: function(el, w, h, stateChanged) {

        var width,
            height;

        width = w < 200 ? 200 : w;
        height = h < 100 ? 100 : h;

        d3.select(el)
            .append("svg")
            .attr("class", "svg-content-responsive")
            .attr("width", width)
            .attr("height", height);

        return Sankey().width(width).height(height).stateSaver(stateChanged);

  },

  renderValue: function(el, x, instance, state) {
    // ATTRIBUTION:  much of this JavaScript code
    //  came from http://bl.ocks.org/robschmuecker/0f29a2c867dcb1b44d18

        instance = instance.opts(x.opts);
        instance = instance.data(x.data);
        if (state) {
            if (instance.checkState(state)) {
                instance.restoreState(state);
            } else {
                instance.resetState();
            }
        }
        d3.select(el).select('g').remove();
        d3.select(document).selectAll('.d3-tip').remove();
        d3.select(document).selectAll('#littleTriangle').remove();
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
