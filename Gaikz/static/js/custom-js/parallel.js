function parallel_plot(data_parallel) {

    var data2 = data_parallel["parallel"];

    // var margin = {top: 50, right: 50, bottom: 50, left: 50};
    // var height = $("#r1c1").height() - margin.left - margin.right;
    // var width = $("#r1c1").width() - margin.top - margin.bottom;

    // var width = 960;
    // var height = 500;

    var height = $("#parallel_coordinates").height();
    var width = $("#parallel_coordinates").width();

    var margin = {top: 50, right: 0, bottom: 30, left: 120};
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
    d3.select("#parallel_coordinates").selectAll("svg").remove();

    var svg_parallel = d3.select("#parallel_coordinates").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // d3.csv("/static/data/merged_data.csv", function(error, data2) {

        // if (error) {
        //     console.log(error);
        //     return;
        // }

        var parallel_countries = Array.from(unique_countries);
        var total_len = 30;
        var remaining_len = total_len - selected_countries.size;
        var remaining_countries = new Set(parallel_countries.filter( ( el ) => !selected_countries.has( el ) ).slice(0, remaining_len));
        // console.log(remaining_countries);

        parallel_countries = new Set([...selected_countries, ...remaining_countries])
        // console.log(parallel_countries);

        // remaining_countries.has(element["Country"]) & 
        data2 = data2.filter(element => parallel_countries.has(element["Country"]) &  element["Year"] == year)
                .map(element => Object.assign({}, ...disease_list.map(key => ({[key]: element[key]}))))
        
        // console.log(data2);
        // console.log(dimensions);
        //Create the dimensions depending on attribute "type" (number|string)
        // The x-scale calculates the position by attribute dimensions[x].name
        dimensions.forEach(function(dimension) {
            dimension.scale.domain(dimension.type === "number"
                ? d3.extent(data2, function(d) { return +d[dimension.name]; })
                : data2.map(function(d) { return d[dimension.name]; }).sort());

            // y[dimension.name] = d3.scaleLinear()
            //                     .domain(d3.extent(data2, function(p) { return +p[dimension.name]; }))
            //                     .range([height, 0])
            
        });

        // console.log(y);

        // Add grey background lines for context.
        background = svg_parallel.append("g")
                .attr("class", "background")
            .selectAll("path")
                .data(data2)
            .enter().append("path")
                .attr("d", path);

        // Add blue foreground lines for focus.
        foreground = svg_parallel.append("g")
                .attr("class", "foreground")
            .selectAll("path")
                .data(data2)
            .enter().append("path")
                .attr("d", path)
                .style("stroke", function (d) {
                    // console.log(country_color_dict);
                    if (selected_countries.has(d["Country"])) {
                        // console.log(country_color_dict[d["Country"]]);
                        return country_color_dict[d["Country"]];
                    }
                });

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
        // g
        d3.select(".dimension").append("g")
                .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(d.scale.brush = d3.brushY()
                            .extent([[-10,0], [10,height]])
                            .on("start", brushstart)
                            .on("brush", brush)
                            .on("end", brushend))
            })
            .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);
    // });

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

    function brushend() {
        get_year_data(year, "scatter");
        update_actives();
    }
    
    function brush() {
        selected_countries = new Set();

        var actives = [];
        //filter brushed extents
        svg_parallel.selectAll(".brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });        
        actives = actives[0];
        
        // console.log(actives);
        if (actives) {        
            // set un-brushed foreground line disappear
            foreground.style('display', function(d) {
                // console.log(d);
                const dim = actives.dimension;
                const country = d[dim.name];
                // console.log(dim.scale(d[dim.name]));
                check = actives.extent[0] <= dim.scale(country) && dim.scale(country) <= actives.extent[1];
                if (check) {
                    selected_countries.add(country);
                    if(!(country in country_color_dict)) {
                        country_color_dict[country] = colors[colors_iterator % colors.length];
                        colors_iterator++;
                    }
                }
                return check ? null : "none";
            });
        }
        else {
            foreground.style('display', null);
            if (!selected_countries.size) {
                selected_countries = new Set(["Albania", "Afghanistan", "Argentina"]);
            }
        }
      }
}