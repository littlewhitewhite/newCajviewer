//const nativeImage = require("electron").nativeImage;

const { ipcRenderer } = require("electron");
const xml2js = require("xml2js");

$(function () {
  // 点击退出登录
  $(".my_quit>a").click(function () {
    // console.log(1)
    //$(".entire").addClass('none')
    window.parent.logout();
    //logout();
  });
  // 点赞下面的tab切换
  $(".my_right_tab").on("click", "li", function () {
    let index = $(this).index();
    $(".my_right_tab_list")
      .eq(index)
      .removeClass("none")
      .siblings(".my_right_tab_list")
      .addClass("none");

    $(this).find("a").addClass("currentTab");
    $(this).siblings().children("a").removeClass("currentTab");
  });
  // 初次现实tab第一项
  $(".my_right_tab_list")
    .eq(0)
    .removeClass("none")
    .siblings(".my_right_tab_list")
    .addClass("none");

  $(".my-list> .my_item >a").click(function () {
    let index = $(this).parent(".my_item").index();
  });

  $(".t_trangle").click(function () {
    if ($(this).hasClass("downUp")) {
      $(this).removeClass("downUp");
      $(this).addClass("downDown");
      $(this)
        .parent()
        .parent(".tab_list")
        .siblings(".tab_list_box")
        .slideUp(500);
    } else {
      $(this).removeClass("downDown");
      $(this).addClass("downUp");
      $(this)
        .parent()
        .parent(".tab_list")
        .siblings(".tab_list_box")
        .slideDown(500);
    }
  });

  // 点击个人六个入口的侧边进入
  $(".my_item>a").click(function () {
    let index = $(this).parent(".my_item").index();
    console.log(index);
    switch (index) {
      case 0:
        $(".my_list").removeClass("none");
        $(".my_thumbs_up").removeClass("none").siblings().addClass("none");
        window.parent.getMyPraise();
        break;
      case 1:
        $(".my_list").removeClass("none");
        $(".my-collect").removeClass("none").siblings().addClass("none");
        window.parent.getMyFavorite();
        break;
      case 2:
        $(".my_list").removeClass("none");
        $(".my_history").removeClass("none").siblings().addClass("none");
        break;
      case 3:
        $(".my_list").removeClass("none");
        $(".my_notes").removeClass("none").siblings().addClass("none");
        window.parent.getNoteRemote();
        break;
      case 4:
        $('.my_list').removeClass('none')
        $('.my-dynamic').removeClass('none').siblings().addClass('none')
        window.parent.getDynamic();
        break;
      case 5:
        $('.my_list').removeClass('none')
        $('.my-acounts').removeClass('none').siblings().addClass('none')
        window.parent.getUserBalance();
        window.parent.getUserIntegral();
        break;
      default:
        $("my_list").addClass("none");
        break;
    }
  });

  $(".dynamic-ul").on("click", "li", function() {
    //let index = $(this).parent(".dynamic-li").index();
    var $li = $(this);
    $li.addClass("dynamic-slected").siblings().removeClass("dynamic-slected");
    var index = $li.data("index");
    $(".dynamic-list").addClass("none");
    $("#dynamic-list-" + index).removeClass('none');
	})

  $("#balance-refresh").on("click", ()=>{
    window.parent.getUserBalance();
  })
  $("#balance-charge").on("click", ()=>{
    //window.parent.getUserBalance();
    //https://zhifu.cnki.net/
    window.parent.openExternal("https://zhifu.cnki.net?uid=" + window.parent.getUserUID());
  })

  $(".file-control-btn").click(function () {
    //console.log(1);
    $(".my_list").addClass("none");
  });

  $("#to_login").click(function () {
    if (autologin_failed) {
      window.parent.autoLogin();
    } else {
      window.parent.login();
    }
  });
  // $("#my-area").on("mouseleave", () => {
  //   window.parent.hideLoginPanel();
  // });
  $("#related-now-1, #related-now-2").on("click", ()=>{
    // const { ipcRenderer } = require('electron');
    // ipcRenderer.send("get-org-band-qrcode");
    // console.log("send get-org-band-qrcode");
    window.parent.showOrgBind();
  })
  frame_ready = true;
});
var frame_ready = false;
function isReady() {
  return frame_ready;
}
function loginSuccess() {
  $("#my_quit").show();
  $("#to_login").hide();
  $("#my_head_img").attr("src", "./imgs/my/head_sign_in_light@2x.png");
  $(".my-list>.my_item").removeClass("disable");
  $("#login-success").show();
  $("#related-now-2").show();
  $("#my_head_orgstatus").hide();
}
var autologin_failed = false;
function loginFailed() {
  $("#my_quit").show();
  $("#to_login").children(":nth-child(1)").text("登录失败,点击重试");
  $("#logining").hide();
  autologin_failed = true;
}
function logining() {
  $("#to_login").children(":nth-child(1)").text("正在登录...");
  $("#logining").show();
}
function logout() {
  $("#login-success").hide();
  autologin_failed = false;
  //("#related-now").hide();
  //$("#my_head_orgstatus").hide();
  $("#my_quit").hide();
  $("#to_login").show();
  $("#logining").hide();
  $("#to_login").children(":nth-child(1)").text("点击登录");
  $("#my_head_img").attr("src", "./imgs/my/head_not_logged_in_light@2x.png");
  $(".my-list>.my_item").addClass("disable");
  $("#my-note").removeClass("disable");
  setMyNote([]);
}

