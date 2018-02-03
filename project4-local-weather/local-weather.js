class Coords {
  constructor(lat, lon) {
    this._lat = lat;
    this._lon = lon;
  }

  getLat() {
    return this._lat;
  }

  getLon() {
    return this._lon;
  }
}

var CELSIUS_HTML_SYMBOL = '&#8451;';
var FERENHEIT_HTML_SYMBOL = '&#8457;';

// Holds the actual temperature, 
var TEMPERATURE = 0; 

function initWeatherUpdate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        updateWeather(new Coords(lat, lon));
      });
  } else {
    console.error("Could not retrieve coordinates. Retrieving default coordinates: lat 47.151726 lon 27.587914");
    updateWeather(new Coords(47.151726, 27.587914));
  }
}


$(document).ready(function () {
  initWeatherUpdate();
  setupDegreeConvertButtons();
});

function updateWeather(coordinates) {
  $.ajax({
    url: buildUrl(coordinates),
    type: 'GET',
    success: function (result) {
      $('#location-name').html(result.name);
      $('#status-value').html(result.weather[0].main);
      $('#status-icon').attr("src", result.weather[0].icon);
      updateDegrees(result.main.temp);
    },
    error: function (xhr) {
      alert("An error occured: " + xhr.status + " " + xhr.statusText);
    }
  });
}

function setupDegreeConvertButtons() {
  $('.btn').on('click', function () {
    var degreesHolder = $('#degrees-value');
    var degrees = degreesHolder.html();

    var celsiusButton = $('#celsius-button');
    var ferenheitButton = $('#ferenheit-button');
    if (buttonNotSelected($(this), 'celsius-button')) {
      convertAndChangeButtons(celsiusButton, ferenheitButton, convertToCelsius(), degreesHolder,  CELSIUS_HTML_SYMBOL);
    } else if (buttonNotSelected($(this), 'ferenheit-button')) {
      convertAndChangeButtons(ferenheitButton, celsiusButton, convertToFerenheit(), degreesHolder, FERENHEIT_HTML_SYMBOL);
    }
  });
}

function convertAndChangeButtons(toButton, fromButton, convertValueProvider, degreesHolder, degreesSymbol) {
  degreesHolder.html(convertValueProvider);
  changeButtons(toButton, fromButton);
  $('#degrees-type').html(degreesSymbol);
}
/*
This function checks if a button has the passed id and that the button is not selected.
*/
function buttonNotSelected(jQuerryButtonObj, idValue) {
  return jQuerryButtonObj.attr('id') === idValue && !isButtonSelected(jQuerryButtonObj);
}

function changeButtons(btnA, btnB) {
  var btnSelectedClass = 'btn-selected';
  btnA.addClass(btnSelectedClass);
  btnB.removeClass(btnSelectedClass);
}

function updateDegrees(degrees) {
  TEMPERATURE = degrees;
  var isCelsius = $('.btn-selected').attr('id') === 'celsius-button';
  var actualDegrees = isCelsius ? parseInt(Math.round(TEMPERATURE)) : convertToFerenheit(TEMPERATURE);
  var symbol = isCelsius ? '&#8451;' : '&#8457;'
  $('#degrees-value').html(actualDegrees);
  $('#degrees-type').html(symbol);
}


function convertToFerenheit() {
  TEMPERATURE = TEMPERATURE * 9.0 / 5.0 + 32.0;
  return parseInt(Math.round(TEMPERATURE));
}

function convertToCelsius() {
  TEMPERATURE = (TEMPERATURE - 32.0) * 5.0 / 9.0;
  return parseInt(Math.round(TEMPERATURE));
}

function isButtonSelected(btn) {
  return btn.hasClass('btn-selected');
}

function buildUrl(coordinates) {
  var url = "";
  url += "https://fcc-weather-api.glitch.me/api/current?lat=";
  url += coordinates.getLat();
  url += "&lon=";
  url += coordinates.getLon();
  return url;
}


