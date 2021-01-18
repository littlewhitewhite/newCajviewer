
// function setTextToClipbord(text) {
// 	$("#copyContainer").attr('data-clipboard-text', text);
// 	$("#copyContainer").trigger('click');
// }
$(function() {
	console.log('ready-to-show');
	initAll();
	readyToShow();
	function rgb2int(rgb) {
		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		return  Number(rgb[1]) << 16 |  Number(rgb[2]) << 8 | Number(rgb[3]);
	}
	function rgb2hex(rgb) {
		rgb = rgb2int(rgb);
		function hex(x) {
			 return ("0" + x.toString(16)).slice(-2);
		}
		return "" + hex((rgb >> 16) & 0xff) + hex((rgb >> 8) & 0xff) + hex(rgb & 0xff); 
	}
	//工具栏
	$(".tool-list").on("click",".tool-item",function(){
		selectToolItem($(this));
		if (!longpress) $(".line-size").addClass("hide");
	})
	var timer;
	var longpress = false;
	$(".tool-list").on("mousedown",".tool-item", function(event) {
		var $item = $(this);
		var index = $item.index();
		longpress = false;
		timer = setTimeout(function(){
			longpress = true;
			event.stopPropagation();
			event.preventDefault();
			if (index >= 3 && index <= 6) {
				var top = $item.get(0).offsetTop-$item.height()/2;
				$(".line-size").removeClass("hide").css("top",top);
			}
		}, 500);
	}).on("mouseup mouseleave",function(){
		clearTimeout(timer);
	});
	//工具栏颜色线条大小
	$(".line-list").on("click",".line-size-item",function(){
		$(this).addClass("line-size-item-sel").siblings().removeClass("line-size-item-sel")
		var size = $(this).data("size")
		//alert("线条粗细为"+size+"px")
		default_line_width = size * 100;
		//$(this).addClass("hide");
	})
	$(".bottom-line-size").on("click",".line-item",function(){
		var size = $(this).data("size")
		var note = getCurSelectNote();
		note.lineWidth = size * 100;
		updateNote(note);
		hideToolbar();
	})
	//工具栏线条颜色选取
	$(".line-color-btn").on("click",function(){
		$(".line-color-list").removeClass("hide")
	})
	$(".line-color-list").on("click",".line-color-item",function(){
		$(this).addClass("sel").siblings().removeClass("sel")
		var colorName = $(this).data("color");
		$(".color-sel").css("background",colorName);
		$(".line-color-list").addClass("hide")
		default_line_color = colorName.substring(1);
	})
	//左侧目录隐藏按钮
	$(".one-left").on("click",".one-left-btn",function(){
		var $oneLeft = $(".one-left");
		var $this = $(this);
		if($this.hasClass("left-open")){
			$oneLeft.removeClass("one-left-hide");
			$this.removeClass("left-open");
			caj_settings.left_sidebar = true;
		}else{
			$oneLeft.addClass("one-left-hide");
			$this.addClass("left-open");
			caj_settings.left_sidebar = false;
		}
		relayoutViewerContainer();
	})
	document.getElementById('left-sidebar').addEventListener( 
		'webkitTransitionEnd', 
		function( event ) { 
			relayoutViewerContainer();
		}, false );
		//右侧交流区隐藏按钮
	$(".one-right").on("click",".one-right-btn",function(){
		var $oneLeft = $(".one-right");
		var $this = $(this);
		if($this.hasClass("right-open")){
			$oneLeft.removeClass("one-right-hide");
			$this.removeClass("right-open");
			caj_settings.right_sidebar = true;
		}else{
			$oneLeft.addClass("one-right-hide");
			$this.addClass("right-open");
			caj_settings.right_sidebar = false;
		}
		relayoutViewerContainer();
	})
	document.getElementById('right-sidebar').addEventListener( 
		'webkitTransitionEnd', 
		function( event ) {
			relayoutViewerContainer();
		}, false );
	//顶部尺寸缩放点击事件
	//放大
	$(".size-btn-item").on("click",".size-up-btn",function(){
		zoomin();
	})
	//缩小
	$(".size-btn-item").on("click",".size-down-btn",function(){
		zoomout();
	})
	//下拉框
	$(".size-number-box").on("click",".number-select-btn",function(){
		$(".size-number-select").removeClass("hide")
	})
	//下拉框点击事件
	$(".select-number").on("click",".select-number-item",function(){
		$(this).addClass("number-selected").siblings().removeClass("number-selected");
		var value = $(this).attr('data-value');
		//$("#sizeInput").attr('')
		$(".size-number-select").addClass("hide");
		setScale(Number(value));
	})
	$("#sizeInput").on("keydown", function(e){
		if (e.key == 'Enter') {
			var scale = Number($(this).val());
			setScale(scale);
		}
	})
	$("#sizeInput").on("click", function(){
		this.select();
		$(".size-number-select").addClass("hide");
	})

	//翻页箭头点击事件
	//上一页
	$(".center-progress").on("click",".progress-left-arrow",function(){
		prevPage();
	})
	//下一页
	$(".center-progress").on("click",".progress-right-arrow",function(){
		nextPage();
	})
	$("#current-page").on("keydown", function(e){
		if (e.key == 'Enter') {
			var page = Number($(this).val());
			turnToPage(page);
			updatePageButton();
		}
	})

    //问答批注菜单切换事件
    $(".exchnge-menu").on("click","li",function(){
    	var idx = $(this).index()
    	$(this).addClass("selected").siblings().removeClass("selected");
    	var dis = $(this).position().left+"px"
    	$(".slider").eq(0).css("left",dis);
    	if(idx==0){
    		$(".QA-content").removeClass("hide")
    		$(".annotations-content").addClass("hide")
    	}else{
    		$(".annotations-content").removeClass("hide")
    		$(".QA-content").addClass("hide")
    	}
    })

    //添加到书签事件
    $(".add-mark-btn").on("click",function(){
    	if ($(this).hasClass("added-flag")) {
			$(this).removeClass("added-flag");
			removeBookmark();
		  } else {
			$(this).addClass("added-flag");
			addBookmark();
		  }
	})
	$("#note-export").on("click", (e)=>{
		exportNote();
	})
    //固定按钮点击事件
    $(".fixed-btn").on("click",function(){
    	if($(this).hasClass("fixed-sure")){
			$(this).removeClass("fixed-sure")
			caj_settings.top_sidebar = false;
    	}else{
			$(this).addClass("fixed-sure")
			caj_settings.top_sidebar = true;
		}
		relayoutViewerContainer();
    })

	//顶部区域
	$(".top-function").on("mouseenter",function(){
		$(this).removeClass("topHide");
	})
	$(".top-function").on("mouseleave",function(){
		if(!($(".size-number-select").hasClass("hide")) || $(".right-btn-item").hasClass("selected") || $(".left-btn-item").hasClass("selected") || $(".fixed-btn").hasClass("fixed-sure")){
			$(this).removeClass("topHide");
			return
		}else{
			$(this).addClass("topHide");
		}
	})
     	    //阅读器左侧菜单功能按钮点击，左侧固定内容伸展
    $(".left-area").on("click",".left-btn-item",function(){
    	var idx = $(this).index();
    	$(".right-btn-item").removeClass("selected")
    	$(this).addClass("selected").siblings().removeClass("selected");
    	$(".left-fixed-block").css("left","0px")
    	$(".right-fixed-block").css("right","-360px")
    	if($(this).attr("id")=="print"){//打印
			//$(".print-alert").removeClass("hide");
			print();
    		$(".search-moudle").addClass("search-hide");
    	}else if($(this).attr("id")=="searchControl"){//搜索
    		$(".search-moudle").removeClass("search-hide");
    		$(".exchange-block").addClass("exchange-hide");
    	}
    })
    //打印弹框点击事件
    $(".print-machine").on("click",function(){
		if ($(".machine-box").hasClass("hide"))
			$(".machine-box").removeClass("hide");
		else
			$(".machine-box").addClass("hide");
    })
    // $(".machine-list").on("click",".machine-item",function(e){
    // 	e.stopPropagation()
    // 	$(this).addClass("machine-selected").siblings().removeClass("machine-selected")
    // 	var value = $(this).html();
    // 	$(".print-machine").find("span").html(value);
    // 	$(".machine-box").addClass("hide");
    // })
    //打印机下拉框点击事件
  	$(".print-paper").on("click",function(){
		if ($(".paper-list").hasClass("hide"))
			$(".paper-list").removeClass("hide");
		else
			$(".paper-list").addClass("hide");
    })
    //纸张大小下拉框点击事件
    // $(".paper-list").on("click",".paper-item",function(e){
    // 	e.stopPropagation()
    // 	$(this).addClass("paper-selected").siblings().removeClass("paper-selected")
    // 	var value = $(this).html();
    // 	$(".print-paper").find("span").html(value);
    // 	$(".paper-list").addClass("hide");
    // })
    // //打印质量下拉框点击事件
    // $(".print-quality").on("click",function(){
    // 	$(".quality-list").removeClass("hide");
    // })
    // //打印质量下拉框点击事件
    // $(".quality-list").on("click",".quality-item",function(e){
    // 	e.stopPropagation()
    // 	$(this).addClass("quality-selected").siblings().removeClass("quality-selected")
    // 	var value = $(this).html();
    // 	$(".print-quality").find("span").html(value);
    // 	$(".quality-list").addClass("hide");
    // })
    //打印弹框显示信息点击事件
    $("#printDialog").on("change","#more-print-setting",function(){
    	if($(".print-ohter-line").hasClass("hide")){
    		$(".print-content-control").html("隐藏更多设置");
    		$(".print-ohter-line").removeClass("hide");
    	}else{
    		$(".print-content-control").html("显示更多设置");
    		$(".print-ohter-line").addClass("hide")
    	}
    })
    //标注区域排序点击事件
    $(".order-select").on("click","span",function(){
		var $select = $(this);
		if (!$select.hasClass("selected")) {
			$select.addClass("selected").siblings().removeClass("selected");
			if ($select.attr("id") == "order-by-paragraph") {
				caj_settings.note_sort_type = 1;
			} else {
				caj_settings.note_sort_type = 2;
			}
			sortNote();
			setupNoteList();
		}
    })
    //书签列表删除事件
	$(".marking-list").on("click",".marking-item .marking-oprate-delete",function(e){
		e.stopPropagation()
		var item = $(this).parents(".marking-item");
		removeNote(item.attr("list-note-id"));
	})
	//书签列表编辑事件
	$(".marking-list").on("click",".marking-item .marking-oprate-edit",function(e){
		e.stopPropagation()
		var $parent_dom = $(this).parents(".marking-item-sub");
		var $mesg = $parent_dom.find(".marking-mesg");
		var $input_dom = $('<div class="text-box"> <textarea></textarea> </div>')
		$input_dom.find("textarea").val($mesg.text().trim())
		$mesg.hide()
		var newMesg = ""
		$input_dom.find("textarea").get(0).addEventListener("blur",function(){
			newMesg=$(this).val();
			$input_dom.remove();
			if(newMesg.trim()!=""){
				$mesg.text(newMesg.trim())
				var item = $parent_dom.parents(".marking-item");
				var note = getNoteById(item.attr("list-note-id"));
				note.note.desc = newMesg.trim();
				updateNote(note.note);
			}
			$mesg.show()
		})
		$parent_dom.prepend($input_dom)
	})
    $(".right-area").on("click",".right-btn-item",function(){
		var idx = $(this).index();
		if(idx==1){
    		return
    	}
		$(".left-btn-item").removeClass("selected")
    	$(".search-moudle").addClass("search-hide")
		if(idx==0){//交流区
			$(this).addClass("selected").siblings().removeClass("selected");
			$(".exchange-block").removeClass("exchange-hide");
		} else if(idx==2){//分屏
			$(".exchange-block").addClass("exchange-hide");
			// if($(this).hasClass("full")){//分屏
			// 	$(this).removeClass("full");
			// 	alert("分屏")
			// }else{//全屏
			// 	$(this).addClass("full");
			// 	alert("全屏")
			// }
			//captureImage();
			toggleNoteStatus();
		} else if (idx == 3) {
			toggleNoteStatus();
		}
	})
	//检测标注输入框内变化
	$(".search-moudle").on("input propertychange", "input", function (e) {
		if ($(this).val().length > 0) {
		  $(".search-btn").removeClass("disable");
		} else {
		  $(".search-btn").addClass("disable");
		}
		//console.log(e);
	  });
	  $("#caj-search-keyword").on('keydown', function(e){
		console.log(e);
		if (e.key == 'Enter') {
			searchText();
		}
	  });
	  $(".search-btn").on("click", function() {
		searchText();
	});
	//var stop_search = false;
	var in_searching = false;
	function searchText() {
		if (in_searching){
			stopSearch();
			return;
		}
		$("#search-progressbar").show();
		var text = $("#caj-search-keyword").val();
		if (!text || text.length == 0) return;
		var list = $("#caj-search-list");
		list.empty();
		var $search_result = $(".search-result");
		var $no_result = $("#empty-tip-block-search");
		$(".search-btn").addClass("search-btn-stop");
		$search_result.show();
		$no_result.hide();
		in_searching = true;
		remoteSearch(text);
		var interval = setInterval(()=>{
			var results = getSearchProgress();
			if (results) {
				console.log(results);
				if (!results.searching) {
					clearInterval(interval);
					if (results.count == 0 && !results.cancel) {
						$search_result.hide();
						$no_result.show();
					}
					in_searching = false;
					$(".search-btn").removeClass("search-btn-stop");
					$("#search-progressbar").hide();
				}
				addSearchResult(list[0], results.results);
			}
		}, 500);
	}
	function addSearchResult(list, results) {
		if (results) {
			results.forEach(element => {
				var li = document.createElement('li');
				li.className = 'search-item';
				var text = element.text.toString();
				text = text.replace(/\<H\>/, "<span style='color:red;'>");
				text = text.replace(/\<\/H\>/, "</span>");
				
				li.innerHTML = '...' + text + '...';
				list.appendChild(li);
				li.addEventListener('click', function(){
					turnToPage(element.page);
					createSelectionFromSearchResult(element);
				})
			});
			
		}
	}
	/*
    document.addEventListener("click",function (e) {
            var e = e || window.event; //浏览器兼容性
            var elem = e.target || e.srcElement;
            //工具栏颜色线条弹框
            var menuTool = document.getElementsByClassName("menu-tool")[0];
            var linesizeBox = document.getElementsByClassName("line-size")[0];

            if(!(menuTool==elem || menuTool.contains(elem) || linesizeBox==elem || linesizeBox.contains(elem))) {
              	linesizeBox.classList.add("hide")
            }
            //缩放尺寸下拉框
            var sizeBlock = document.getElementsByClassName("size-btn-item")[0];
            var sizeSelect = document.getElementsByClassName("size-number-select")[0];
            if(!(sizeBlock==elem || sizeBlock.contains(elem) || sizeSelect==elem || sizeSelect.contains(elem))) {
              	sizeSelect.classList.add("hide")
            }
            //打印弹框
            var printControl = document.getElementById("print")
            var printAlert = document.getElementsByClassName("print-alert")[0];
            if(!(printControl==elem || printControl.contains(elem) || printAlert==elem || printAlert.contains(elem))) {
               $(".print-alert").addClass("hide");
               $(printControl).removeClass("selected")
            }
            
            //打印弹框打印机下拉框
            var printMachine = document.getElementsByClassName("print-machine")[0];
            if(!(printMachine==elem || printMachine.contains(elem))) {
              	$(".machine-box").addClass("hide");
            }
            //打印弹框纸张大小下拉框print-paper
             var printPaper = document.getElementsByClassName("print-paper")[0];
            if(!(printPaper==elem || printPaper.contains(elem))) {
              	$(".paper-list").addClass("hide");
            }
            //打印弹框打印质量下拉框print-quality
            var printQuality = document.getElementsByClassName("print-quality")[0];
            if(!(printQuality==elem || printQuality.contains(elem))) {
              	$(".quality-list").addClass("hide");
            }
            
			var topFunction = document.getElementById("top-function");
			var searchMoudle = document.getElementsByClassName("search-moudle")[0];
			var exchangeBlock = document.getElementsByClassName("exchange-block")[0];
			//点击左右弹框以外的相关区域，左右弹框消失
			if(!(topFunction==elem || topFunction.contains(elem) || searchMoudle==elem || searchMoudle.contains(elem) || exchangeBlock==elem || exchangeBlock.contains(elem))) {
              	$(".search-moudle").addClass("search-hide")
    			$(".exchange-block").addClass("exchange-hide")
              	$(".right-btn-item").removeClass("selected")
              	$(".left-btn-item").removeClass("selected")
              	if(!$(".fixed-btn").hasClass("fixed-sure")){
              		$("#top-function").addClass("topHide")
              	}
            }
			//点击提问的编辑框相关以外的区域，提问的编辑框消失
			var QuestionDom = document.getElementById("Question");
			var questionBox = document.getElementById("questionBox");
       		if(!(QuestionDom==elem || QuestionDom.contains(elem)|| questionBox==elem || questionBox.contains(elem))) {
              	$("#questionBox").hide();
            }
       		//点击写批注的编辑框以外的区域，写批注的编辑框消失
       		var markingDownDom = document.getElementById("markingDown");
       		var markingBox = document.getElementById("markingBox");
            if(!(markingDownDom==elem || markingDownDom.contains(elem)|| markingBox==elem || markingBox.contains(elem))){
      			$("#markingBox").hide();
            }
            //点击分享弹框以外的相关区域，分享弹框消失
        	var shareDom = document.getElementById("share");
       		var sharePlatformBox = document.getElementById("sharePlatformBox");
            if(!(shareDom==elem || shareDom.contains(elem)|| sharePlatformBox==elem || sharePlatformBox.contains(elem))){
      			$("#sharePlatformBox").hide();
            }
            
		})
		*/
	// var windowResizing = false;
	// var minWidth = 800;
	// var minHeight = 700;
	window.addEventListener('resize', function(e) {
		// console.log(e);
		// var width = $(this).width();
		// var height = $(this).height();
		// if ((height < minHeight || width < minWidth) && !windowResizing ) {
		// 	windowResizing = true;
		// 	//this.innerHeight = height<500?500:height;
		// 	//this.innerWidth = width < 500?500:width;
		// 	//window.resizeTo(width<minWidth?minWidth:width, height<minHeight?minHeight:height);
		// 	//return;
		// }
		// windowResizing = false;
		relayoutViewerContainer();
	});
	
	function relayoutViewerContainer () {
		var x = 0, y = 0;
		var w = $('.content-sub').width();
		var h = $('.content-sub').height();
		
		var $menu_tool = $("#menu-tool");
		x = $menu_tool.outerWidth();
		w -= x;
		//w-= 20;
		// var $left_sidebar = $("#left-sidebar");
		// if($left_sidebar.hasClass("left-open")) {
		// 	//w -= $left_sidebar.width();
		// 	//x += $left_sidebar.width();
		// }
		// var $right_sidebar = $("#right-sidebar");
		// if($right_sidebar.hasClass("right-open")) {
		// 	//w -= $right_sidebar.width();
		// }

		var $top_sidebar = $("#top-sidebar");
		if($(".fixed-btn").hasClass("fixed-sure")) {
			y = $top_sidebar.height();
			h -= y;
		}
		//console.log('viewerContainer:x=', x, ',y=', y, ',w=', w, ',h=', h);
		//var $viewerContainer = $("#viewerContainer");
		//$viewerContainer.css({'left': x + 'px', 'top': y + 'px', 'width': w + 'px', 'height': h + 'px'});
		$viewerContainer[0].style.left = x + 'px';
		$viewerContainer[0].style.top = y + 'px';
		$viewerContainer[0].style.width = w + 'px';
		$viewerContainer[0].style. height = h + 'px';
		//$("#content-box").css({'left': 0 + 'px', 'top': 0 + 'px'});
		//var entire = $('.entire');//[0].scrollTo(0, 0);
		//entire[0].scrollTop = (0);
		//console.log($("#center-content").scrollTop());
		relayoutAllPageEx(true);
	}
	$("#center-content")[0].addEventListener("scroll", function(event){
		console.log('entire-content scroll');
		this.scrollTop = 0;
    });
	
	//var $contentArea = $("#contentArea");
	var $reader_opration = $("#reader_opration");
	//var contentBox = document.getElementsByClassName("content-box")[0]
	
	line();
	relayoutViewerContainer();
  	
	function line(){
		var clipboard = new ClipboardJS('#setCopy, #copyContainer',{
				//复制文本
				text:function(trigger){
					console.log(trigger)
					var text = $(trigger).attr('data-clipboard-text');
					if (text) return text;
					if (cur_selection) return cur_selection.text;
					var note = getNoteById(cur_select_note_id);
					if (note) return note.note.title;
					return '';
				}
			});
			 clipboard.on('success', function(e) {
				hideToolbar();
				clearSelection();
				$("#copy-alert").show().delay(1000).hide(0)
			 });
			 clipboard.on('error', function(e) {
			 	//$reader_opration.hide()
//			 	layer.msg('当前浏览器不支持此功能，请手动复制', {icon: "../imgs/s",time:10000});
//			 	alert("当前浏览器不支持此功能，请手动复制。")
			 });
	
	 
		//分享
		$reader_opration.on("click","#share",function(evt){
			$reader_opration.hide();
			$("#sharePlatformBox").show()
		})
		//提问
		$reader_opration.on("click","#Question",function(evt){
			var note = noteFromSelection();
			note['type'] = 'Highlight';
			note['color'] = 'FF0000';
			showQuestionDialog('提问', note, true);
		})
		$reader_opration.on("click","#Question1",function(evt){
			showQuestionDialog('提问', getCurSelectNote(), false);
		})
		//写批注
		$reader_opration.on("click","#markingDown",function(evt){
			//addNoteFromSelection('Highlight');
			var note = noteFromSelection();
			note['type'] = 'Underline';
			note['color'] = 'FFEB85';
			showNoteDialog('写批注', note, true);
		})
		$reader_opration.on("click","#markingDown1",function(evt){
			//addNoteFromSelection('Highlight');
			showNoteDialog('写批注', getCurSelectNote(), false);
		})
		
        //操作高亮点击事件
		$reader_opration.on("click","#setHighlight",function(evt){
			evt.stopPropagation();
			addNoteFromSelection('Highlight');
			hideToolbar();
		})
		
		//下划线
		$reader_opration.on("click","#setUnderline",function(evt){
			evt.stopPropagation();
			addNoteFromSelection('Underline');
			hideToolbar();
		})
		//标注编辑，提问编辑，分享弹框关闭按钮点击事件
		$("#sharePlatformBox,#questionBox,#markingBox").on("click",".close-btn",function(){
			$(this).parent().parent().parent().hide()
		})
		$("#color-toolbar").on("click", ".light-item", function (evt) {
			var color = $(this).css("background-color");
			var note = getCurSelectNote();
			note.color = rgb2hex(color);
			caj_settings.note_default_color = note.color;
			console.log(note.color);
			updateNote(note);
			hideToolbar();
		});
		$reader_opration.on("click", "#note-delete", function (evt) {
			removeNote(getCurSelectNote());
			hideToolbar();
		});
	}
	
	//问答列表喜欢点击事件
	// $(".QA-ul").on("click",".QA-item",function(e){
	// 	if(e.target.classList.contains("like-number")){
	// 		e.stopPropagation();
	// 		var $likeNumber = $(this).find(".like-number");
	// 		if($likeNumber.hasClass("liked")){//取消点赞
	// 			$likeNumber.removeClass("liked");
	// 		}else{//点赞
	// 			$likeNumber.addClass("liked");
	// 		}
	// 	}else{//点击点赞以外的区域跳转链接
	// 		alert("此操作是跳转链接")
	// 	}
	// })
	//批注点赞点击事件
	// $(".annotation-ul").on("click",".annotation-li",function(e){
	// 	if(e.target.classList.contains("praise-number")){
	// 		e.stopPropagation();
	// 		var $praiseNumber = $(this).find(".praise-number");
	// 		if($praiseNumber.hasClass("praised")){//取消点赞
	// 			$praiseNumber.removeClass("praised");
	// 		}else{//点赞
	// 			$praiseNumber.addClass("praised");
	// 		}
	// 	}else{//点击点赞以外的区域跳转链接
	// 		alert("此操作是跳转链接")
	// 	}
	// })

	//书签列表，只显示书签点击事件
	$(".marking-moudle").on("click",".marking-control-btn",function(){
		 if($(".book-mark").hasClass("hide")){//只显示书签的操作
		 	$(this).addClass("showBook")
		 	$(".marking-list").addClass("hide");
		 	$(".book-mark").removeClass("hide");
		 }else{
		 	$(this).removeClass("showBook")
		 	$(".marking-list").removeClass("hide");
		 	$(".book-mark").addClass("hide");
		 }
	})
	//检测标注输入框内变化
   	$(".marking-edit").on("input propertychange","textarea",function(){
   		if($(this).val().length>0){
   			$(".marking-edit").find(".sure-btn ").removeClass("disable")
   		}else{
   			$(".marking-edit").find(".sure-btn ").addClass("disable")
   		}
   	})
   		//检测提问输入框内变化
  	$(".question-edit").on("input propertychange","textarea",function(){
   		if($(this).val().length>0){
   			$(".question-edit").find(".sure-btn ").removeClass("disable")
   		}else{
   			$(".question-edit").find(".sure-btn ").addClass("disable")
   		}
   	})

});