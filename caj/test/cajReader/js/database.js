window.addEventListener("load",function(){
				var oprateMenu = document.getElementsByClassName("oprate-menu")[0];
				//参数el是分组的列表的父元素的id
				var groupObj = function(el){
					this.el = el;
					this.dom = document.getElementById(el);
					this.children = this.dom.children;
					this.oprate()
				
				
				}
				//鼠标右键点击事件
				groupObj.prototype.whichButton=function(event){
					console.log(event)
					var btnNum = event.button;
					if (btnNum==2){
//						alert("您点击了鼠标右键！")
						var e = event
						
						//这个事件是阻止点击鼠标右键的时候默认事件的发生
						document.oncontextmenu = function(e){
						    e.preventDefault();
						}
						this.currentChildren = event.target;
						
							oprateMenu.classList.remove("hide")
							if(e.clientX<30){
								oprateMenu.style.left = e.clientX+"px"
							}else{
								oprateMenu.style.left = e.clientX-30+"px"
							}

							oprateMenu.style.top = e.clientY+20+"px"
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
				groupObj.prototype.oprate = function(){
					var doms = this.children;
					for(var i=0;i<doms.length;i++){
						groupObj = this
						doms[i].addEventListener("mousedown",function(){
							
							var e = event
							groupObj.whichButton(e)
							
//							
						})
					}
				
					
				}
				//添加分组
				groupObj.prototype.add = function(txt){
					var newChild = document.createElement("li")
					newChild.classList.add("group-item");
					newChild.innerHTML = txt;
					newChild.addEventListener("mousedown",function(){
					
						var e = event
						groupObj.whichButton(e)
						
//							
					})
					this.dom.appendChild(newChild)
					groupObj = this
					
				}
				//删除分组
				groupObj.prototype.delete = function(){
					oprateMenu.classList.add("hide");
					debugger
					this.dom.removeChild(this.currentChildren);
					
				}
				//重命名
				groupObj.prototype.changeContent = function(txt){
						oprateMenu.classList.add("hide");
					this.currentChildren.innerHTML = txt
				
				}
				//对象初始化
				var createGroup = new groupObj("group-box");
				//点击右键显示菜单的dom对象
//				var oprateMenu = document.getElementsByClassName("oprate-menu")[0];
				//添加事件
				document.getElementById("add-btn").onclick = function(){
					var newName = document.getElementById("input-box").value
					if(newName!=""){
						//参数传递添加新分组时候的的名字即显示的文字
						createGroup.add(newName)
					}
					
				}
				//重命名点击事件
				document.getElementById("renameMn").onclick = function(){
					//参数传递修改分组时候的的名字即显示的文字
					createGroup.changeContent("hhh")
					
				}
				//删除分组点击事件
				document.getElementById("deleteMn").onclick = function(){
					createGroup.delete()
					
				}
				//右侧分组菜单展开关闭时间
				document.getElementsByClassName("extend-btn")[0].onclick=function(){
					console.log(this)
//					var extendMenu = document.getElementsByClassName("extend-menu")[0];
					var extendMenu= document.getElementsByClassName("extend-block")[0];
					extendMenu.classList.add("animate__animated");
					if(this.classList.contains("open")){//关闭状态
						extendMenu.classList.remove("animate__fadeOutLeft")
						extendMenu.classList.add("animate__fadeInLeft");
						
						this.classList.remove("open")
						this.style.transform = "translate(175px)"
						
						this.style.webkitTransform = "translate(175px)"
					}else{//菜单打开状态
						this.classList.add("open")
						extendMenu.classList.remove("animate__fadeInLeft")
						extendMenu.classList.add("animate__fadeOutLeft");
						this.style.transform = "translate(0px)"
						this.style.webkitTransform = "translate(0px)"
					}

				}
				//最近文件点击打开事件
				document.getElementsByClassName("open-file-btn")[0].onclick=function(){
					var fileBlock= document.getElementsByClassName("file-area")[0];
					if(fileBlock.classList.contains("opened")){//打开状态
						fileBlock.classList.remove("opened")
						fileBlock.classList.remove("animate__fadeInRight")
						fileBlock.classList.add("animate__fadeOutRight");
					}else{//关闭状态
						fileBlock.classList.add("opened")
						fileBlock.classList.remove("animate__fadeOutRight")
						fileBlock.classList.add("animate__fadeInRight");
					}

				}
					//最近文件点击关闭事件
				document.getElementsByClassName("file-close")[0].onclick=function(){
					var fileBlock= document.getElementsByClassName("file-area")[0];
					if(fileBlock.classList.contains("opened")){//打开状态
						fileBlock.classList.remove("opened")
						fileBlock.classList.remove("animate__fadeInRight")
						fileBlock.classList.add("animate__fadeOutRight");
					}else{//关闭状态
						fileBlock.classList.add("opened")
						fileBlock.classList.remove("animate__fadeOutRight")
						fileBlock.classList.add("animate__fadeInRight");
					}

				}
				//分页
//				var page_box = document.getElementById('page-box')
//				var currentPageNumer = 1
//				page_box.addEventListener('click', function(event) {
//					var target = event.srcElement ? event.srcElement : event.target;
//					//总页数
//					var endPage = 15;
//					//当前页数
//					debugger
//					if(target.classList.contains("page-first") || target.classList.contains("page-number-first")){//首页
//						currentPageNumer =1
//						
//
//					}else if(target.classList.contains("page-end") || target.classList.contains("page-number-end")){//末页
//						currentPageNumer = endPage
//					}else if(target.classList.contains("page-last")){//上一页
//						debugger
//						if(currentPageNumer>1){
//							currentPageNumer = currentPageNumer-1;
//						}else{
//							return
//						}
//					}else if(target.classList.contains("page-next")){//下一页
//						debugger
//						if(currentPageNumer<15){
//							currentPageNumer = currentPageNumer+1;
//							
//						}else{
//							return
//						}
//
//					}else if(target.classList.contains("page-number")){
//						currentPageNumer = parseInt(target.getAttribute("data-page"));
//					}
//					
//					
//					var fontPoint = document.getElementById('font-point');
//					var afterPoint = document.getElementById('after-point');
//					var pageNumberList = document.getElementsByClassName("page-number");
//					if((currentPageNumer-1)>=4 && (endPage-currentPageNumer)>=4){
//						for(var i=0;i<pageNumberList.length;i++){
//							var currentPageBox = pageNumberList[i];
////					
//							var dataNumber = currentPageNumer-((pageNumberList.length-1)/2-i)
//							if((pageNumberList.length-1)/2==i){
//								dataNumber = currentPageNumer
//								
//							}
//							currentPageBox.setAttribute("data-page",dataNumber)
//							currentPageBox.innerHTML = dataNumber
//						}
//					}else if((currentPageNumer-1)<4 ){
//						for(var i=0;i<pageNumberList.length;i++){
//							var currentPageBox = pageNumberList[i];
//							
//							var dataNumber = 1+(i+1)
//
//							currentPageBox.setAttribute("data-page",dataNumber)
//							currentPageBox.innerHTML = dataNumber
//						}
//					}else{
//						for(var i=0;i<pageNumberList.length;i++){
//							var currentPageBox = pageNumberList[i];
//							
//							var dataNumber = endPage-(pageNumberList.length-i)
//
//							currentPageBox.setAttribute("data-page",dataNumber)
//							currentPageBox.innerHTML = dataNumber
//						}
//					}
//					if((currentPageNumer-1)>=4){
//						fontPoint.classList.remove("hide")
//					}else{
//						fontPoint.classList.add("hide")
//					}
//					if((endPage-currentPageNumer)>=4){
//						afterPoint.classList.remove("hide");
//					}else{
//						afterPoint.classList.add("hide")
//					}
//				
//					//样式改变
//					
//					var children = document.getElementsByClassName('page-numger-area')[0].children
//					for(var i=0;i<children.length;i++){
//						if(children[i].getAttribute("data-page")!=currentPageNumer){
//							children[i].classList.remove("selected");
//							
//						}else{
//							children[i].classList.add("selected");
//						}
//
//					}
//						
//				},false);
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
				var clear_btn = document.getElementsByClassName("clear-btn")[0];
				//输入框
				var search_input = document.getElementById("searchInput");
				function inputChange(){
					if(search_input.value != ""){
						clear_btn.classList.remove("hide")
					}else{
						clear_btn.classList.add("hide")
					}
				}
				search_input.addEventListener("input",inputChange)
				search_input.addEventListener("porpertychange",inputChange)
				//轻输入框清空按钮
				clear_btn.addEventListener("click",function(){
					search_input.value = "";
					clear_btn.classList.add("hide")
				})
				
			})