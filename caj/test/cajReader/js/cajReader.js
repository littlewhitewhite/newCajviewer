$(function(){

	//工具栏
	$(".tool-list").on("click",".tool-item",function(){
		var index = $(this).index();
		if(index==0){
			$(".line-size").addClass("hide");
		}else if(index==1){
			$(".line-size").addClass("hide");
		}else if(index==2 || index==3 || index==4 || index==5){
			var top = $(this).get(0).offsetTop-$(this).height()/2
			console.log($(this).height())
			console.log(top)
			$(".line-size").removeClass("hide").css("top",top)
		}else if(index==6){
			$(".line-size").addClass("hide");
		}
		
	})
	//工具栏颜色线条大小
	$(".line-list").on("click",".line-size-item",function(){
		$(this).addClass("sel").siblings().removeClass("sel")
		var size = $(this).data("size")
		alert("线条粗细为"+size+"px")
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
	})
	//左侧目录隐藏按钮
	$(".one-left").on("click",".one-left-btn",function(){
		var $oneLeft = $(".one-left");
		var $this = $(this);
		if($this.hasClass("left-open")){
			$oneLeft.removeClass("one-left-hide");
			$this.removeClass("left-open");
		}else{
			$oneLeft.addClass("one-left-hide");
			$this.addClass("left-open");
		}
	})
		//右侧交流区隐藏按钮
	$(".one-right").on("click",".one-right-btn",function(){
		var $oneLeft = $(".one-right");
		var $this = $(this);
		if($this.hasClass("right-open")){
			$oneLeft.removeClass("one-right-hide");
			$this.removeClass("right-open");
		}else{
			$oneLeft.addClass("one-right-hide");
			$this.addClass("right-open");
		}
	})
	
	//顶部尺寸缩放点击事件
	//放大
	$(".size-btn-item").on("click",".size-up-btn",function(){
		var value = $("#sizeInput").val();
		value = parseInt(value.slice(0,-1))+10+"%";
		$("#sizeInput").val(value)
		
	})
	//缩小
	$(".size-btn-item").on("click",".size-down-btn",function(){
		var value = $("#sizeInput").val();
		value = parseInt(value.slice(0,-1))-10+"%";
		$("#sizeInput").val(value)
	})
	//下拉框
	$(".size-number-box").on("click",".number-select-btn",function(){
		$(".size-number-select").removeClass("hide")
	})
	//下拉框点击事件
	$(".select-number").on("click",".select-number-item",function(){
		$(this).addClass("number-selected").siblings().removeClass("number-selected");
		var value = $(this).html();
		$("#sizeInput").val(value)
		$(".size-number-select").addClass("hide")
	})
	//翻页箭头点击事件
	//上一页
	$(".center-progress").on("click",".progress-left-arrow",function(){
		var $input = $(".page-input").find("input");
		$(".progress-right-arrow").removeClass("page-disable")
	
		if($(this).hasClass("page-disable")){
			return
		}else{
			var num = $input.val();//获取值
			num = parseInt(num)-1
			$input.val(num);//
			if(num==1){
				$(".progress-left-arrow").addClass("page-disable")
			}else{
				$(".progress-left-arrow").removeClass("page-disable")
			}


		}
	})
	//下一页
	$(".center-progress").on("click",".progress-right-arrow",function(){
		var $input = $(".page-input").find("input");
		var maxNum = $(".page-count").find("span").html()
		$(".progress-left-arrow").removeClass("page-disable")
		
		if($(this).hasClass("page-disable")){
			return
		}else{
			var num = $input.val();//获取值
			num = parseInt(num)+1
			$input.val(num);//获取值
			if(num==parseInt(maxNum)){
				$(".progress-right-arrow").addClass("page-disable")
			}else{
				$(".progress-right-arrow").removeClass("page-disable")
			}
			
		}

	})



			
   var zTreeObj;
   // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
   var setting = {
   		view:{
   			showIcon: false,// 设置 zTree 不显示图标
   			showLine: false,//设置 zTree 不显示节点之间的连线
   			showTitle:false,//设置 zTree 不显示图标
   		}
   };
   // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
   var zNodes = [
   		{
	   		name:"摘要",
	   		title:"摘要",
//	   		open:false,
	   		isParent:false,
	   		
		},
		{
	   		name:"ABETRACT",
	   		title:"ABETRACT",
//	   		open:false,
	   		isParent:false
	   		
		},
	   	{
	   		name:"第一章 绪论",
	   		title:"第一章 绪论",
	   		open:true,
	   		children:[
		      {
		      	name:"1.1 选题的目的及意义",
		      	title:""
		      },
		      {
		      	name:"1.2 选题的目的及意义"
		      },
		      {
		      	name:"1.3 选题的目的及意义选题的目"
		      }
		    ]
		},
	    {
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
	   	{
		   	name:"第二章 绪论选题的目的及意义选题的目的及第二章 绪论选题的目的及意义选题的目的及", 
		   	open:true, 
		   	children:[
			      {
			      	name:"test2_1",
			      	children:[
			      		{
			      			name:"test2_1.1"
		      			},
		      			{
			      			name:"test2_1.2"
		      			}
			      	]
			      },
			      {name:"test2_2"}
		    ]
	   	},
    ];
    zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, zNodes);
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
    	if($(this).hasClass("added-flag")){
    		$(this).removeClass("added-flag")
    	}else{
    		$(this).addClass("added-flag")
    	}
    })
    //固定按钮点击事件
    $(".fixed-btn").on("click",function(){
    	if($(this).hasClass("fixed-sure")){
    		$(this).removeClass("fixed-sure")
    	}else{
    		$(this).addClass("fixed-sure")
    	}
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
    		$(".print-alert").removeClass("hide");
    		$(".search-moudle").addClass("search-hide");
    	}else if($(this).attr("id")=="searchControl"){//搜索
    		$(".search-moudle").removeClass("search-hide");
    		$(".exchange-block").addClass("exchange-hide");
    	}
    })
    //打印弹框点击事件
    $(".print-machine").on("click",function(){
    	$(".machine-box").removeClass("hide");
    })
    $(".machine-list").on("click",".machine-item",function(e){
    	e.stopPropagation()
    	$(this).addClass("machine-selected").siblings().removeClass("machine-selected")
    	var value = $(this).html();
    	$(".print-machine").find("span").html(value);
    	$(".machine-box").addClass("hide");
    })
    //打印机下拉框点击事件
  	$(".print-paper").on("click",function(){
    	$(".paper-list").removeClass("hide");
    })
    //纸张大小下拉框点击事件
    $(".paper-list").on("click",".paper-item",function(e){
    	e.stopPropagation()
    	$(this).addClass("paper-selected").siblings().removeClass("paper-selected")
    	var value = $(this).html();
    	$(".print-paper").find("span").html(value);
    	$(".paper-list").addClass("hide");
    })
    //打印质量下拉框点击事件
    $(".print-quality").on("click",function(){
    	$(".quality-list").removeClass("hide");
    })
    //打印质量下拉框点击事件
    $(".quality-list").on("click",".quality-item",function(e){
    	e.stopPropagation()
    	$(this).addClass("quality-selected").siblings().removeClass("quality-selected")
    	var value = $(this).html();
    	$(".print-quality").find("span").html(value);
    	$(".quality-list").addClass("hide");
    })
    //打印弹框显示信息点击事件
    $(".print-alert").on("click",".print-content-control",function(){
    	if($(".print-ohter-line").hasClass("hide")){
    		$(this).html("隐藏详细信息");
    		$(".print-ohter-line").removeClass("hide");
    	}else{
    		$(this).html("显示详细信息");
    		$(".print-ohter-line").addClass("hide")
    	}
    })
    //打印弹框取消按钮点击事件
    $(".print-alert").on("click",".print-cancel-btn",function(){
    	$(".print-alert").addClass("hide");
    	 $("#print").removeClass("selected")
    })
    //打印弹框确定按钮点击事件
    $(".print-alert").on("click",".print-sure-btn",function(){
	    	$(".print-alert").addClass("hide");
	    	$("#print").removeClass("selected")
	    	alert("确定打印")

    })
    //标注区域排序点击事件
    $(".order-select").on("click","span",function(){
    	$(this).addClass("selected").siblings().removeClass("selected");
    })
    //书签列表删除事件
    var currentMakingItem;
	$(".marking-list").on("click",".marking-item .marking-oprate-delete",function(e){
		e.stopPropagation();
		$(".marking-delete-alert").show()
		currentMakingItem = $(this).parents(".marking-item")
	})
	//书签列表弹框取消关闭点击事件
	$(".marking-delete-alert").on("click",".delete-alert-close,.cancel-del-btn",function(){
		$(".marking-delete-alert").hide();
	})
	//书签列表弹确定按钮点击事件
	$(".marking-delete-alert").on("click",".delete-alert-close,.sure-del-btn",function(){
		$(".marking-delete-alert").hide();
		currentMakingItem.remove()
	})
	//书签列表点击事件
	$(".marking-list").on("click",".marking-item",function(e){
		e.stopPropagation()
		$(this).addClass("focus")
		$(this).siblings().removeClass("focus");
		//编辑事件
		 var e = e || window.event; //浏览器兼容性
        var elem = e.target || e.srcElement;
        var editDom = $(this).get(0).getElementsByClassName(".marking-oprate-edit");
        if(elem.classList.contains("marking-oprate-edit")){
//      	var $mesg = $(this).find(".marking-mesg");
//			var $input_dom = $('<div class="text-box"> <textarea></textarea> </div>')
//			$input_dom.find("textarea").val($mesg.find(".mesg").text().trim())
//			var inputDom = $input_dom.find("textarea").get(0);
//			
//			inputDom.autofocus = true
//			inputDom.scrollTop = inputDom.scrollHeight;
////			inputDom.select()
//			$mesg.hide()
//			var newMesg = ""
//			$(this).find(".marking-item-sub").prepend($input_dom);
        if($(this).find(".text-box").length>0){
			setTimeout(function(){
    			$(this).find("textarea").focus();
			},1);

    	}else{
    		var $mesg = $(this).find(".marking-mesg");
			var $input_dom = $('<div class="text-box"> <textarea></textarea> </div>')
			$input_dom.find("textarea").val($mesg.find(".mesg").text().trim())
			var inputDom = $input_dom.find("textarea");
			setTimeout(function(){
				inputDom.focus();
			},1);
			
			inputDom[0].scrollTop = inputDom.scrollHeight;
//			inputDom.select()
			$mesg.hide()
			var newMesg = ""
			$(this).find(".marking-mesg").after($input_dom);
			inputDom[0].addEventListener("blur",function(){
				$(this).parents(".marking-item").removeClass("focus")
				var $mesg = $(this).parents(".marking-item").find(".marking-mesg");
		        var $input = $(this);
				var newMesg=$input.val();
				$input.parent().remove();
				if(newMesg.trim()!=""){
					$mesg.find(".mesg").text(newMesg.trim())
				}
				$mesg.show();
			})
    	}
			
			
        }

	})
