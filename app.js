/*global $*/

// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function (question) {
	'use strict';
    var result, questionElem, asked, date, viewed, asker;
	// clone our result template code
	result = $('.templates .question').clone();
	// Set the question properties in result
	questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);
	// set the date asked property in result
	asked = result.find('.asked-date');
	date = new Date(1000 * question.creation_date);
	asked.text(date.toString());
	// set the #views for question property in result
	viewed = result.find('.viewed');
	viewed.text(question.view_count);
	// set some properties related to asker
	asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' + question.owner.display_name + '</a>' + '</p>' + '<p>Reputation: ' + question.owner.reputation + '</p>');
	return result;
};


// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function (query, resultNum) {
    'use strict';
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function (error) {
    'use strict';
    var errorElem, errorText;
	errorElem = $('.templates .error').clone();
	errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function (tags) {
	'use strict';
    var request, result;
	// the parameters we need to pass in our request to StackOverflow's API
	request = {
        tagged: tags,
        site: 'stackoverflow',
        order: 'desc',
        sort: 'creation'
    };
	result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET"
    })
        .done(function (result) {
            var searchResults = showSearchResults(request.tagged, result.items.length);
            $('.search-results').html(searchResults);
            $.each(result.items, function (i, item) {
                var question = showQuestion(item);
                $('.results').append(question);
            });
	    })
	       .fail(function (jqXHR, error, errorThrown) {
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });
};

// convert user object to be injected into DOM
var makeAnswerer = function (rank, userObj) {
    'use strict';
    var template, user, userRank, userName, userImage, userRep, userPostcount, userScore;
    template = $('.templates .top-answerers').clone();
    user = userObj.user;
    // make rank
    userRank = template.find('.rank');
    userRank.text(rank + 1);
    // make linked user name
    userName = template.find('.user-name a');
    userName.prop("href", user.link);
	userName.text(userObj.user.display_name);
    // make user image
    userImage = template.find('img');
    userImage.prop('src', user.profile_image);
    // make rep
    userRep = template.find('.user-rep');
    userRep.text(user.reputation);
    // make post count
    userPostcount = template.find('.user-postcount');
    userPostcount.text(userObj.post_count);
    // make score
    userScore = template.find('.user-score');
    userScore.text(userObj.score);
    
    return template;
};

// make a call for top answerers object
var getTopAnswerers = function (tag, period) {
    'use strict';
    var result = $.ajax({
        url: "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/" + period + "?site=stackoverflow",
        dataType: "jsonp",
        type: "GET"
    })
        .done(function (result) {
            var searchResults = showSearchResults(tag, result.items.length);
            $('.search-results').html(searchResults);
            $.each(result.items, function (i, user) {
                var answerer = makeAnswerer(i, user);
                $('.results').append(answerer);
            });
        });
};

// doc ready
$(function () {
    'use strict';
	$('.unanswered-getter').submit(function (event) {
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
        $('input[type="text"').val("");
	});
    $('.inspiration-getter').submit(function () {
        var tag, period;
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tag and period the user submitted
		tag = $(this).find("input[name='answerers']").val();
        period = $("input[name='period']:checked").val();
		getTopAnswerers(tag, period);
        $('input[type="text"').val("");
    });
});