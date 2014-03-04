var sorted;

var getMemosDone = function(d) {

    var unsortedList = $.map(d.Data, function(o1, i1) {
          console.log(o1.FileName);
        return { Subject:o1.Subject, CreatedOn:o1.CreatedOn, RegardingName:o1.Regarding.Name, Comments:o1.Comments, Author: o1.Author.Name, FileName:o1.FileName};
    });

    sorted = unsortedList.sort(function(obj1, obj2) {
      return new Date(obj2.CreatedOn).getTime() - new Date(obj1.CreatedOn).getTime();
    });

    var memoList = $.map(sorted, function(o2, i2) {
        return '<li data-index="'+i2+'"><span>'+o2.CreatedOn+'</span><h4>'+o2.Subject+'</h4><div>'+o2.RegardingName+'</div><div>'+o2.Comments+'</div></li>';
    });
    
    $('#memoList').html( memoList.join('') );
}


var getMemos = $.ajax({url: "api/memos.json"});

getMemos.done(function(data) {
  getMemosDone(data);
});

$('#memoList').on("click","li",function(a){
var obj = sorted[a.currentTarget.dataset.index];
var fn = (obj.FileName) ? '<a href="#">'+obj.FileName+' [x]</a>' : '';
$('article').html('<div class="tbl"><div class="td tdr"><button><i class="fa fa-trash-o"></i> Delete</button></div>'+
'<div class="td"><small>Subject: </small>'+obj.Subject+'</div></div>'+
'<div class="tbl"><div class="td"><small>Author: </small>'+obj.Author+' | <small>Updated: </small>12/12/2013</div></div>'+
'<div class="article-area"><fieldset class="mm-companies"><legend>Regarding</legend><button class="fr"><i class="fa fa-plus-circle"></i> Add</button>'+
'<a href="#">'+obj.RegardingName+' [x]</a></fieldset>'+
'<fieldset class="memo-info"><legend>Comment</legend><p>'+obj.Comments+'</p></fieldset>'+
'<div class="memo-data"><small>Created by: </small>'+obj.Author+' | <small>Created on: </small>'+obj.CreatedOn+'</div>'+
'<fieldset><legend>History</legend><em> ~ Old values ~ </em></fieldset>'+
'</div><div class="tbl tbl-attached"><div class="td tdr"><button><i class="fa fa-paperclip"></i> Attach</button></div>'+
'<div class="td"><small>Attached: </small>'+fn+'</div></div>');
});
$('#newMemo').click(function(a){
var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();  
$('article').html('<div class="tbl"><div class="td tdr"><button><i class="fa fa-trash-o"></i> Delete</button></div>'+
'<div class="td"><small>Subject: </small><span contenteditable=true></span></div></div>'+
'<div class="tbl"><div class="td"><small>Author: </small>Firstname Lastname <small>Updated: </small>'+day + "/" + month + "/" + year+'</div></div>'+
'<div class="article-area"><fieldset class="mm-companies"><legend>Regarding</legend><button class="fr"><i class="fa fa-plus-circle"></i> Add</button></fieldset>'+
'<fieldset class="memo-info"><legend>Comment</legend><p contenteditable=true></p></fieldset>'+
'<div class="memo-data"><small>Created by: </small>Firstname Lastname | <small>Created on: </small>'+day + "/" + month + "/" + year+'</div>'+
'</div><div class="tbl tbl-attached"><div class="td tdr"><button><i class="fa fa-paperclip"></i> Attach</button></div>'+
'<div class="td"><small>Attached: </small></div></div>');
});
