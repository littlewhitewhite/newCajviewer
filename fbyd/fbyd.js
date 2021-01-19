

function  doReady() {

    var img = document.getElementById("originImage");
    console.log("src:", img.src);
    let indexOf1 = img.src.lastIndexOf('/');
    let indexOf2 = img.src.lastIndexOf('.');
    let xmlName = img.src.substring(indexOf1, indexOf2);
    let xmlFileName = './data/xmls/' + xmlName + ".xml";
    console.log("xmlFileName:", xmlFileName);
    // let urlSplitArray = img.src.split("/");
    // console.log("urlSplitArray:", urlSplitArray);
    var Connect = new XMLHttpRequest();
    // Define which file to open and
    // send the request.
    Connect.open("GET", xmlFileName, false);
    // Connect.open("GET", "http://em.cnki.net/picmngr/image/expresspic?image=cjfd_HNZK20200202000_1.xml", false);
    
    Connect.setRequestHeader("Content-Type", "text/xml");
    Connect.send(null);
    // Place the response in an XML document.
    
    // console.log("theDocument:", theDocument);
    var theDocument = Connect.responseXML;
    console.log("theDocument:", theDocument);
   
    drawImg(theDocument, img, 1);
    
};

window.onload = doReady;
// Connect.readystatechange = function (){
// 	if(this.readyState == 4 && this.status == 200)
// 	{
// 		var theDocument = Connect.responseXML;
        
// 		var img = document.getElementById("originImage");
// 		drawImg(theDocument, img, 1);
// 	}
// };
    
function drawImg(xml, img,scale){
    var canvas = document.getElementById("piccanvas1");
    var ctx = canvas.getContext("2d")
    console.log(scale)
    var xmlDoc = xml;
    var nodes = xmlDoc.getElementsByTagName("Node");

    var canvas = document.getElementById("myCanvas");
    // ctx.beginPath();
    for (var i = 0 ; i < nodes.length;  i++){
        console.log("i:", i);
        var originRect = nodes[i].getElementsByTagName("OriginRect")[0];
        console.log("originRect:", originRect);
        var src_x1 = originRect.getAttribute("x1");
        var src_y1 = originRect.getAttribute("y1");
        var src_x2 = originRect.getAttribute("x2");
        var src_y2 = originRect.getAttribute("y2");
        var sliceRect = nodes[i].getElementsByTagName("SliceRect")[0];
        var dest_x1 = sliceRect.getAttribute("x1")/scale;
        var dest_y1 = sliceRect.getAttribute("y1")/scale;
        var dest_x2 = sliceRect.getAttribute("x2")/scale;
        var dest_y2 = sliceRect.getAttribute("y2")/scale;
        ctx.drawImage(img, src_x1, src_y1, src_x2 - src_x1, src_y2 - src_y1,  
            dest_x1, dest_y1,dest_x2 - dest_x1, dest_y2 - dest_y1);
    }
}