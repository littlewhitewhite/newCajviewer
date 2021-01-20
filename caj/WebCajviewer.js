// WebCajviewer

    let book = { 
		pagesInfo: {
			pageCount: 15,
			pageInfo:
		[
	    {
            pageNumber: 1,
            pageImageUrl: 'data/images/1-96-150.png',
            pageTextJsonUrl: 'data/text/1.json'
        },
        {
            pageNumber: 2,
            pageImageUrl: 'data/images/2-96-150.png',
            pageTextJsonUrl: 'data/text/2.json',
            //pageAnnotationUrl: 'data/2-notes.xml'
        },
        {
            pageNumber: 3,
            pageImageUrl: 'data/images/3-96-150.png',
            pageTextJsonUrl: 'data/text/3.json'
        },
        {
            pageNumber: 4,
            pageImageUrl: 'data/images/4-96-150.png',
            pageTextJsonUrl: 'data/text/4.json'
        },
        {
            pageNumber: 5,
            pageImageUrl: 'data/images/5-96-150.png',
            pageTextJsonUrl: 'data/text/5.json'
        },
		{
            pageNumber: 6,
            pageImageUrl: 'data/images/6-96-150.png',
            pageTextJsonUrl: 'data/text/6.json'
        },
        {
            pageNumber: 7,
            pageImageUrl: 'data/images/7-96-150.png',
            pageTextJsonUrl: 'data/text/7.json',
            //pageAnnotationUrl: 'data/2-notes.xml'
        },
        {
            pageNumber: 7,
            pageImageUrl: 'data/images/7-96-150.png',
            pageTextJsonUrl: 'data/text/7.json'
        },
        {
            pageNumber: 8,
            pageImageUrl: 'data/images/8-96-150.png',
            pageTextJsonUrl: 'data/text/8.json'
        },
        {
            pageNumber: 9,
            pageImageUrl: 'data/images/9-96-150.png',
            pageTextJsonUrl: 'data/text/9.json'
        },
		{
            pageNumber: 10,
            pageImageUrl: 'data/images/10-96-150.png',
            pageTextJsonUrl: 'data/text/10.json'
        },
        {
            pageNumber: 11,
            pageImageUrl: 'data/images/11-96-150.png',
            pageTextJsonUrl: 'data/text/11.json'
        },
        {
            pageNumber: 12,
            pageImageUrl: 'data/images/12-96-150.png',
            pageTextJsonUrl: 'data/text/12.json',
            //pageAnnotationUrl: 'data/2-notes.xml'
        },
        {
            pageNumber: 13,
            pageImageUrl: 'data/images/13-96-150.png',
            pageTextJsonUrl: 'data/text/13.json'
        },
        {
            pageNumber: 14,
            pageImageUrl: 'data/images/14-96-150.png',
            pageTextJsonUrl: 'data/text/14.json'
        },
        {
            pageNumber: 15,
            pageImageUrl: 'data/images/15-96-150.png',
            pageTextJsonUrl: 'data/text/15.json'
        }
    ]
		},
		
	cataInfo : 'data/text/catalog.json'
};

function getCatalog()
{
	let requestURL = book.cataInfo;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json'; 
    request.send();
    request.onload = function () {
		setNavigationTree(request.response);
    }
    console.log("catalog end");
}

function turnToPage(page)
{
	
}

function setNavigationTree(naviTree)
{
	if(naviTree) {
		naviTree.forEach(createLevels);
	}
}

let i = 0, levelIndex = 0;
let parent = document.getElementById('naviTree');

