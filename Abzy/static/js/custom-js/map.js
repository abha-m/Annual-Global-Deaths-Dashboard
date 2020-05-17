var height = $("#r1c1").height();
var width = $("#r1c1").width();

// The svg
var svg = d3.select("#world_map")
            .attr("width", width)
            .attr("height", height);
// width = +svg.attr("width"),
// height = +svg.attr("height");

var tooltip = d3.select("#world_map_div")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
                    .scale(70)
                    .center([0,20])
                    .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
.domain([0.2, 0.4, 0.5, 0.6, 0.7, 0.9])
.range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
.defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
.defer(d3.csv, "/static/data/HDI_2017.csv", function(d) { data.set(d.Code, +d.HDI); })
.await(ready);

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

var clicked_countries = [];
function ready(error, topo) {
let mouseOver = function(d) {
    d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", .5)
    d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "black")
    tooltip.style("opacity", 1)
            .html("Country: " + d["properties"]["name"] + "</br>HDI: " + parseFloat(d["total"]).toPrecision(3))
            .style("left", (d3.mouse(this)[0]+70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    
}

let mouseLeave = function(d) {
    if(!clicked_countries.includes(d.id)) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
    }
    tooltip.style("opacity", 0)
}

let mouseClick = function(d) {
    if(clicked_countries.includes(d.id)) {
    removeA(clicked_countries, d.id);
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
    }
    else {
    clicked_countries.push(d.id);
    d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "black")
    }
}

// Draw the map
svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath()
        .projection(projection)
    )
    // set the color of each country
    .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", function(d){ return "Country" } )
    .style("opacity", .8)
    .on("mouseover", mouseOver )
    .on("mouseleave", mouseLeave )
    .on("click", mouseClick )
}
