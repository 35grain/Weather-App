const API_key = '2e1ac6f588da64cf4146b5863b898c6d'; //Don't worry, not a secret

$('input.city').on('keydown', function (e) { //'Enter' key acts as entry button
    if (e.which == 13) {
        city();
    }
    if (e.which === 8) { //Backspace removes error class caused by an error in the city name
        $('.location input.city').removeClass('error');
    }
});

let units = localStorage.getItem('units'); //Get preferred units from storage

if (units === 'imperial') { //Set toggle switch accordingly
    $('input#unitSwitch[type=checkbox]').prop("checked", false);
} else {
    $('input#unitSwitch[type=checkbox]').prop("checked", true);
    units = 'metric'; //Default unit
}

$('input#unitSwitch[type=checkbox]').change(function () { //Listen for toggles and set units accordingly
    if ($(this).prop('checked')) {
        units = 'metric';
        localStorage.setItem('units', units);
    } else {
        units = 'imperial';
        localStorage.setItem('units', units);
    }
    location.reload(); //Reload page for fresh data
})

let saved_city = localStorage.getItem('city'); //Load location from storage on load
let saved_geoLoc = JSON.parse(localStorage.getItem('geoLoc')); //Load location from storage on load

if (saved_city) { //Check for saved location
    let today = `http://api.openweathermap.org/data/2.5/weather?q=${saved_city}&units=${units}&APPID=${API_key}`;
    let week = `http://api.openweathermap.org/data/2.5/forecast?q=${saved_city}&units=${units}&APPID=${API_key}`;
    data_card(today, week);
} else if (saved_geoLoc) {
    let saved_lat = saved_geoLoc[0];
    let saved_lon = saved_geoLoc[1];
    let today = `http://api.openweathermap.org/data/2.5/weather?lat=${saved_lat}&lon=${saved_lon}&units=${units}&APPID=${API_key}`;
    let week = `http://api.openweathermap.org/data/2.5/forecast?lat=${saved_lat}&lon=${saved_lon}&units=${units}&APPID=${API_key}`;
    data_card(today, week);
} else {
    $('.location').fadeIn();
}

function city() { //Location based on city
    let city = $('.city').val();

    if (city) {
        let today = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&APPID=${API_key}`;
        let week = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&APPID=${API_key}`;
        data_card(today, week);
        localStorage.setItem('city', city); //Save location in storage
    }
}