function setOrgStatus(value) {
  $("#related-now-1").hide();
  $("#my_head_orgstatus").show();
  //console.log("value:", value);
  if(value.is_band == "1"){
    $("#my-unit-name").show();
    $("#my-unit-name").text(value.unitname);
    $("#my-end-date").text("本机漫游至 " + value.enddate1);
  } else {
    $("#my_head_orgstatus").hide();
    $("#related-now-1").show();
    $("#my-unit-name").hide();
    $("#my-unit-name").text("");
    $("#my-end-date").text("");
  }
  // $("#my-end-date").text("漫游至 " + value.enddate);
}

function setUserName(arg, usernames, nicknames) {
  if (arg == 0) {
    $("#my_head_name").text(nicknames);
  } else if (arg == 2) {
    //if (usernames instanceof Set) {
      usernames.forEach(u=>{
        var $t_btm_type = $("[user-nickname='" + u + "']");
        $t_btm_type.text(nicknames.get(u));
      })
    //} 
  } else {
    //$img.setAttribute("userheadimg", element.username);
    //var $t_btm_type = $tab_btm.children(".t_btm_type");
    var $t_btm_type = $("[usernickname='" + usernames + "']");
    $t_btm_type.text(nicknames);
  }
}

function setHeadImage(islogin, arg, usernames, data) {
  if (arg == 0) {
    let loginImg = document.getElementById("my_head_img");
    if (islogin) {
      if (data) {
        //var image = nativeImage.createFromBuffer(Buffer.from(data, "base64"));
        loginImg.src = "data:image/png;base64," + data;
      } else {
        loginImg.src = "./imgs/my/head_sign_in_light@2x.png";
      }
    } else {
      loginImg.src = "./imgs/my/head_not_logged_in_light@2x.png";
    }
  } else if (arg == 2) {
    //if (usernames instanceof Set) {
      usernames.forEach(u=>{
        var $img = $("[user-head-img='" + u + "']");
        $img.css({'background-image': 'url(data:image/png;base64,' + data.get(u) + ')'});
      })
    //} 
  }else {
    //$img.setAttribute("userheadimg", element.username);
    //var $t_btm_type = $tab_btm.children(".t_btm_type");
    if (data) {
      var $img = $("[userheadimg='" + usernames + "']");
      //var image = nativeImage.createFromBuffer(Buffer.from(data, "base64"));
      $img.attr("src", "data:image/png;base64," + data);
    } 
  }
}

