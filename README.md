# Cloudant 
a HTML5 demo using cloudant

### pouchdb api 
To connect to a cloudant database, use PouchDB which is a javascript client

https://pouchdb.com/api.html

### database object
must be in JSON


    var entryJson = {
    _id:  
    kind:  
    property_name: property_value,
    property_name: property_value
    };
    
#### kind
if this entry belongs to a list/array of similar entries, then you should provide a kind identifier...ie kind: student

##### _id
_id must be provided and should be a unique identifier. 

    var studentJson = {
       _id: student_1
       kind: student
       name: John
       grade: A
      }

