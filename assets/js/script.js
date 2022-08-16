var searchHistory = JSON.parse(localStorage.getItem("city-history")) || []
var searchBtn = document.getElementById("search-btn")
var clearHistBtn = document.getElementById("clear-history-btn")
var cityEl = document.getElementById("city-input")
var nameEl = document.getElementById("city-name");
var currentWeatherEl = document.getElementById("current-weather");
var currentIconEl = document.getElementById("current-icon");
var currentTempEl = document.getElementById("current-temp");
var currentHumidityEl = document.getElementById("current-humidity");
var currentWindEl = document.getElementById("current-wind");
var currentUvEl = document.getElementById("current-uv");
var fivedayEl = document.getElementById("forecast-header");
var historyEl = document.getElementById("search-history");

const APIKey = "84b79da5e5d7c92085660485702f4ce8";

function getWeather(cityName) {
    // Execute a current weather get request from open weather api
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
      })
        // Store all of the retrieved data inside of an object called "weather"
        .then(function(response) {
          // Log the queryURL
          console.log(queryURL);
    
          // Log the resulting object
          console.log(response);
    
            currentWeatherEl.classList.remove("d-none");

            // Parse response to display current weather
            const currentDate = new Date(response.dt * 1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            nameEl.innerHTML = response.name + " (" + month + "/" + day + "/" + year + ") ";
            let weatherIcon = response.weather[0].icon;
            currentIconEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png");
            currentIconEl.setAttribute("alt", response.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + response.main.temp + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.wind.speed + " MPH";
            
            // Get UV Index
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + APIKey + "&cnt=1";
            $.ajax({
                url: UVQueryURL,
                method:"GET"
            })
                                
                .then(function (response) {
                    console.log(UVQueryURL);
                    console.log(response);
                    let UVIndex = document.createElement("span");
                    
                    // When UV Index is good, shows green, when ok shows yellow, when bad shows red
                    if (response[0].value < 4 ) {
                        UVIndex.setAttribute("class", "badge badge-success");
                    }
                    else if (response[0].value < 8) {
                        UVIndex.setAttribute("class", "badge badge-warning");
                    }
                    else {
                        UVIndex.setAttribute("class", "badge badge-danger");
                    }
                    console.log(response[0].value)
                    UVIndex.innerHTML = response[0].value;
                    currentUvEl.innerHTML = "UV Index: ";
                    currentUvEl.append(UVIndex);
                });
            
            // Get 5 day forecast for this city
            var cityID = response.id;
            var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&appid=" + APIKey;
            $.ajax({
                url: forecastQueryURL,
                method:"GET"
            })
                .then(function (response) {
                    console.log(forecastQueryURL);
                    console.log(response);
                    fivedayEl.classList.remove("d-none");
                    
                    //  Parse response to display forecast for next 5 days
                    var forecastEls = document.querySelectorAll(".forecast");
                    for (i = 0; i < forecastEls.length; i++) {
                        forecastEls[i].innerHTML = "";
                        const forecastIndex = i * 8 + 4;
                        const forecastDate = new Date(response.list[forecastIndex].dt * 1000);
                        const forecastDay = forecastDate.getDate();
                        const forecastMonth = forecastDate.getMonth() + 1;
                        const forecastYear = forecastDate.getFullYear();
                        const forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                        forecastEls[i].append(forecastDateEl);

                        // Icon for current weather
                        const forecastWeatherEl = document.createElement("img");
                        forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.list[forecastIndex].weather[0].icon + "@2x.png");
                        forecastWeatherEl.setAttribute("alt", response.list[forecastIndex].weather[0].description);
                        forecastEls[i].append(forecastWeatherEl);
                        const forecastTempEl = document.createElement("p");
                        forecastTempEl.innerHTML = "Temp: " + response.list[forecastIndex].main.temp + " &#176F";
                        forecastEls[i].append(forecastTempEl);
                        const forecastHumidityEl = document.createElement("p");
                        forecastHumidityEl.innerHTML = "Humidity: " + response.list[forecastIndex].main.humidity + "%";
                        forecastEls[i].append(forecastHumidityEl);
                    }
                })
        });
}

searchBtn.addEventListener("click", function() {
    const searchCity = cityEl.value;
    getWeather(searchCity);
    searchHistory.push(searchCity);
    localStorage.setItem("city-history", JSON.stringify(searchHistory));
    renderSearchHistory();
})

clearHistBtn.addEventListener("click", function() {
    localStorage.clear();
    searchHistory = [];
    renderSearchHistory();
})

function renderSearchHistory() {
    historyEl.innerHTML = "";
    for (var i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function() {
                getWeather(historyItem.value)
            });
        historyEl.append(historyItem);
    }
}

renderSearchHistory();
if (searchHistory.length > 0) {
    getWeather(searchHistory[searchHistory.length - 1]);
}