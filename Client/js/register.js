$(document).ready(function(e) {
    var userName = $("#input_userName");
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
                        return $.post('join', 'username=' + userEmail.val() + '&password=' + userPassword.val());
                    })
                    .then(function(auth){
                        if (auth.isValid){
                            $("#snackbar").html("Account has been created.. ").addClass("show")
                            setTimeout(function(){ $("#snackbar").removeClass("show"); window.location.replace('signin');}, 3000);
                                
                        } else {
                            $("#snackbar").html(auth.message).addClass("show")
                            setTimeout(function(){ $("#snackbar").removeClass("show");}, 3000);
                            userName.val("")
                            userEmail.html('');
                            userPassword.html('');
                            repeatPassword.html('');
                            
                        }
                    })
                    .catch(function(err){
                        console.log(err);
                    })
       }
    });
})