//	$(".marking-list").on("blur",".marking-item",function(e){
////		e.stopPropagation()
//		$(this).removeClass("focus")
//      var $mesg = $(this).find(".marking-mesg");
//      var $input = $(this).find("textarea");
//		var newMesg=$input.val();
//		$input.parent().remove();
//		if(newMesg.trim()!=""){
//			$mesg.find(".mesg").text(newMesg.trim())
//		}
//		$mesg.show();
//		
//	})

	//书签内容标注鼠标移入事件
	$(".marking-list").on("mouseenter",".marking-item .flag",function(e){
		e.stopPropagation()
		var $parent_dom = $(this).parents(".marking-item");
		$parent_dom.siblings().find(".mesg-alert").remove()
		var $mesg = $parent_dom.find(".marking-mesg");
		var $input_dom = $('<div class="mesg-alert"><div class="mesg-alert-sub"><div class="mesg-alert-sj"></div><div class="mesg-alert-txt"></div></div></div>')
		var ss =$mesg.height()
		$input_dom.css({
			"top":$mesg.height()+21+"px",
			
		})
		$input_dom.find(".mesg-alert-txt").html($mesg.text())
		$parent_dom.prepend($input_dom)
		
	})
	//书签内容标注鼠标移出事件
	$(".marking-list").on("mouseleave",".marking-item .marking-mesg",function(e){
		e.stopPropagation()
		$(this).parents(".marking-item").find(".mesg-alert").remove();
		
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
		}else if(idx==2){//分屏
			$(".exchange-block").addClass("exchange-hide");
			if($(this).hasClass("full")){//分屏
				$(this).removeClass("full");
				alert("分屏")
			}else{//全屏
				$(this).addClass("full");
				alert("全屏")
			}
		}
    })
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
	
	//阅读选区内容操作
	rangy.init();
	
	var $contentArea = $("#contentArea");
	var $reader_opration = $("#reader_opration");
	var contentBox = document.getElementsByClassName("content-box")[0]
	
	line();
  	function gEBI(id) {
        return document.getElementById(id);
    }
  	//获取选区范围range对象
    function getFirstRange() {
        var sel = rangy.getSelection();
        return sel.rangeCount ? sel.getRangeAt(0) : null;
    }
  	//获取选区内容
  	function reportSelectionText() {
//		var range = getFirstRange();
        return rangy.getSelection().toString();
    }
   function cloneRange() {
        var range = getFirstRange();
        if (range) {
            showContent(range.cloneContents());
        }
    }
	function line(){
		
		var k_x,k_y;
		$contentArea.on("mousedown",function(ev){
			k_x = ev.pageX;
	        k_y = ev.pageY;
	        $("#hightLightColor").hide();
	    	$reader_opration.hide()
		})
		$contentArea.on("mouseup",function(evt){
	//  	$reader_opration.show()
	
	            var sel = getFirstRange();
	            if (!sel) {
	                return;
	            }
	
	            if (!window.okmsReadRangeAt) {
	                window.okmsReadRangeAt = {};
	            }
	
	            window.okmsReadRangeAt = sel; //保存的选中范围
	            var range = sel;
	
	            if (range.collapsed) {
	                return;
	            }
	
	            if (!$.trim(window.okmsReadRangeAt.toString())) {
	                return;
	            }
	
	//          window.InitData.content = window.okmsReadRangeAt.toString();  // 保存的选中范围到全局用于纠错

				 var wholeSelRect = rangy.getSelection().getBoundingDocumentRect();
	
	
	            if (!wholeSelRect) {
	                return;
	            }
	

	            var startPos = rangy.getSelection().getStartDocumentPos();

	            var endPos = rangy.getSelection().getEndDocumentPos();
	            var endPos555 = rangy.getSelection()
				var $reader_opration_width = $reader_opration.width();
//	            if((endPos.x-$reader_opration_width/2)<($reader_opration_width/2) && ($contentArea.width()-endPos.x)>($reader_opration_width/2)){//最左侧
//					$reader_opration.show().css({ 'top': endPos.y+"px", 'left': endPos.x+"px"});
//				}else if(($contentArea.width()-endPos.x)<($reader_opration_width/2)){//最右侧
//					$reader_opration.show().css({ 'top': endPos.y+"px", 'left': endPos.x-$reader_opration_width+"px"});
//				}else{//中间
//					$reader_opration.show().css({ 'top': endPos.y+"px", 'left': endPos.x-$reader_opration_width/2+"px"});
//					
//				}
				
	            if((endPos.x-$reader_opration_width/2)<($reader_opration_width/2) && ($contentArea.width()-endPos.x)>($reader_opration_width/2)){//最左侧
					$reader_opration.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x+"px"});
				}else if(($contentArea.width()-endPos.x)<($reader_opration_width/2)){//最右侧
					$reader_opration.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$reader_opration_width+"px"});
				}else{//中间
					$reader_opration.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$reader_opration_width/2+"px"});
					
				}
	
			
		});
		var clipboard = new ClipboardJS('#setCopy',{
				//复制文本
				text:function(trigger){
//					event.preventDefault()
//		            var userSelection = window.okmsReadRangeAt.toString();
		            var userSelection = reportSelectionText()
//		            console.log(window.okmsReadRangeAt.toString())

		            return userSelection;
				}
			});
			 clipboard.on('success', function(e) {
			 	  console.info('Action:', e.action);
			    console.info('Text:', e.text);
			    console.info('Trigger:', e.trigger);
			     $reader_opration.hide();
				 e.clearSelection(); //选中需要复制的内容
				 
//				 alert("复制成功！");

				$(".copy-alert").show().delay(1000).hide(0)
//				layer.msg('已复制', {icon: 1,time:100000});
			 });
			 clipboard.on('error', function(e) {
			 	$reader_opration.hide();

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
			console.log("提问");
			$reader_opration.hide();
		  	var endPos = rangy.getSelection().getEndDocumentPos();
			var $questionBox_width = $("#questionBox").width();
			var $questionBox = $("#questionBox");
            if((endPos.x-$questionBox_width/2)<($questionBox_width/2) && ($contentArea.width()-endPos.x)>($questionBox_width/2)){//最左侧
				$questionBox.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x+"px"});
			}else if(($contentArea.width()-endPos.x)<($questionBox_width/2)){//最右侧
				$questionBox.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$questionBox_width+"px"});
			}else{//中间
				$questionBox.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$questionBox_width/2+"px"});
			}
			 
			
		})
		//写批注
		$reader_opration.on("click","#markingDown",function(evt){
			console.log("写批注");
			$reader_opration.hide();
			$("#markingBox").show();
			var endPos = rangy.getSelection().getEndDocumentPos();
			var $markingBox_width = $("#markingBox").width();
			var $markingBox = $("#markingBox");
            if((endPos.x-$markingBox_width/2)<($markingBox_width/2) && ($contentArea.width()-endPos.x)>($markingBox_width/2)){//最左侧
				$markingBox.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x+"px"});
			}else if(($contentArea.width()-endPos.x)<($markingBox_width/2)){//最右侧
				$markingBox.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$markingBox_width+"px"});
			}else{//中间
				$markingBox.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$markingBox_width/2+"px"});
			}
			
		})
		
		//	高亮