function setMyPraise(data) {
  if (data.type == "article") {
    var my_praise_article_list = document.getElementById(
      "my-praise-article-list"
    );
    $(my_praise_article_list).empty();
    data.data.forEach((element) => {
      console.log(element);
      var div_item = document.createElement("div");
      div_item.className = "tab_list_item";
      var div_content = document.createElement("div");
      div_content.className = "tab_content";
      div_content.textContent = element.title
        .replace('<font color="FF0000">', "")
        .replace("</font>", "");
      div_item.appendChild(div_content);

      var div_date = document.createElement("div");
      div_date.className = "tab_date";
      div_date.textContent = element.time.substring(0, 10);
      div_item.appendChild(div_date);
      div_item.addEventListener("click", () => {
        window.parent.openArticleDetail(element.typeid, element.fileid);
      });

      my_praise_article_list.appendChild(div_item);
    });
  } else if (data.type == "note") {
    var my_praise_note_list = document.getElementById("my-praise-note-list");
    $(my_praise_note_list).empty();
    data.data.forEach((element) => {
      console.log(element);
      var div_item = document.createElement("div");
      div_item.className = "tab_list_item";
      div_item.setAttribute("annotationid", element.annotationid);

      var div_btm = document.createElement("div");
      div_btm.className = "tab_btm";
      //div_btm.setAttribute("username", element.username);
      var div_t_btm_img = document.createElement("div");
      div_t_btm_img.className = "t_btm_img";
      var img = document.createElement("img");
      img.className = "t_btm_img_img";
      div_t_btm_img.appendChild(img);
      div_btm.appendChild(div_t_btm_img);
      var div_t_btm_type = document.createElement("div");
      div_t_btm_type.className = "t_btm_type";
      // div_t_btm_type.textContent = element.username;
      div_btm.appendChild(div_t_btm_type);

      var div_date = document.createElement("div");
      div_date.className = "t_btm_date";
      div_date.textContent = element.time.substring(0, 10);
      div_btm.appendChild(div_date);

      div_item.appendChild(div_btm);
      div_item.addEventListener("click", () => {
        //window.parent.openArticleDetail(element.typeid, element.fileid);
      });

      my_praise_note_list.appendChild(div_item);
    });
  } else if (data.type == "note-info") {
    var element = data.data[0];
    var userinfo = window.parent.getUserInfo(element.username);
    var $div_item = $("[annotationid='" + data.annotationid + "']");
    var div_content = document.createElement("div");
    div_content.className = "tab_content";
    div_content.textContent = element.annotation;
    var div_other = document.createElement("div");
    div_other.className = "tab_other";
    div_other.textContent = element.title;

    $div_item[0].insertBefore(div_other, $div_item[0].firstChild);
    $div_item[0].insertBefore(div_content, div_other);
    var $tab_btm = $div_item.children(".tab_btm"); //.t_btm_type");
    var $img = $tab_btm.children(".t_btm_img").children();
    if (userinfo && userinfo.image) {
      $img.attr("src", userinfo.image);
    } else {
      $img.attr("userheadimg", element.username);
      window.parent.getUserHeadImage(1, element.username);
    }
    var $t_btm_type = $tab_btm.children(".t_btm_type");
    if (userinfo && userinfo.nickname) {
      $t_btm_type.text(userinfo.nickname);
    } else {
      $t_btm_type.attr("usernickname", element.username);
      $t_btm_type.text(element.username);
      window.parent.getUserNickname(1, element.username);
    }
  } else if (data.type == "question") {
    var my_praise_question_list = document.getElementById(
      "my-praise-question-list"
    );
    $(my_praise_question_list).empty();
    data.data.forEach((element) => {
      //console.log(element);
      var div_item = document.createElement("div");
      div_item.className = "tab_list_item";
      var div_content = document.createElement("div");
      div_content.className = "tab_content";
      div_content.setAttribute("answerid", element.answerid);
      div_item.appendChild(div_content);

      var div_other = document.createElement("div");
      div_other.className = "tab_other";
      div_other.setAttribute("questionid", element.questionid);
      div_item.appendChild(div_other);

      var div_btm = document.createElement("div");
      div_btm.className = "tab_btm";
      var div_t_btm_img = document.createElement("div");
      div_t_btm_img.className = "t_btm_img";
      var img = document.createElement("img");
      div_t_btm_img.appendChild(img);
      div_btm.appendChild(div_t_btm_img);
      var div_t_btm_type = document.createElement("div");
      div_t_btm_type.className = "t_btm_type";
      //div_t_btm_type.textContent = element.owner;
      div_btm.appendChild(div_t_btm_type);

      var div_date = document.createElement("div");
      div_date.className = "t_btm_date";
      div_date.textContent = element.time.substring(0, 10);
      div_btm.appendChild(div_date);

      div_item.appendChild(div_btm);
      div_item.addEventListener("click", () => {
        //window.parent.openArticleDetail(element.typeid, element.fileid);
      });

      my_praise_question_list.appendChild(div_item);
    });
  } else if (data.type == "question-info") {
    var element = data.data[0];
    var $div_question = $("[questionid='" + data.questionid + "']");
    $div_question.text(element.question);
  } else if (data.type == "answer-info") {
    var element = data.data[0];
    var userinfo = window.parent.getUserInfo(element.username);
    var $div_answer = $("[answerid='" + data.answerid + "']");
    $div_answer.text(element.answer);
    var $tab_btm = $div_answer.parent().children(".tab_btm");
    var $t_btm_type = $tab_btm.children(".t_btm_type");
    if (userinfo && userinfo.nickname) {
      $t_btm_type.text(userinfo.nickname);
    } else {
      $t_btm_type.attr("usernickname", element.username);
      $t_btm_type.text(element.username);
      window.parent.getUserNickname(1, element.username);
    }
    var $t_btm_img = $tab_btm.children(".t_btm_img");
    if (userinfo && userinfo.image) {
      $t_btm_img.children().attr("src", userinfo.image);
    } else {
      $t_btm_img.children().attr("userheadimg", element.username);
      window.parent.getUserHeadImage(1, element.username);
    }
  }
}
function setMyFavorite(data) {
  var my_favorite_list = document.getElementById("my-favorite-list");
  $(my_favorite_list).empty();
  data.forEach((element) => {
    console.log(element);
    var div_item = document.createElement("div");
    div_item.className = "tab_list_item collect-item";
    var div_content = document.createElement("div");
    div_content.className = "tab_content";
    div_content.textContent = element.title
      .replace('<font color="FF0000">', "")
      .replace("</font>", "");
    div_item.appendChild(div_content);

    var div_oprate = document.createElement("div");
    div_oprate.className = "collect-oprate";
    div_item.appendChild(div_oprate);

    var div_date = document.createElement("div");
    div_date.className = "tab_date";
    div_date.textContent = element.time;
    div_oprate.appendChild(div_date);

    var div2 = document.createElement('div');
    div2.className = 'collect-oprate-list';

    var div1 = document.createElement('div');
    div1.className = 'collect-oprate-delete';
    div1.addEventListener("click", (e)=>{
      //remove
      e.stopPropagation();
      $(div_item).remove();
      ipcRenderer.send("delete-my-favorite", element.fileid, element.odatatype);

    })
    div1.setAttribute("title", "删除");
    div2.appendChild(div1);
    div_oprate.appendChild(div2);
    
    div_item.addEventListener("click", () => {
      let fileObject = {
        fileid: element.fileid,
        type: element.odatatype,
        title: element.title
        .replace('<font color="FF0000">', "")
        .replace("</font>", "")
    }
      window.parent.openArticleDetail(fileObject);
    });

    my_favorite_list.appendChild(div_item);
  });
}

