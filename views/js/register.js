$(document).ready(function() {
	console.log('hello');
	
	$("#password").after("<p>The password should be at least 8 characters</p>");
	$("#fname").after("<p>Name should have only letters</p>");
	$("#email").after("<p>Please enter a valid email</p>");
	$("#phone").after("<p>Please enter a valid phone number</p>");
	$("p").hide();

	$('#password').blur('input', function() {    
		console.log('hello');	
	$( this ).next( "p" ).hide();
	
	var input=$(this);
	var user_pass=input.val();
	var len = user_pass.length;
	if(len >= 8 && len<=16){  
	$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
	$( this ).next( "p" ).show(); 
	if( $('input[type=submit]').attr("disabled")==="disabled")
	{
		$('input[type=submit]').removeAttr("disabled");
		$('input[type=submit]').css("background-color", "");
	}
	return true;
	}
	else{
	$( this ).next( "p" ).text("Password should be between 8 and 16 characters").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
	//$('#submit').click(function () {
        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
      //  });
	}
	});

	
	$('#fname').blur('input', function() {
		console.log('entered');
	$( this ).next( "p" ).hide(); 


	var input=$(this);
	var fname=input.val();
	var str=/^([a-zA-Z]+\s)*[a-zA-Z]+$/;   
	if(fname.match(str) && fname.length<=50){
	$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
	$( this ).next( "p" ).show(); 
	if( $('input[type=submit]').attr("disabled")==="disabled")
	{
		$('input[type=submit]').removeAttr("disabled");
		$('input[type=submit]').css("background-color", "");
	}
	return true;
	}
	else{
	$( this ).next( "p" ).text("Enter a valid name").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
    //$('#submit').click(function () {
        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
      //  });
	}
	});
	
	$('#phone').blur('input', function() {
	$( this ).next( "p" ).hide(); 
	

	var input=$(this);
	var contact=input.val();
	var str=/^[0-9]+$/;   
	if(contact.match(str) && contact.length==10){
	$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
	$( this ).next( "p" ).show(); 
	if( $('input[type=submit]').attr("disabled")==="disabled")
	{
		$('input[type=submit]').removeAttr("disabled");
		$('input[type=submit]').css("background-color", "");
	}
	return true;
	}
	else{
	$( this ).next( "p" ).text("Enter a valid contact number").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();  
    //$('#submit').click(function () {
        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
      //  });
	}
	});
	$('#email').blur('input', function() {    	
	$( this ).next( "p" ).hide();
	$.ajax({
		type:'GET',
		url:'/register',
		success:()=>{
			alert('success');
		},
		error:(data)=>{
			alert('error');
		}
	});
	var input=$(this);
    var user_email=input.val();
	if (validateEmail(user_email)){
	$( this ).next( "p" ).text(" ").append('<i style="display:inline;color: #3a7d34;">&#10004;</i>');
	$( this ).next( "p" ).show();
	if( $('input[type=submit]').attr("disabled")==="disabled")
	{
		$('input[type=submit]').removeAttr("disabled");
		$('input[type=submit]').css("background-color", "");
	}
	return true;
	}
	else{
    $( this ).next( "p" ).text("Enter a valid email").append('<i style="display:inline;color: #FF0000;">&#10008;</i>').show();
	//$('#submit').click(function () {

        $('input[type=submit]').attr("disabled", "disabled");
        $('input[type=submit]').css("background-color", "grey");
        return false;
      //  });
	}
	function validateEmail(user_email) {
	var filter = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
	if (filter.test(user_email)) {
	return true;
	}
	else {
	return false;
	}
	}
	});  
	
	});