//		var serializedHighlights = decodeURIComponent(window.location.search.slice(window.location.search.indexOf("=") + 1));
        var highlighter;
        (function(){
    	 	var range = getFirstRange();
        	highlighter = rangy.createHighlighter();
        	//划线
        	highlighter.addClassApplier(rangy.createClassApplier("note", {
                ignoreWhiteSpace: true,
                elementTagName: "markline",
                elementProperties: {
//                  class: "node",
//                  onclick: function() {
//                      var highlight = highlighter.getHighlightForElement(this);
//                      if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
//                          highlighter.removeHighlights( [highlight] );
//                      }
//                      return false;
                    }
               }))
        	
//

        })()

        var initialDoc;
        var saveHighlightRange = []
        //操作高亮点击事件
		$reader_opration.on("click","#setHighlight",function(evt){
			console.log(11111)
//			$("#hightLightColor").show()
			createHighlighter("high-light-yellow");
			highlighter.highlightSelection("high-light-yellow");
			console.log(highlighter)
			$reader_opration.hide()
		})
		//插入编辑的图标
	    function insertNodeAtRange() {
            var range = getFirstRange();
            if (range) {
                var el = document.createElement("mycon");
                el.classList.add("note-co-o");
                range.insertNode(el);
                rangy.getSelection().setSingleRange(range);
            }
        }
	    //创建高亮样式类名及标签
