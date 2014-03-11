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
	var newMemoHTM = '<div class="tbl"><div class="td tdr">' +
		'<button id="saveMemo"><i class="fa fa-save"></i> Save</button> <button id="cancelNew"><i class="fa fa-save"></i> Cancel</button></div>' +
		'<div class="td"><small>Subject: </small><input placeholder="New subject here" id="subject"/></div></div>' +
		'<div class="tbl"><div class="td"><small>Author: </small><input placeholder="Add author here" id="author"/></div></div>' +
		'<div class="article-area">' +
		'<fieldset class="memo-info"><legend>Comment</legend><p><textarea placeholder="New comment here"rows="3" id="comments"></textarea></p></fieldset>' +
		'<div class="memo-data"><small>Type: </small>' +
		'<select id="memotype-new"><option value="Company">Company</option><option value="Contact">Contact</option><option value="Market Intelligence">Market Intelligence</option></select>' +
		'</div>' +
		'<fieldset class="mm-companies"><legend>Regarding</legend><button class="fr" id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button></fieldset>' +
		'</div><div class="tbl tbl-attached"><div class="td tdr"><button id="addFile"><i class="fa fa-paperclip"></i> Attach</button></div>' +
		'<div class="td" id="attachments"><small>Attached: </small></div></div>';

	//click memo item in the list
	memoListEl.on("click", "li", function(a) {
		var obj = sorted[a.currentTarget.dataset.index];
		var fn = (obj.FileName) ? '<b class="anch"><a href="#" class="anch">' + obj.FileName + '</a><span class="editmode-btn anch-x">x<span></b>' : '';
		//var regarding = (obj.RegardingName) ? '<b class="anch"><a href="#">' + obj.RegardingName + '</a><span class="editmode-btn anch-x">x<span></b>' : '';
		var recips = (typeof obj.Recipients !== "undefined" && obj.Recipients.length) ? '<b class="anch"><a href="#">'+obj.Recipients.join('</a><span class="editmode-btn anch-x">x<span></b><b class="anch"><a href="#">') + '</a><span class="editmode-btn anch-x">x<span></b>' : '';
		var filenames = (typeof obj.FileNames !== "undefined" && obj.FileNames.length) ? '<b class="anch"><a href="#">'+obj.FileNames.join('</a><span class="editmode-btn anch-x">x<span></b><b class="anch"><a href="#">') + '</a><span class="editmode-btn anch-x">x<span></b>' : '';
		var comment = (obj.Comments) ? obj.Comments : '';
		currentMemo = a.currentTarget.dataset.index;
		currentMemoId = a.currentTarget.dataset.id;

		appendArticle('<div class="tbl"><div class="td tdr"><button id="deleteMemo"><i class="fa fa-trash-o"></i> Archive</button></div>' +
			'<div class="td"><small>Subject: </small><span class="may-edit" id="subject">' + obj.Subject + '</span></div></div>' +
			'<div class="tbl"><div class="td tdr"><button id="editMemo" class="edit-memo"><i class="fa fa-edit"></i> Edit</button>' +
			'<button id="saveEdit" class="editmode-btn"><i class="fa fa-save"></i> Save</button> <button id="cancelEdit" class="editmode-btn"><i class="fa fa-save"></i> Cancel</button></div>' +
			'<div class="td"><small>Author: </small><span class="may-edit" id="author">' + obj.Author + '</span></div></div>' +
			'<div class="article-area">' +
			'<fieldset class="memo-info"><legend>Comment</legend><p id="comments" class="may-edit">' + comment + '</p></fieldset>' +
			'<div class="memo-data"><small>Type: </small><span class="editmodehide">' + obj.MemoType + '</span>' +
			'<select class="editmodeshow" id="memotype-edit"><option value="Company">Company</option><option value="Contact">Contact</option><option value="Market Intelligence">Market Intelligence</option></select>' +
			'</div>' +
			'<fieldset class="mm-companies"><legend>Regarding</legend>' +
			'<button class="fr editmodeshow" id="addRegarding"><i class="fa fa-plus-circle"></i> Add</button>' + recips + '</fieldset>' +
			'<div class="memo-data"><small>Created by: </small>' + obj.CreatedBy + '<br><small>Created: </small>' + obj.CreatedOn + '<br><small>Updated: </small>' + obj.UpdatedAt + '</div>' +
			'</div><div class="tbl tbl-attached"><div class="td tdr"><button id="addFile" class="editmodeshow"><i class="fa fa-paperclip"></i> Attach</button></div>' +
			'<div class="td" id="attachments"><small>Attached: </small>' + filenames + '</div></div>');

		$(this).addClass('selected').siblings().removeClass('selected');
		articleEl.removeClass('edit-mode');

	});

	var makeMemoList = function() {
		var memoList = $.map(sorted, function(o2, i2) {
			return '<li data-index="' + i2 + '" data-id="' + o2.id + '">' +
				'<input type="checkbox" class="selectbox"/>' +
				'<span>' + o2.CreatedOn + '</span>' +
				'<h4>' + o2.Subject + '&nbsp;</h4>' +
				'<div>' + o2.RegardingName + '&nbsp;</div>' +
				'<div>' + o2.Comments + '&nbsp;</div></li>';
		});
		return memoList.join('');
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
				CreatedOn: moment(o1.createdAt).fromNow(),
				Updated: moment(o1.createdAt),
				UpdatedAt: moment(o1.updatedAt).calendar()
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
	q1.count({success:function(count){
		cnt = count;}
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
			success:function(count){
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

	articleEl.on('click', '#editMemo', function() {
		articleEl.find('.may-edit').attr('contenteditable', 'true');
		articleEl.addClass('edit-mode');
	});

	articleEl.on('click', '#saveEdit', function() {
		var recips = $.map(articleEl.find('.mm-companies a'), function (v,k) {
			return $(v).text();
		});
		var filenames = $.map(articleEl.find('#attachments a'), function (v,k) {
			return $(v).text();
		});
		var obj = {
			"Subject": articleEl.find('#subject').text(),
			"Author": {
				"Name": articleEl.find('#author').text()
			},
			"Comments": articleEl.find('#comments').text(),
			"Regarding": {
				"Name": articleEl.find('.mm-companies').find('a').text()
			},
			"MemoType": {
				"Name": articleEl.find('#memotype-edit').val()
			},
			"FileName": articleEl.find('#attachments').find('a').eq(0).text(),
			"FileNames": filenames,
			"Recipients": recips
		};
		var saveObject = new TestObject();
		saveObject.set("objectId", currentMemoId);
		saveObject.save(obj).then(function(result) {
			//update
			sorted[currentMemo].Subject = obj.Subject;
			sorted[currentMemo].Author = obj.Author.Name;
			sorted[currentMemo].Comments = obj.Comments;
			sorted[currentMemo].RegardingName = obj.Regarding.Name;
			sorted[currentMemo].Recipients = obj.Recipients;
			sorted[currentMemo].MemoType = obj.MemoType.Name;
			sorted[currentMemo].FileName = obj.FileName;
			sorted[currentMemo].FileNames = obj.FileNames;
			sorted[currentMemo].Updated = moment(result.updatedAt);
			sorted[currentMemo].UpdatedAt = moment(result.updatedAt).calendar();

			appendList(makeMemoList());
			memoListEl.find('li').eq(currentMemo).click();
			alert('Saved');

		}, function(error) {
			alert("Could not update. " + error);
		});

	});


	articleEl.on('click', '#saveMemo', function() {
		var recips = $.map(articleEl.find('.mm-companies a'), function (v,k) {
			return $(v).text();
		});
		var filenames = $.map(articleEl.find('#attachments a'), function (v,k) {
			return $(v).text();
		});
		var obj = {
			"Subject": articleEl.find('#subject').val(),
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
				CreatedOn: moment(result.createdAt).fromNow(),
				Updated: moment(result.updatedAt),
				UpdatedAt: moment(result.updatedAt).calendar(),
				Recipients: obj.Recipients
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

	var getSorted = function () {
		return sorted;
	};
	return {
		arr: function () {
			return sorted;
		}
	};
})();
