$(document).ready(function () {
  let searchedCitiesArray = [];

  //<---------------------- City Input and Search History
  $("#searchBtn").on("click", getSearchInput);
  $(document).on("click", ".selected", storedCities);

  searchHistory();

  // Display recently searched cities stored in search history
  function storedCities() {
    let city = $(this).text();
    getWeather(city);
  }

  // Listen to the search button click and create function to get user input/city
  function getSearchInput(event) {
    event.preventDefault(); // Prevent default form submission behavior
    $("#previousSearches").empty();

    let city = $(".form-control").val().trim(); // Trim whitespace from the input
    searchedCitiesArray.push(city);
    localStorage.setItem("cities", JSON.stringify(searchedCitiesArray));
    $("#searchHistory").append($("<div>").text(city).addClass("selected"));
    $("#searchInput").val("");
    $(".form-control").val(""); // Clear out search bar after searches
    getWeather(city);
  }

  function searchHistory() {
    //Create function to display cities search History stored in localStorage
    searchedCitiesArray = JSON.parse(localStorage.getItem("cities"));
    if (searchedCitiesArray == null) {
      searchedCitiesArray = [];
    }

    for (let i = 0; i < searchedCitiesArray.length; i++) {
      //Loop through searched citiies array
      const displaySearchedCities = searchedCitiesArray[i];

      const searchHistoryList = $("<div>")
        .text(displaySearchedCities)
        .addClass("selected"); // Display searched history and store in local storage
      $("#searchHistory").append(searchHistoryList);
    }
  }

  //<---------------------- Weather API Call
  const apiKey = "67acae8c226e94763f4c70fdb6c20deb"; //OpenWeatherMap apiKey to call the API
  const API_KEY = apiKey; // Creating a variable named API_KEY with the value of the key

  function getWeather(city) {
    // Current weather function
    const queryURL =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      city +
      "&appid=" +
      API_KEY;

    $.getJSON(queryURL)
      .done(function (response) {
        updateCurrentWeather(response.list[0], response.city);
        updateForecast(response.list);
      })
      .fail(function (jqxhr, textStatus, error) {
        console.log("Request Failed: " + textStatus + ", " + error);
      });
  }

  function updateCurrentWeather(data, city) {
    let dateOptions = { month: "2-digit", day: "2-digit", year: "numeric" };
    let formattedDate = new Date(data.dt * 1000).toLocaleDateString(
      undefined,
      dateOptions
    );
    $(".currentCity").html(`<h3>${city.name} (${formattedDate})</h3>`);
    $(".humidity").text(`Humidity: ${data.main.humidity}%`);
    $(".windSpeed").text(
      `Wind Speed: ${(data.wind.speed * 2.237).toFixed(2)} mph`
    );
    $(".temperature").text(
      `Temperature: ${((data.main.temp - 273.15) * 1.8 + 32).toFixed(2)} F`
    );
    getUVindex(city.coord.lat, city.coord.lon);
  }

  function updateForecast(list) {
    $("#previousSearches").empty();
    const options = { month: "2-digit", day: "2-digit", year: "numeric" };

    //<---------------------- Displays data for 5 Days Weather Forecast
    for (let i = 0; i <= 5; i++) {
      let data = list[i * 8]; // Adjust the index to cover all five days
      let date = new Date(data.dt * 1000).toLocaleDateString(
        undefined,
        options
      );

      $(`#day${i + 1}Forecast`).text(date); // "i + 1" for day IDs
      $(`#day${i + 1}Icon`)
        .empty()
        .append(
          $(
            `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png"/>`
          )
        );
      $(`#day${i + 1}Humidity`).text(`Humidity: ${data.main.humidity}%`);
      $(`#day${i + 1}Temperature`).text(
        `Temp: ${((data.main.temp - 273.15) * 1.8 + 32).toFixed(2)} F`
      );
      $(`#day${i + 1}Wind`).text(
        `Wind: ${(data.wind.speed * 2.237).toFixed(2)} mph`
      );
    }
  }

  // Using lat and long with get uvIndex and display on Currentweather DOM
  function getUVindex(lat, long) {
    let queryURL =
      "https://api.openweathermap.org/data/2.5/onecall?" +
      "&lat=" +
      lat +
      "&lon=" +
      long +
      "&appid=" +
      apiKey;

    $.ajax({
      url: queryURL,
      method: "GET",
    })
      .done(function (responseUVI) {
        let uvIndex = responseUVI.current.uvi;
        //Print UVIndex
        $("#uvIndex").text(`UV Index: ${uvIndex}`);
        let color;
        if (uvIndex <= 2.99) {
          color = "olivedrab";
        } else if (uvIndex <= 5.99) {
          color = "gold";
        } else if (uvIndex <= 7.99) {
          color = "darkorange";
        } else {
          color = "firebrick";
        }
        $("#uvIndex").css({
          "background-color": color,
          display: "block",
          "border-radius": "12px",
          padding: "1.5%",
          "max-width": "20%",
        });
      })
      .fail(function (jqxhr, textStatus, error) {
        console.log("Request Failed: " + textStatus + ", " + error);
      });
  }

  getWeather("Houston");
});
