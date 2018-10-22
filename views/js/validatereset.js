$(document).ready(function() {
    $("#pwd1").after("<p>The password should be at least 8 characters</p>");
    $("#pwd2").after("<p>The password should be at least 8 characters</p>");
    $("#email").after("<p>Invalid E-mail ID!</p>");
    
	$("p").hide();

    $('#email').blur('input', function() {
    $( this ).next( "p" ).hide(); 
   

	var input=$(this);
    var email=input.val();
    var len=email.length;
    if(len==0)
    {
        $( this ).next( "p" ).text("E-mail ID cannot be empty.").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();          
    }
    else
    {
        var str = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        if(email.match(str))
        {
            $( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
            $( this ).next( "p" ).show(); 
        }
        else
        {
            $( this ).next( "p" ).text("Invalid E-mail ID!").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
            $('#submit').click(function () {
            $('input[type=submit]').attr("disabled", "disabled");
            $('input[type=submit]').css("background-color", "grey");
            return false;
            });

        }
    }

});

 $('#pwd1').blur('input', function() {    	
    $( this ).next( "p" ).hide();
    
	var input=$(this);
	var user_pass=input.val();
	var len = user_pass.length;
	if(len >= 8 && len<=16){  
		$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
		$( this ).next( "p" ).show(); 
		}
	else{
		$( this ).next( "p" ).text("Please enter a valid password having length 8-16").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
	    $('#submit').click(function () {
        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
        });
	}
});

$('#pwd2').blur('input', function() {    	
    $( this ).next( "p" ).hide();
    
	var input=$(this);
	var user_pass=input.val();
	var len = user_pass.length;
	if(len >= 8 && len<=16){  
		$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
		$( this ).next( "p" ).show();
		}
	else{
		$( this ).next( "p" ).text("Please enter a valid password having length 8-16").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
	    $('#submit').click(function () {
        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
        });
	}
});
});