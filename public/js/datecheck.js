$(document).ready(function () {
    
        $("#checkin").datepicker({
            dateFormat: "yy-mm-dd",
            minDate: 0,
            onSelect: function (date) {
                var date2 = $('#checkin').datepicker('getDate');
                date2.setDate(date2.getDate() + 1);
                $('#checkout').datepicker('setDate', date2);
                //sets minDate to dt1 date + 1
                $('#checkout').datepicker('option', 'minDate', date2);
            }
        });
        $('#checkout').datepicker({
            dateFormat: "yy-mm-dd",
            onClose: function () {
                var dt1 = $('#checkin').datepicker('getDate');
                var dt2 = $('#checkout').datepicker('getDate');
                //check to prevent a user from entering a date below date of dt1
                if (dt2 <= dt1) {
                    var minDate = $('#checkout').datepicker('option', 'minDate');
                    $('#checkout').datepicker('setDate', minDate);
                }
            }
        });
    });