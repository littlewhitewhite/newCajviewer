
window.addEventListener("load", function () {
	var oprateMenu = document.getElementsByClassName("oprate-menu")[0];
	//参数el是分组的列表的父元素的id
	var groupObj = function (el) {
		this.el = el;
		this.dom = document.getElementById(el);
		this.children = this.dom.children;
		this.oprate()


	}
	//鼠标右键点击事件
	groupObj.prototype.whichButton = function (event) {
		console.log(event)
		var btnNum = event.button;
		if (btnNum == 2) {
			//						alert("您点击了鼠标右键！")
			var e = event

			//这个事件是阻止点击鼠标右键的时候默认事件的发生
			document.oncontextmenu = function (e) {
				e.preventDefault();
			}
			var elem = event.target;
			while (elem) { //循环判断至跟节点，防止点击的是div子元素
				if (elem.className && elem.className == 'group-item') {
					this.currentChildren = elem;
					break;
				}
				elem = elem.parentNode;
			}


			oprateMenu.classList.remove("hide")
			if (e.clientX < 30) {
				oprateMenu.style.left = e.clientX + "px"
			} else {
				oprateMenu.style.left = e.clientX - 30 + "px"
			}

			oprateMenu.style.top = e.clientY + 20 + "px"
		}
		/*else if(btnNum==0){
			alert("您点击了鼠标左键！")
		}else if(btnNum==1){
			alert("您点击了鼠标中键！");
			
		}else{
			alert("您点击了" + btnNum+ "号键，我不能确定它的名称。");
		}*/
	}
	//给每个子元素添加右键点击事件
	groupObj.prototype.oprate = function () {
		var doms = this.children;
		for (var i = 0; i < doms.length; i++) {
			groupObj = this
			doms[i].addEventListener("mousedown", function () {

				var e = event
				groupObj.whichButton(e)

				//							
			})
		}


	}
	//添加分组
	groupObj.prototype.add = function (num) {
		//新建分组数字
		if (!num) {
			num = 0
		}
		var newChild = document.createElement("li")
		newChild.classList.add("group-item");
		var txt = "<label>新建分组</label><span>(" + num + ")</span>"
		newChild.innerHTML = txt;
		newChild.addEventListener("mousedown", function () {

			var e = event
			groupObj.whichButton(e)

			//							
		})
		this.currentChildren = newChild;
		this.changeContent(1)
		this.dom.appendChild(newChild)
		//					groupObj = this
		newChild.getElementsByTagName("input")[0].autoFocus = true;
		newChild.getElementsByTagName("input")[0].focus()

	}
	//删除分组
	groupObj.prototype.delete = function () {
		oprateMenu.classList.add("hide");
		this.dom.removeChild(this.currentChildren);

	}
	//重命名
	groupObj.prototype.changeContent = function (idxtype) {
		var label = this.currentChildren.getElementsByTagName("label")[0]
		var span = this.currentChildren.getElementsByTagName("span")[0]
		var name = label.innerHTML;
		label.classList.add("hide");
		span.classList.add("hide");
		oprateMenu.classList.add("hide");
		this.createInput(name, this.currentChildren, idxtype)

	}
	groupObj.prototype.getNamesByGroup = function () {
		var items = this.dom.getElementsByClassName("group-item");
		var mns = document.getElementsByClassName("mn-item");
		var names = [];
		for (var i = 0; i < mns.length; i++) {
			names.push(mns[i].getElementsByTagName("label")[0].innerText)
		}
		for (var i = 0; i < items.length; i++) {
			names.push(items[i].getElementsByTagName("label")[0].innerText)

		}
		return names;
	}
	//创建重命名的搜索框
	groupObj.prototype.createInput = function (name, liDom, idxtype) {
		var inputBox = document.createElement("div");
		inputBox.classList.add("input-box");
		var clearBtn = document.createElement("div");
		clearBtn.classList.add("input-clear-btn")
		var input = document.createElement("input");
		input.value = name;


		inputBox.appendChild(input);
		inputBox.appendChild(clearBtn);
		liDom.appendChild(inputBox)
		liDom.getElementsByTagName("input")[0].autofocus = true
		liDom.getElementsByTagName("input")[0].focus()
		function blurChange() {
			var elem = event.srcElement || event.target;
			liDom.getElementsByTagName("label")[0].innerHTML = this.value;
			liDom.getElementsByTagName("label")[0].classList.remove("hide");
			liDom.getElementsByTagName("span")[0].classList.remove("hide");
			this.parentNode.remove();
		}
		var names = this.getNamesByGroup()
		clearInput(input, clearBtn, idxtype);

		input.addEventListener("focusout", blurChange);


		function clearInput(search_input, clear_btn, idxtype) {
			var errorTip = document.createElement("div");
			errorTip.classList.add("error-tip");
			errorTip.innerText = "分组名称重复"
			function inputChange() {
				if (search_input.value != "") {
					clear_btn.classList.remove("hide")
				} else {
					clear_btn.classList.add("hide")
				}
				var idx = -1
				if (names && names.length > 0) {
					var idx = names.indexOf(search_input.value)
				}

				if (idx < 0 || (!idxtype && search_input.value == name)) {
					errorTip.remove()

				} else {
					//命名重复
					liDom.appendChild(errorTip);
				}

			}
			inputChange()
			search_input.addEventListener("input", inputChange)
			search_input.addEventListener("porpertychange", inputChange)
			//轻输入框清空按钮
			clear_btn.addEventListener("mousedown", function (e) {
				e.preventDefault()
				e.stopPropagation()
				search_input.value = "";
				search_input.autofocus = true;
				search_input.focus()
				clear_btn.classList.add("hide")

			})
		}
	}

	//对象初始化
	var createGroup = new groupObj("group-box");
	//点击右键显示菜单的dom对象
	//				var oprateMenu = document.getElementsByClassName("oprate-menu")[0];
	//添加事件
	document.getElementById("add-btn").onclick = function () {
		//					if(newName!=""){
		//						//参数传递添加新分组时候的的名字即显示的文字
		//						
		//					}
		//新建分组所含有的文献数量

		// createGroup.add(20)

	}
	//重命名点击事件
	document.getElementById("renameMn").onclick = function () {
		//参数传递修改分组时候的的名字即显示的文字
		createGroup.changeContent();


	}
	//删除分组点击事件
	document.getElementById("deleteMn").onclick = function () {
		createGroup.delete()

	}
	//右侧分组菜单展开关闭时间
	document.getElementsByClassName("extend-btn")[0].onclick = function () {
		// console.log(this)
		//					var extendMenu = document.getElementsByClassName("extend-menu")[0];
		if (!inEditMode()) {
			var extendMenu = document.getElementsByClassName("extend-block")[0];
			if (this.classList.contains("open")) {//关闭状态
				extendMenu.classList.remove("extend-block-hide")

				this.classList.remove("open")
				//						
			} else {//菜单打开状态
				extendMenu.classList.add("extend-block-hide")
				this.classList.add("open")
			}
		}
	}
	//最近文件点击打开事件
	var file_btn = document.getElementsByClassName("file-control-btn")[0]
	var left_content = $(".entire-left")
	file_btn.onclick = function () {
		var fileBlock = document.getElementsByClassName("entire-right")[0];
		if (fileBlock.classList.contains("opened")) {//打开状态
			fileBlock.classList.remove("opened")
			//						fileBlock.classList.remove("animate__fadeInRight")
			//						fileBlock.classList.add("animate__fadeOutRight");
			file_btn.classList.add("file-control-open");
			$(file_btn).css("right", "0");
			left_content.css("width", "100%")
			$(fileBlock).css("width", "0%")
		} else {//关闭状态
			fileBlock.classList.add("opened")
			//						fileBlock.classList.remove("animate__fadeOutRight")
			//						fileBlock.classList.add("animate__fadeInRight");
			file_btn.classList.remove("file-control-open");
			$(file_btn).css("right", "242px");
			left_content.css("width", "auto")
			$(fileBlock).css("width", "255px")
		}

	}

	//分页

	//分页回调函数
	//				function pageChange(currentPageNumer,pageNumber){
	//					console.log("当前页码："+currentPageNumer)
	//					console.log("总页码："+pageNumber)
	//				}
	//				//分页参数d
	//				var pageOpt = {
	//					"elem":"page-box",//分页容器的Id
	//					"endPage":9,//分页总页数
	//					"currentPageNumber":5,//当前页码
	//					"onchange":pageChange,//回调函数
	//				}
	//				var pageView = new Page(pageOpt)



	//搜索框时事件
	//搜索框清按钮
	// var clear_btn = document.getElementsByClassName("clear-btn")[0];
	//输入框
	var search_input = document.getElementById("searchInput");
	clearInput1(search_input);
	function clearInput1(input) {
		function inputChange() {
			// if(search_input.value != ""){
			// 	clear_btn.classList.remove("hide")
			// }else{
			// 	clear_btn.classList.add("hide")
			// }
			search(input.value);
		}
		input.addEventListener("input", inputChange)
		input.addEventListener("porpertychange", inputChange)
		//轻输入框清空按钮
		// clear_btn.addEventListener("click",function(){
		// 	search_input.value = "";
		// 	clear_btn.classList.add("hide")
		// 	search('');
		// })
	}
	//交流区展开
	// $(".down-list").on("click", ".down-item .exchange-icon", function () {
	// 	$(".exchange-block").removeClass("exchange-hide");
	// })
	//问答批注菜单切换事件
	$(".exchnge-menu").on("click", "li", function () {
		var idx = $(this).index()
		$(this).addClass("exchage-selected").siblings().removeClass("exchage-selected");
		var dis = $(this).position().left + "px"
		$(".slider").eq(0).css("left", dis);
		if (idx == 0) {
			$(".QA-content").removeClass("hide")
			$(".annotations-content").addClass("hide")
		} else {
			$(".annotations-content").removeClass("hide")
			$(".QA-content").addClass("hide")
		}
	})
	//交流区域关闭
	$(".exchange-block").on("click", ".exchange-close", function () {
		$(".exchange-block").addClass("exchange-hide")
	})
	//问答列表喜欢点击事件
	// $(".QA-ul").on("click", ".QA-item", function (e) {
	// 	if (e.target.classList.contains("like-number")) {
	// 		e.stopPropagation();
	// 		var $likeNumber = $(this).find(".like-number");
	// 		const { ipcRenderer } = require('electron');
	// 		let questionid = $likeNumber.attr("data-file-question-is-collected");
	// 		console.log("questionid:", questionid);
	// 		if ($likeNumber.hasClass("liked")) {//取消点赞
	// 			ipcRenderer.send("database-question-remove-collected", questionid);
	// 			$likeNumber.removeClass("liked");
	// 		} else {//点赞
	// 			ipcRenderer.send("database-question-add-collected", questionid);
	// 			$likeNumber.addClass("liked");
	// 		}
	// 	} else {//点击点赞以外的区域跳转链接
	// 		alert("此操作是跳转链接")
	// 	}
	// })
	// //批注点赞点击事件
	// $(".annotation-ul").on("click", ".annotation-li", function (e) {
	// 	if (e.target.classList.contains("praise-number")) {
	// 		e.stopPropagation();
	// 		var $praiseNumber = $(this).find(".praise-number");
	// 		let annotationid = $praiseNumber.attr("data-file-annotation-id-praised");
	// 		let fileid = $praiseNumber.attr("data-file-id-praised");
	// 		const { ipcRenderer } = require('electron');
	// 		if ($praiseNumber.hasClass("praised")) {//取消点赞
	// 			ipcRenderer.send("database-annotation-remove-praised", fileid, annotationid);
	// 			$praiseNumber.removeClass("praised");
	// 		} else {//点赞
	// 			ipcRenderer.send("database-annotation-add-praised", fileid, annotationid);
	// 			$praiseNumber.addClass("praised");
	// 		}
	// 	} else {//点击点赞以外的区域跳转链接
	// 		alert("此操作是跳转链接")
	// 	}
	// })
	$("#database-edit").on("click", (e)=>{
		//const{remote } = require("electron");
		//console.log("database-is-reading-mode:", remote.getGlobal("database").is_reading_mode );
		if(!inEditMode()){
			setInEditMode(true);
			// $(".down-item").addClass("hasCheck");
			// $(".down-item div[class='checkbox']").show()
			// $("#database-edit").text("完成");
			$(".alert-model").removeClass("hideInBottom")
			setupEditableDownList();
			var extendMenu = document.getElementsByClassName("extend-block")[0];
			extendMenu.classList.add("extend-block-hide");
			document.getElementsByClassName("extend-btn")[0].classList.add("open");
		}
		
		//console.log("database-is-reading-mode:", remote.getGlobal("database").is_reading_mode );
		// $(".down-list input[type='checkbox']").toggle()
	})
	$("#database-finish").on("click", (e)=>{
		// setInEditMode(false);
		$(".alert-model").addClass("hideInBottom")
		resetDownList();
		setInEditMode(false);
		initBooks(false);
	})
	var $select_all = $("#select-all");
	$select_all.on("click", (e)=>{
		var $btn = $select_all.children();
		var a = $btn.attr("selected");
		$btn.attr("selected", !a);
		// if (!a) {
		// 	$select_all.children().text("取消")
		// 	$select_all.attr("select-all", true);
		// } else {
		// 	$select_all.attr("select-all", null);
		// 	$select_all.children().text("全选")
		// }
		selectAll(!a);
	})
	$("#delete-select").on("click", (e)=>{
		deleteSelect();
	});
	$("#delete-select-file").on("click", (e)=>{
		deleteSelectFile();
	});
	$("#move-to").on("click", (e)=>{
		selectMoveTo();
	});
	$("#edit-database").removeClass("hide");
	$("#all-count-2").on("click", ()=>{
		$("#extend-block").addClass("extend-block-hide");
		$("#extend-btn").addClass("open");
		selectTagOrCategory();
	})
	addCategory();
	initRecentFileList();
	initBooks();
})