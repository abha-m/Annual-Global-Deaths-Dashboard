// helper
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

function plotBarPlot(data_barplot) {
    // console.log(data);
    // set the dimensions and margins of the graph

    // console.log(data);
    // points.sort(function(a, b){return b - a});

    // console.log(selected_causes);

    var data = data_barplot["bar_plot"];

    function get_list(data_obj) {
        var sortable = [];
        var to_keep = {};
        for (var key in data_obj) {
            if (selected_causes.has(key)) {
                to_keep[key] = data_obj[key];
            }
            else {
                sortable.push([key, data_obj[key]]);
            }
        }

        return [sortable, to_keep];
    }

    // console.log("AAA");
    // console.log(data);

    for (i = 0; i < data.length; i++) {
        temp = get_list(data[i]);
        sortable = temp[0];
        to_keep = temp[1];
        to_keep["Country"] = sortable[0][1];

        extra_len = 10 - selected_causes.size + 1;

        sortable = sortable.slice(1, extra_len).sort(function(a, b){return b[1] - a[1]})
        // console.log(sortable);

        to_keep_2 = {}
        for (j = 0; j < sortable.length; j++) {
            to_keep_2[sortable[j][0]] = sortable[j][1];
        }
        // console.log(to_keep);
        to_keep = {...to_keep_2, ...to_keep};

        data[i] = to_keep;
    }

    var height = $("#barplot").height();
    var width = $("#barplot").width();

    // console.log(height, width);

    var margin = {top: 10, right: 0, bottom: 0, left: 50};
    // width = 460 - margin.left - margin.right,
    // height = 400 - margin.top - margin.bottom;

    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

    // console.log(height, width);

    d3.select("#barplot").selectAll("svg").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")" + "scale(0.8, 0.70)");

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = removeA(Object.keys(data[0]), "Country")
    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function(d){return(d.Country)}).keys()


    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#barplot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        tooltip
            .html("Cause: " + subgroupName + "<br>" + "Percentage: " + subgroupValue)
            .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
        .style("left", (d3.mouse(this)[0]-10) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
        tooltip
        .style("opacity", 0)
    }

    // Add X axis
    var x = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding([0.2])
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
        .attr("transform", "rotate(-20)");

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0 ]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color_focus = d3.scaleOrdinal()
    .domain(subgroups)
    .range(d3.schemeDark2);

    var color_background = d3.scaleOrdinal()
                            .domain(subgroups)
                            .range(d3.schemePastel2);

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
    .keys(subgroups)
    (data)

    



    // // ----------------
    // // Highlight a specific subgroup when hovered
    // // ----------------

    // // What happens when user hover a bar
    // var mouseover = function(d) {
    // // what subgroup are we hovering?
    // var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
    // var subgroupValue = d.data[subgroupName];
    // // Reduce opacity of all rect to 0.2
    // d3.selectAll(".myRect").style("opacity", 0.2)
    // // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
    // d3.selectAll("."+subgroupName)
    //   .style("opacity", 1)
    // }

    // // When user do not hover anymore
    // var mouseleave = function(d) {
    // // Back to normal opacity: 0.8
    // d3.selectAll(".myRect")
    //   .style("opacity",0.8)
    // }

    // Show the bars
    svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
    //   .attr("fill", function(d) { if(selected_causes.has(d.key)) { return color_focus(d.key); } return color_background(d.key); })
    .attr("fill", function(d) { if(selected_causes.has(d.key)) { return "#FC6C66"; } return "#D2E2F2"; })
    .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function(d) { return d; })
    .enter().append("rect")
        .attr("x", function(d) { return x(d.data.Country); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
        .attr("stroke", "black")
        .attr("stroke-width", "0.5")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}