function setMyHistory(data) {
  var my_history_list = document.getElementById("my-history-list");
  $(my_history_list).empty();
  if (!data) return;
  data.forEach((element) => {
    // console.log(element);
    var div_item = document.createElement("div");
    div_item.className = "tab_list_item";
    var div_content = document.createElement("div");
    div_content.className = "tab_content";
    div_content.textContent = element.title
      .replace('<font color="FF0000">', "")
      .replace("</font>", "");
    div_item.appendChild(div_content);

    var div_date = document.createElement("div");
    div_date.className = "tab_date";
    div_date.textContent = element.time.substring(0, 10);
    div_item.appendChild(div_date);
    div_item.addEventListener("click", () => {
      window.parent.openArticleDetail(element.odatatype, element.fileid);
    });

    my_history_list.appendChild(div_item);
  });
}
function decodeUTF16( binaryStr ) {
  if (binaryStr.length > 2) {
    
    if (binaryStr[0] == 0xfe && binaryStr[1] == 0xff) {
      //be to le
      var cp = [];
      for( var i = 2; i < binaryStr.length; i+=2) {
          cp.push( 
              binaryStr[i+1] |
              ( binaryStr[i] << 8 )
          );
      }
      return String.fromCharCode.apply( String, cp );
    } else if (binaryStr[0] == 0xff && binaryStr[1] == 0xfe) {
      //le
        return binaryStr.toString('ucs2', 2);
    }
  }
  return binaryStr.toString('ucs2');
}
function parseCAJNote(element) {
  var note = {};
  var xml = Buffer.from(element, "base64").toString();
  //console.log(xml);
  var xmlParser = new xml2js.Parser();
  xmlParser.parseString(xml, function (err, result) {
    if (result && result.Item) {
      note["id"] = result.Item.$.id;
      note["type"] = result.Item.$.Type;
      note["page"] = Number(result.Item.$.Page);
      note["color"] = result.Item.$.Color;
      if (result.Item.$.cdate) {
        note["cdate"] = Number(result.Item.$.cdate);
      }
      if (result.Item.$.mdate) {
        note["mdate"] = Number(result.Item.$.mdate);
      }
      if (result.Item.$.DescText) {
        note["desc"] = decodeUTF16(Buffer.from( result.Item.$.DescText.trim(), "base64"));
      }
      if (result.Item.$.Title) {
        note["title"] = decodeUTF16(Buffer.from( result.Item.$.Title.trim(), "base64"));
      }
      if (result.Item.$.Author) {
        note["author"] = decodeUTF16(Buffer.from(result.Item.$.Author.trim(), "base64"));
      }
      if (result.Item.$.Width) {
        note["lineWidth"] = Number(result.Item.$.Width);
      }
      if (result.Item.RC) {
        var rects = [];
        result.Item.RC.forEach((rc) => {
          var rect = {};
          rect.left = Number(rc.$.l);
          rect.right = Number(rc.$.r);
          rect.top = Number(rc.$.t);
          rect.bottom = Number(rc.$.b);
          rects.push(rect);
        });
        note["rects"] = rects;
      }
      if (result.Item.PT) {
        var points = [];
        result.Item.PT.forEach((pt) => {
          var point = {};
          point.x = Number(pt.$.x);
          point.y = Number(pt.$.y);
          points.push(point);
        });
        note["points"] = points;
      }
    }
  });
  return note;
}
function sortByArticle(notes) {
  var map = new Map();
  notes.forEach(elem=>{
    var rows = map.get(elem.recid);
    if (!rows) {
      rows = [];
      map.set(elem.recid, rows);
    }
    rows.push(elem);
  })
  return map;
}
function setMyNote(notes) {
  var $list = $("#note-list");
  if (notes.length) {
    $list.show();
    $(".empty-tip-block").hide();
    // $("#note-count").show();
    // $("#note-count").text('共' + notes.length +'条');
  } else {
    $list.hide();
    $(".empty-tip-block").show();
    //$("#note-count").hide();
  }
  $list.empty();
  var recid_array = [];
  var ul = null;
  var div = null;
  var li = null;
  var note_list = $list[0];
  var div_sub = null, p, span;
  var sub_list;
  var map = sortByArticle(notes);
  map.forEach((value, key)=>{
    recid_array.push(key);
    sub_list = document.createElement("div");
    sub_list.className = "marking-article-item";

    var title = document.createElement("div");
    title.className = "marking-title";
    div = document.createElement("div");
    div.className = "side-line";
    title.appendChild(div);
    div = document.createElement("div");
    div.className = "title-con";
    div.setAttribute("rec-id", key);
    div.textContent = key;

    title.appendChild(div);
    var btn_div = document.createElement("div");
    btn_div.className = "content-btn opended";
    title.appendChild(btn_div);

    sub_list.appendChild(title);
    $(btn_div).on("click", () => {
      var $prt = $(title);
      if ($(btn_div).hasClass("opended")) {
        $(btn_div).removeClass("opended");
        $prt.siblings(".marking-list").addClass("hide");
      } else {
        $(btn_div).addClass("opended");
        $prt.siblings(".marking-list").removeClass("hide");
      }
    });
    ul = document.createElement("ul");
    ul.className = "marking-list";
    sub_list.appendChild(ul);
    note_list.appendChild(sub_list);
    value.forEach(elem=>{
      if (elem.rectype == 0) {
        var note = parseCAJNote(elem.item);
        li = document.createElement("li");
        li.className = "marking-item";
        li.setAttribute("list-note-id", note.id);
        div_sub = document.createElement("div");
        div_sub.className = "marking-item-sub";
  
        div = document.createElement("div");
        div.className = "marking-mesg";
        p = document.createElement("p");
        p.className = "mesg";
        if (note.title) p.textContent = note.title;
        div.appendChild(p);
        span = document.createElement("span");
        span.className = "flag";
        div.appendChild(span);
  
        div_sub.appendChild(div);
  
        div = document.createElement("div");
        div.className = "original";
        if (note.desc) div.textContent = note.desc;
        div_sub.appendChild(div);
        div = document.createElement("div");
        div.className = "marking-oprate";
        var div1 = document.createElement("div");
        div1.className = "marking-date";
        if (note.mdate)
          div1.textContent = new Date(note.mdate).toLocaleDateString();
        div.appendChild(div1);
        var div2 = document.createElement("div");
        div2.className = "oprate-list";
  
        div1 = document.createElement("div");
        div1.className = "marking-oprate-edit";
        div2.appendChild(div1);
        div1 = document.createElement("div");
        div1.className = "marking-oprate-delete";
        div2.appendChild(div1);
        div.appendChild(div2);
  
        div_sub.appendChild(div);
        li.appendChild(div_sub);
        ul.appendChild(li);
  
        li.addEventListener("click", (e) => {
          window.parent.openBookById(elem.recid, "caj", note);
        });
      } else {
        var note = JSON.parse(Buffer.from(elem.item, "base64").toString());
        li = document.createElement("li");
        li.className = "marking-item";
        li.setAttribute("list-note-id", note.id);
        div_sub = document.createElement("div");
        div_sub.className = "marking-item-sub";
  
        div = document.createElement("div");
        div.className = "marking-mesg";
        p = document.createElement("p");
        p.className = "mesg";
        if (note.annot) p.textContent = note.annot;
        div.appendChild(p);
        span = document.createElement("span");
        span.className = "flag";
        div.appendChild(span);
  
        div_sub.appendChild(div);
  
        div = document.createElement("div");
        div.className = "original";
        if (note.text) div.textContent = note.text;
        div_sub.appendChild(div);
        div = document.createElement("div");
        div.className = "marking-oprate";
        var div1 = document.createElement("div");
        div1.className = "marking-date";
        if (note.modified)
          div1.textContent = new Date(note.modified).toLocaleDateString();
        div.appendChild(div1);
        var div2 = document.createElement("div");
        div2.className = "oprate-list";
  
        div1 = document.createElement("div");
        div1.className = "marking-oprate-edit";
        div2.appendChild(div1);
        div1 = document.createElement("div");
        div1.className = "marking-oprate-delete";
        div2.appendChild(div1);
        div.appendChild(div2);
  
        div_sub.appendChild(div);
        li.appendChild(div_sub);
        ul.appendChild(li);
  
        li.addEventListener("click", (e) => {
          window.parent.openBookById(elem.recid, "epub", note);
        });
      }
    })
  });
  if (recid_array.length > 0) {
    window.parent.getTitleById(recid_array);
  }
}

