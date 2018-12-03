$(document).ready(function(){
    $("#city").change(function(){
        var input=$(this);
        var id=input.val();
        var data1={
            'city':id,
            'page':1,
            'search':search
        };
        $.ajax({
            type:'POST',
            url:'/roomInfo',
            data:data1,
            success:(valid)=>{
                alert('success');
            },
            error:()=>{
                alert('error');
            }
        });
    });
});