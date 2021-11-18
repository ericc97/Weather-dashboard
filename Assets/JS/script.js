// Variable to store searched city
var city="";

// Declare variables
var searchCity = $("#search-city");
var searchButton = $("#searchBtn");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWindSpeed = $("#wind-speed");
var currentUvIndex = $("#uv-index");
var currentDescription = $("#description");
var sCity = [];

// search the city to see if it exists in the entries from local storage

function find(city){
    for (var i=0; i< sCity.length; i++){
        if(city.toUpperCase() === sCity[i]){
            return -1;
        }
    }
    return 1;
}

// Set api key
var ApiKey ="218bf9885141b28259c6e95eada68d3c";

// display current and future weather to user after getting city from input box
var displayWeather = function (event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
        $("#search-city").val('');
    }
}


// create AJAX call
var currentWeather = function(city){
    // api url
    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + ApiKey;
    $.ajax({
        url: queryUrl,
        method: "GET",
    }).then(function(response){
        // parse through response to display current weather including city name. The date plus weather icon.
        console.log(response); 

        // data object from server side Api for icon property
        var weatherIcon = response.weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";

        // get date format from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt*1000).toLocaleDateString();

        // parse response for name of city and concatenating date and icon 
        $(currentCity).html(response.name + " (" + date + ")" + "<img src=" + iconUrl + " >");

        var description = response.weather[0].description;
        console.log(description);

        $(currentDescription).html((description));
        

        // List weather info + icon or type ex. mph, fahrenheit symbol

        //parse response to display current temperature. 
        // convert given temp to fahrenheit
        var tempF = (response.main.temp -273.15) * 1.8 + 32;
        $(currentTemperature).html((tempF).toFixed() + " &#8457" );
        console.log(tempF);

        //display humidity 
        $(currentHumidity).html(response.main.humidity + " %");
        console.log(currentHumidity);

        //display wind speed
        var windS = (response.wind.speed * 2.237).toFixed(1);
        $(currentWindSpeed).html(windS + " Mph");
        console.log(currentWindSpeed);

        // display uv index
        uvIndex(response.coord.lon, response.coord.lat);
        console.log(uvIndex);

        forecast(response.id);
        if(response.cod == 200){
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            // if local storage is empty create new array
            if ( sCity == null){
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }else {
                if (find(city) > 0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}


// new function to get UV Index response
var uvIndex = function(ln,lt){
    // get new url to retrieve long and lat 
    var uvIndexUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lt + "&lon=" + ln + "&appid=" + ApiKey;


    $.ajax({
        url: uvIndexUrl,
        method: "get"
        }).then(function(response){
            $(currentUvIndex).html(response.current.uvi);
        });
}
 

// display 5 day weather forecast for current city
var forecast = function(cityid){

    var queryForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + ApiKey;

    $.ajax({
        url: queryForecastUrl,
        method: "GET"
    }).then(function(response){
        //loop through the 5 day forecast 5 times
        for( i = 0; i < 5; i++){
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();

            // get date, icon, temp, humidity, wind speed, uv index
            var weatherIconCode = response.list[((i+1)*8)-1].weather[0].icon;
            var futureIconUrl = "http://openweathermap.org/img/wn/" + weatherIconCode + ".png";
            var tempKelvin = response.list[((i+1)*8)-1].main.temp;
            // convert tempKelvin to tempFahrenheit
            var tempFahrenheit = (((tempKelvin-273.5)*1.80)+32).toFixed();

            var humidity = response.list[((i+1)*8)-1].main.humidity;
            
            var windSpeed = response.list[((i+1)*8)-1].wind.speed;
            // display date, temp, humidity, wind speed, uv index
            $("#future-date"+i).html(date);
            $("#future-image"+i).html("<img src=" + futureIconUrl + " > ");
            $("#future-temp"+i).html(tempFahrenheit + "&#8457");
            $("#future-humidity" + i).html(humidity + "%");
            $("#future-wind-speed" + i).html(windSpeed + "Mph");


            
        }
    });
}

// add searched cities to saved list
var addToList = function(c){
    var listEl = $("<li >" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());

    $(".list-group").append(listEl);
    console.log(c);
}

// display past searched cities when list group item is clicked in search history
var activatePastSearch = function(event){
    var liEl = event.target;
    if (event.target.matches("li")){
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}
// list the searched cities from saved list in DOM
var loadLastCity = function(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null){
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++){
            addToList(sCity[i]);
        } 
        city = sCity[i-1];
        currentWeather(city);
    }
}

// when clear search history is clicked removed listed cities
var clearSearchBtn = function(event){
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}



$("#searchBtn").on("click", displayWeather);
$(document).on("click", activatePastSearch);
$(window).on("load", loadLastCity);
$("#clear-history").on("click", clearSearchBtn);