//	    var currentHighter
//	    var highlight;
	    
	 	function createHighlighter(className){
	 		highlighter.addClassApplier(rangy.createClassApplier(className, {
	            ignoreWhiteSpace: true,
	            elementTagName: "markline",
                elementProperties: {
//              	id
//                  class: "node",
                    onclick: function(e) {
//						console.log(e.target.parentNode())
						console.log($(this))
                        highlight = highlighter.getHighlightForElement(this);
                        console.log(highlight.getRange())
                        console.log(rangy.getSelection())
                        rangy.getSelection().setSingleRange(highlight.getRange())
//                      console.log(highlight)
//                  	rangy.getSelection().setSingleRange(highlight.characterRange)
	                  	var endPos = rangy.getSelection().getEndDocumentPos();
        				var $reader_opration_width = $reader_opration.width();
			            if((endPos.x-$reader_opration_width/2)<($reader_opration_width/2) && ($contentArea.width()-endPos.x)>($reader_opration_width/2)){//最左侧
								$reader_opration.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x+"px"});
						}else if(($contentArea.width()-endPos.x)<($reader_opration_width/2)){//最右侧
			//					$reader_opration.show().offset({ 'top': endPos.y, 'left': endPos.x-$reader_opration_width});
							$reader_opration.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$reader_opration_width+"px"});
						}else{//中间
			//				 	$reader_opration.show().offset({ 'top': endPos.y, 'left': endPos.x-$reader_opration_width/2});
							$reader_opration.show().css({ 'top': endPos.y+contentBox.scrollTop+"px", 'left': endPos.x-$reader_opration_width/2+"px"});
							
						}
//                      currentHighter = rangy.getSelection();
//                       currentHighter = getFirstRange();
//                      if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
//                          highlighter.removeHighlights( [highlight] );
//                      }
//						$reader_opration.show();
						$("#hightLightColor").show()
                        return false;
                    }
                }
	         
	        }));
	       
	 	}
		//高亮背景颜色点击事件
		$("#hightLightColor").on("click",".light-item",function(evt){

			var colorName = $(this).data("color");
			$("#hightLightColor").hide();
			$reader_opration.hide();
			createHighlighter(colorName);
//			colorName.applyToRange(currentHighter)
//			highlighter.removeHighlights( [highlight] )
//			highlight.Highlighters[highlight]
//			highlighter.highlightSelection(colorName);
//			var selection = rangy.getSelection().setSingleRange(currentHighter)
			highlighter.highlightSelection(colorName,{
//				selection:selection
			})
//			insertNodeAtRange()
			
		})
		//下划线
		$reader_opration.on("click","#setUnderline",function(evt){
			 highlighter.highlightSelection("note");
			 $reader_opration.hide();
			
		})
		//标注编辑，提问编辑，分享弹框关闭按钮点击事件
		$("#sharePlatformBox,#questionBox,#markingBox").on("click",".close-btn",function(){
			$(this).parent().parent().parent().hide()
		})
		
		//选区内容序列化，储存恢复
		//序列化选区内容
		var str= "";//序列化选区内容的字符串
	   	function serializeSelection() {
            str = rangy.serializeSelection();
           
        }
		//反序列化选区内容
        function deserializeSelection() {
            rangy.deserializeSelection(str);
        }
		$("#test1").on("click",function(){
			serializeSelection()
		})
		$("#test2").on("click",function(){
			deserializeSelection()
		})
		//保存高亮的序列化字符串
