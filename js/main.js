$(function(){

//  base style

	var winWidth = $(window).width();
	var winHeight = $(window).height();

	$("#content").height(winHeight);
	
	if (winWidth > 767) {
		$("#results").height(winHeight - 150);
		$(".left-side, .right-side, .left-side .wrapper").height(winHeight - 200);
	} else {
		$("#results").height(winHeight - 100);
		$(".left-side, .right-side, .left-side .wrapper").height(winHeight - 130);
	}

	$("a.play").fancybox({
        'autoScale'     	: false,
        'transitionIn'		: 'none',
		'transitionOut'		: 'none',
		'type'				: 'iframe',
		'padding'			: '0'
	});
	
// - gapi
	function googleApiClientReady() {

	    var apiKey = 'AIzaSyC_TmpVk9CYnwJXtbeK47WQRaHnXRucLVo';

        gapi.client.setApiKey(apiKey);
        gapi.client.load('youtube', 'v3', function() {

            request = gapi.client.youtube.search.list({
                part: 'snippet',
	    		type: 'video',
	    		metrics: 'views',
	    		q: $('#search').val().replace(/%20/g, "+"),
	    		maxResults: 30,
	    		order: "viewCount",
	    		publishedAfter: "2015-01-01T00:00:00Z"
	    	});

			request.execute(function(response) {
	        	var results = response.result.items;

		        $(".left-side .wrapper").kendoListView({
	                dataSource: {
                		data: results,
	   					schema: {
	                        model: {
	                            fields: {
	                                id: { type: "Object" },
	                                snippet: { type: "Object" },
	                            }
	                        },  
	                    },
	                },
	                selectable: "row",
	                change: onChange,
	                template: kendo.template($("#searchlist").html())
	            });

	            function onChange() {
	            	var data = results,
                    selected = $.map(this.select(), function(item) {
                        return data[$(item).index()];
                    });

                    $(".right-side").kendoListView({
						dataSource: {
	                		data: selected
		                },  
		                template: kendo.template($("#detail").html())              	
                    });
                    if (winWidth <= 768) {
                    	var needDist = winWidth*0.9;
                    	console.log(needDist);
                    	$('#results > .wrapper').css('margin-left','-' + needDist + 'px');
                    	$('.back-button').addClass('action');

                    	$('.back-button.action').on('click', function(){
							$('#results > .wrapper').css('margin-left','auto');
					        $( this ).removeClass('action');    	
					    });
                    } 
                    var commentID = $(".right-side .wrapper").data('id');
                    var commentForThis = localStorage.getItem(commentID);
                    var jsonObj = $.parseJSON('[' + commentForThis + ']');

                    if (jsonObj != '') {
	                	$.each(jsonObj , function(){
	                    	$('.description.comments').append('<p><span class="date-comment">' + kendo.toString(kendo.parseDate(this.dateComment), 'dd MMMM yyyy') + ':</span>' + this.newComment + '</p>');
	                    });
	                } else {
	                	return false;
	                }
	            }
			});

		return false;
        });
	}


// - event

    $('form input[type="text"]').on('keyup', function(e){
        e.preventDefault();
        googleApiClientReady();
        $('#results').css('opacity','1');
    });	

	$('form').on('submit', function(e){
        e.preventDefault();
        googleApiClientReady();
        $('#results > .wrapper').css('margin-left','0');
    });	

// - comments

	$('body').on('click','#add', function() {
		var Description = $('#description').val();
		if($("#description").val() == '') {
	    	$('#alert').html("Please enter your comment.");
	    	$('#alert').fadeIn().delay(1000).fadeOut();
	    	return false;
	   	}
		var dateComment = new Date();
		$('.description.comments').append('<p><span class="date-comment">' + kendo.toString(kendo.parseDate(dateComment), 'dd MMMM yyyy') + ':</span>' + Description + "</p>");
			
	// - localstorage

		var obj = {
			newComment : $("#description").val(),
			dateComment : new Date(),
			id : $(".right-side .wrapper").data('id')
		}

		var commentID = $(".right-side .wrapper").data('id');
		var old_comment = localStorage.getItem(commentID);
		if(old_comment == null) {
			localStorage.setItem(commentID, JSON.stringify(obj));
		}else 
		localStorage.setItem(commentID, old_comment+','+JSON.stringify(obj));

	//
		$("#description").val('');
		return false;
	});

});