function createLevels(directory, index)
{
	
	let text = directory.name;
	let page = directory.dest.page;
	
	let oli = document.createElement('li');
	oli.setAttribute('id', i++);
	oli.setAttribute('class', 'level' + levelIndex);
	
	let ospan = document.createElement('span');
	ospan.setAttribute('id', 'naviTree_' + levelIndex + '_switch');
	
	let oa = document.createElement('a');
	oa.setAttribute('id', 'naviTree_' + levelIndex + '_a');
	ospan.setAttribute('class', '');
	oa.onclick = turnToPage(page);
	
	let oaSpan = document.createElement('span');
	ospan.setAttribute('id', 'naviTree_' + levelIndex + '_switch');
	oaSpan.innerHTML = text;
	
	oli.appendChild(ospan);
	oli.appendChild(oa);
	oa.appendChild(oaSpan);
		
	parent.appendChild(oli);
	
	if(directory.childs) {
		let oul = document.createElement('ul');
		oul.style.display = 'none';
		oli.appendChild(oul);
		
		ospan.setAttribute('class', 'button noline_close');		// set class ospan to noline_close
		ospan.onclick = function () { 
			let dirState =  ospan.getAttribute('class');
			oul.getAttribute("display") == "none" ? "block" : "none";
			console.log(dirState);
		};
		
		directory.childs.map(createLevels).forEach((element) => {oul.appendChild(element);}); // then recursive call 
	} else {
		ospan.setAttribute('class', 'button noline_docu');
	}		
	
	return oli;
}

function drawBook(){
    console.log("drawBook start");
	getCatalog();
    createPageLayout(15);
	
    for(let i = 0; i < book.pagesInfo.pageInfo.length; i++) {
        // console.log(pageUrlArray[i].pageImageUrl);
        drawPage(book.pagesInfo.pageInfo[i].pageNumber, book.pagesInfo.pageInfo[i].pageImageUrl,
            book.pagesInfo.pageInfo[i].pageTextJsonUrl, book.pagesInfo.pageInfo[i].pageAnnotationUrl);
    }
    // setScrollEvent();
    // initPageNumber();
    // setPageNextPreviouseButton();
    // setPageButton();
    console.log("drawBook end");
}



function initViewer() {
    console.log("initViewer");
    // hideNotUsedButton();
    setSideBar();
    setPrintButton();
    setFullScreenButton();
    initialFind();
    // let netPageButton = document.getElementById("next");
    // netPageButton.addEventListener("click", nextPage);
}



let curScale = 100;
function multiBy(value) {
    // var ratio = 1.333;
    // var scale = 1;
    // var scale2 = window.devicePixelRatio;
    // return value * ratio * scale * scale2 / 100.0;
    return value * curScale / 10000;
}

function pointm2Pixel(value, scale) {
    if (!scale) scale = curScale;
    return value * DPI * scale / 720000;
}
function point2Pixel(value) {
    return value * DPI / 72;
}
function pixel2mPoint(value) {
    // pageSize.cx * DPI / 72;
    return (value * 72 * 10000 / (DPI*curScale));
}
function pixel2Point(value) {
    // pageSize.cx * DPI / 72;
    return (value * 72 / DPI);
}

function getDPI() {
    var arrDPI = new Array();
    if ( window.screen.deviceXDPI != undefined ) {
        arrDPI[0] = window.screen.deviceXDPI;
        arrDPI[1] = window.screen.deviceYDPI;
    } else {
        var tmpNode = document.createElement( "DIV" );
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild( tmpNode );
        arrDPI[0] = parseInt( tmpNode.offsetWidth );
        arrDPI[1] = parseInt( tmpNode.offsetHeight );
        tmpNode.parentNode.removeChild( tmpNode );
    }
    return arrDPI;
}

let DPI = getDPI()[0];

function zrun(){
    //initViewer();
	let arrDPI = getDPI();
    drawBook();
}

zrun();
// drawBook();
// document.addEventListener("DOMContentLoaded", function(event) { 

// });

