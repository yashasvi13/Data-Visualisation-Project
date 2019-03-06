function buildBar(ds) {
  var barTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var formatRatio = d3.format("%");

  var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("s"))
    .ticks(3);

  var minProfit = d3.min(ds, function(d) {
    return d.profit;
  });
  var maxProfit = d3.max(ds, function(d) {
    return d.profit;
  });

  var color = d3.scale
    .quantize()
    .domain([minProfit, maxProfit])
    .range([
      "rgb(255,255,212)",
      "rgb(254,217,142)",
      "rgb(254,153,41)",
      "rgb(204,76,2)"
    ]);

  var chart = d3
    .select("#barChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("2019-monthly-sales.csv", function(error, data) {
    x.domain(
      data.map(function(d) {
        return d.month;
      })
    );
    y.domain([
      0,
      d3.max(data, function(d) {
        return d.sales;
      })
    ]);

    chart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    chart
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    chart
      .selectAll("#barChart")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return x(d.month);
      })
      .attr("y", function(d) {
        return y(d.sales);
      })
      .attr("height", function(d) {
        return height - y(d.sales);
      })
      .attr("width", x.rangeBand())
      .style("fill", function(d) {
        return color(d.profit);
      })
      .on("mouseover", function(d) {
        barTooltip
          .transition()
          .duration(500)
          .style("opacity", 0.9);

        var tip = "<strong>Sales:</strong> $" + formatSales(d.sales) + "<br/>";
        var tip =
          tip + "<strong>Profit:</strong> $" + formatSales(d.profit) + "<br/>";
        var tip =
          tip +
          "<strong>Ratio:</strong> " +
          formatRatio(d.profit / d.sales) +
          "<br/>";

        barTooltip
          .html(tip)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function(d) {
        barTooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
}

function buildLegend(data) {
  var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  var minProfit = d3.min(data, function(d) {
    return d.profit;
  });
  var maxProfit = d3.max(data, function(d) {
    return d.profit;
  });

  var color = d3.scale
    .quantize()
    .domain([minProfit, maxProfit])
    .range([
      "rgb(255,255,212)",
      "rgb(254,217,142)",
      "rgb(254,153,41)",
      "rgb(204,76,2)"
    ]);

  var barLegendData = [];

  data.forEach(function(dv) {
    var val = parseFloat(dv.profit);

    if (val) {
      barLegendData.push(val);
    }
  });

  barLegendData.sort(function(a, b) {
    return a - b;
  });

  var header = d3
    .select("#barChartLegend")
    .attr("width", 200)
    .attr("height", 50)
    .attr("transform", "translate(" + 300 + "," + -180 + ")");

  header
    .append("text")
    .text("Profit")
    .attr({
      x: 0,
      y: h - 255,
      class: "profitLabel"
    });

  header
    .selectAll(".barChartLegend")
    .data(barLegendData)
    .enter()
    .append("rect")
    .attr({
      x: function(d, i) {
        return i * (200 / barLegendData.length);
      },
      y: height + margin.top,
      width: function(d, i) {
        return 200 / barLegendData.length;
      },
      height: 10,
      fill: function(d) {
        return color(d);
      },
      class: "barChartLegend"
    });

  header
    .selectAll("text.profitLegend")
    .data([barLegendData[0], barLegendData[barLegendData.length - 1]])
    .enter()
    .append("text")
    .text(function(d) {
      return formatSales(d);
    })
    .attr({
      x: function(d, i) {
        return (200 - margin.left / 2) * i;
      },
      y: h - 285,
      "font-size": "12px",
      "font-family": "sans-serif",
      class: "profitLegend"
    });
}

d3.csv("2019-monthly-sales.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    buildLegend(data);
    buildBar(data);
  }
});
