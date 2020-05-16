var selected_years = new Set([2007, 2008, 2009]);
    var selected_countries = new Set(["India", "USA"]);
    var selected_causes = new Set(["Cause 1", "Cause 2"]);

    $(".years-dropdown-item").click(function() {
        selected_years.add(parseInt(this.text));
        var url_string = "/?years=";
        selected_years.forEach(element => url_string += element + "+");

        url_string = url_string.concat("&?countries=")
        selected_countries.forEach(element => url_string += element + "+");

        url_string = url_string.concat("&?causes=");
        selected_causes.forEach(element => url_string += element + "+");

        console.log("......")
        console.log(url_string);
        $.ajax({
            url: url_string,
            success: function(response) {
                // data = JSON.parse(response);
                // plotIt(data) 
            }
        })
        
    })