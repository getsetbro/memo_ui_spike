//main sorted array of objects
var sorted;
//get left and right side ELs
var memoListEl = $('#memoList');
var articleEl = $('article');
//keep track of the item in context

var currentMemo = null;
var currentMemoId = null;

//ajax static values
$.ajaxSetup({
	beforeSend: function(request) {
		request.setRequestHeader("X-Parse-Application-Id", 'z42AxABqdKP18ChfFoF1hrX4AypBKmPpSdQkyT1p');
		request.setRequestHeader("X-Parse-REST-API-Key", 'JBsIYOgQJDTB39UqzNTk4nV6v7iwOxjf0kH59Ths');
		request.setRequestHeader("Content-Type", 'application/json');
	},
	dataType: 'json'
});

//new memo template
var newMemoHTM = '<div class="tbl"><div class="td tdr">'+
	'<button id="saveMemo"><i class="fa fa-save"></i> Save</button> <button id="cancelNew"><i class="fa fa-save"></i> Cancel</button></div>' +
	'<div class="td"><small>Subject: </small><input placeholder="New subject here" id="subject"/></div></div>' +
	'<div class="tbl"><div class="td"><small>Author: </small><input placeholder="Add author here" id="author"/></div></div>' +
	'<div class="article-area">'+
	'<fieldset class="memo-info"><legend>Comment</legend><p><textarea placeholder="New comment here"rows="3" id="comments"></textarea></p></fieldset>' +
		'<div class="memo-data"><small>Type: </small>' +
		'<select id="memotype-new"><option value="Company">Company</option><option value="Contact">Contact</option><option value="Market Intelligence">Market Intelligence</option></select>'+
		'</div>'+
	'<fieldset class="mm-companies"><legend>Regarding</legend><button class="fr" id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button></fieldset>' +
	'</div><div class="tbl tbl-attached"><div class="td tdr"><button id="addFile"><i class="fa fa-paperclip"></i> Attach</button></div>' +
	'<div class="td" id="attachments"><small>Attached: </small></div></div>';

// initialize parse.com
Parse.initialize("z42AxABqdKP18ChfFoF1hrX4AypBKmPpSdQkyT1p", "1J0Ey4DCKbdEpFlgUucNbVKLn5uU2gJhNKza4Cev");
//add and get items out of a class
var TestObject = Parse.Object.extend("TestObject");

//click memo item in the list
memoListEl.on("click", "li", function(a) {
	var obj = sorted[a.currentTarget.dataset.index];
	var fn = (obj.FileName) ? '<a href="#">' + obj.FileName + '</a>' : '';
	var regarding = (obj.RegardingName) ? '<a href="#">' + obj.RegardingName + '</a>' : '';
	var comment = (obj.Comments) ? obj.Comments : '';
	currentMemo = a.currentTarget.dataset.index;
	currentMemoId = a.currentTarget.dataset.id;
	appendArticle('<div class="tbl"><div class="td tdr"><button id="deleteMemo"><i class="fa fa-trash-o"></i> Archive</button></div>' +
		'<div class="td"><small>Subject: </small><span class="may-edit" id="subject">' + obj.Subject + '</span></div></div>' +
		'<div class="tbl"><div class="td tdr"><button id="editMemo" class="edit-memo"><i class="fa fa-edit"></i> Edit</button>' +
		'<button id="saveEdit" class="editmode-btn"><i class="fa fa-save"></i> Save</button> <button id="cancelEdit" class="editmode-btn"><i class="fa fa-save"></i> Cancel</button></div>' +
		'<div class="td"><small>Author: </small><span class="may-edit" id="author">' + obj.Author + '</span></div></div>' +
		'<div class="article-area">'+
		'<fieldset class="memo-info"><legend>Comment</legend><p id="comments" class="may-edit">' + comment + '</p></fieldset>' +
		'<div class="memo-data"><small>Type: </small><span class="editmodehide">' + obj.MemoType + '</span>' +
		'<select class="editmodeshow" id="memotype-edit"><option value="Company">Company</option><option value="Contact">Contact</option><option value="Market Intelligence">Market Intelligence</option></select>'+
		'</div>' +
		'<fieldset class="mm-companies"><legend>Regarding</legend>' +
		'<button class="fr editmodeshow" id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button>' + regarding + '</fieldset>' +
		'<div class="memo-data"><small>Created by: </small>' + obj.CreatedBy + '<br><small>Created on: </small>' + obj.CreatedOn + '<br><small>Updated: </small>' + obj.UpdatedAt + '</div>' +
		'</div><div class="tbl tbl-attached"><div class="td tdr"><button id="addFile" class="editmodeshow"><i class="fa fa-paperclip"></i> Attach</button></div>' +
		'<div class="td" id="attachments"><small>Attached: </small>' + fn + '</div></div>');

	$(this).addClass('selected').siblings().removeClass('selected');
	articleEl.removeClass('edit-mode');

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
		$.ajax({
			type: "DELETE",
			url: 'https://api.parse.com/1/classes/TestObject/' + currentMemoId
		}).done(function() {
			sorted.splice(currentMemo, 1);
			appendList(makeMemoList());
			memoListEl.find('li').eq(0).click();
		}).fail(function(a) {
			alert("Could not delete.");
		});

	}
});

