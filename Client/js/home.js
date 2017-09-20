$(document).ready(function(e) {
    // load as document is ready and perform some tasks after DOM is ready to manipulate
    $('[data-toggle="tooltip"]').tooltip();   // init tooltips
    $.post('posts', '', function(data) {
        render(data)// render post response from server
        $("#upload_img_btn").click(function(e) {
            $("#uplaod_img_modal").modal(); // open upload dialog box
            $("#uplaod_img_modal").addClass('animated bounceIn');
        });
        
        // assign event handlers to each span id for showing who liked the post
        $("span[id*='like_']").each(function (i, el) { 
        el.onclick = function(){
            var str = ""
            // rendering who liked the post list
            $.post("likeslist", 'id=' + el.id.split("_")[1], function(data){
                $('#like_list').html("");
                $.each(data, function(e, d){
                  $('#like_list').append('<span>'+d.userName+'</span></br>');
                });
            });
            
            
            $("#like_list_modal").modal();
        }
     });

    });

    

(function() {

        var dropzone = $("#dropzone");
        
        // this function render the preview image before uploading
        function preview(files) {
            var reader = new FileReader(); // instance of the FileReader
            var fileData = new FormData(files[0])
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function() { // set image data as background of div
                $("#dropzone")
                    .css({ "background-image": "url(" + this.result + ")", "background-size": "contain" })
                    .addClass("hightlight");
                    //.append('<button type="button" class="close" id="closePreview" onclick="removePreview(this);">&times;</button>');
            }
        }
        // upload the image
        $("#upload_photo_btn").on('click', function(e) {
            e.preventDefault();
            var fileData = new FormData($("#form-inline")[0])
            console.log(fileData);
            $.ajax({
                    type: "POST",
                    enctype: 'multipart/form-data',
                    url: "/upload",
                    data: fileData,
                    processData: false,
                    contentType: false,
                    cache: false,
                    timeout: 600000,
                    success: function (data) {
                       renderResponseNode(data.message);
                    },
                    error: function (e) {
                        console.log("Error: " + e);
                    }
                });
        })
        
        // perform drag and drop events
        dropzone.on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass("dragover");
            preview(e.originalEvent.dataTransfer.files);
        })
        dropzone.on("dragover", function(e) {
            $(this).addClass("dropzone dragover");
            return false;
        });
        dropzone.on("dragleave", function(e) {
            $(this).removeClass("dragover");
            return false;
        });
        
        $("#file_broswer").click(function(e){
            $("#uploadFile").click();
        })
        $("#uploadFile").change(function(e){
            preview(this.files);
        })
    }($))

    function render(data) {
       
       
        $.each(data, function(index, data) {
            var post = ' <div class="container-fluid feed" id=' + data._id + '">' +
                '<header class="feed-header">' +
                '<div class="user_profile_img">' +
                '<img src="../images/profile.jpg" class="ppic"></img>' +
                '</div>' +
                '<div class="feed_user_name_info">' +
                '<div class="name">' + data.userName + '</div>' +
                '<div class="location">' +

                '</div>' +
                '</div>' +

                ' <div class="feed_time">' + moment(''+data.postTimeStamp+'').fromNow() + '</div>' +
                ' </header>' +
                '<div class="posts">' +
                '<img src="' + data.image + '"></img>' +
                '</div>' +
                '<section class="like_section">' +
                '<a class="btn like_btn" href="#" role="button" aria-disabled="false">' +
                '<span class="fa fa-commenting-o"></span>' +
                ' </a>' +
                '<a class="btn like_btn fa fa-heart-o" href="#" role="button" onclick="postLike(event)" data-post-id="'+ data._id +'">' +
               
                '</a>' +
                 '<div class="container likes-section">Likes'+
                 '<span class="btn" id="like_'+ data._id +'">'+ data.likeCount +'</span></div>'+
                '</section>' +

                '</div>'

            $("#feeds").append(post);

        })


    }
     function renderResponseNode(data) {

            var post = ' <div class="container-fluid feed" id=' + data._id + '>' +
                '<header class="feed-header">' +
                '<div class="user_profile_img">' +
                '<img src="../images/profile.jpg" class="ppic"></img>' +
                '</div>' +
                '<div class="feed_user_name_info">' +
                '<div class="name">' + data.userName + '</div>' +
                '<div class="location">' +

                '</div>' +
                '</div>' +

                ' <div class="feed_time">' +  moment(''+data.postTimeStamp+'').fromNow()  + '</div>' +
                ' </header>' +
                '<div class="posts">' +
                '<img src="' + data.image + '"></img>' +
                '</div>' +
                '<section class="like_section">' +
                '<a class="like_btn" href="#" role="button" aria-disabled="false">' +
                '<span class="fa fa-commenting-o"></span>' +
                ' </a>' +
                '<a class="like_btn fa fa-heart-o" href="#" role="button" onclick="postLike(event)" data-post-id="'+ data._id +'">' +
                
                '</a>' +
                '<div class="container likes-section">Likes <span class="btn" id="like_'+ data._id +'">'+ data.likeCount +'</span></div>'+
                '</section>' +

                '</div>'

            $("#feeds").prepend(post);
            $("#uplaod_img_modal").modal('toggle');
       


    }
});

function removePreview(e) {
         $(e).parent().css({ "background-image": "url()", "background-size": "contain" })
             .removeClass("hightlight")
         $("#closePreview").remove();
        
}

function postLike(event){
    event.preventDefault();
    var target = $(event.target);
    var postId = target.data('postId')
    var spanLikeLiteral = "#like_"+postId;
    Promise.resolve()
        .then(function() {
            return $.post('incrLike', { id: postId });
        })
        .then(function(like) {
           $(spanLikeLiteral).html(like.count)
        })
        .catch(function(err) {
            console.log(err);
        });
}

function showLikes(int){
    console.log(int);
}