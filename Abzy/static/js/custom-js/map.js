function plotMap(data) {
    var dataset = data["map_HDI"];
    
    var height = $("#r1c1").height();
    var width = $("#r1c1").width();
    d3.select("#world_map_div").selectAll("svg").remove();
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
                console.log(country_colorScale(d.id));
                return country_colorScale(d.id) || 0;
            });
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
            if(selected_countries.has(d["properties"]["name"])) {
                console.log(country_color_dict[d["properties"]["name"]]);
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
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
        .on("click", mouseClick )
    }


}
