function hdi_barplot(data2) {
    

    var data = data2["map_HDI"].filter( (el) => (selected_countries.has(el.Entity)));
    // console.log(data, selected_countries);

    // var height = $("#hdi_barplot").height();
    // var width = $("#hdi_barplot").width();

    var height = 550;
    var width = 200;
    
    // console.log(height, width);

    var margin = {top: 20, right: 10, bottom: 30, left: 10},
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;

    // set the ranges
    var y = d3.scaleBand()
            .range([height, 0])
            .padding(0);

    var x = d3.scaleLinear()
            .range([0, width]);

    d3.select("#hdi_barplot").selectAll("svg").remove();

    var svg = d3.select("#hdi_barplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .style("overflow-y", "scroll")
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    // format the data
    // data.forEach(function(d) {
    //     d.sales = +d.sales;
    // });

    // Scale the range of the data in the domains
    x.domain([0, d3.max(data, function(d){ return d.HDI; })])
    y.domain(data.map(function(d) { return d.Entity; }));
    //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        //.attr("x", function(d) { return x(d.sales); })
        .attr("width", function(d) {return x(d.HDI); } )
        .attr("y", function(d) { return y(d.Entity); })
        .attr("height", y.bandwidth())
        .append("text")
        .text(function (d) {
            return d.Entity;
        })
        ;

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + "" + "-10)")
        .call(d3.axisBottom(x))
        // .style('stroke', '#fff');
        // .attr("transform", ("translate(0," + String(height) + ")"));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("transform", ("translate(" + String(width) + ",0)"))
        // .selectAll(".tick line")
        // .attr("transform", ("translate(" + String(width) + ",0)"))
        .select("path")
        .attr("stroke", "none");
}
// function type(d){
//     d.population = +d.population;
//     return d;
// }

// d3.csv("top10cities.csv", type, render);
