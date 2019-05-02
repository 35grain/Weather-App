function back() { //Reset app on back button click
    $('.weather').fadeOut();
    $('.location').fadeIn();
    localStorage.clear();
    localStorage.setItem('units', units);
    $('ul.values').empty();
    $('ul.day').empty();
    $('ul.value_name').empty();
}