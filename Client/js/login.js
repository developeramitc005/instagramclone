$(document).ready(function(e) {
   
    var error_userEmail = false;
    var error_password = false;
     var userEmail = $("#input_email");
     var submitButton = $("#submit_btn");
     var userPassword = $("#input_password");
    $("#submit_btn").click(function(e) {
        var email = $("#input_email").val();
        var password = $("#input_password").val();
        $.post('signin', 'username=' + email + '&password=' + password, function(auth) {
            if (auth.isValid) {
                $('#error').text = '';
                $("#snackbar").html(auth.message).addClass("show")
                setTimeout(function(){ $("#snackbar").removeClass("show");window.location.replace('posts');}, 3000);
                
            }else{
                 $("#snackbar").html(auth.message).addClass("show")
                 setTimeout(function(){ $("#snackbar").removeClass("show");}, 3000);
            }
        })
    })

    $(".like_btn").each(function(e){
        $(this).click(function(et){
            alert("a");
        })
    })
    
       userEmail.keyup(function(e) {
       
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail.val().trim())) {
            error_userEmail = true
            $(e.target).next().removeClass();
            $(e.target).next().addClass("glyphicon glyphicon-ok form-control-feedback")
            //error_userEmail && error_Password ? submitButton.removeAttr("disabled")  : submitButton.removeAttr("");
        }
        else {
            $(e.target).next().addClass("glyphicon glyphicon-remove form-control-feedback");
            error_password = false;
            error_userEmail && error_password ? submitButton.removeAttr("")  : submitButton.removeAttr("disabled");
        }
    })
    userPassword.keyup(function(e) {
        
        if ((userPassword.val().trim()!="") ) {
            error_password = true;
            $(e.target).next().removeClass();
            $(e.target).next().addClass("glyphicon glyphicon-ok form-control-feedback")
            error_userEmail && error_password ? submitButton.removeAttr("disabled")  : submitButton.removeAttr("");

        }
        else {
            error_password = false;
            $(e.target).next().addClass("glyphicon glyphicon-remove form-control-feedback")
            //error_userEmail && error_Password ? submitButton.removeAttr("")  : submitButton.removeAttr("disabled");
        }
    })

})
