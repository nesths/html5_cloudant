/*
 global PouchDB
 global $
*/

(function(root){

    var initDB = function(){

        //for your own database, change "testdb" on the next line to your db name
        var db = new PouchDB('https://nesths1.cloudant.com/<DATABASE_NAME>', {
            auth: {
                username: '<API_KEY>',
                password: '<API_PASSWORD>'
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

    // initialize database
    var db = initDB();


    // re-writes table with new comments
    function renderComments(){
        var commentTable = $("#commentTable");
        commentTable.empty();
        for (var i = comments.length-1; i>=0 ; i-- ) {
            var comment = comments[i];
            var html = "<tr><td>" + comment.name + "</td><td>" + comment.comment + "</td></tr>"
            commentTable.append(html);
        }

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

        // insert to DB
        // update local comment array
        // clear form data

        db.put( entry )
          .then(function (response) {
            comments.push(entry)
            commentForm.reset();
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

    });

})(this);

