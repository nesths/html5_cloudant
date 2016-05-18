/*
 global PouchDB
 global $
*/

(function(root){


    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    function replaceAll(str, find, replace) {
      return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }

    var initDB = function(){

        //for your own database, change "testdb" on the next line to your db name
        var db = new PouchDB('https://nesths1.cloudant.com/testdb', {
            auth: {
                username: 'ineciesedifeasterethentl',
                password: '9799a95f765427a3834fb4b169cbaa2e6409bdb9'
              }
        });

        // this only creates index if not initialized
        db.createIndex({
          index: {
            fields: ['kind'],
            name: 'by_kind',
            ddoc: 'by_kind'
          }
        });

        return db;
    };


    // the main array for comments
    var comments = [];


    var attachment = {}

    // initialize database
    var db = initDB();


    // re-writes table with new comments
    function renderComments(){
        var commentTable = $("#commentTable");
        commentTable.empty();
        for (var i = comments.length-1; i>=0 ; i-- ) {
            var comment = comments[i];
            var html = 
            `
                <tr><td>{{id}}</td><td>{{name}}</td><td>{{comment}}</td><td>{{attachment}}</td></tr>
            `

            html = html.replace("{{name}}", comment.name );
            html = html.replace("{{comment}}", comment.comment);
            if( comment._attachments ){
                var image_filename = Object.keys(comment._attachments)[0];
                html = html.replace("{{attachment}}", "<img data-comment-id='{{id}}' data-filename='{{filename}}' class='comment_image' id='image_{{id}}'/>");
                html = html.replace("{{filename}}", image_filename );
            }
            else{
                html = html.replace("{{attachment}}", "");
            }
            html = replaceAll(html, "{{id}}", comment._id);
            commentTable.append(html);
        }
        
        //
        // now go and populate the attachment images
        // all the info needed to get the image is stored in the data- attribute
        // this gets converted into a dataset map
        //
        $(".comment_image").each( function(index, img){
            var commentId = img.dataset.commentId;
            var image_filename = img.dataset.filename;            
            db.getAttachment(commentId, image_filename).then(function (blob) {
                var url = URL.createObjectURL(blob);
                img.src = url;
                img.setAttribute("width", "200px");
                console.log(img);
            });   
        });

        return false;
    }

    var loadComments = function(){

        // selects comments from database
        db.find({
          selector: {kind: 'comment'}
        }).then(function (result) {

            // creates array of comments
            var l = result.docs.length;
            for (var i = 0; i < l ; i++ ) {
                comments.push(result.docs[i]);
            }

            renderComments();

        }).catch(function (err) {
            alert("error!");
        });
    }


    var submitForm = function(){

        // this gets the info from the form and sets up an entry
        var entry = {
            _id: 'comment_' + new Date().toISOString(),
            kind: 'comment',
            name: $('#name').val(),
            comment: $('#message').val()
        }


        if( attachment ){
            entry._attachments = attachment;
        }

        // insert to DB
        // update local comment array
        // clear form data

        db.put( entry )
          .then(function (response) {
            comments.push(entry)
            commentForm.reset();
            
            // clear attachment
            attachment = {};
            
            renderComments();

          })
          .catch(function (err) {
            console.log(err);
          });

        return false
    };


    $(document).ready(function() {

        loadComments();

        // bind to HTML
        $("#formSubmit").click(submitForm);
        
        
        $("#attachment")[0].addEventListener('change', function(){
            var file = this.files[0];
            // This code is only for demo ...
            console.log("name : " + file.name);
            console.log("size : " + file.size);
            console.log("type : " + file.type);
            console.log("date : " + file.lastModified); 
            
             var imageUrl =  URL.createObjectURL(file);
             $("#imagePreview")[0].src = imageUrl;
            
            attachment = {
                filename: {
                    type: file.type,
                    data: file
                }
            }
        }, false);


    });

})(this);

