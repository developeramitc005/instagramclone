$(document).ready(function(e) {
    
    var userEmail = $("#input_email");
    var userPassword = $("#input_password");
    var repeatPassword = $("#repeat_password");
    var submitButton = $("#submit_btn");
    var error_userEmail = false;
    var error_Password = false;
   
    userEmail.keyup(function(e) {

        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail.val().trim())) {
            error_userEmail = true
            $(e.target).next().removeClass();
            $(e.target).next().addClass("glyphicon glyphicon-ok form-control-feedback")
            //error_userEmail && error_Password ? submitButton.removeAttr("disabled")  : submitButton.removeAttr("");
        }
        else {
            $(e.target).next().addClass("glyphicon glyphicon-remove form-control-feedback");
            error_Password = false;
            error_userEmail && error_Password ? submitButton.removeAttr("")  : submitButton.removeAttr("disabled");
        }
    })
    repeatPassword.keyup(function(e) {
        if ((userPassword.val().trim() == repeatPassword.val().trim())&&(userPassword.val().trim() !="" && repeatPassword.val().trim()!="") ) {
            error_Password = true;
            $(e.target).next().removeClass();
            $(e.target).next().addClass("glyphicon glyphicon-ok form-control-feedback")
            error_userEmail && error_Password ? submitButton.removeAttr("disabled")  : submitButton.removeAttr("");

        }
        else {
            error_Password = false;
            $(e.target).next().addClass("glyphicon glyphicon-remove form-control-feedback")
            //error_userEmail && error_Password ? submitButton.removeAttr("")  : submitButton.removeAttr("disabled");
        }
    })
    
    submitButton.click(function(e){
       e.preventDefault();
       if(error_userEmail && error_Password){
           console.log("error");
           Promise.resolve()
                    .then(function(){
                        return $.post('passwordreset', 'email=' + userEmail.val() + '&password=' + userPassword.val());
                    })
                    .then(function(auth){
                       $("#snackbar").html(auth).addClass("show")
                        setTimeout(function(){ $("#snackbar").removeClass("show");;}, 3000);
                    })
                    .catch(function(err){
                        console.log(err);
                    })
       }
    });
})
