var Page = function(opt){
	this.default = {
		"elem":"page-box",//分页容器的Id
		"endPage":15,//分页总页数
		"currentPageNumber":1,//当前页码
		"onchange":null,//回调函数
	}
	for(var key in opt){
		this.default[key] = opt[key]
	}
	this.init()
}
Page.prototype= {
	//按钮启用
	enable:function(dom){
		dom.classList.remove("disable")
	},
	//按钮禁用
	disable:function(dom){
		dom.classList.add("disable");
	},
	
	//分页
	
	init:function(){
		
		var page_box = document.getElementById(this.default.elem)
		var currentPageNumber = this.default.currentPageNumber;
		var endPage = this.default.endPage  
		this.createPage(endPage);
		var first_btn = document.getElementsByClassName("page-first")[0];//首页按钮
		var end_btn = document.getElementsByClassName("page-end")[0];//末页按钮
		var page_last = document.getElementsByClassName("page-last")[0];//上一页按钮
		var page_next = document.getElementsByClassName("page-next")[0];//下页按钮
		//设置末页数字页码属性
		document.getElementsByClassName("page-number-end")[0].setAttribute("data-page",endPage);
		document.getElementsByClassName("page-number-end")[0].innerHTML = endPage;
		if(currentPageNumber == 1){//如果当前页码为首页禁用首页按钮
			this.disable(first_btn);
			this.disable(page_last);
		}else if(currentPageNumber==endPage){//如果当前末页码为首页禁用末页按钮
			this.disable(end_btn);
			this.disable(page_next);
		}
		
		this.pageChange(this.default.currentPageNumber);
		//分页点击事件
		var page = this;
		page_box.addEventListener('click', function(event) {
			var target = event.srcElement ? event.srcElement : event.target;
	
			//当前页数
			
			if(target.classList.contains("page-first") || target.classList.contains("page-number-first")){//首页
				currentPageNumber = 1
	
			}else if(target.classList.contains("page-end") || target.classList.contains("page-number-end")){//末页
				currentPageNumber = endPage
				
			}else if(target.classList.contains("page-last")){//上一页
				
				if(currentPageNumber>1){
					currentPageNumber = currentPageNumber-1;
				}
			}else if(target.classList.contains("page-next")){//下一页
				if(currentPageNumber<endPage){
					currentPageNumber = currentPageNumber+1;
				}
	
			}else if(target.classList.contains("page-number")){
				currentPageNumber = parseInt(target.getAttribute("data-page"));
			}
			if(currentPageNumber==endPage){
				page.disable(end_btn)
				page.disable(page_next)
				page.enable(first_btn)
				page.enable(page_last)
				
			}else if(currentPageNumber==1){
				page.enable(end_btn)
				page.enable(page_next)
				page.disable(first_btn)
				page.disable(page_last)
			}else{
				page.enable(end_btn)
				page.enable(page_next)
				page.enable(first_btn)
				page.enable(page_last)
			}
			page.pageChange(currentPageNumber)
				
		},false);
	},
	createPage:function(number){
		var pageParent = document.getElementsByClassName('page-numger-area')[0];
		
		for(var i=0;i<number;i++){
			var pageNumberItem = document.createElement("div");
			if(i==0){
				pageNumberItem.classList.add("page-number-first")
			}else if(i==number-1){
				pageNumberItem.classList.add("page-number-end")
			}else{
				pageNumberItem.classList.add("page-number")
			}
			pageNumberItem.setAttribute("data-page",i+1);
			pageNumberItem.innerHTML = i+1;
			if(i==1 && number>7){
				var font_point = document.createElement("div");
				font_point.classList.add("more-point","hide")
				
				font_point.setAttribute("id","font-point");
				font_point.innerHTML = "..."
				pageParent.appendChild(font_point)
			}else if(i==number-1 && number>7){
				var after_point = document.createElement("div");
				after_point.classList.add("more-point","hide");
				after_point.setAttribute("id","after-point");
				after_point.innerHTML = "..."
				pageParent.appendChild(after_point)
			}
			pageParent.appendChild(pageNumberItem)
			
		}
		
		
		
	},
	//逻辑变化
	pageChange:function(currentPageNumber){
		this.default.currentPageNumber = currentPageNumber;
		var onchange = this.default.onchange;
		var endPage = this.default.endPage
		if(onchange && (typeof onchange=="function")){
			onchange(currentPageNumber,endPage)//回调函数，返回当前页码跟总页数
		}
//		中间页码的显示逻辑
		if(endPage>7){
			var fontPoint = document.getElementById('font-point');
			var afterPoint = document.getElementById('after-point');
			var pageNumberList = document.getElementsByClassName("page-number");
			if((currentPageNumber-1)>=4 && (endPage-currentPageNumber)>=4){
				for(var i=0;i<pageNumberList.length;i++){
					var currentPageBox = pageNumberList[i];
	//					
					var dataNumber = currentPageNumber-((pageNumberList.length-1)/2-i)
					if((pageNumberList.length-1)/2==i){
						dataNumber = currentPageNumber
						
					}
					currentPageBox.setAttribute("data-page",dataNumber)
					currentPageBox.innerHTML = dataNumber
				}
			}else if((currentPageNumber-1)<4 ){
				for(var i=0;i<pageNumberList.length;i++){
					var currentPageBox = pageNumberList[i];
					
					var dataNumber = 1+(i+1)
	
					currentPageBox.setAttribute("data-page",dataNumber)
					currentPageBox.innerHTML = dataNumber
				}
			}else{
				for(var i=0;i<pageNumberList.length;i++){
					var currentPageBox = pageNumberList[i];
					
					var dataNumber = endPage-(pageNumberList.length-i)
	
					currentPageBox.setAttribute("data-page",dataNumber)
					currentPageBox.innerHTML = dataNumber
				}
			}
			//前后页码省略显示的逻辑
			if((currentPageNumber-1)>=4){
				fontPoint.classList.remove("hide")
			}else{
				fontPoint.classList.add("hide")
			}
			if((endPage-currentPageNumber)>=4){
				afterPoint.classList.remove("hide");
			}else{
				afterPoint.classList.add("hide")
			}
	
		}
	
		//样式改变
		
		var children = document.getElementsByClassName('page-numger-area')[0].children
		for(var i=0;i<children.length;i++){
			if(children[i].getAttribute("data-page")!=currentPageNumber){
				children[i].classList.remove("selected");
				
			}else{
				children[i].classList.add("selected");
			}

		}
	}
	
				
}
