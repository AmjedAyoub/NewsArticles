$(document).on("click", ".scrape-new", function() {
    console.log("k")
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function(res) {
        console.log( "hi "+res)
        location.reload();
    })
})

$(document).on("click", ".clear", function() {
    $.ajax({
        method: "GET",
        url: "/clear"
    }).then(function(res) {
        location.reload();
    })
})

$(document).on("click", ".save", function() {
    $.ajax({
        method: "POST",
        url: "/articles",
        data: {
            title: $(this).attr("data-title"),
            link: $(this).attr("data-link"),
            body: $(this).attr("data-body")
        }
    }).then(function(res) {
        location.reload();
    })
})

$(document).on("click", ".delete", function() {
    // console.log("this.data-id", $(this).attr("data-id"))
    $.ajax({
        type: "GET",
        url: "/delete/" + $(this).attr("data-id")
    }).then(function() {
        // window.location.href = "/saved";
        location.reload();
    })
})

var noteID;
$(document).on("click", "#ArtNote", function() {
    $("#ArtNotes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    noteID=thisId;
    // console.log(thisId);
    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .then(function(data) {
            // console.log('data',data);
            if (data) {
                for (let i = 0; i < data[0].note.length; i++) {
                    console.log('data[0]',data[0])
                    $("#ArtNotes").append("<p>" + data[0].note[i].body + "</p");
                    $("#ArtNotes").append("<button class='btn btn-danger' data-id='" + data[0].note[i]._id + "' id='deleteNote'>Delete</button>");
                }
            }
            $("#modalNotes").modal("toggle");
        });
})

$(document).on("click", "#addNote", function() {
    
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + noteID,
        data: {
            // Value taken from note textarea
            body: $("#body").val()
        }
    })
    // With that done
    .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
        $("#body").val("");
        $("#modalNotes").modal("hide");
        
    });
});
        
$(document).on("click", "#deleteNote", function() {
    
    var thisId = $(this).attr("data-id");
    console.log(">>>>>>>>  "+thisId);
    $.ajax({
        type: "GET",
        url: "/deleteNote/" + thisId
    }).then(function (data){
        // Log the response
        console.log("2>>>>>>>>  "+data);
        // Empty the notes section
        $("#notes").empty();
        $("#body").val("");
        $("#modalNotes").modal("hide");
    });
});