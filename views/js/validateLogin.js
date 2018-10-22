$(document).ready(function() {
    $("#password").after("<p>The password should be at least 8 characters</p>");
    $("#email").after("<p>Invalid E-mail ID!</p>");
    
	$("p").hide();

    $('#email').blur('input', function() {
    $( this ).next( "p" ).hide(); 
    

        var input=$(this);
        var email=input.val();
        var len=email.length;    
        var str = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        if(email.match(str) && len>0)
        {
            if( $('input[type=submit]').attr("disabled")==="disabled")
            {
                $('input[type=submit]').removeAttr("disabled");
                $('input[type=submit]').css("background-color", "");
            }
            $( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
            $( this ).next( "p" ).show();
                return true;
            
        }
        else
        {
            $( this ).next( "p" ).text("Invalid E-mail ID!").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
            $('input[type=submit]').attr("disabled", "disabled");
            $('input[type=submit]').css("background-color", "grey");
            return false;
            

        }
    

});

 $('#password').blur('input', function() {    	
    $( this ).next( "p" ).hide();
   
	var input=$(this);
	var user_pass=input.val();
	var len = user_pass.length;
    if(len >= 8 && len<=16)
    {
        if( $('input[type=submit]').attr("disabled")==="disabled")
        {
            $('input[type=submit]').removeAttr("disabled");
            $('input[type=submit]').css("background-color", "");
        }
		$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
        $( this ).next( "p" ).show();
        
        return true;
	}
	else{
		$( this ).next( "p" ).text("Please enter a valid password having length 8-16").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show(); 
        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
        
	}
});
});