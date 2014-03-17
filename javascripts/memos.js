var app = (function() {
    "use strict";

    //main sorted array of objects
    var sorted;
    //get left and right side ELs
    var memoListEl = $('#memoList');
    var articleEl = $('article');
    //keep track of the item in context

    var currentMemo = null;
    var currentMemoId = null;
    var cnt = 0;

    $(window).keydown(function(e){

        if(e.which === 38){
            memoListEl.find('li').eq( currentMemo - 1 ).click();
        }
        if(e.which === 40){
            memoListEl.find('li').eq( currentMemo + 1 ).click();
        }

    });


    //ajax static values
    $.ajaxSetup({
        beforeSend: function(request) {
            request.setRequestHeader("X-Parse-Application-Id", 'z42AxABqdKP18ChfFoF1hrX4AypBKmPpSdQkyT1p');
            request.setRequestHeader("X-Parse-REST-API-Key", 'JBsIYOgQJDTB39UqzNTk4nV6v7iwOxjf0kH59Ths');
            request.setRequestHeader("Content-Type", 'application/json');
        },
        dataType: 'json'
    });

    // initialize parse.com
    Parse.initialize("z42AxABqdKP18ChfFoF1hrX4AypBKmPpSdQkyT1p", "1J0Ey4DCKbdEpFlgUucNbVKLn5uU2gJhNKza4Cev");

    //add and get items out of a class
    var TestObject = Parse.Object.extend("TestObject");

    var appendList = function(listArr) {
        memoListEl.html(listArr);
    };
    var appendArticle = function(htm) {
        articleEl.html(htm);
    };
    var appendResNumbers = function(x, y) {
        $('#resLength').text(x);
        $('#resTotal').text(y);
    };

    //new memo template
    var newMemoHTM = ''+
      '<div class="tbl"><div class="td tdr">' +
        '<button id="saveMemo"><i class="fa fa-save"></i> Publish</button> <button id="cancelNew"><i class="fa fa-save"></i> Cancel</button></div>' +
        '<div class="td"><small>Subject: </small><input placeholder="New subject here" id="subject"/></div>'+
      '</div>' +
      '<div class="tbl">'+
        '<div class="td tdr">'+
          '<small>Type: </small>' +
          '<select id="memotype-new">'+
            '<option value="Company">Company</option>'+
            '<option value="Contact">Contact</option>'+
            '<option value="Market Intelligence">Market Intelligence</option>'+
          '</select>' +
        '</div>' +
        '<div class="td"><small>Author: </small><input id="author" value="User McGoo"/></div>'+
      '</div>' +
      '<div class="tbl">'+
        '<div class="td tdr">'+
          '<button id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button>'+
        '</div>' +
        '<div class="td mm-companies">'+
          '<small>Regarding: </small>'+
        '</div>'+
      '</div>'+
      '<div class="tbl tbl-attached">'+
        '<div class="td tdr">'+
          '<button id="addFile"><i class="fa fa-paperclip"></i> Attach</button>'+
        '</div>' +
        '<div class="td" id="attachments">'+
          '<small>Attached: </small>'+
        '</div>'+
      '</div>'+
      '<div class="article-area">' +
        '<fieldset class="memo-info"><legend>Comment</legend>'+
          '<p><textarea placeholder="New comment here"rows="6" id="comments"></textarea></p>'+
        '</fieldset>' +
      '</div>'
      ;

    //click memo item in the list
    memoListEl.on("click", "li", function(a) {
        var thisindex = $(this).data('index');
        var obj = sorted[thisindex];
        //var fn = (obj.FileName) ? '<b class="anch"><a href="#" class="anch">' + obj.FileName + '</a><span class="editmode-btn anch-x">x<span></b>' : '';
        //var regarding = (obj.RegardingName) ? '<b class="anch"><a href="#">' + obj.RegardingName + '</a><span class="editmode-btn anch-x">x<span></b>' : '';
        var recips = (typeof obj.Recipients !== "undefined" && obj.Recipients.length) ? '<b class="anch"><a href="#">' + obj.Recipients.join('</a><span class="editmode-btn anch-x">x<span></b><b class="anch"><a href="#">') + '</a><span class="editmode-btn anch-x">x<span></b>' : '<em>none</em>';
        var filenames = (typeof obj.FileNames !== "undefined" && obj.FileNames.length) ? '<b class="anch"><a href="#">' + obj.FileNames.join('</a><span class="editmode-btn anch-x">x<span></b><b class="anch"><a href="#">') + '</a><span class="editmode-btn anch-x">x<span></b>' : '<em>none</em>';
        var comment = (obj.Comments) ? obj.Comments : '<em>empty<em>';
        currentMemo = thisindex;
        currentMemoId = $(this).data('id');

        appendArticle(''+
          '<div class="tbl">'+
            '<div class="td tdr">'+
              '<button id="deleteMemo"><i class="fa fa-trash-o"></i> Archive</button>'+
            '</div>' +
            '<div class="td">'+
              '<small>Subject: </small><span class="may-edit" id="subject">' + obj.Subject + '</span>'+
            '</div>'+
          '</div>' +
          '<div class="tbl">'+
            '<div class="td tdr">'+
              '<small>Type: </small><span class="editmodehide">' + obj.MemoType + '</span>' +
            '</div>' +
            '<div class="td">'+
              '<small>Author: </small><span class="may-edit" id="author">' + obj.Author + '</span>'+
              '<small> By: </small>' + obj.CreatedBy + '<small> On: </small>' + obj.CreatedOn +
            '</div>'+
          '</div>' +
          '<div class="tbl tbl-attached">'+
            '<div class="td" id="attachments"><small>Recipients: </small>'+ recips +' <small> Attached: </small>' + filenames + '</div>'+
          '</div>'+
          '<div class="article-area">' +
            '<fieldset class="memo-info"><legend>Comment</legend>'+
              '<p id="comments" class="may-edit">' + comment + '</p>'+
            '</fieldset>' +
          '</div>'
          );

        $(this).addClass('selected').siblings().removeClass('selected');
        articleEl.removeClass('edit-mode');

    });

    var makeMemoList = function() {
        //if there are items
        if (sorted.length) {
            var memoList = $.map(sorted, function(o2, i2) {
                var recips = (typeof o2.Recipients !== "undefined" && o2.Recipients.length) ? o2.Recipients.join(', ') : '-';
                return ''+
                  '<li data-index="' + i2 + '" data-id="' + o2.id + '">' +
                    '<input type="checkbox" class="selectbox"/>' +
                    '<span>'+ o2.CreatedOn + '</span>' +
                    '<h4>' + o2.Subject + '</h4>' +
                    '<div>'+ recips + '</div>' +
                    '<div>'+ o2.Comments + '</div>'+
                  '</li>';
            });
            return memoList.join('');
        }
        //if there are no items
        appendArticle("<p class='none-to-show'>No item to show</p>");
        return "<p class='none-to-show'>No items to show</p>";
    };

    var gotMemos = function(d) {
        sorted = $.map(d, function(o1, i1) {
            //get items
            return {
                id: o1.id,
                Subject: o1.attributes.Subject,
                RegardingName: o1.attributes.Regarding.Name,
                Recipients: o1.attributes.Recipients,
                Comments: o1.attributes.Comments,
                Author: o1.attributes.Author.Name,
                CreatedBy: o1.attributes.CreatedBy.Name,
                FileName: o1.attributes.FileName,
                FileNames: o1.attributes.FileNames,
                MemoType: o1.attributes.MemoType.Name,
                CreatedOn: moment(o1.createdAt).format("MMM DD, YYYY"),
                Updated: moment(o1.createdAt),
                UpdatedAt: moment(o1.updatedAt).format("MMM DD, YYYY")
            };
        });

        //build list with sorted arr
        appendList(makeMemoList());
        appendResNumbers(d.length, cnt);
    };

    // initial get of all items
    var q1 = new Parse.Query(TestObject);
    q1.descending("-createdAt");
    q1.limit(15);
    q1.count({
        success: function(count) {
            cnt = count;
        }
    });
    q1.find({
        success: function(results) {
            //alert("Successfully retrieved " + results.length + " scores.");
            gotMemos(results);
            //click first one after items are appended to list
            memoListEl.find('li').eq(0).click();
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });


    var searchGo = function() {
        var query = new Parse.Query(TestObject);
        var searchterm = $('#searchbox').val();

        if (searchterm) {
            var sb = new Parse.Query("TestObject");
            sb.contains("Subject", searchterm);

            var rn = new Parse.Query("TestObject");
            rn.contains("Regarding.Name", searchterm);

            var cm = new Parse.Query("TestObject");
            cm.contains("Comments", searchterm);

            query = Parse.Query.or(sb, rn, cm);
        }

        query.descending("-createdAt");
        query.limit(15);

        query.count({
            success: function(count) {
                cnt = count;
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
        query.find({
            success: function(results) {
                gotMemos(results);
                //click first one after items are appended to list
                memoListEl.find('li').eq(0).click();
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };

    $('#searchbutton').click(function() {
        searchGo();
    });

    $('#searchbox').keypress(function(e) {
        if (e.which == 13) {
            searchGo();
        }
    });

    //click to add new memo
    $('#newMemo').click(function() {
        appendArticle(newMemoHTM);
        articleEl.find('#subject').focus();
        memoListEl.find('.selected').removeClass('selected');
    });

    articleEl.on('click', '#deleteMemo', function() {
        //splice out deleted item and rebuild left
        if (window.confirm("Confirm that you want to delete this memo.")) {
            var deleteObject = new TestObject();
            deleteObject.set("objectId", currentMemoId);
            deleteObject.destroy({
                success: function(myObject) {
                    sorted.splice(currentMemo, 1);
                    appendList(makeMemoList());
                    memoListEl.find('li').eq(0).click();
                    alert("Deleted.");
                },
                error: function(myObject, error) {
                    alert("Could not delete.");
                }
            });
        }
    });

    articleEl.on('click', '#saveMemo', function() {
        var subj = articleEl.find('#subject').val();
        if (!subj) {
            //if subject is blank dont save
            alert("There must be a subject to save a memo");
            articleEl.find('#subject').focus();
            return false;
        }
        var recips = $.map(articleEl.find('.mm-companies a'), function(v, k) {
            return $(v).text();
        });
        var filenames = $.map(articleEl.find('#attachments a'), function(v, k) {
            return $(v).text();
        });
        var obj = {
            "Subject": subj,
            "Author": {
                "Name": articleEl.find('#author').val()
            },
            "Comments": articleEl.find('#comments').val(),
            "Regarding": {
                "Name": articleEl.find('.mm-companies').find('a').text()
            },
            "MemoType": {
                "Name": articleEl.find('#memotype-new').val()
            },
            "FileName": articleEl.find('#attachments').find('a').eq(0).text(),
            "FileNames": filenames,
            "CreatedBy": {
                "Name": "McGoo, User"
            },
            "Recipients": recips
        };

        var testObject = new TestObject();
        testObject.save(obj).then(function(result) {
            //add new
            sorted.unshift({
                id: result.id,
                Subject: obj.Subject,
                RegardingName: obj.Regarding.Name,
                Comments: obj.Comments,
                Author: obj.Author.Name,
                CreatedBy: obj.CreatedBy.Name,
                FileName: obj.FileName,
                FileNames: obj.FileNames,
                MemoType: obj.MemoType.Name,
                CreatedOn: moment(result.createdAt).format("MMM DD, YYYY"),
                Updated: moment(result.updatedAt),
                UpdatedAt: moment(result.updatedAt).format("MMM DD, YYYY"),
                Recipients: obj.Recipients
            });
            appendList(makeMemoList());
            memoListEl.find('li').eq(0).click();
            alert('Published');
        });

    });

    articleEl.on('click', '#addRegarding', function() {
        //splice out deleted item and rebuild left
        var value = window.prompt("Add a regarding party.", "Uber group");
        if (value) {
            articleEl.find('.mm-companies').append('<b class="anch"><a href="#" class="anch">' + value + '</a><span class="editmode-btn anch-x">x<span></b>');
        }
    });

    articleEl.on('click', '#addFile', function() {
        //splice out deleted item and rebuild left
        var file = window.prompt("Please add a file here.", "New File.ext");
        if (file) {
            articleEl.find('#attachments').append('<b class="anch"><a href="#" class="anch">' + file + '</a><span class="editmode-btn anch-x">x<span></b>');
        }
    });

    articleEl.on('click', '.anch-x', function(e) {
        if (window.confirm("Delete this link?")) {
            $(this).parent().remove();
        }
    });

    articleEl.on('click', 'a', function(e) {
        e.preventDefault();
    });

    memoListEl.on('click', '.selectbox', function(e) {
        e.stopPropagation();
    });

    $('#selectAllMemosList').click(function() {
        memoListEl.find('.selectbox').prop('checked', true);
    });
    $('#selectNoneMemosList').click(function() {
        memoListEl.find('.selectbox').prop('checked', false);
    });

    $('#exportBtn').click(function() {
        alert('Sorry, export is not configured.');
    });

    articleEl.on('click', '#cancelNew, #cancelEdit', function() {
        memoListEl.find('li').eq(currentMemo).click();
    });

    var getSorted = function() {
        return sorted;
    };
    return {
        arr: function() {
            return sorted;
        }
    };
})();
