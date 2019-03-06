var margin = { top: 20, right: 30, bottom: 30, left: 40 },
  w = 500 - margin.left - margin.right,
  h = 500 - margin.top - margin.bottom;

var projection = d3.geo
  .albersUsa()
  .translate([w / 2 + 10, h / 2 - 80])
  .scale([h + 50]);

var path = d3.geo.path().projection(projection);

var color = d3.scale
  .linear()
  .range([
    "rgb(255,255,204)",
    "rgb(161,218,180)",
    "rgb(65,182,196)",
    "rgb(34,94,168)"
  ]);

//SVG element
var svg = d3
  .select("#bottomRight")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

d3.csv("2019-state-sales.csv", function(data) {
  color.domain([0, d3.max(data, d => d.sales)]);

  //Loading GeoJSON data
  d3.json("us.json", function(json) {
    for (var i = 0; i < data.length; i++) {
      var dataState = data[i].state;

      var dataValue = parseFloat(data[i].sales);

      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.NAME;

        if (dataState == jsonState) {
          json.features[j].properties.value = dataValue;
          break;
        }
      }
    }

    var mapTooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "mapTooltip")
      .style("opacity", 0);

    svg
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function(d) {
        var value = d.properties.value;

        if (value) {
          return color(value);
        } else {
          return "#fff";
        }
      })
      .on("mouseover", d => {
        mapTooltip
          .transition()
          .duration(500)
          .style("opacity", 0.9);

        var tip = "<strong>" + d.properties.NAME + "</strong><br/>";
        var tip =
          tip +
          "<strong>Sales:</strong> $" +
          formatSales(d.properties.value) +
          "<br/>";

        mapTooltip
          .html(tip)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function(d) {
        mapTooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    var legendData = [];

    json.features.forEach(prop => {
      var val = parseFloat(prop.properties.value);

      if (val) {
        legendData.push(val);
      }
    });

    legendData.sort((a, b) => a - b);

    //color legend
    svg
      .selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr({
        x: (d, i) => i * (w / legendData.length),
        y: h - 140,
        width: (d, i) => w / legendData.length,
        height: 10,
        fill: d => color(d)
      });

    svg
      .selectAll("text")
      .data([legendData[0], legendData[legendData.length - 1]])
      .enter()
      .append("text")
      .text(function(d) {
        return formatSales(d);
      })
      .attr({
        x: (d, i) => (w - margin.left / 2) * i,
        y: h - 150,
        "font-size": "12px",
        "font-family": "sans-serif"
      });
  });
});
