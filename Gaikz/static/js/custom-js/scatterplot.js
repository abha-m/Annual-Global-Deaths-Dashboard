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
        "translate(" + margin.left + "," + margin.top + ")");

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
                    .domain([d3.min(scatter_data, function (d) { return +d["Sum"]; }),
                    d3.max(scatter_data, function (d) { return +d["Sum"]; })])
                    .range(["#F3F5FF", "#406AA9"])
    // var selected_color = d3.scaleLinear()
    //                 .domain([d3.min(data, function (d) { return +d["Sum"]; }),
    //                 d3.max(data, function (d) { return +d["Sum"]; })])
    //                 .range(["#FFCDCE", "#F40300"])
    var colors = ['#F0F8FF', '#FAEBD7', '#00FFFF', '#7FFFD4', '#F0FFFF', '#F5F5DC',
     '#FFE4C4', '#000000', '#FFEBCD', '#0000FF', '#8A2BE2', '#A52A2A', '#DEB887', 
     '#5F9EA0', '#7FFF00', '#D2691E', '#FF7F50', '#6495ED', '#FFF8DC', '#DC143C', 
     '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#A9A9A9', 
     '#BDB76B', '#8B008B', '#556B2F', '#FF8C00', '#9932CC', '#8B0000', '#E9967A', 
     '#8FBC8F', '#483D8B', '#2F4F4F', '#2F4F4F', '#00CED1', '#9400D3', '#FF1493', 
     '#00BFFF', '#696969', '#696969', '#1E90FF', '#B22222', '#FFFAF0', '#228B22', 
     '#FF00FF', '#DCDCDC', '#F8F8FF', '#FFD700', '#DAA520', '#808080', '#008000', 
     '#ADFF2F', '#808080', '#F0FFF0', '#FF69B4', '#CD5C5C', '#4B0082', '#FFFFF0', 
     '#F0E68C', '#E6E6FA', '#FFF0F5', '#7CFC00', '#FFFACD', '#ADD8E6', '#F08080', 
     '#E0FFFF', '#FAFAD2', '#D3D3D3', '#90EE90', '#D3D3D3', '#FFB6C1', '#FFA07A', 
     '#20B2AA', '#87CEFA', '#778899', '#778899', '#B0C4DE', '#FFFFE0', '#00FF00', 
     '#32CD32', '#FAF0E6', '#FF00FF', '#800000', '#66CDAA', '#0000CD', '#BA55D3', 
     '#9370DB', '#3CB371', '#7B68EE', '#00FA9A', '#48D1CC', '#C71585', '#191970', 
     '#F5FFFA', '#FFE4E1', '#FFE4B5', '#FFDEAD', '#000080', '#FDF5E6', '#808000', 
     '#6B8E23', '#FFA500', '#FF4500', '#DA70D6', '#EEE8AA', '#98FB98', '#AFEEEE', 
     '#DB7093', '#FFEFD5', '#FFDAB9', '#CD853F', '#FFC0CB', '#DDA0DD', '#B0E0E6', 
     '#800080', '#FF0000', '#BC8F8F', '#4169E1', '#8B4513', '#FA8072', '#F4A460', 
     '#2E8B57', '#FFF5EE', '#A0522D', '#C0C0C0', '#87CEEB', '#6A5ACD', '#708090', 
     '#708090', '#FFFAFA', '#00FF7F', '#4682B4', '#D2B48C', '#008080', '#D8BFD8', 
     '#FF6347', '#40E0D0', '#EE82EE', '#F5DEB3', '#FFFFFF', '#F5F5F5', '#FFFF00'];

    // var colors = ["#FF1493", "#DB7093", "#7B68EE", "#CD5C5C", "#FF0000", 
    // "#FFA500", "#FFDAB9", "#7FFF00", "#00FF00", "#00FA9A", "#9ACD32", "#20B2AA", 
    // "#00FFFF", "#4682B4", "#0000FF", "#191970", "#BC8F8F", "#A0522D", "#778899"];
    
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
    .attr("r", function(d) { return d.HDI * 15; })
    .style("fill", function (d) { if(selected_countries.has(d.Country)) { 
                                    // return selected_color(d.Sum);
                                    // return country_colorScale(d.Country);
                                    return country_color_dict[d.Country];
                                } 
                                return color(d.Sum); } )
    .style("opacity", 0.7)
    .attr("stroke", "#000")

    // Add brushing
    svg
    .call( d3.brush()                 // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        // .on("", clear_selected_countries)
        .on("start brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
        .on("end", function() { 
            console.log(selected_countries); 
            get_year_data(year, "scatter");
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
            return true;
        }
    // return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
    }
}