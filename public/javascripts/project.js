$(document).ready(function () {
    
    $.getJSON('/flightnew/fetchallstates', function (data) {
        data.map((item) => {
            $('#sourcestate').append($('<option>').text(item.statename).val(item.stateid))
        })
        $('#sourcestate').formSelect();

        data.map((item) => {
            $('#deststate').append($('<option>').text(item.statename).val(item.stateid))
        })
        $('#deststate').formSelect();
    });

    $('#sourcestate').change(function () {

        $('#sourcecity').empty();

        $('#sourcecity').append($('<option disabled selected>').text('Choose your City'));

        $.getJSON('/flightnew/fetchallcity', { stateid: $('#sourcestate').val() }, function (data) {
            
            data.map((item) => {
               
                $('#sourcecity').append($('<option>').text(item.cityname).val(item.cityid))
            });
            $('#sourcecity').formSelect(); 
        });
    });

    $('#deststate').change(function () {

        $('#destcity').empty();

        $('#destcity').append($('<option disabled selected>').text('Choose your City'));

        $.getJSON('/flightnew/fetchallcity', { stateid: $('#deststate').val() }, function (data) {
            
            data.map((item) => {
               
                $('#destcity').append($('<option>').text(item.cityname).val(item.cityid))
            });
            $('#destcity').formSelect(); 
        });
    });

    $('#btn').click(function () {
        
        $.getJSON('/flightnew/searchflight', { sid: $('#sourcecity').val(), did: $('#destcity').val() }, function (data) {
            
            if (data.length == 0)
            {
                $('#result').html("<h1>Flight does not exist...</h1>")
            }
            else
            {
                var htm = "<tbody>"
                data.map((item) => {
                    
                    htm += "<tr><td>" + item.flightid + "</td><th>" + item.companyname + "<br><img src='/images/" + item.logo + "' width='40'></th>"
                    htm+="<td>"+item.sc+"<br>"+item.sourcetiming+"</td>"
                    htm+="<td>"+item.dc+"<br>"+item.destinationtiming+"</td>"
                    htm+="<td>"+item.status+"</td>"
                    htm+="<td>"+item.flightclass+"</td>"
                    htm+="<td>"+item.days+"</td>"
                })
                htm+="</tbody>"

                $('#result').html(htm)

                }
        })
    })

});