function updateNoteListTitle(recid_array, title_array) {
  for (var i = 0; i < recid_array.length; ++i) {
    $("[rec-id='" + recid_array[i] + "']").text(title_array[i]);
  }
}
/*
<div class="dynamic-item">
  <div class="annotation">
    用户批注的内容，针对文章某一段落、某些文, 用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,用户批注的内容，针对文章某一段落、某些文,
  </div>
  <div class="annotation-origin">
    老艺术期刊封面中的现代主义风格，老艺术期老艺术期刊封面中的现代主义风格，老艺术期老艺术期刊封面中的现代主义风格，老艺术期
  </div>
  <div class="annotation-other">
    <div class="user-mesg">
      <div class="head"></div>
      <div class="name">列金365</div>
    </div>
    <div class="date">2019-10-10</div>
  </div>
</div>
*/
function setupDynamic(list, data, showuser) {
  var usernames = new Set();
  data.forEach(elem=>{
    var item = document.createElement('div');
    item.className = 'dynamic-item';
    var annot = document.createElement('div');
    annot.className = 'annotation';
    annot.textContent = elem.question;
    item.appendChild(annot);

    var origin = document.createElement('div');
    origin.className = 'annotation-origin';
    origin.textContent = elem.content;
    item.appendChild(origin);

    var userinfo = null;
    if (showuser) {
      userinfo = window.parent.getUserInfo(elem.username);
    }
    var other = document.createElement('div');
    other.className = 'annotation-other';
    var mesg = document.createElement('div');
    mesg.className = 'user-mesg';
    var head = document.createElement('div');
    head.className = 'head';
    if (userinfo && userinfo.image) {
      $(head).css({'background-image': 'url(' + userinfo.image + ')'});
    } else {
      if (showuser) {
        usernames.add(elem.username);
        head.setAttribute('user-head-img', elem.username);
      }
    }
    mesg.appendChild(head);
    var nickname = document.createElement('div');
    nickname.className = 'name';
    if (userinfo && userinfo.nickname) {
      nickname.textContent = userinfo.nickname;
    } else {
      if (showuser) {
        usernames.add(elem.username);
        nickname.setAttribute('user-nickname', elem.username);
      }
    }
    mesg.appendChild(nickname);
    other.appendChild(mesg);
    var date = document.createElement('div');
    date.className = 'date';
    date.textContent = elem.time.substring(0, 10);
    other.appendChild(date);

    item.appendChild(other);
    list.appendChild(item);
  })
  window.parent.getUserHeadImage(2, usernames);
  window.parent.getUserNickname(2, usernames);
}
function setDynamic(data) {
  console.log(data);
  if (!data) return;
  if (data.type == 'my-question') {
    var $dynamic_list = $("#dynamic-list-0");
    $dynamic_list.empty();
    setupDynamic($dynamic_list[0], data.data, false);
  } else if (data.type == 'collect-question') {
    var $dynamic_list = $("#dynamic-list-2");
    $dynamic_list.empty();
    setupDynamic($dynamic_list[0], data.data, true);
  } else {
    var $dynamic_list = $("#dynamic-list-1");
    $dynamic_list.empty();
    setupDynamic($dynamic_list[0], data.data, true);
  }
}

function setBalance(data) {
  var $card_block = $("#card-block");
  var userbalance = Number(data.userbalance);
  var userticket = Number(data.userticket);
  
  $card_block.find(".balance").text(userbalance + userticket);
  $card_block.find(".acounts-other").children(":nth-child(1)").text(userbalance);
  $card_block.find(".acounts-other").children(":nth-child(2)").text(userticket);
}

function setIntegral(data) {
  $(".score-num >.num-txt").text(data.allscore);
}