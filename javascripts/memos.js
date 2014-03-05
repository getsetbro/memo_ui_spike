var sorted;
var memoListEl = $('#memoList');
var articleEl = $('article');
var currentMemo = null;
var currentRegardings = [];
var currentDate = new Date();
var m = currentDate.getMonth() + 1;
var d = currentDate.getDate();
var y = currentDate.getFullYear();
var newMemoHTM = '<div class="tbl"><div class="td tdr"><button id="saveMemo"><i class="fa fa-save"></i> Save</button></div>' +
        '<div class="td"><small>Subject: </small><input placeholder="New subject here" id="subject"/></div></div>' +
        '<div class="tbl"><div class="td"><small>Author: </small><input placeholder="Add author here" id="author"/> | <small>Updated: </small>' + m + "/" + d + "/" + y + '</div></div>' +
        '<div class="article-area"><fieldset class="mm-companies"><legend>Regarding</legend><button class="fr" id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button></fieldset>' +
        '<fieldset class="memo-info"><legend>Comment</legend><p><textarea placeholder="New comment here"rows="3" id="comments"></textarea></p></fieldset>' +
        '<div class="memo-data"><small>Created by: </small>Firstname Lastname | <small>Created on: </small>' + m + "/" + d + "/" + y + '</div>' +
        '</div><div class="tbl tbl-attached"><div class="td tdr"><button id="addFile"><i class="fa fa-paperclip"></i> Attach</button></div>' +
        '<div class="td" id="attachments"><small>Attached: </small></div></div>';

var rebuildList = function(listArr) {
    memoListEl.html(listArr);
};
var buildArticle = function(htm) {
    articleEl.html(htm);
};

var makeMemoList = function() {
    var memoList = $.map(sorted, function(o2, i2) {
        return '<li data-index="' + i2 + '"><span>' + o2.CreatedOn + '</span><h4>' + o2.Subject + '&nbsp;</h4><div>' + o2.RegardingName + '&nbsp;</div><div>' + o2.Comments + '&nbsp;</div></li>';
    });
    return memoList.join('');
}



//click memo item in the list
memoListEl.on("click", "li", function(a) {
    var obj = sorted[a.currentTarget.dataset.index];
    var fn = (obj.FileName) ? '<a href="#">' + obj.FileName + ' [x]</a>' : '';
    var regarding = (obj.RegardingName) ? '<a href="#">' + obj.RegardingName + ' [x]</a>' : '';
    var comment = (obj.Comments) ? obj.Comments : '<em>empty</em>';
    currentMemo = a.currentTarget.dataset.index;
    buildArticle('<div class="tbl"><div class="td tdr"><button id="deleteMemo"><i class="fa fa-trash-o"></i> Archive</button></div>' +
        '<div class="td"><small>Subject: </small><span class="may-edit" id="subject">' + obj.Subject + '</span></div></div>' +
        '<div class="tbl">'+
        '<div class="td tdr"><button id="editMemo" class="edit-memo"><i class="fa fa-edit"></i> Edit</button>'+
        '<button id="saveEdit" class="save-edit"><i class="fa fa-save"></i> Save</button></div>'+
        '<div class="td"><small>Author: </small><span class="may-edit" id="author">' + obj.Author + '</span> | <small>Updated: </small>' + obj.CreatedOn + '</div></div>' +
        '<div class="article-area"><fieldset class="mm-companies"><legend>Regarding</legend>'+
        '<button class="fr" id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button>' + regarding + '</fieldset>' +
        '<fieldset class="memo-info"><legend>Comment</legend>'+
        '<p id="comments" class="may-edit">' + comment + '</p></fieldset>' +
        '<div class="memo-data"><small>Created by: </small>' + obj.Author + ' | <small>Created on: </small>' + obj.CreatedOn + '</div>' +
        '<fieldset><legend>History</legend><em> ~ Old values ~ </em></fieldset>' +
        '</div><div class="tbl tbl-attached"><div class="td tdr"><button id="addFile"><i class="fa fa-paperclip"></i> Attach</button></div>' +
        '<div class="td" id="attachments"><small>Attached: </small>' + fn + '</div></div>');

    $(this).addClass('selected').siblings().removeClass('selected');
});
//click to add new memo
$('#newMemo').click(function() {
  buildArticle(newMemoHTM);
  articleEl.find('#subject').focus();
  memoListEl.find('.selected').removeClass('selected');
});