//		var highlighterstr = ""
//		highlighterstr = highlighter.serialize();
//		//反序列化高亮
//		if (serializedHighlights) {
//          highlighter.deserialize(serializedHighlights);
//      }
//      function restoreSelection() {
//          rangy.restoreSelectionFromCookie();
//      }
//
//      function saveSelection() {
//          rangy.saveSelectionCookie();
//      }
		
	}
	
	//问答列表喜欢点击事件
	$(".QA-ul").on("click",".QA-item",function(e){
		if(e.target.classList.contains("like-number")){
			e.stopPropagation();
			var $likeNumber = $(this).find(".like-number");
			if($likeNumber.hasClass("liked")){//取消点赞
				$likeNumber.removeClass("liked");
			}else{//点赞
				$likeNumber.addClass("liked");
			}
		}else{//点击点赞以外的区域跳转链接
			alert("此操作是跳转链接")
		}
	})
	//批注点赞点击事件
	$(".annotation-ul").on("click",".annotation-li",function(e){
		if(e.target.classList.contains("praise-number")){
			e.stopPropagation();
			var $praiseNumber = $(this).find(".praise-number");
			if($praiseNumber.hasClass("praised")){//取消点赞
				$praiseNumber.removeClass("praised");
			}else{//点赞
				$praiseNumber.addClass("praised");
			}
		}else{//点击点赞以外的区域跳转链接
			alert("此操作是跳转链接")
		}
	})
	//提问弹框发表到交流区点击事件
	$(".marking-edit").on("click",".send-radio",function(){
		if($(this).hasClass("radio-selected")){//不发表到交流区
			$(this).removeClass("radio-selected");
		}else{//发表到交流区
			$(this).addClass("radio-selected");
		}
	})

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