function geoLoc() { //Location based on current position / geo location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            let today = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&APPID=${API_key}`;
            let week = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&APPID=${API_key}`;
            data_card(today, week);
            localStorage.setItem('geoLoc', JSON.stringify([lat, lon])); //Save location in storage
        });
    } else {
        $('.container').innerHTML = "Geolocation is not supported by this browser.";
    }
}

function unixConverter(timestamp) { //API UNIX timestamp to milliseconds
    timestamp = new Date(timestamp * 1000);
    return timestamp;
}

function temperature(temp) { //Temperature rounder, writer thingy
    if ($('input#unitSwitch[type=checkbox]').prop('checked')) {
        temp = `${Math.round(temp,1)}°C`;
    } else {
        temp = `${Math.round(temp,1)}°F`;
    }

    return temp;
}

function wind(speed) { //Wind speed rounder, writer thingy
    if (speed) {
        if ($('input#unitSwitch[type=checkbox]').prop('checked')) {
            speed = `${Math.round(speed,1)} m/s`;
        } else {
            speed = `${Math.round(speed,1)} mps`;
        }
    } else {
        speed = '-';
    }

    return speed;
}

function pressure(pressure) { //Pressure writer thingy
    if (pressure) {
        pressure = pressure + ' hPa';
    } else {
        speed = '-';
    }

    return pressure;
}

function visibility(distance) { //Visibility rounder, writer thingy
    if (distance) {
        if ($('input#unitSwitch[type=checkbox]').prop('checked')) {
            distance = `${Math.round(distance/1000,1)} km`;
        } else {
            distance = `${Math.round(distance/1000*0.6213712,1)} miles`;
        }
    } else {
        distance = '-';
    }

    return distance;
}

function data_card(tdy, wek) {
    const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function ordinal_suffix_of(i) { //Suffix for dates e.g '1st, 2nd, 3rd'
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    } //Salman A. @Stack Overflow made life easier

    var request_today = new XMLHttpRequest() //Begin city request
    request_today.open('GET', tdy, true)
    request_today.onload = function () {
        const data_today = JSON.parse(this.response);

        if (data_today["name"]) { //Check if there is valid data
            $('h1#city').html(`${data_today["name"]}`);

            const date = unixConverter(data_today["dt"]);
            const humanly_day = `${weekdays[date.getDay()]}, ${month_names[date.getMonth()]} ${ordinal_suffix_of(date.getDate())} ${date.getFullYear()}`; //Convert date to a more readable format e.g 'Friday, May 2nd 2019'
            const current_wth = data_today["weather"][0]["description"]; //Get weather description e.g 'Light snow'
            let current_temp = temperature(data_today["main"]["temp"]);
            const current_stat = data_today["weather"][0]["id"]; //Get weather status code

            let time = '';
            if (6 < date.getHours() && date.getHours() < 21) { //Everything in between 6 and 21 o'clock is considered daytime
                time = 'day';
            } else {
                time = 'night';
            }
            let current_icon = `<i class="wi wi-owm-${time}-${current_stat}"></i>`; //Get matching icon for status code

            $('h2#date').html(`${humanly_day}`);
            $('h3#current').html(`${current_wth}`);
            $('h2#current_temp').html(`${current_temp} ${current_icon}`);

            $('ul.value_name').append('<li>Humidity</li>');
            $('ul.values').append(`<li>${data_today["main"]["humidity"]}%</li>`);

            $('ul.value_name').append('<li>Wind speed</li>');
            $('ul.values').append(`<li>${wind(data_today["wind"]["speed"])}</li>`);

            $('ul.value_name').append('<li>Pressure</li>');
            $('ul.values').append(`<li>${pressure(data_today["main"]["pressure"])}</li>`);

            $('ul.value_name').append('<li>Visibility</li>');
            $('ul.values').append(`<li>${visibility(data_today["visibility"])}</li>`);

            if (date.getHours() > 15) {
                $('ul.day').append(`<li>
                    <h4>${weekdays[date.getDay()]}</h4>
                    <i class="wi wi-owm-${current_stat}"></i>
                    <h4>${current_temp}</h4>
                    </li>`) //Current data used due to API limitations
            }
        } else {
            localStorage.removeItem('city'); //Clear storage if no valid data found
            $('.location input.city').addClass('error');
        }
    }
    request_today.send();

    var request_week = new XMLHttpRequest() //Not really a week, free API allows for only 5 days of messy data
    request_week.open('GET', wek, true)
    request_week.onload = function () {
        const data_week = JSON.parse(this.response);

        if (data_week["city"]["name"]) {
            $('.location').fadeOut(); //Get rid of the location selector card
            $('.weather').fadeIn(); //Load the weather widget
            $('.location input.city').val(''); //Reset input field

            for (i = 0; i < data_week["list"].length; i++) {
                if (unixConverter(data_week["list"][i]["dt"]).getHours() === 12) { //Get data for next 5 days at 12.00 UTC (API doesn't give local time)
                    let day_stat = data_week["list"][i]["weather"][0]["id"]; //Weather status code
                    let day_temp = temperature(data_week["list"][i]["main"]["temp"]); //Temperature
                    let day_name = weekdays[unixConverter(data_week["list"][i]["dt"]).getDay()]; //Day name

                    $('ul.day').append(`<li>
                    <h4>${day_name}</h4>
                    <i class="wi wi-owm-${day_stat}"></i>
                    <h4>${day_temp}</h4>
                    </li>`)
                }
            }

        } else {
            localStorage.removeItem('geoLoc'); //Get rid of invalid geoLoc in storage
        }
    }
    request_week.send();
}