function createPageLayout(pageNumber){
	let top = 15;
for (var i = 1; i <= book.pagesInfo.pageInfo.length; ++i) {

        let page = document.createElement("div");
        page.className = "page";
        page.setAttribute("data-page-number", i);
        page.setAttribute("id", 'zpage-number-' + i);
        page.style.top = top + 'pt';
        top += 15;
		page.style.width = '100%';
		page.style.height = '100%';
		
        let image_layer = document.createElement('div');
        image_layer.setAttribute('id', 'zpage-image-number-' + i);
        image_layer.className = "canvasWrapper";
        image_layer.style.width = '100%';
        image_layer.style.height = '100%';
        image_layer.style.visibility = 'hidden';
        let pageCanvas = document.createElement("canvas");
        pageCanvas.width = page.style.width;
        pageCanvas.height = page.style.height;
        pageCanvas.setAttribute("aria-label", "页码 " + i);
        pageCanvas.setAttribute('id', 'zpage-image-canvas-' + i);
        image_layer.appendChild(pageCanvas);
        //image_layer.style.zIndex = "-9999";
        page.appendChild(image_layer);

        let annotation_layer = document.createElement('div');
        annotation_layer.setAttribute('id', 'zpage-annotation-number-' + i);
        annotation_layer.className = "annotationLayer";
        annotation_layer.style.width = '100%';
        annotation_layer.style.height = '100%';
        //annotation_layer.style.visibility = caj_settings.showNote ? 'visible' : 'hidden';
        page.appendChild(annotation_layer);

        let text_layer = document.createElement('div');
        text_layer.setAttribute('id', 'zpage-text-number-' + i);
        text_layer.className = "textLayer";
        text_layer.style.width = '100%';
        text_layer.style.height = '100%';
        text_layer.style.visibility = 'hidden';
        page.appendChild(text_layer);

        viewer.appendChild(page);
    }
}


/* function drawPagePromise(pageNumber, ret, reload){
    return new Promise((resolve, reject) =>
    {
        console.log("asyncFunc");
        drawPageAsync(pageNumber, ret, reload);
        resolve(pageNumber);
    });
}
 */

function drawImage(pageNumber, pageImageUrl, pageAnnotationUrl, jsonText){
    let page = document.getElementById('zpage-number-' + pageNumber);
/*     if (page.getAttribute('drawn')) {
        if (!reload) {
            return;
        }
    } 
   if (page.getAttribute('relayout')) {
        let pageSize = getPageSize(pageNumber);
        page.style.width = (pageSize.cx * curScale / 10000) + 'pt';
        page.style.height = (pageSize.cy * curScale / 10000) + 'pt';
        page.removeAttribute('relayout');
    } */

    //page.setAttribute('drawn', 'true');
    let pageImg = new Image();
    pageImg.resetLayer = true;
    pageImg.page = page;
    //pageImg.scale = ret.scale;
    pageImg.pageNumber = pageNumber;
	pageImg.src = pageImageUrl;
    pageImg.onload = imageOnLoad;
    //pageImg.src = "data:image/png;base64," + Buffer.from(ret.image).toString('base64');
    //pageImages[pageNumber - 1] = pageImg;
}


function imageOnLoad() {
    var x = 0;
    var y = 0;
let tmppx = point2Pixel(15)
	let VC = document.getElementById( 'viewerContainer');
	let viewerHeight = VC.clientHeight - tmppx * 2;
	let viewerWidth = VC.clientWidth;
	let hh = this.page.offsetHeight;
	
	
	let width = this.width * viewerHeight / this.height; 
	
    let image_layer = document.getElementById( 'zpage-image-number-' + this.pageNumber);
    image_layer.style.visibility = 'visible';
	
	let page = document.getElementById( 'zpage-number-' + this.pageNumber);
	page.style.width = width + 'px';
	page.style.height = viewerHeight + 'px';
	page.style.left = (viewerWidth - width) / 2 + 'px';
	
    let pageCanvas = document.getElementById('zpage-image-canvas-' + this.pageNumber);
    pageCanvas.width = width;
    pageCanvas.height = viewerHeight;
    let ctx = pageCanvas.getContext("2d");
    ctx.save();
    ctx.drawImage(this, 0, 0, width, viewerHeight);
    console.log("imageOnLoad pageNumber:",  this.pageNumber);
/*     if (this.resetLayer) {
        //setupTextLayer(this.pageNumber, ctx);
        setupAnnotation(this.page, this.pageNumber);
        this.resetLayer = false;
    }
    drawAnnotation(this.pageNumber, ctx); */
    ctx.restore();
}


function drawPage(pageNumber, pageImageUrl, pageTextJsonUrl, pageAnnotationUrl) {
    console.log("drawPage start");
    console.log("pageNumber:", pageNumber);
    let i = 0;
    let requestURL = pageTextJsonUrl;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json'; 
    request.send();
    request.onload = function () {
        // console.log("pageNumber:", pageNumber);
        drawImage(pageNumber, pageImageUrl, pageAnnotationUrl, request.response);
    }
    console.log("drawPage end");
}




















