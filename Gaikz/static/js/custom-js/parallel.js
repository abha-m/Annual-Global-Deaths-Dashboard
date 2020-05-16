// var margin = {top: 50, right: 50, bottom: 50, left: 50};
// var height = $("#r1c1").height() - margin.left - margin.right;
// var width = $("#r1c1").width() - margin.top - margin.bottom;

// var width = 960;
// var height = 500;

// var height = $("#r1c1").height();
// var width = $("#r1c1").width();

var margin = {top: 50, right: 50, bottom: 50, left: 50},
			width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
            
var country_list = ["Afghanistan", "Albania", "Algeria", "American Samoa"];
var country_set = new Set(country_list);

var disease_list = ["Country", "Cardiovascular diseases (%)", "Cancers (%)", "Respiratory diseases (%)", "Diabetes (%)", "Dementia (%)"];

var dimensions = [
    {
        name: "Country",
        scale: d3.scaleOrdinal().range([0, height]),
        type: "string"
    },
    // {
    //     name: "Cardiovascular diseases (%)",
    //     scale: d3.scaleLinear().range([height, 0]),
    //     type: "number"
    // },
];

for (disease of disease_list) {
    if (disease == "Country") {
        continue;
    }
    dimensions.push(
        {
            name: disease,
            scale: d3.scaleLinear().range([height, 0]),
            type: "number"
        }
    )
}

// console.log(dimensions);

var x = d3.scaleOrdinal().domain(dimensions.map(function(d) { return d.name; })).range([0, width]),
    y = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(),
    background,
    foreground;

// The svg
// var svg = d3.select("#parallel")
var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("/static/data/merged_data.csv", function(error, data) {

    if (error) {
        console.log(error);
        return;
    }

    data = data.filter(element => country_set.has(element["Country"]))
               .map(element => Object.assign({}, ...disease_list.map(key => ({[key]: element[key]}))))
    
    console.log(data);
    console.log(dimensions);
    //Create the dimensions depending on attribute "type" (number|string)
    // The x-scale calculates the position by attribute dimensions[x].name
    dimensions.forEach(function(dimension) {
        dimension.scale.domain(dimension.type === "number"
            ? d3.extent(data, function(d) { return +d[dimension.name]; })
            : data.map(function(d) { return d[dimension.name]; }).sort());
    });

    // Add grey background lines for context.
    // background = svg.append("g")
    //         .attr("class", "background")
    //     .selectAll("path")
    //         .data(data)
    //     .enter().append("path")
    //         .attr("d", path);

    // Add blue foreground lines for focus.
    // foreground = svg.append("g")
    //         .attr("class", "foreground")
    //     .selectAll("path")
    //         .data(data)
    //     .enter().append("path")
    //         .attr("d", path);
});

    // // Add a group element for each dimension.
    // var g = svg.selectAll(".dimension")
    //             .data(dimensions)
    //         .enter().append("g")
    //             .attr("class", "dimension")
    //             .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; })
    //         .call(d3.drag()
    //                 .subject(function(d) { return {x: x(d.name)}; })
    //             .on("start", function(d) {
    //                 dragging[d.name] = x(d.name);
    //                 background.attr("visibility", "hidden");
    //             })
    //             .on("drag", function(d) {
    //                 dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
    //                 foreground.attr("d", path);
    //                 dimensions.sort(function(a, b) { return position(a) - position(b); });
    //                 x.domain(dimensions.map(function(d) { return d.name; }));
    //                 g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
    //             })
    //             .on("end", function(d) {
    //                 delete dragging[d.name];
    //                 transition(d3.select(this)).attr("transform", "translate(" + x(d.name) + ")");
    //                 transition(foreground).attr("d", path);
    //                 background
    //                     .attr("d", path)
    //                     .transition()
    //                         .delay(500)
    //                         .duration(0)
    //                         .attr("visibility", null);
    //             })
    //         );

    // // Add an axis and title.
    // g.append("g")
    //         .attr("class", "axis")
    //     .each(function(d) { d3.select(this).call(axis.scale(d.scale)); })
    //         .append("text")
    //             .style("text-anchor", "middle")
    //             .attr("class", "axis-label")
    //             .attr("y", -19)
    //             .text(function(d) { return d.name; });

    // Add and store a brush for each axis.
    // g.append("g")
    //         .attr("class", "brush")
    //     .each(function(d) {
    //         d3.select(this).call(d.scale.brush = d3.svg.brush().y(d.scale).on("brushstart", brushstart).on("brush", brush));
    //     })
    //     .selectAll("rect")
    //         .attr("x", -8)
    //         .attr("width", 16);
// });

function position(d) {
    var v = dragging[d.name];
    return v == null ? x(d.name) : v;
}

function transition(g) {
    return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
    //return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    return line(dimensions.map(function(dimension) {
        var v = dragging[dimension.name];
        var tx = v == null ? x(dimension.name) : v;
        return [tx, dimension.scale(d[dimension.name])];
    }));
}

function brushstart() {
    d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = dimensions.filter(function(p) { return !p.scale.brush.empty(); }),
        extents = actives.map(function(p) { return p.scale.brush.extent(); });

    foreground.style("display", function(d) {
        return actives.every(function(p, i) {
            if(p.type==="number"){
                return extents[i][0] <= parseFloat(d[p.name]) && parseFloat(d[p.name]) <= extents[i][1];
            }else{
                return extents[i][0] <= p.scale(d[p.name]) && p.scale(d[p.name]) <= extents[i][1];
            }
        }) ? null : "none";
    });
}