import * as d3 from './dist/d3.min';

function segColor(c) {
        var color = [
            "#87CEFA",
            "#FFDEAD",
            "#7B68EE",
            "#8FBC8F",
            "#FF3366",
            "#33FFFF",
            "#666699",
            "#00FA9A",
            "#FF00FF",
            "#FFA500",
            //"#6B8E23",
        ];
        var pointer = c % 10;
        return color[pointer];
}

function pieChart(id, fData, legFlg, r) {

    function createChart(pD) {
        var pC = {},
            pieDim = {
                w: r,
                h: r
            };
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

        var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        var pie = d3.pie().sort(null).value(function(d) {
            return d.freq;
        });

        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) {
                this._current = d;
            })
            .style("fill", function(d, i) {
                return segColor(i);
            })

        return pC;
    }

    var keys = [];
    var keys = Object.keys(fData);

    var tF = keys.map(function(d) {
        return {
            type: d,
            freq: fData[d]
        };
    });

    //clear_graph(id);
    d3.select(id).selectAll("svg").remove();
    d3.select(id).selectAll("table").remove();

    var pC = createChart(tF);

}

module.exports = {
  pieChart:pieChart,
  segColor:segColor
};
