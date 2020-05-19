function plotMap(data) {
    var dataset = data["map_HDI"];
    
    var height = $("#world_map_div").height();
    var width = $("#world_map_div").width();
    d3.select("#world_map_div").selectAll("svg").remove();
    d3.select("#world_map_div").selectAll("div").remove();
    // The svg
    var svg = d3.select("#world_map_div")
                .append("svg")
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
    dataset.forEach(element => {
        data.set(element.Code, +element.HDI);
    });
    // console.log(data)

    var colorScale = d3.scaleThreshold()
    .domain([0.2, 0.4, 0.5, 0.6, 0.7, 0.9])
    .range(d3.schemeBlues[7]);
     
    var country_colorScale = d3.scaleOrdinal()
    .domain(dataset, function(d) { return d.Code; })
    // .interpolate(d3.interpolateHcl)
    .range(colors);
    // .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);
    // console.log(country_colorScale);


    // Load external data and boot
    d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    // .defer(dataset, function(d) { data.set(d.Code, +d.HDI); })
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

    // var clicked_countries = [];
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
        tooltip.style("opacity", 1)
                .html("Country: " + d["properties"]["name"] + "</br>HDI: " + parseFloat(d["total"]).toPrecision(3))
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
    }

    let mouseLeave = function(d) {
        if(!selected_countries.has(d["properties"]["name"])) {
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
        if(selected_countries.has(d["properties"]["name"])) {
            // console.log(d["properties"]["name"]);
            removeA(selected_countries, d["properties"]["name"]);
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "transparent")
                .attr("fill", function (d) {
                    d.total = data.get(d.id) || 0;
                    return colorScale(d.total);
                })
        }
        else {
            selected_countries.add(d["properties"]["name"]);
            d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .attr("fill", function (d) {
                // d.total = data.get(d.id);
                // console.log(country_colorScale(d.id));
                return country_colorScale(d.id) || 0;
            });
        }
        // console.log(selected_countries);
        get_year_data(year, "map");
        update_actives();
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
            if(selected_countries.has(d["properties"]["name"])) {
                // console.log(country_color_dict[d["properties"]["name"]]);
                d.total = data.get(d.id) || 0;
                return country_color_dict[d["properties"]["name"]];
            }
            else {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            }
            
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", function(d) {
            if(selected_countries.has(d["properties"]["name"])) {
                return 1.2;
            }
            else {
                return 0.8;
            }
        })
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
        .on("click", mouseClick )
    }
}
