// var selected_years = new Set([2016]);
// var selected_countries = new Set(["India", "China"]);
// var selected_causes = new Set(["Cardiovascular diseases (%)", "Cancers (%)", "Respiratory diseases (%)"]);

// document.getElementById("t1_whole_dataset").addEventListener("click", function() {
//     plotGraph("whole_dataset");
// });

// $("#years-dropdown-item").click(
// );

function plotScatterPlot(dataset_plot) {
    var scatter_data = dataset_plot["pca_plot"], 
        dataset_HDI = dataset_plot["map_HDI"];

    // set the dimensions and margins of the graph
    var height = $("#scatterplot").height();
    var width = $("#scatterplot").width();

    // console.log(height, width);

    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    d3.select("#scatterplot").selectAll("svg").remove();
    // append the svg object to the body of the page
    var svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")" + "scale(0.6, 0.5)");


    // Add X axis
    var x = d3.scaleLinear()
    .domain([d3.min(scatter_data, function (d) { return +d["PC1"]; }),
    d3.max(scatter_data, function (d) { return +d["PC1"]; })])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([d3.min(scatter_data, function (d) { return +d["PC2"]; }),
    d3.max(scatter_data, function (d) { return +d["PC2"]; })])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    var color = d3.scaleLinear()
                    .domain([d3.min(scatter_data, function (d) { return +d["HDI"]; }),
                    d3.max(scatter_data, function (d) { return +d["HDI"]; })])
                    .range(["#F3F5FF", "#406AA9"])

    var country_colorScale = d3.scaleOrdinal()
    .domain(dataset_HDI, function(d) { return d.Entity; })
    // .interpolate(d3.interpolateHcl)
    .range(colors);
    // .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

    // Add dots
    var myCircle = svg.append('g')
    .selectAll("circle")
    .data(scatter_data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.PC1); } )
    .attr("cy", function (d) { return y(d.PC2); } )
    .attr("r", function(d) { return d.Sum / 5; })
    .style("fill", function (d) { if(selected_countries.has(d.Country)) { 
                                    // return selected_color(d.Sum);
                                    // return country_colorScale(d.Country);
                                    return country_color_dict[d.Country];
                                } 
                                return color(d.HDI); } )
    .style("opacity", function (d) {
        if(selected_countries.has(d.Country)) {
            return 1.2;
        }
        else {
            return 0.4;
        }
    })
    .attr("stroke", "#000")
    

    // Add brushing
    svg
    .call( d3.brush()                 // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        // .on("", clear_selected_countries)
        .on("start brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
        .on("end", function() { 
            get_year_data(year, "scatter");
            update_actives();
        })
    )

    // function clear_selected_countries() {
    //     selected_countries.clear();
    // }

    // Function that is triggered when brushing is performed
    function updateChart() {
        selected_countries = new Set();
        
        extent = d3.event.selection
        // add color here 
        myCircle.classed("selected", function(d){ return isBrushed(extent, x(d.PC1), y(d.PC2), d.Country ) } )

        if (!selected_countries.size) {
            selected_countries = new Set(["Albania", "Afghanistan", "Argentina"]);
        }
        // plotBarPlot(data["bar_plot"]);
        // parallel_plot();

        // myCircle.classed("selected", function(d){ selected_countries.add(isBrushed(extent, x(d.PC1), y(d.PC2), d.Country )); } )
    }

    // A function that return TRUE or FALSE according if a dot is in the selection or not
    function isBrushed(brush_coords, cx, cy, country) {

        var x0 = brush_coords[0][0],
            x1 = brush_coords[1][0],
            y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];
        if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
            selected_countries.add(country);
            // this.style("fill", function(d) {
            //     if(d.Country in selected_countries) {
            //         return country_color_dict[d.Country];
            //     }
            // })
            // if(!(country in country_color_dict)) {
            //     country_color_dict[country] = colors[colors_iterator % colors.length];
            //     colors_iterator++;
            // }
            return true;
        }
    // return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
    }
}