$('#searchbutton').click(function() {
    var searchtext = $('#searchbox').val();
    var memoList = $.map(sorted, function(o2, i2) {
        if (o2.RegardingName && o2.RegardingName.toUpperCase().indexOf(searchtext.toUpperCase()) != -1) {
            return '<li data-index="' + i2 + '"><span>' + o2.CreatedOn + '</span><h4>' + o2.Subject + '</h4><div>' + o2.RegardingName + '</div><div>' + o2.Comments + '</div></li>';
        }
    });
    if(memoList.length){
      rebuildList(memoList.join(''));
      memoListEl.find('li').eq(0).click();
    }else{
      rebuildList('<p>No memos to display<p>');
      buildArticle('<p>No memos to display<p>');
    }
});

articleEl.on('click', '#deleteMemo', function() {
    //splice out deleted item and rebuild left
    if (window.confirm("Really?")) {
        sorted.splice(currentMemo, 1);
        rebuildList(makeMemoList());
        memoListEl.find('li').eq(0).click();
    }
});

articleEl.on('click', '#editMemo', function() {
  articleEl.find('.may-edit').attr('contenteditable', 'true');
  articleEl.addClass('edit-mode');
});

articleEl.on('click', '#saveEdit', function() {
  var subject = articleEl.find('#subject').text();
  var author = articleEl.find('#author').text();
  var comments = articleEl.find('#comments').text();
  sorted[currentMemo].Subject = subject;
  sorted[currentMemo].Author = author;
  sorted[currentMemo].Comments = comments;
  sorted[currentMemo].CreatedOn = m+'/'+d+'/'+y;
  articleEl.find('.may-edit').attr('contenteditable', 'false');
  articleEl.removeClass('edit-mode');
  sortList(sorted);
  rebuildList(makeMemoList());
  memoListEl.find('li').eq(0).addClass('selected');
  alert('Saved');
});

articleEl.on('click', '#saveMemo', function() {
  var subject = articleEl.find('#subject').val();
  var subj = (subject) ? subject : "No Subject";
  var comm = articleEl.find('#comments').val();
  var comments = (comm) ? comm : "No comment";
  var regardings = (currentRegardings.length) ? currentRegardings.join(', ') : "";
    sorted.unshift({
        Subject: subj,
        CreatedOn: m + "/" + d + "/" + y,
        RegardingName: regardings,
        Comments: comments,
        Author: "Firstname Lastname",
        FileName: null
    });
    rebuildList(makeMemoList());
    memoListEl.find('li').eq(0).click();
    alert('Saved');
});

articleEl.on('click', '#addRegarding', function() {
    //splice out deleted item and rebuild left
    var value = window.prompt("Add a regarding party.", "Uber group");
    if (value) {
      articleEl.find('.mm-companies').append('<a href="#">'+value+' [x]</a>');
      currentRegardings.push(value);
    }
});

articleEl.on('click', '#addFile', function() {
    //splice out deleted item and rebuild left
    var file = window.prompt("Please add a file here.", "New File.ext");
    if (file) {
      articleEl.find('#attachments').append('<a href="#">'+file+' [x]</a>');
    }
});

articleEl.on('click','a',function (e) {
  e.preventDefault();
  if (window.confirm("Do you want to remove this?")) {
    $(this).remove();
  }
});

var sortList = function (lst) {
  sorted = lst.sort(function(obj1, obj2) {
      return new Date(obj2.CreatedOn).getTime() - new Date(obj1.CreatedOn).getTime();
  });
}
var getMemosDone = function(d) {

    var unsortedList = $.map(d.Data, function(o1, i1) {
        return {
            Subject: o1.Subject,
            CreatedOn: o1.CreatedOn,
            RegardingName: o1.Regarding.Name,
            Comments: o1.Comments,
            Author: o1.Author.Name,
            FileName: o1.FileName
        };
    });
    //update sorted with sorted list
    sortList(unsortedList);
    //build list with sorted arr
    rebuildList(makeMemoList());

}

var getMemos = $.ajax({
    url: "api/memos.json"
});

getMemos.done(function(data) {
    getMemosDone(data);
    memoListEl.find('li').eq(0).click();
});
