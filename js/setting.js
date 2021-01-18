const { read } = require("fs");
const crypto = require("crypto");
const { ipcRenderer } = require("electron");
$(function() {
	$("#app-version").text("Version: " + require('electron').remote.app.getVersion());
	//日历
	//执行一个laydate实例
	laydate.render({
		elem: '#calendar' //指定元素
	});
	/*头像上传*/
	var CROPPER; //创建一个cropper的全局对象 
	var croppable = false;
	var result = document.getElementById('previewBox');
	var imagefile;
	function loadingImg(eve) {
		$("#save-image").removeClass("btn-disable");
		if(CROPPER) {
			CROPPER.destroy()
		}
		//读取上传文件
		
		let reader = new FileReader();
		if(event.target.files[0]) {
			imagefile = event.target.files[0];
			//readAsDataURL方法可以将File对象转化为data:URL格式的字符串（base64编码）
			reader.readAsDataURL(imagefile);
			reader.onload = (e) => {
				let dataURL = reader.result;
				//将img的src改为刚上传的文件的转换格式
				document.querySelector('#cropImg').src = dataURL;
				var minAspectRatio = 0.5;
				var maxAspectRatio = 1.5;
				var image = document.getElementById('cropImg');

				//创建cropper实例-----------------------------------------
				CROPPER = new Cropper(image, {
					aspectRatio: 16 / 16,
					viewMode: 1,
					minContainerWidth: 144,
					minContainerHeight: 144,
					//			                dragMode:'move',
					ready: function() {
						croppable = true;
						//					   
					},
					//					
					//					       

				})
			}
		}
	}

	function getRoundedCanvas(sourceCanvas) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		var width = sourceCanvas.width;
		var height = sourceCanvas.height;

		canvas.width = width;
		canvas.height = height;
		context.imageSmoothingEnabled = true;
		context.drawImage(sourceCanvas, 0, 0, width, height);
		//		      context.globalCompositeOperation = 'destination-in';
		//		      context.beginPath();
		//		      context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
		//		      context.fill();
		return canvas;
	}
	//头像上传点击事件
	$("#imgReader").on("change", loadingImg)
	function calcSHA1(string) {
		var hash = crypto.createHash("sha1");
		if (typeof(string) == 'string') {
		  hash.update(string, "utf8");
		} else {
		  hash.update(string);
		}
		return hash.digest("hex");
	  }
	  
	//头像上传弹框保存事件
	$(".head-sure").on("click", function() {
		var croppedCanvas;
		var roundedCanvas;
		var roundedImage;
		if(!croppable) {
			return;
		}
		window.parent.showWaitingDialog('上传中...');
		// Crop
		croppedCanvas = CROPPER.getCroppedCanvas();
		croppedCanvas.toBlob(function(blob) {
			let reader = new FileReader();
			reader.readAsArrayBuffer(blob);
			reader.onload = (e) => {
				var data = Buffer.from(reader.result);
				var sha1 = calcSHA1(data);
				var boundary = '----' + Date.now();
				var contentType = "multipart/form-data; boundary=" + boundary;
				var fileFormdataTemplate =
				'--' + boundary + '\r\n' + 
				'Content-Disposition: form-data; name="img"; filename="upload.png"\r\n' +
				'Content-Type: application/octet-stream\r\n' +
				'Content-Transfer-Encoding: binary\r\n\r\n';
				var buffer = Buffer.from(fileFormdataTemplate);
				var buffer1 = Buffer.from("\r\n--" + boundary + "--\r\n\r\n");
				var formdata = Buffer.concat([buffer, data, buffer1])

				window.parent.uploadHeadImage(contentType, formdata, data, sha1, (imageurl)=>{
					if (imageurl) {
						userinfo.imageurl = imageurl.replace(/[\\\/]/g, "@");
						if (saveUserInfo()) {
							window.parent.closeWaitingDialog();
							window.parent.showToast('上传成功', true);
							roundedCanvas = getRoundedCanvas(croppedCanvas);
							roundedImage = document.createElement('img');
							roundedImage.src = roundedCanvas.toDataURL()
							result.innerHTML = '';
							result.appendChild(roundedImage);
							$("#upload-image-overlay").addClass("hide");
							window.parent.getUserHeadImage(0, window.parent.getLoginUserName());
						} else {
							window.parent.closeWaitingDialog();
							window.parent.showToast('上传失败');
						}
					} else {
						window.parent.closeWaitingDialog();
						window.parent.showToast('上传失败');
					}
				});
			};
			
		})
	});
	//修改头像点击事件
	$(".head-change").on("click",function(){
		$("#upload-image-overlay").removeClass("hide");
		
	})
	
	//个人信息保存点击事件
	$(".model-btn").on("click",function(){
		var basicModel = $("#basicModel");
		var loadingIcon = $("#saveloding");
		if($(this).hasClass("edit")){
			if (saveUserInfo()) {
				$(this).html("编辑")
				$(this).removeClass("edit")
				loadingIcon.removeClass("hide")
				basicModel.find(".input-box,.radio-box").addClass("hide");
				basicModel.find(".input-txt").removeClass("hide")
		
				var timeOutLoading = setTimeout(function(){
					loadingIcon.addClass("hide");
					clearTimeout(timeOutLoading );
				},1000)
			} else {
				window.parent.showToast('保存失败')
			}
		}else{
			$(this).html("保存")
			$(this).addClass("edit")
			basicModel.find(".input-box,.radio-box").removeClass("hide");
			basicModel.find(".input-txt").addClass("hide")
		}
		
	})
	//手机号点击修改事件
	$("#resetTel,#newSetTel").on("click",function(){
		//$("#telBox").removeClass("hide")
		$("#bind-mobile-overlay").removeClass("hide")
		$input_mobile.focus();
	})
	var $send_code = $("#send-identify-code");
	var $input_mobile = $("#input-mobile");
	$input_mobile.on("input", (e)=>{
		var mobile = $input_mobile.val();
		if (/^1[3-9]{1}[0-9]{9}$/.test(mobile)) {
			//var regex = "^1(3([0-35-9]\\d|4[1-8])|4[14-9]\\d|5([0-35689]\\d|7[1-79])|66\\d|7[2-35-8]\\d|8\\d{2}|9[13589]\\d)\\d{7}$";
			$send_code.removeClass("code-disable");
		} else {
			if (!$send_code.hasClass("code-disable")) {
				$send_code.addClass("code-disable");
			}
		}
	})
	var $do_bind = $("#do-bind");
	var $input_identify_code = $("#input-identity-code");
	$input_identify_code.on("input", (e)=>{
		if (identify_code_send_success && $input_identify_code.val().length == 6) {
			$do_bind.removeClass("btn-disable");
		} else {
			if (!$do_bind.hasClass("btn-disable")) {
				$do_bind.addClass("btn-disable");
			}
		}
	})
	//发送验证码倒计时
	var my_mobile;
	var identify_code;
	
	var identify_code_send_success = false;
	$send_code.on("click",function(){
		if($send_code.hasClass("code-disable")) {
			return;
		} else {
			identify_code_send_success = false;
			$("#error-message").text('');
			my_mobile = $input_mobile.val();
			$send_code.addClass("code-disable");
			var value = window.parent.sendIdentifyCode(my_mobile);
			if (value) {
				if (value.result) {
					var num = 60;
					// 倒计时
					var ds = setInterval(function() {
						num--;
						$send_code.html(num+"S");
						if(num == 0){
							$send_code.removeClass("code-disable")
							$send_code.html("重新发送");
							clearInterval(ds);
						}else if(num==59){
							$send_code.addClass("code-disable")
						}
					},1000);
					identify_code_send_success = true;
					identify_code = value.identid;
				} else {
					$send_code.removeClass("code-disable")
					if (Number(value.errorcode) == 5339) {
						$("#error-message").text('发送失败, 手机号码已被绑定。');
					} else {
						$("#error-message").text('发送失败(code=' + value.errorcode + ')。');
					}
				}
			} else {
				$send_code.removeClass("code-disable")
			}
			console.log(value);
		}
	})
	$do_bind.on("click", (e)=>{
		var value = window.parent.bindMobile(my_mobile, identify_code, $input_identify_code.val());
		if (value && value.result) {
			window.parent.showToast("绑定成功！", true);
			setBindMobile(true, my_mobile);
			$(".overlay").addClass("hide");
		} else {
			window.parent.showToast("绑定失败！", false);
		}
	})
	//设置密码点击事件
	$("#newSetPwd").on("click",function(){
		$("#newPwdBox").removeClass("hide")
	})
	//修改密码点击事件
	$("#resetPwd").on("click",function(){
		//$("#resetPwdBox").removeClass("hide")
		$("#change-password-overlay").removeClass("hide")
		$("#resetPwdBox").find("input").val('');
		$origin_password.focus();
	})
	var $origin_password = $("#origin-password");
	var $new_password = $("#new-password");
	var $new_password_confirm = $("#new-password-confirm");
	var $change_password = $("#change-password");
	$change_password.on('click', (e)=>{
		var new_password = $new_password.val();
		var new_password_confirm = $new_password_confirm.val();
		if (new_password != new_password_confirm) {
			$("#change-password-message").text("两次输入的密码不一致")
			return;
		}
		var regex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,20}');
		if (!regex.test(new_password)) {
			$("#change-password-message").text("密码中必须包含字母、数字、特殊字符，至少8个字符，最多20个字符")
			return;
		}
		var result = window.parent.changePassword($origin_password.val(), new_password);
		console.log(result);
		if (result) {
			if (result.result) {
				window.parent.showToast("密码修改成功，请重新登录", true);
				$("#change-password-overlay").addClass("hide");
				window.parent.logout();
			} else {
				$("#change-password-message").text(`修改密码失败, ${result.message}`);
			}
		} else {
			$("#change-password-message").text("修改密码失败，错误未知");
		}
	})
	function passwordInput(e) {
		$("#change-password-message").text('');
		if ($new_password.val().length >= 8 && $new_password_confirm.val().length >= 8) {
			$change_password.removeClass("btn-disable");
		} else {
			$change_password.addClass("btn-disable");
		}
	}
	$origin_password.on('input', passwordInput);
	$new_password.on('input', passwordInput);
	$new_password_confirm.on('input', passwordInput);
	
	//弹框关闭事件
	$(".alert-box, .document-path-alert").on("click",".close",function() {
		//$(this).parents(".alert-box").addClass("hide")
		$(".overlay").addClass("hide");
	})
	
	//清楚缓存点击事件
	$("#clear-app-cache").on("click",function() {
		window.parent.clearAppCache();
	})
	$("#change-document-path").on("click", (e)=>{
		$("#change-document-path-overlay").removeClass("hide");
		$("#document-path-new").text(document_path);
		$("#document-path-new").attr("title", document_path);
	})
	$("#document-path-select").on("click", (e)=>{
		var path = window.parent.selectDocumentPath();
		if (path) {
			$("#document-path-new").text(path);
			$("#document-path-new").attr("title", path);
			if (path == document_path) {
				$("#do-document-path-change").addClass("btn-disable");
			} else {
				$("#do-document-path-change").removeClass("btn-disable");
			}
		}
	})
	$("#do-document-path-change").on("click", (e)=>{
		if (window.parent.getOpenedFileCount()) {
			window.parent.showToast('请先关闭所有已打开的文档');
			return;
		}
		window.parent.changeDocumentPath($("#document-path-new").attr("title"));
	})
	var $overlay = $(".overlay");
	$overlay.on("keydown", (e)=>{
		//console.log(e);
		if (e.key == "Escape") {
			$overlay.addClass("hide");
		}
	})
	$("#check-update").on("click", ()=>{
		ipcRenderer.send("show-check-update");
	})
})
function getAppCacheSizeResult(size) {
	size = Math.trunc(size / (1024*1024));
	$("#app-cache-size").text(size + " MB");
}

