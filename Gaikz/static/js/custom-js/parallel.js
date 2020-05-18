function parallel_plot() {

    // var margin = {top: 50, right: 50, bottom: 50, left: 50};
    // var height = $("#r1c1").height() - margin.left - margin.right;
    // var width = $("#r1c1").width() - margin.top - margin.bottom;

    // var width = 960;
    // var height = 500;

    var height = $("#r1c2").height() + 100;
    var width = $("#r1c2").width();

    var margin = {top: 50, right: 0, bottom: 0, left: 100};
                // width = 960 - margin.left - margin.right,
                // height = 500 - margin.top - margin.bottom;

    height = height - margin.top - margin.bottom;
    width = width - margin.left - margin.right;

    // var country_list = Array.from(selected_countries).sort();
    var disease_list = Array.from(selected_causes);
    disease_list.unshift("Country");

    // var country_set = selected_countries;

    // var year = "2008";

    // console.log(country_list);
    // console.log(country_set);
    // console.log(disease_list);

    var dimensions = [
        {
            name: "Country",
            // scaleBand, scaleOrdinal
            scale: d3.scalePoint().range([0, height]),
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
                scale: d3.scaleLinear().range([0, height]),
                type: "number"
            }
        )
    }

    // console.log(dimensions);

    var x = d3.scaleBand().domain(dimensions.map(function(d) { return d.name; })).range([0, width]),
        y = {},
        dragging = {};

        var line = d3.line(),
        axis = d3.axisLeft(),
        background,
        foreground;

    // remove old svgs
    d3.select("#r1c2").selectAll("svg").remove();

    var svg_parallel = d3.select("#r1c2").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("/static/data/merged_data.csv", function(error, data) {

        if (error) {
            console.log(error);
            return;
        }

        // country_set.has(element["Country"]) & 
        data = data.filter(element => element["Year"] == year)
                .map(element => Object.assign({}, ...disease_list.map(key => ({[key]: element[key]}))))
        
        // console.log(data);
        // console.log(dimensions);
        //Create the dimensions depending on attribute "type" (number|string)
        // The x-scale calculates the position by attribute dimensions[x].name
        dimensions.forEach(function(dimension) {
            dimension.scale.domain(dimension.type === "number"
                ? d3.extent(data, function(d) { return +d[dimension.name]; })
                : data.map(function(d) { return d[dimension.name]; }).sort());

            y[dimension.name] = d3.scaleLinear()
                                .domain(d3.extent(data, function(p) { return +p[dimension.name]; }))
                                .range([height, 0])
            
        });

        // console.log(y);

        // Add grey background lines for context.
        background = svg_parallel.append("g")
                .attr("class", "background")
            .selectAll("path")
                .data(data)
            .enter().append("path")
                .attr("d", path);

        // Add blue foreground lines for focus.
        foreground = svg_parallel.append("g")
                .attr("class", "foreground")
            .selectAll("path")
                .data(data)
            .enter().append("path")
                .attr("d", path);

        // Add a group element for each dimension.
        var g = svg_parallel.selectAll(".dimension")
                    .data(dimensions)
                .enter().append("g")
                    .attr("class", "dimension")
                    .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; })
                .call(d3.drag()
                        .subject(function(d) { return {x: x(d.name)}; })
                    .on("start", function(d) {
                        dragging[d.name] = x(d.name);
                        background.attr("visibility", "hidden");
                    })
                    .on("drag", function(d) {
                        dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
                        foreground.attr("d", path);
                        dimensions.sort(function(a, b) { return position(a) - position(b); });
                        x.domain(dimensions.map(function(d) { return d.name; }));
                        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                    })
                    .on("end", function(d) {
                        delete dragging[d.name];
                        transition(d3.select(this)).attr("transform", "translate(" + x(d.name) + ")");
                        transition(foreground).attr("d", path);
                        background
                            .attr("d", path)
                            .transition()
                                .delay(500)
                                .duration(0)
                                .attr("visibility", null);
                    })
                );
        
        // // Add an axis and title.
        // .call(d3.axisBottom(xAxis))
        g.append("g")
                .attr("class", "axis")
            .each(function(d) { 
                // console.log(d.name);
                d3.select(this).call(axis.scale(d.scale))
                    .attr("fill", "black")
                    // .selectAll("text")
                    //     .attr("transform", function() {
                    //         if (d.name == "Country")
                    //             return "rotate(-10)";
                    //     })
                        ;
                })
                .append("text")
                    .style("text-anchor", "middle")
                    .style("font-size", "7px")
                    .attr("class", "axis-label")
                    .attr("y", -19)
                    .attr("transform", "rotate(-10)")
                    .text(function(d) { return d.name; });

        // Add and store a brush for each axis.
        g.append("g")
                .attr("class", "brush")
            .each(function(d) {
                // .y(d.scale)
                d3.select(this).call(d.scale.brush = d3.brushY()
                            .extent([[-10,0], [10,height]])
                            .on("start", brushstart)
                            .on("brush", brush)
                            .on("end", brush))
            })
            .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);
    });

    function position(d) {
        var v = dragging[d.name];
        return v == null ? x(d.name) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // TODO check for scaleBand here 
    // Returns the path for a given data point.
    function path(d) {
        //return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
        return line(dimensions.map(function(dimension) {
            var v = dragging[dimension.name];
            var tx = v == null ? x(dimension.name) : v;
            // if (dimension.name == "Country") {
            //     console.log(dimension.scale(d[dimension.name]));
            // }
            return [tx, dimension.scale(d[dimension.name])];
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        
        // console.log(dimensions[0].scale.brush);
        // render.invalidate();

        var actives = [];
        svg.selectAll(".axis .brush")
        .each(function(d) {
            actives.push({
            dimension: d,
            extent: d3.brushSelection(this)
            });
        });
        
        // console.log(actives);

        var extents = dimensions.map(function(p) { return p.scale.brush.extent(); });

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
}
// function brush() {  
//     var actives = [];
//     svg.selectAll(".brush")
//     .filter(function(d) {
//             y[d].brushSelectionValue = d3.brushSelection(this);
//             return d3.brushSelection(this);
//     })
//     .each(function(d) {
//         // Get extents of brush along each active selection axis (the Y axes)
//             actives.push({
//                 dimension: d,
//                 extent: d3.brushSelection(this).map(y[d].invert)
//             });
//     });
    
//     var selected = [];
//     // Update foreground to only display selected values
//     foreground.style("display", function(d) {
//         let isActive = actives.every(function(active) {
//             let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
//             return result;
//         });
//         // Only render rows that are active across all selectors
//         if(isActive) selected.push(d);
//         return (isActive) ? null : "none";
//     });
// }  