articleEl.on('click', '#editMemo', function() {
	articleEl.find('.may-edit').attr('contenteditable', 'true');
	articleEl.addClass('edit-mode');
});

articleEl.on('click', '#saveEdit', function() {
	var author = articleEl.find('#author').text();
	var regarding = articleEl.find('.mm-companies').find('a').eq(0).text();
	var obj = {
		"Subject": articleEl.find('#subject').text(),
		"Author": {
			"Name": author
		},
		"Comments": articleEl.find('#comments').text(),
		"Regarding": {
			"Name": regarding
		},
		"MemoType": {
			"Name": articleEl.find('#memotype-edit').val()
		},
		"FileName": articleEl.find('#attachments').find('a').eq(0).text()
	};
	$.ajax({
		type: "PUT",
		url: 'https://api.parse.com/1/classes/TestObject/' + currentMemoId,
		data: JSON.stringify(obj)
	}).done(function(result) {
		sorted[currentMemo].Subject = obj.Subject;
		sorted[currentMemo].Author = obj.Author.Name;
		sorted[currentMemo].Comments = obj.Comments;
		sorted[currentMemo].RegardingName = obj.Regarding.Name;
		sorted[currentMemo].MemoType = obj.MemoType.Name;
		sorted[currentMemo].FileName = obj.FileName;
		sorted[currentMemo].Updated = moment(result.updatedAt);
		sorted[currentMemo].UpdatedAt = moment(result.updatedAt).format("MM/DD/YY hA");

		// articleEl.find('.may-edit').attr('contenteditable', 'false');
		// articleEl.removeClass('edit-mode');
		//sortList(sorted);
		appendList(makeMemoList());
		memoListEl.find('li').eq(0).click();
		alert('Saved');
	}).fail(function(a) {
		alert("Could not update.");
	});

});


articleEl.on('click', '#saveMemo', function() {
	var subject = articleEl.find('#subject').val();
	var author = articleEl.find('#author').val();
	var comments = articleEl.find('#comments').val();
	var memotype = articleEl.find('#memotype-new').val();
	var regarding = articleEl.find('.mm-companies').find('a').eq(0).text();
	var filename = articleEl.find('#attachments').find('a').eq(0).text();

	var testObject = new TestObject();
	testObject.save({
		"MemoType": {
			"Name": memotype
		},
		"Subject": subject,
		"Comments": comments,
		"Regarding": {
			"Name": regarding
		},
		"Author": {
			"Name": author
		},
		"CreatedBy": {
			"Name": "McGoo, User"
		},
		"FileName": filename
	}).then(function(result) {
		sorted.unshift({
			id: result.id,
			Subject: subject,
			RegardingName: regarding,
			Comments: comments,
			Author: author,
			CreatedBy: "McGoo, User",
			FileName: filename,
			MemoType: "Company",
			CreatedOn: moment(result.createdAt).format("MM/DD/YY hA"),
			Updated: moment(result.updatedAt),
			UpdatedAt: moment(result.updatedAt).format("MM/DD/YY hA")
		});
		appendList(makeMemoList());
		memoListEl.find('li').eq(0).click();
		alert('Saved');
	});

});