function logout() {
	$(".model-btn").addClass("btn-disable");
	$(".head-change").addClass("btn-disable");
	$("#resetTel").addClass("btn-disable");
	$("#newSetTel").addClass("btn-disable");
	$("#newSetPwd").addClass("btn-disable");
	$("#resetPwd").addClass("btn-disable");
	$("#username").children(":nth-child(1)").text('');
	$("#nickname").children(":nth-child(1)").text('');
	$("#nickname").children(":nth-child(2)").children().val('');
	$("#name").children(":nth-child(1)").text('');
	$("#name").children(":nth-child(2)").children().val('');
	$("#sex").children(":nth-child(1)").text('');
	//$("input:radio[name='sex'][value='" + data.sex + "']").attr('checked','true');

	$("#email").children(":nth-child(1)").text('');
	$("#email").children(":nth-child(2)").children().val('');
	$("#birthday").children(":nth-child(1)").text('');
	$("#birthday").children(":nth-child(2)").children().val('');
	$("#unitname").children(":nth-child(1)").text('');
	$("#unitname").children(":nth-child(2)").children().val('');
}
function login() {
	$(".model-btn").removeClass("btn-disable");
	$(".head-change").removeClass("btn-disable");
	$("#resetTel").removeClass("btn-disable");
	$("#newSetTel").removeClass("btn-disable");
	$("#newSetPwd").removeClass("btn-disable");
	$("#resetPwd").removeClass("btn-disable");
	window.parent.getLoginUserInfo();
	window.parent.getBindMobile();
	window.parent.getAppCacheSize();
}
let userinfo = null;
function setUserInfo(data, updateHeadImage) {
	userinfo = data;
	if (updateHeadImage) {
		window.parent.getUserHeadImage(8, window.parent.getLoginUserName());
	}
	//console.log(data);
	$("#username").children(":nth-child(1)").text(window.parent.getLoginUserName());
	$("#nickname").children(":nth-child(1)").text(data.nickname);
	$("#nickname").children(":nth-child(2)").children().val(data.nickname);
	$("#name").children(":nth-child(1)").text(data.name);
	$("#name").children(":nth-child(2)").children().val(data.name);
	$("#sex").children(":nth-child(1)").text(data.sex);
	$("input:radio[name='sex'][value='" + data.sex + "']").attr('checked','true');

	$("#email").children(":nth-child(1)").text(data.email);
	$("#email").children(":nth-child(2)").children().val(data.email);
	$("#birthday").children(":nth-child(1)").text(data.birthday);
	$("#birthday").children(":nth-child(2)").children().val(data.birthday);
	$("#unitname").children(":nth-child(1)").text(data.unitname);
	$("#unitname").children(":nth-child(2)").children().val(data.unitname);
}
function saveUserInfo() {
	userinfo.nickname = $("#nickname").children(":nth-child(2)").children().val();
	userinfo.name = $("#name").children(":nth-child(2)").children().val();
	userinfo.sex = $("input[name='sex']:checked").data("sex");
	console.log(userinfo.sex);
	if (!userinfo.sex) userinfo.sex = '';
	userinfo.email = $("#email").children(":nth-child(2)").children().val();
	userinfo.birthday = $("#birthday").children(":nth-child(2)").children().val();
	userinfo.unitname = $("#unitname").children(":nth-child(2)").children().val();

	if (window.parent.updateUserInfo(userinfo)) {
		setUserInfo(userinfo, false);
		return true;
	}
	return false;
}
function setHeadImage(data) {
	var $previewBox = $("#previewBox");
	$previewBox.css({'background-image': 'url(data:image/png;base64,' + data + ')'});
}

function setBindMobile(success, mobile) {
	if (success) {
		if (mobile) {
			mobile = mobile.trim();
			//mobile = mobile.splice(3, 4, '*', '*', '*', '*');
			mobile = mobile.slice(0, 3) + '****' + mobile.slice(7, 11);
			$("#change-bind-mobile").children(":nth-child(1)").text(mobile);
			$("#change-bind-mobile").children(":nth-child(2)").removeClass("btn-disable");
			$("#change-bind-mobile").children(":nth-child(2)").text('点击修改');
		} else {
			$("#change-bind-mobile").children(":nth-child(2)").removeClass("btn-disable");
			$("#change-bind-mobile").children(":nth-child(2)").text('立即绑定');
		}
	}
}
var document_path;
function init(loginSuccess) {
	if (loginSuccess) login();
	else logout();
	document_path = window.parent.getDocumentPath();
	$("#document-path").text(document_path);
	$("#document-path").attr("title", document_path);
}
function changeDocumentPathResult(result, newpath) {
	if (result) {
		document_path = newpath;
		$("#document-path").text(document_path);
		$("#document-path").attr("title", document_path);
		$("#change-document-path-overlay").addClass("hide");
	}
}