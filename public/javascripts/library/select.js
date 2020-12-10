
$.fn.select2.defaults.set( "theme", "bootstrap" );

$(document).ready(function() {
    $('.multiple-selecting').select2({
        placeholder: "Select one or more"
    });
});