articleEl.on('click', '#addRegarding', function() {
	//splice out deleted item and rebuild left
	var value = window.prompt("Add a regarding party.", "Uber group");
	if (value) {
		articleEl.find('.mm-companies').append('<a href="#">' + value + '</a>');
	}
});

articleEl.on('click', '#cancelNew, #cancelEdit', function() {
	memoListEl.find('li').eq(0).click();
});

articleEl.on('click', '#addFile', function() {
	//splice out deleted item and rebuild left
	var file = window.prompt("Please add a file here.", "New File.ext");
	if (file) {
		articleEl.find('#attachments').append('<a href="#">' + file + '</a>');
	}
});

articleEl.on('click', 'a', function(e) {
	e.preventDefault();
});

memoListEl.on('click', '.selectbox', function(e) {
	e.stopPropagation();
});

var appendList = function(listArr) {
	memoListEl.html(listArr);
};
var appendArticle = function(htm) {
	articleEl.html(htm);
};

var makeMemoList = function() {
	var memoList = $.map(sorted, function(o2, i2) {
		return '<li data-index="' + i2 + '" data-id="' + o2.id + '">' +
			'<input type="checkbox" class="selectbox"/>' +
			'<span>' + o2.UpdatedAt + '</span>' +
			'<h4>' + o2.Subject + '&nbsp;</h4>' +
			'<div>' + o2.RegardingName + '&nbsp;</div>' +
			'<div>' + o2.Comments + '&nbsp;</div></li>';
	});
	return memoList.join('');
};

var gotMemos = function(d) {
	sorted = $.map(d.results, function(o1, i1) {
		return {
			id: o1.objectId,
			Subject: o1.Subject,
			RegardingName: o1.Regarding.Name,
			Comments: o1.Comments,
			Author: o1.Author.Name,
			CreatedBy: o1.CreatedBy.Name,
			FileName: o1.FileName,
			MemoType: o1.MemoType.Name,
			CreatedOn: moment(o1.createdAt).format("MM/DD/YY hA"),
			Updated: moment(o1.updatedAt),
			UpdatedAt: moment(o1.updatedAt).format("MM/DD/YY hA")
		};
	});

	//build list with sorted arr
	appendList(makeMemoList());
};

$.ajax({
	type: "GET",
	url: 'https://api.parse.com/1/classes/TestObject',
	data: {
		limit: 30,
		order: "-updatedAt",
		count: 1
	}
}).done(function(data) {
	gotMemos(data);
	//click first one after items are appended to list
	memoListEl.find('li').eq(0).click();
}).fail(function(jqXHR, textStatus, errorThrown) {
	alert('Sorry, this app was unable to get the data it needs.');
});

// $('#searchbutton').click(function() {
//     var searchterm = $('#searchbox').val();
//     var dt = '';
//     if (searchterm) {
//         dt = 'where={"Regarding.Name":"' + searchterm + '"}';
//     }
//     $.ajax({
//         type: "GET",
//         url: 'https://api.parse.com/1/classes/TestObject',
//         data: dt
//     }).done(function(data) {
//         gotMemos(data);
//         //click first one after items are appended to list
//         memoListEl.find('li').eq(0).click();
//     }).fail(function(jqXHR, status, err) {
//         alert('Sorry, this app was unable to get the data it needs.');
//     });
// });
