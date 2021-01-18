'use strict';

const {Menu, MenuItem, dialog} = require("electron").remote;
const {ipcRenderer, remote, clipboard} = require('electron');
const nativeImage = require('electron').nativeImage;
const xml2js = require('xml2js');
var XMLWriter = require('xml-writer');
const formats = clipboard.availableFormats()
console.log(formats)
Date.prototype.format = function (fmt) {
    var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      S: this.getMilliseconds(), //毫秒
    };
  
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
  
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };
function timestToString(timest, fmt) {
    return new Date(timest).format(fmt?fmt:"yyyy-MM-dd hh:mm:ss");
}
class Rectangle {
    constructor( left, top, width, height) {
        this.left = left;
        this.right = left + width;
        this.top = top;
        this.bottom = top + height;
    }
    // constructor( offset, area) {
    //     this.left = offset.left;
    //     this.right = offset.left + area.width;
    //     this.top = offset.top;
    //     this.bottom = offset.top + area.height;
    // }
    set(left, top, right, bottom) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
    offset(dx, dy) {
        this.left += dx;
        this.right += dx;
        this.top += dy;
        this.bottom += dy;
    }

    contain(x, y) {
        return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom)
    }
}
class LineRectange {
    constructor( x1, y1, x2, y2, delta) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.delta = delta;
    }

    contain(x, y) {
        //console.log(x, y, this.x1, this.y1, this.x2, this.y2);
        if (this.y1 == this.y2) {
            if (this.x1 < this.x2) {
                if ((x + this.delta) < this.x1 || (x - this.delta) > this.x2) return false;
            }
            if (this.x1 > this.x2) {
                if ((x + this.delta) < this.x2 || (x - this.delta) > this.x1) return false;
            }
            if (y < (this.y1 - this.delta) || y > (this.y1 + this.delta)) return false;
            console.log("line hit:", x, y, this.x1, this.y1, this.x2, this.y2);
            return true;
        }
        if (this.x1 == this.x2) {
            if (this.y1 < this.y2) {
                if ((y + this.delta) < this.y1 || (y - this.delta) > this.y2) return false;
            }
            if (this.y1 > this.y2) {
                if ((y + this.delta) < this.y2 || (y - this.delta) > this.y1) return false;
            }
            if (x < (this.x1 - this.delta) || x > (this.x1 + this.delta)) return false;
            console.log("line hit:", x, y, this.x1, this.y1, this.x2, this.y2);
            return true;
        }
        // ax +by + c = 0
        // A = y2 - y1,
        // B = x1- x2,
        // C = x2 * y1 - x1 * y2;
        // d = |AX0 + BY0 + C|/sqrt(A^2 + B^2)
        var d = (Math.abs((this.y2 - this.y1) * x +(this.x1 - this.x2) * y + ((this.x2 * this.y1) - (this.x1 * this.y2)))) / (Math.sqrt(Math.pow(this.y2 - this.y1, 2) + Math.pow(this.x1 - this.x2, 2)));
        //console.log(x, y, this.x1, this.y1, this.x2, this.y2);
        
        if (d > this.delta) return false;
        //var ar = Math.atan(Math.abs((this.y2 - this.y1) / (this.x2 - this.x1)));
        //var ar1 = Math.atan(Math.abs((y - this.y1) / (x - this.x1)));
        //var dx = this.delta * Math.cos(ar);
        //var dy = this.delta * Math.sin(ar);
        //var delta1 = d / Math.tan(ar-ar1);
        //console.log("hit test:", d, ar, ar1, delta1);
        if (this.x1 < this.x2) {
            if (x >= this.x1 && x <= this.x2) {
                console.log("line hit1:", x, y, this.x1, this.y1, this.x2, this.y2);
                return true;
            } else {
                if ( x < this.x1) {
                    var delta1 = Math.sqrt(Math.pow(this.x1 - x, 2) + Math.pow(this.y1 - y, 2));
                    if (delta1 < this.delta) {
                        console.log("line hit2:", x, y, this.x1, this.y1, this.x2, this.y2);
                        return true;
                    }
                }
                if ( x > this.x2) {
                    var delta1 = Math.sqrt(Math.pow(this.x2 - x, 2) + Math.pow(this.y2 - y, 2));
                    if (delta1 < this.delta) {
                        console.log("line hit3:", x, y, this.x1, this.y1, this.x2, this.y2);
                        return true;
                    }
                }
            }
        } else {
            if (x >= this.x2 && x <= this.x1) {
                console.log("line hit4:", x, y, this.x1, this.y1, this.x2, this.y2);
                return true;
            } else {
                if ( x < this.x2) {
                    var delta1 = Math.sqrt(Math.pow(this.x2 - x, 2) + Math.pow(this.y2 - y, 2));
                    if (delta1 < this.delta) {
                        console.log("line hit5:", x, y, this.x1, this.y1, this.x2, this.y2);
                        return true;
                    }
                }
                if ( x > this.x1) {
                    var delta1 = Math.sqrt(Math.pow(this.x1 - x, 2) + Math.pow(this.y1 - y, 2));
                    if (delta1 < this.delta) {
                        console.log("line hit6:", x, y, this.x1, this.y1, this.x2, this.y2);
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
class LineBounding {
    constructor() {
        this.lines = [];
    }
    addLine(x1, y1, x2, y2, delta) {
        this.lines.push(new LineRectange(x1, y1, x2, y2, delta));
    }
    contain(x, y) {
        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].contain( x, y)) return true;
        }
        return false;
    }
}
class EllipseBounding {
    constructor( x1, y1, x2, y2, x3, y3, x4, y4, delta) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.x4 = x4;
        this.y4 = y4;
        this.delta = delta;
    }
    contain(x, y) {
        var a1 = Math.pow((this.x3 - this.x1 - this.delta * 2) / 2, 2);
        var b1 = Math.pow((this.y3 - this.y1 - this.delta * 2) / 2, 2);
        var c1 = (this.x3 + this.x1) / 2;
        var d1 = (this.y3 + this.y1) / 2;
        if ((Math.pow(x-c1, 2) / a1 + Math.pow(y-d1, 2) / b1) <= 1) return false;

        var a2 = Math.pow((this.x3 - this.x1 + this.delta * 2) / 2, 2);
        var b2 = Math.pow((this.y3 - this.y1 + this.delta * 2) / 2, 2);
        if ((Math.pow(x-c1, 2) / a2 + Math.pow(y-d1, 2) / b2) <= 1) {
            console.log("ellipse hit:", x, y, this.x1, this.y1, this.x3, this.y3);
            return true;
        }
        return false;
    }
}

ipcRenderer.on('page-image-done', (event, args)=>{
    console.log('page-image-done:' + args[0]);
    drawPages([args[0]], true);
});

ipcRenderer.on('page-done', (event, args)=>{
    console.log('page-done:' + args[0]);
    pageSizes[args[0] - 1] = getPageSizeRemote(args[0]);
    //relayoutPage(args[0]);
    relayoutAllPage();
});

ipcRenderer.on('file-download-complete', (event)=>{

});

ipcRenderer.on('catalog-done', (event)=>{
    getCatalog();
})



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

function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

//根据QueryString参数名称获取值 
function getQueryStringByName(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}
function isFileComplete() {
    return ipcRenderer.sendSync('caj-is-complete', fileid);
}
function getFilePath() {
    return ipcRenderer.sendSync('caj-get-file-path', fileid);
}
function getFileTitle() {
    return ipcRenderer.sendSync('get-file-title', fileid);
}
function getPageSizeRemote(page) {
    return ipcRenderer.sendSync('caj-get-page-size', fileid, page);
}
function getPageCountRemote() {
    return ipcRenderer.sendSync('caj-get-page-count', fileid);
}
function getReadStatusRemote() {
    return Number(ipcRenderer.sendSync('caj-get-read-status', fileid));
}
function saveReadStatus() {
    ipcRenderer.send('caj-save-read-status', fileid, curPage);
}
function selectTextRemote(page, x1, y1, x2, y2) {
    return ipcRenderer.sendSync('caj-select-text', fileid, page, x1, y1, x2, y2);
}
function getPrinter() {
    return ipcRenderer.sendSync('get-printer');
}
function getPrinterCapabilities(printerName, portName) {
    return ipcRenderer.sendSync('get-printer-capabilities', printerName, portName);
}
function getPrintSetting() {
    return ipcRenderer.sendSync('get-print-print-setting');
}
function abortPrint() {
    ipcRenderer.sendSync('abort-print');
}
function isPrinting() {
    return ipcRenderer.sendSync('is-printing');
}
function getPrintProgress() {
    return ipcRenderer.sendSync('get-print-progress');
}
function getSelectedPaper(papers, name) {
    var paper = null;
    for (var i = 0; i < papers.length; ++i) {
        if (papers[i].name == name) {
            paper = papers[i];
            break;
        }
    }
    return paper;
}
/**
 * 
 * @param {string} filepath 需要打印的文件路径
 * @param {string} pages 页码范围，1-2+8
 * @param {string} printerName 目标打印机名称
 * @param {string} jobName 打印任务名
 * @param {number} copies 打印份数
 * @param {number} duplex 是否双面打印, 0-单面，1-双面，长边翻转，2-双面，短边翻转
 * @param {number} orientation 0-Portrait（纵向）， 1-Landscape（横向）
 * @param {Object} paperSize 目标页面宽度， 目标页面高度，1/10mm
 * @param {Object} margin Left, Right, Top, Bottom, 页边距
 * @param {boolean} ps PostScript打印机,PCLXL打印机
 */
function remotePrint(filepath, jobName, print_setting) {
    return ipcRenderer.sendSync('caj-print-file', filepath, jobName, print_setting);
}
function remoteSearch(text) {
    ipcRenderer.send('caj-search', fileid, text);
}
function stopSearch() {
    ipcRenderer.send('caj-search-stop', fileid);
}
function getSearchProgress() {
    return ipcRenderer.sendSync('caj-get-search-progress', fileid);
}
function getPageSize(page) {
    return pageSizes[page-1];
}

function getAllPageSize() {
    var remotePageSizes = getPageSizeRemote(0);
    console.log(remotePageSizes);
    for (var i = 0; i < pageCount; ++i) {
        pageSizes.push({cx: remotePageSizes[i].cx, cy: remotePageSizes[i].cy});
    }
}
function getPageImage(page, scale, dpi, loadit, reload) {
    ipcRenderer.send('caj-get-page-image', fileid, page, scale, dpi, loadit, reload);
}
ipcRenderer.on('caj-get-page-image-result', (event, fileid, page, ret, reload)=>{
    if (ret && ret.image) {
        drawPagePromise(page, ret, reload);
    }
})
function getPageTextRemote(page) {
    return ipcRenderer.sendSync('caj-get-page-text', fileid, page);
}
function getPagePlainTextRemote(page) {
    return ipcRenderer.sendSync('caj-get-page-plain-text', fileid, page);
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
function encodeUTF16BE( string ) {
    //this le
    //var buffer = Buffer.alloc(2);
    
    var buffer1 = Buffer.from(string, 'ucs-2');
    
    var buffer2 = Buffer.alloc(buffer1.length + 2);
    buffer2[0] = 0xff;
    buffer2[1] = 0xfe;
    buffer2.fill(buffer1, 2);
    //buffer = buffer.swap16();
    for (var i = 0; i < buffer2.length; i += 2) {
        var tmp = buffer2[i];
        buffer2[i] = buffer2[i+1];
        buffer2[i+1] = tmp;
    }
    return buffer2;
}
function getNoteRemote() {
    var rows = ipcRenderer.sendSync('caj-get-note', fileid);
    //console.log(rows);
    if (rows) {
        rows.forEach(element => {
            var xml = Buffer.from(element, 'base64').toString();
            console.log(xml);
            var xmlParser = new xml2js.Parser();
            xmlParser.parseString(xml,function(err,result){
                if (result && result.Item) {
                    var note = {};
                    note['id'] = result.Item.$.id;
                    note['type'] = result.Item.$.Type;
                    note['page'] = Number(result.Item.$.Page);
                    note['color'] = result.Item.$.Color;
                    if (note['color'] && note['color'].length > 6) {
                        note['color'] = note['color'].substring(2);
                    }
                    if (result.Item.$.cdate) {
                        note['cdate'] = Number(result.Item.$.cdate);
                    }
                    if (result.Item.$.mdate) {
                        note['mdate'] = Number(result.Item.$.mdate);
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
                        note['lineWidth'] = Number(result.Item.$.Width);
                    }
                    if (result.Item.RC) {
                        var rects = [];
                        result.Item.RC.forEach(rc=>{
                            var rect = {};
                            rect.left = Number(rc.$.l);
                            rect.right = Number(rc.$.r);
                            rect.top = Number(rc.$.t);
                            rect.bottom = Number(rc.$.b);
                            rects.push(rect);
                        })
                        note['rects'] = rects;
                    }
                    if (result.Item.PT) {
                        var points = [];
                        result.Item.PT.forEach(pt=>{
                            var point = {};
                            point.x = Number(pt.$.x);
                            point.y = Number(pt.$.y);
                            points.push(point);
                        })
                        note['points'] = points;
                        if (note.type == 'Note') {
                            note['rects'] = [{left: points[0].x, top: points[0].y, 
                                right: points[0].x + 2000, bottom: points[0].y + 2000}];
                        }
                    }
                    if (result.Item.curve) {
                        note['curve'] = [];
                        result.Item.curve.forEach(curve=>{
                            var points = [];
                            curve.PT.forEach(pt=>{
                                var point = {};
                                point.x = Number(pt.$.x);
                                point.y = Number(pt.$.y);
                                points.push(point);
                            })
                            note['curve'].push(points);
                        })
                    }
                    setNoteBounding(note);
                    notes.push(note);
                    getPageNote(note.page).push(note);
                }
            });
        });
    }
    sortNote();
}
function setNoteBounding(note) {
    var delta = 800;
    if (note.type == 'Ellipse') {
        if (note.points.length == 4) {
            note.bounding = new EllipseBounding(note.points[0].x, note.points[0].y, note.points[1].x, note.points[1].y, 
                note.points[2].x, note.points[2].y, note.points[3].x, note.points[3].y, delta);
            note.rects = [{left: note.points[0].x, right: note.points[2].x, top: note.points[0].y, bottom: note.points[2].y}];
        } else if (note.rects.length > 0) {
            note.bounding = new EllipseBounding(note.rects[0].left, note.rects[0].top,
                 note.rects[0].right, note.rects[0].top, 
                 note.rects[0].right, note.rects[0].bottom,
                 note.rects[0].left, note.rects[0].bottom, delta);
        }
    } else if (note.type == 'Line') {
        note.bounding = new LineBounding();
        note.bounding.addLine(note.points[0].x, note.points[0].y, note.points[1].x, note.points[1].y, delta);
        note.rects = [{left: note.points[0].x, right: note.points[1].x, top: note.points[0].y, bottom: note.points[1].y}];
    } else if (note.type == 'Rectangle') {
        if (note.points.length == 4) {
            note.bounding = new LineBounding();
            note.bounding.addLine(note.points[0].x, note.points[0].y, note.points[1].x, note.points[1].y, delta);
            note.bounding.addLine(note.points[1].x, note.points[1].y, note.points[2].x, note.points[2].y, delta);
            note.bounding.addLine(note.points[2].x, note.points[2].y, note.points[3].x, note.points[3].y, delta);
            note.bounding.addLine(note.points[3].x, note.points[3].y, note.points[0].x, note.points[0].y, delta);
            note.rects = [{left: note.points[0].x, right: note.points[2].x, top: note.points[0].y, bottom: note.points[2].y}];
        } else if (note.rects.length > 0) {
            note.bounding = new LineBounding();
            note.bounding.addLine(note.rects[0].left, note.rects[0].top, note.rects[0].right, note.rects[0].top, delta);
            note.bounding.addLine(note.rects[0].right, note.rects[0].top, note.rects[0].right, note.rects[0].bottom, delta);
            note.bounding.addLine(note.rects[0].right, note.rects[0].bottom, note.rects[0].left, note.rects[0].bottom, delta);
            note.bounding.addLine(note.rects[0].left, note.rects[0].bottom, note.rects[0].left, note.rects[0].top, delta);
        }
    } else if (note.type == 'Curve' && note.curve) {
        note.bounding = new LineBounding();
        var minx = 100000, miny = 100000, maxx = 0, maxy = 0;
        note.curve.forEach(points=>{
            var point = points[0];
            var point1;
            if (point.x < minx) minx = point.x;
            if (point.x > maxx) maxx = point.x;
            if (point.y < miny) miny = point.y;
            if (point.y > maxy) maxy = point.y;
            for (var i = 1; i < points.length; ++i) {
                point1 = points[i];
                note.bounding.addLine(point.x, point.y, point1.x, point1.y, delta);
                point = point1;
                if (point.x < minx) minx = point.x;
                if (point.x > maxx) maxx = point.x;
                if (point.y < miny) miny = point.y;
                if (point.y > maxy) maxy = point.y;
            }
        })
        note.rects = [{left: minx, right: maxx, top: miny, bottom: maxy}];
    }
}
function unionRect(rect1, rect) {
    if (!rect1.left) {
        rect1.left = rect.left;
        rect1.right = rect.right;
        rect1.top = rect.top;
        rect1.bottom = rect.bottom;
    } else {
        if (rect1.left > rect.left) rect1.left = rect.left;
        if (rect1.right < rect.right) rect1.right = rect.right;
        if (rect1.top > rect.top) top = rect1.rect.top;
        if (rect1.bottom < rect.bottom) rect1.bottom = rect.bottom;
    }
    return rect1;
}
function calcBounding(rects, pixel) {
    var bounding1 = {};
    var bounding2 = {};
    //var width = $("body").width();
    if (rects && rects.length > 0) {
        for (var i = 0; i < rects.length; ++i) {
            var rect = {};
            rect = unionRect(rect, rects[i]);
            //if (rect.right < 0 || rect.left > width) continue;
            if (!bounding1.left) {
                bounding1.left = rect.left;
                bounding1.right = rect.right;
                bounding1.top = rect.top;
                bounding1.bottom = rect.bottom;
            } else {
                if (bounding1.right < rect.left || bounding1.left > rect.right ) {
                    bounding2 = unionRect(bounding2, rect);
                } else {
                    bounding1 = unionRect(bounding1, rect);
                }
            }
        }
        if (bounding2.left) {
            if (bounding2.left > bounding1.right || 
                bounding2.right < bounding1.left ) {
                    ;
            } else {
                bounding1 = unionRect(bounding1, bounding2);
            }
        }
    } else {
        bounding1.left = 0;
        bounding1.right = 0;
        bounding1.top = 0;
        bounding1.bottom = 0;
    }
    if (pixel) {
        bounding1.left = pointm2Pixel(bounding1.left);
        bounding1.right = pointm2Pixel(bounding1.right);
        bounding1.top = pointm2Pixel(bounding1.top);
        bounding1.bottom = pointm2Pixel(bounding1.bottom);
    }
    bounding1.width = bounding1.right - bounding1.left;
    bounding1.height = bounding1.bottom - bounding1.top;
    
    return bounding1;
}
function sortNote() {
    //
    if (caj_settings.note_sort_type == 1) {
        notes.sort((e1, e2)=>{
            if (e1.page == e2.page) {
                var bounding1 = calcBounding(e1.rects);
                var bounding2 = calcBounding(e2.rects);
                if (bounding1.top == bounding2.top) {
                    return bounding1.left - bounding2.left;
                } else {
                    return bounding1.top - bounding2.top;
                }
            } else {
                return e1.page - e2.page;
            }
        })
    } else {
        notes.sort((e1, e2)=>{
            return e2.mdate - e1.mdate;
        })
    }
}
function getNoteById(id) {
    return getNoteById1(notes, id);
}
function getNoteById1(notelist, id) {
    for (var i = 0; i < notelist.length; ++i) {
        if (notelist[i].id == id) {
            return {index:i, note:notelist[i]};
        }
    }
    return null;
}
function getBookmark(page) {
    for (var i = 0; i < notes.length; ++i) {
        if (notes[i].page == page && notes[i].type == 'Bookmark') {
            return {index:i, note:notes[i]};
        }
    }
    return null;
}

function removeNote(note) {
    var n = -1;
    var id;
    var page;
    if (typeof(note) == 'string') {
        var no = getNoteById(note);
        if (no) {
            n = no.index;
            page = no.note.page;
        }
        id = note;
    } else {
        page = note.page;
        n = notes.indexOf(note);
        id = note.id;
    }
    if (n >=0 ) {
        notes.splice(n, 1);
        var pagenote = getPageNote(page);
        var org = getNoteById1(pagenote, id);
        if (org) {
            pagenote.splice(org.index, 1);
        }
        ipcRenderer.send('caj-remove-note', fileid, id);
        $("[section-note-id='" + id + "']").remove();
        $("[section-note-id-1='" + id + "']").remove();
        $("[list-note-id='" + id + "']").remove();
        if (notes.length == 0) {
            $("#note-count").hide();
        } else {
            //$list.hide();
            $("#note-count").show();
            $("#note-count").text('共' + notes.length +'条');
        }
        updatePageButton();
        refreshPage(page);
    }
}
function saveNote(note, add) {
    var fulltext = "";
    var xw = new XMLWriter();
    xw.startDocument('1.0', 'utf-8');
        xw.startElement('Item');
        xw.writeAttribute('Type', note.type);
        xw.writeAttribute('Page', note.page);
        xw.writeAttribute('Color', 'FF' + note.color);
        xw.writeAttribute('id', note.id);
        if (note.cdate) {
            xw.writeAttribute('cdate', note.cdate);
        }
        if (note.mdate) {
            xw.writeAttribute('mdate', note.mdate)
        }
        if (note.desc) {
            fulltext = note.desc;
            xw.writeAttribute('DescText', encodeUTF16BE(note.desc).toString('base64'));
        }
        if (note.title) {
            fulltext = fulltext + ' ' + note.title; 
            xw.writeAttribute('Title', encodeUTF16BE(note.title).toString('base64'));
        }
        if (note.author) {
            xw.writeAttribute('Author', encodeUTF16BE(note.author).toString('base64'));
        }
        if (note.lineWidth) {
            xw.writeAttribute('Width', note.lineWidth);
        }
        if (note.rects && note.type != 'Line' && note.type != 'Rectangle' &&
            note.type != 'Ellipse' && note.type != 'Curve' && note.type != 'Note') {
            note.rects.forEach(element=>{
                xw.startElement('RC');
                xw.writeAttribute('l', Math.trunc(element.left));
                xw.writeAttribute('r', Math.trunc(element.right));
                xw.writeAttribute('t', Math.trunc(element.top));
                xw.writeAttribute('b', Math.trunc(element.bottom));
                xw.endElement();
            })
        }
        if (note.points) {
            if (note.type == 'Curve' && note.curve) {
                note.curve.forEach(points=>{
                    xw.startElement('curve');
                    points.forEach(element=>{
                        xw.startElement('PT');
                        xw.writeAttribute('x', Math.trunc(element.x));
                        xw.writeAttribute('y', Math.trunc(element.y));
                        xw.endElement();
                    })
                    xw.endElement();
                })
            } else {
                note.points.forEach(element=>{
                    xw.startElement('PT');
                    xw.writeAttribute('x', Math.trunc(element.x));
                    xw.writeAttribute('y', Math.trunc(element.y));
                    xw.endElement();
                })
            }
        }
        xw.endElement();
    xw.endDocument();

    var note_str = xw.toString();
    note_str = note_str.slice(39);
    //console.log(note_str);
    if (add) {
        ipcRenderer.send('caj-add-note', fileid, note.id, Buffer.from(note_str).toString('base64'), fulltext);
    } else {
        ipcRenderer.send('caj-update-note', fileid, note.id, Buffer.from(note_str).toString('base64'), fulltext);
    }
}
function getPageNote(page) {
    var page_notes = page_notes_map.get(page);
    if (!page_notes) {
        page_notes = [];
        page_notes_map.set(page, page_notes);
    }
    // notes.forEach(element=>{
    //     if (element.page == page) {
    //         page_notes.push(element);
    //     }
    // })
    return page_notes;
}
function getPageText(page) {
    if (pageTexts[page-1] == undefined) {
        pageTexts[page -1] = getPageTextRemote(page);
    }
    return pageTexts[page-1];
}
function getCatalog() {
    var catalog = ipcRenderer.sendSync('caj-get-catalog', fileid);
    if (catalog) {
        setNavigationTree({childs:catalog});
    }
}

function setupNoteList() {
    var $list = $("#note-list");
    if (notes.length) {
        $list.show();
        $("#empty-tip-block-note").hide();
        $("#note-count").show();
        $("#note-count").text('共' + notes.length +'条');
    } else {
        $list.hide();
        $("#empty-tip-block-note").show();
        $("#note-count").hide();
    }
    
    $list.empty();
    //$bookmark_list.empty();
    notes.forEach(elem=>{
            var li = document.createElement('li');
            li.className = 'marking-item';
            li.setAttribute('list-note-id', elem.id);
            var div_sub = document.createElement('div');
            div_sub.className = 'marking-item-sub';

            var div = document.createElement('div');
            div.className = 'marking-mesg';
            var p = document.createElement('p');
            p.className = 'mesg';
            if (elem.desc) p.textContent = elem.desc;
            div.appendChild(p);
            var span = document.createElement('span');
            span.className = 'flag';
            div.appendChild(span);

            div_sub.appendChild(div);

            div = document.createElement('div');
            div.className = 'original';
            if (elem.title) div.textContent = elem.title;
            div_sub.appendChild(div);
            div = document.createElement('div');
            div.className = 'marking-oprate';
            var div1 = document.createElement('div');
            div1.className = 'marking-date';
            if (elem.mdate)div1.textContent = new Date(elem.mdate).toLocaleString();
            div.appendChild(div1);
            var div2 = document.createElement('div');
            div2.className = 'oprate-list';

            div1 = document.createElement('div');
            div1.className = 'marking-oprate-edit';
            div2.appendChild(div1);
            div1 = document.createElement('div');
            div1.className = 'marking-oprate-delete';
            div2.appendChild(div1);
            div.appendChild(div2);
            
            div_sub.appendChild(div);
            li.appendChild(div_sub);
            $list[0].appendChild(li);
            
            li.addEventListener('click', (e)=>{
                turnToPage(elem.page);
            })
        //}
    })
}

function updateNoteEle(note) {
    var $li = $("[list-note-id='" + note.id + "']");
    if ($li.length == 0) return;
    if ($li.length == 2) {
        $li = $($li[1]);
    }
    $li.empty();
    var div_sub = document.createElement('div');
    div_sub.className = 'marking-item-sub';
    var div = document.createElement('div');
    div.className = 'marking-mesg';
    if (note.desc) div.textContent = note.desc;
    div_sub.appendChild(div);
    div = document.createElement('div');
    div.className = 'original';
    if (note.title) div.textContent = note.title;
    div_sub.appendChild(div);
    div = document.createElement('div');
    div.className = 'marking-oprate';
    var div1 = document.createElement('div');
    div1.className = 'marking-date';
    if (note.mdate) div1.textContent = new Date(note.mdate).toLocaleString();
    div.appendChild(div1);
    var div2 = document.createElement('div');
    div2.className = 'oprate-list';

    div1 = document.createElement('div');
    div1.className = 'marking-oprate-edit';
    div2.appendChild(div1);
    div1 = document.createElement('div');
    div1.className = 'marking-oprate-delete';
    div2.appendChild(div1);
    div.appendChild(div2);
    div_sub.appendChild(div);
    $li[0].appendChild(div_sub);
}
function removeNoteEle(note) {
    var $li = $("[list-note-id='" + note.id + "']");
    $li.remove();
    if (notes.length == 0) {
        //$list.show();
        //$(".empty-tip-block").hide();
        $("#note-count").hide();
    } else {
        //$list.hide();
        $("#note-count").show();
        $("#note-count").text('共' + notes.length +'条');
    }
}

function addNaviItem(item, parent) {
    var node = {};
    node['name'] = item.name;
    node['page'] = item.dest.page;
    node['open'] = true;
    return node;
}

function naviChilds(childs, nodes) {
    childs.forEach(element => {
        var node = addNaviItem(element);
        if (element.childs) {
            var childs_ = [];
            naviChilds(element.childs, childs_);
            node['children'] = childs_;
        }
        nodes.push(node);
    });
}

function setNavigationTree(navi) {
    var nodes = [];
    if (navi && navi.childs) {
        console.log(navi);
        naviChilds(navi.childs, nodes);
    }
    var setting = {
        view:{
            showIcon: false,// 设置 zTree 不显示图标
            showLine: false,//设置 zTree 不显示节点之间的连线
            showTitle:false,//设置 zTree 不显示图标
        },
        callback: {
            onClick: (event, treeId, node, clickFlag)=>{
                var page = node.page;
                turnToPage(Number(page));
            }
        }
    };
    $.fn.zTree.init($("#naviTree"), setting, nodes);
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
let fileid = null;
let pageCount = 0;
let curScale = 100;
let curScaleMode = -1;
let DPI = 96;

let topPage = 0;
let bottomPage = 0;
let curPage = 1;
let pageSizes = [];
let pageTexts = [];
let pageImages = null;
let notes = [];
let page_notes_map = new Map();

let cur_hit_page = 0;
let cur_hit_point = {x:0, y:0};
let cur_hit_page1 = 0;
let cur_hit_point1 = {x:0, y:0};
//let mouse_move_note = null;
//let mouse_hit_note = null;
let start_select_text = false;
let _grabbing = false;
let _drawing = false;
let grab_point = null;
let first_point = {x:0, y:0};
let second_point = {x:0, y:0};
let curve_points = null;
let cur_el_coord = null;
let cur_el_coord1 = null;
let cur_annotationLayer = null;
let cur_selection = null;
let cur_hit_note_id = null;
let cur_hit_note_id1 = null;
let show_search_result = false;
let $viewerContainer = null;

let cur_select_note_id = null;
let printing = false;
let last_event_time = 0;
let last_record_time = 0;
let read_duration = 0;
let record_read_duration = true;
let capture_mouse_event = true;
let caj_settings = {
    top_sidebar: false,
    left_sidebar: false,
    right_sidebar: false,
    note_sort_type: 1,
    note_default_color: 'FFEB85',
    default_scale: 100,
    default_scale_mode: -2,
    publish_to_forum: true,
    showNote: true
}
let TOOL_TYPE = {
    POINTER: 0,
    HAND: 1,
    RECTANGLE: 2,
    ELLIPSE: 3,
    CAPTURE: 4,
    LINE: 5,
    PEN: 6,
    NOTE: 7,
}
let cur_tool_type = TOOL_TYPE.POINTER;
let default_line_width = 100;
let default_line_color = 'FF5E77';
let annotationImg = null;
let select_rectangle = null;
let cur_resize_rectangle = null;

let question_and_public_note_count = 0;
let g_questions =  new Map();
let g_public_notes =[];
let can_publish = false;
let login_username = '';
let user_head_image_and_nickname = new Map();
let g_my_collect_questions = null;

function getCAJSetting() {
    return ipcRenderer.sendSync('caj-get-reader-setting');
}
function saveCAJSetting() {
    ipcRenderer.send('caj-save-reader-setting', caj_settings);
}
window.addEventListener('beforeunload', function (e) {
    if (printing) {
        e.preventDefault();
        e.returnValue = '';
        return;
    }
    if (curPage) {
        saveReadStatus();
    }
    if (record_read_duration) {
        read_duration += (new Date().getTime() - last_record_time);
        saveReadDuration();
    }
    if (curScaleMode == -1 || curScaleMode == -2 || curScaleMode == -3 ) {
        caj_settings.default_scale_mode = curScaleMode;
    }
    saveCAJSetting();
});

function saveReadDuration() {
    if (ipcRenderer.sendSync('caj-save-read-duration', fileid, read_duration)) {
        read_duration = 0;
    }
}
function initReader() {
    if (caj_settings.top_sidebar) {
        $('.fixed-btn').addClass("fixed-sure");
    }
    if (caj_settings.left_sidebar) {
        $(".one-left").removeClass("one-left-hide");
		$(".one-left-btn").removeClass("left-open");
    } else {
        $(".one-left").addClass("one-left-hide");
		$(".one-left-btn").addClass("left-open");
    }
    if (caj_settings.right_sidebar) {
        $(".one-right").removeClass("one-right-hide");
		$(".one-right-btn").removeClass("right-open");
    } else {
        $(".one-right").addClass("one-right-hide");
		$(".one-right-btn").addClass("right-open");
    }
    if (caj_settings.note_sort_type == 1) {
        $("#order-by-paragraph").addClass("selected");
    } else {
        $("#order-by-time").addClass("selected");
    }
    $viewerContainer = $("#viewerContainer");
    if (can_publish) {
        $("#forum").hide();
        $("#Question").hide();
        $("#Question1").hide();
        $("#note-send-to").hide().removeClass("radio-selected");
        $("#note-dialog-dummy").show();
    }
    if (caj_settings.default_scale_mode != undefined) curScaleMode = caj_settings.default_scale_mode;
    if (curScaleMode == -4) {
        $(".select-number >[data-value='" + newScale + "']").addClass("number-selected").siblings().removeClass("number-selected");
    } else {
        $(".select-number >[data-value='" + curScaleMode + "']").addClass("number-selected").siblings().removeClass("number-selected");
    }
    setToggleNoteBtn();
    // $viewerContainer.on("keydown", (e)=>{
    //     console.log(e.key);
    //     if (e.key == 'ArrowLeft') {
    //         if (e.ctrlKey) {
    //             turnToPage(1);
    //         } else {
    //             prevPage();
    //         }
    //     } else if (e.key == 'ArrowRight') {
    //         if (e.ctrlKey) {
    //             turnToPage(pageCount);
    //         } else {
    //             nextPage();
    //         }
    //     }
    // })
}
function initAll() {
    DPI = getDPI()[0];
    console.log(DPI);
    var settings = getCAJSetting();
    if (settings) caj_settings = settings;
    initReader();
    annotationImg = new Image();
    annotationImg.src = './imgs/light/annotation.png';

    fileid = getQueryStringByName('fileid');
    getNoteRemote();
    setupNoteList();
    pageCount = getPageCountRemote();
    pageImages = new Array(pageCount);
    getCatalog();
    getAllPageSize();
    console.log('pagecount:' + pageCount);
    createPageLayout();
    setScrollEvent();

    let spanpageNumbers = document.getElementById("page-count");
    spanpageNumbers.textContent =  pageCount.toString();
    setPageButton();
    updatePageButton();
    for (var i = 0; i < pageCount; ++i) {
        pageTexts[i] = undefined;
    }
    
    last_record_time = last_event_time = new Date().getTime();
    addMouseEventListener();
    window.addEventListener('keydown',(e)=>{
        last_event_time = new Date().getTime();
        console.log(e.key);
        if (e.key == 'ArrowLeft') {
            if (e.ctrlKey) {
                turnToPage(1);
            } else {
                prevPage();
            }
        } else if (e.key == 'ArrowRight') {
            if (e.ctrlKey) {
                turnToPage(pageCount);
            } else {
                nextPage();
            }
        }
    })

    setInterval(() => {
        var timest = new Date().getTime();
        var duration = timest - last_event_time;
        if (duration > 1000 * 60) {
            if (record_read_duration) {
                read_duration += (timest - last_record_time);
                record_read_duration = false;
                console.log('stop record');
            }
        } else {
            if (!record_read_duration) {
                record_read_duration = true;
                last_record_time = timest;
                console.log('begin record');
            }
        }
    }, 1000*60);
    getLoginUser();
    checkCanPublish();
    getMyCollectQuestion();
}

function turnToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
        //let viewer = document.getElementById("viewerContainer");
        let page = document.getElementById('zpage-number-' + pageNumber);
        page.scrollIntoView(true);
    }
}

function prevPage() {
    turnToPage(curPage - 1);
    updatePageButton();
}
function nextPage() {
    turnToPage(curPage + 1);
    updatePageButton();
}

function updatePageButton(){
    document.getElementById("current-page").value = curPage;
    var $prev = $(".progress-left-arrow");//.removeClass("page-disable")
    var $next = $(".progress-right-arrow");

    if (curPage == 1) {
        $prev.addClass('page-disable');
    } else {
        $prev.removeClass('page-disable');
    }
    if (curPage == pageCount) {
        $next.addClass('page-disable');
    } else {
        $next.removeClass('page-disable');
    }
    if (getBookmark(curPage)) {
        $(".add-mark-btn").addClass("added-flag");
    } else {
        $(".add-mark-btn").removeClass("added-flag");
    }
}

function pageInViewport(pageNumber) {
    let viewer = $viewerContainer[0];
    let page = document.getElementById('zpage-number-' + pageNumber);
    let boundRect = page.getBoundingClientRect();
    let viewBound = viewer.getBoundingClientRect();
    let top = boundRect.top - viewBound.top;
    let bottom = boundRect.bottom - viewBound.top;
    let clientHeight = viewer.clientHeight;
    return (top < clientHeight && bottom > 0) ;
}

function getPageByPoint(x, y) {
    if (topPage == 0) return 0;

    for (var i = topPage; i <= bottomPage; ++i) {
        var el = document.getElementById('zpage-image-number-' + i);
        var coord = getCoords(el);
        
        var rect = new Rectangle(coord.left, coord.top, el.clientWidth, el.clientHeight);
        if (rect.contain(x , y)) {
            cur_hit_point.x = pixel2mPoint(x - coord.left);
            cur_hit_point.y = pixel2mPoint( y - coord.top);
            cur_el_coord = coord;
            cur_annotationLayer = document.getElementById('zpage-annotation-number-' + i);
            return i;
        }
    }
    return 0;
}
function getPageByPoint1(x, y) {
    if (topPage == 0) return 0;

    for (var i = topPage; i <= bottomPage; ++i) {
        var el = document.getElementById('zpage-image-number-' + i);
        var coord = getCoords(el);
        
        var rect = new Rectangle(coord.left, coord.top, el.clientWidth, el.clientHeight);
        if (rect.contain(x , y)) {
            cur_hit_point1.x = pixel2mPoint(x - coord.left);
            cur_hit_point1.y = pixel2mPoint( y - coord.top);
            cur_el_coord1 = coord;
            //cur_annotationLayer = document.getElementById('zpage-annotation-number-' + i);
            return i;
        }
    }
    return 0;
}

function getVisiblePage(viewer) {
    //let scrollTop = viewer.scrollTop;
    let viewBound = viewer.getBoundingClientRect();
    let clientHeight = viewer.clientHeight;
    let viewPages = [];
    let percent = 0;
    curPage = 0;
    for (var i = 1; i <= pageCount; ++i) {
        let page = document.getElementById('zpage-number-' + i);
        let boundRect = page.getBoundingClientRect();
       
        let top = boundRect.top - viewBound.top;
        let bottom = boundRect.bottom - viewBound.top;
        if (top > clientHeight) continue;
        if (bottom < 0) continue;
        //console.log( boundRect);
        viewPages.push(i);
        if (curPage == 0) {
            curPage = i;
        } else {
            if (top < 0) {
                top = 0;
            }
            if (bottom > clientHeight) {
                bottom = clientHeight;
            }
            let tmp_percent = (bottom - top) / page.clientHeight;
            if (tmp_percent > percent) {
                percent = tmp_percent;
                curPage = i;
            }
        }
    }
    if (viewPages.length > 0) {
        topPage = viewPages[0];
        bottomPage = viewPages[viewPages.length -1];
    }
    updatePageButton();
    return viewPages;
}
var scroll_top_last = 0;
function setScrollEvent(){
    let viewerContainerElement = $viewerContainer[0];
    viewerContainerElement.addEventListener("scroll", function(event){
         if (Math.abs(scroll_top_last - this.scrollTop) > 5) {
             let pages = getVisiblePage(this);
             //console.log(pages);
             scroll_top_last = this.scrollTop;
             drawPages(pages, false);
             updatePageButton();
             hideToolbar();
             clearSelection();
         }
    });
}

function setPageButton(){
    // document.getElementById('print').addEventListener('click', function() {
    //     print();
    // });
    // let previouseButton = document.getElementById("previous");
    // let nextButton = document.getElementById("next");
    // nextButton.addEventListener("click", function(){
    //     turnToPage(curPage+1);
    // });

    // previouseButton.addEventListener("click", function() {
    //     turnToPage(curPage-1);
    // });
    // let pageNumber = document.getElementById("pageNumber");
    // pageNumber.addEventListener('change', (event) => {
    //     turnToPage(event.target.value);
    // });
    // let scaleSelect = document.getElementById('scaleSelect');
    // scaleSelect.addEventListener('change', (event)=>{
    //     let value = event.target.value;
    //     let newScale;
    //     switch(value) {
    //         case 'page-actual': {
    //             newScale = 100;
    //             break;
    //         }
    //         case 'page-fit': {
    //             let viewer = document.getElementById("viewerContainer");
    //             let pageSize = getPageSize(curPage);
    //             let cy = pageSize.cy * DPI / 72;
    //             newScale = viewer.clientHeight * 10000 / cy;
    //             break;
    //         }
    //         case 'page-width': {
    //             let viewer = document.getElementById("viewerContainer");
    //             let pageSize = getPageSize(curPage);
    //             let cx = pageSize.cx * DPI / 72;
    //             newScale = viewer.clientWidth * 10000 / cx;
    //             break;
    //         }
    //         default: {
    //             newScale = Number(value) * 100;
    //         }
    //     }
    //     setScale(newScale);
    // });
    // document.getElementById('zoomOut').addEventListener('click', (event)=>{
    //     setScale(curScale - 20);
    // });
    // document.getElementById('zoomIn').addEventListener('click', (event)=>{
    //     setScale(curScale + 20);
    // });
}
function zoomin() {
    setScale(curScale + 20);
}
function zoomout() {
    setScale(curScale - 20);
}
function calcScale() {
    var newScale = 0;
    let viewer = $viewerContainer[0];
    let pageSize = getPageSize(curPage);
    if (curScaleMode == -2) {
        let cx = (pageSize.cx) * DPI / 72;
        newScale = (viewer.clientWidth - point2Pixel(page_margin_l*2) - 20) * 10000 / cx;
    } else {
        let cy = (pageSize.cy + page_margin_t * 200) * DPI / 72;
        newScale = viewer.clientHeight * 10000 / cy;
    }
    return newScale;
}
//https://developer.mozilla.org/zh-CN/docs/Web/API/Blob
function setScale(newScale, force) {
    if (newScale < 0) {
        switch(newScale) {
            case -1:
                curScaleMode = -1;
                newScale = 100;
                $("#sizeInput").val('实际大小');
                break;
            case -2:
                curScaleMode = -2;
                newScale = calcScale();
                $("#sizeInput").val('适应宽度');
                break;
            case -3:
                curScaleMode = -3;
                newScale = calcScale();
                $("#sizeInput").val('适应高度');
                break;
            default:
                return;
        }
        newScale = Math.trunc(newScale);
        if (newScale < 25) newScale = 25;
        if (newScale > 400) newScale = 400;
        
    } else {
        curScaleMode = -4;
        if (newScale < 25) newScale = 25;
        if (newScale > 400) newScale = 400;
        newScale = Math.trunc(newScale);
        $("#sizeInput").val(newScale + '%');
    }
    if (curScaleMode == -4) {
        $(".select-number >[data-value='" + newScale + "']").addClass("number-selected").siblings().removeClass("number-selected");
    } else {
        $(".select-number >[data-value='" + curScaleMode + "']").addClass("number-selected").siblings().removeClass("number-selected");
    }
    if (newScale != curScale || force) {
        curScale = newScale;
        relayoutAllPage();
    }
}

function relayoutAllPageEx(force) {
    if (curScaleMode == -1 || curScaleMode == -2 || curScaleMode == -3) {
        setScale(curScaleMode, force);
    } else {
        setScale(curScale, force);
    }
}

function drawAnnotation(pageNumber, ctx) {
    let page_notes = getPageNote(pageNumber);
    if (page_notes && page_notes.length > 0 && caj_settings.showNote ) {
        //ctx.save();
        var original = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'multiply';
        page_notes.forEach(item=>{
            var sections = $("[section-note-id='" + item.id + "']");
            ctx.lineWidth = 1;
            if (item.type == 'Highlight') {
                ctx.fillStyle = '#' + item.color;
                ctx.beginPath();
                for (var i = 0; i < sections.length; i++) {
                    var value = sections[i];
                    ctx.rect(value.offsetLeft, value.offsetTop, value.offsetWidth, value.offsetHeight);
                }
                ctx.closePath();
                ctx.fill();
            } else if (item.type == 'Underline') {
                ctx.strokeStyle = '#' + item.color;
                ctx.beginPath();
                for ( i = 0; i < sections.length; i++) {
                    value = sections[i];
                    ctx.moveTo(value.offsetLeft, value.offsetTop + value.offsetHeight);
                    ctx.lineTo(value.offsetLeft + value.offsetWidth, value.offsetTop + value.offsetHeight);
                }
                ctx.closePath();
                ctx.stroke();
            } else if (item.type == 'Crossout') {
                ctx.strokeStyle = '#' + item.color;
                ctx.beginPath();
                for ( i = 0; i < sections.length; i++) {
                    value = sections[i];
                    ctx.moveTo(value.offsetLeft, value.offsetTop + value.offsetHeight / 2);
                    ctx.lineTo(value.offsetLeft + value.offsetWidth, value.offsetTop + value.offsetHeight / 2 );
                }
                ctx.closePath();
                ctx.stroke();
            } else if (item.type == 'Rectangle' || item.type == 'Line') {
                //ctx.globalCompositeOperation = original;
                ctx.strokeStyle = '#' + item.color;
                if (item.lineWidth) ctx.lineWidth = pointm2Pixel(item.lineWidth);
                ctx.beginPath();
                var x1 = pointm2Pixel(item.points[0].x);
                var y1 = pointm2Pixel(item.points[0].y);
                //var x2 = pointm2Pixel(item.points[1].x);
                //var y2 = pointm2Pixel(item.points[1].y);
                if (item.type == 'Rectangle') {
                    var x2 = pointm2Pixel(item.points[2].x);
                    var y2 = pointm2Pixel(item.points[2].y);
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x1, y2);
                    ctx.lineTo(x1, y1);
                } else if (item.type == 'Line') {
                    var x2 = pointm2Pixel(item.points[1].x);
                    var y2 = pointm2Pixel(item.points[1].y);
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.closePath();
                ctx.stroke();
            } else if (item.type == 'Ellipse') {
                ctx.strokeStyle = '#' + item.color;
                //ctx.strokeStyle = "#FF0000"
                if (item.lineWidth) ctx.lineWidth = pointm2Pixel(item.lineWidth); else ctx.lineWidth = 1;
                ctx.beginPath();
                var x1 = pointm2Pixel(item.points[0].x);
                var y1 = pointm2Pixel(item.points[0].y);
                //var x2 = pointm2Pixel(item.points[1].x);
                //var y2 = pointm2Pixel(item.points[1].y);
                var x3 = pointm2Pixel(item.points[2].x);
                var y3 = pointm2Pixel(item.points[2].y);
                //var x4 = pointm2Pixel(item.points[3].x);
               // var y4 = pointm2Pixel(item.points[3].y);
                
                var w = (x3 - x1) / 2;
                var h = (y3 - y1) / 2;
                ctx.ellipse(x1 + w , y1 + h, Math.abs(w), Math.abs(h), 0, 0, Math.PI*2);
                
                ctx.closePath();
                ctx.stroke();
            } else if (item.type == 'Curve' && item.curve) {
                var moveto = false;
                if (item.lineWidth) ctx.lineWidth = pointm2Pixel(item.lineWidth); else ctx.lineWidth = 1;
                ctx.strokeStyle = '#' + item.color;
                item.curve.forEach(points=>{
                    ctx.beginPath();
                    points.forEach(point=>{
                        var x = pointm2Pixel(point.x);
                        var y = pointm2Pixel(point.y);
                        if (!moveto) {
                            ctx.moveTo(x, y);
                            moveto = true;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    })
                    ctx.stroke();
                })
                
            } else if (item.type == 'Note') {
                //ctx.fillStyle = '#' + item.color;
                // ctx.beginPath();
                // for (var i = 0; i < sections.length; i++) {
                //     var value = sections[i];
                //     ctx.rect(value.offsetLeft, value.offsetTop, value.offsetWidth, value.offsetHeight);
                // }
                // ctx.closePath();
                // ctx.fill();
                var value = sections[0];
                ctx.drawImage(annotationImg, value.offsetLeft, value.offsetTop, value.offsetWidth, value.offsetHeight);
            } 
        })
        ctx.globalCompositeOperation = original;
        //ctx.restore();
    }
    if (cur_selection) {
        var original = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'multiply';
        var sections = $("[selection-id='text-selection']");
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        for (var i = 0; i < sections.length; i++) {
            var value = sections[i];
            ctx.rect(value.offsetLeft, value.offsetTop, value.offsetWidth, value.offsetHeight);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = original;
    }
    if ( cur_tool_type == TOOL_TYPE.CAPTURE && !_drawing) {
        var x1 = 0, y1 = 0, x2 = 0, y2 = 0;
        if (select_rectangle && select_rectangle.page == pageNumber) {
            x1 = pointm2Pixel(select_rectangle.rect.left);
            y1 = pointm2Pixel(select_rectangle.rect.top);
            x2 = pointm2Pixel(select_rectangle.rect.right);
            y2 = pointm2Pixel(select_rectangle.rect.bottom);
        }
        if (!(x1 == 0 && x2 == 0 && y1 == 0 && y2 == 0)) {
            ctx.strokeStyle = '#1c7fee';
            ctx.setLineDash([4, 2]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x1, y1);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            addResizeBox(ctx, x1, y1, 1);
            addResizeBox(ctx, x1, y2, 4);
            addResizeBox(ctx, x2, y1, 2);
            addResizeBox(ctx, x2, y2, 3);
            addResizeBox(ctx, (x1 + x2)/2, y1, 5);
            addResizeBox(ctx, (x1 + x2)/2, y2, 6);
            addResizeBox(ctx, x1, (y1 + y2)/2, 7);
            addResizeBox(ctx, x2, (y1 + y2)/2, 8);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.fillStyle = '#40404040';
        var size = getPageSize(pageNumber);
        var cx = pointm2Pixel(size.cx);
        var cy = pointm2Pixel(size.cy);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x1, 0);
        ctx.lineTo(x1, cy);
        ctx.lineTo(0, cy);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x2, 0);
        ctx.lineTo(cx, 0);
        ctx.lineTo(cx, cy);
        ctx.lineTo(x2, cy);
        ctx.lineTo(x2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x2, 0);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, cy);
        ctx.lineTo(x1, cy);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        ctx.fill();
    }
    if (_drawing) {
        ctx.lineWidth = pointm2Pixel(default_line_width);
        ctx.strokeStyle = '#' + default_line_color;
        ctx.setLineDash([]);
        if (cur_tool_type == TOOL_TYPE.PEN) {
            var moveto = false;
            ctx.beginPath();
            curve_points.forEach(point=>{
                var x = pointm2Pixel(point.x);
                var y = pointm2Pixel(point.y);
                if (!moveto) {
                    ctx.moveTo(x, y);
                    moveto = true;
                } else {
                    ctx.lineTo(x, y);
                }
            })
            ctx.stroke();
        } else {
            ctx.beginPath();
            var x1 = pointm2Pixel(first_point.x);
            var y1 = pointm2Pixel(first_point.y);
            var x2 = pointm2Pixel(second_point.x);
            var y2 = pointm2Pixel(second_point.y);
            if (cur_tool_type == TOOL_TYPE.RECTANGLE) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x1, y1);
            } else if (cur_tool_type == TOOL_TYPE.ELLIPSE) {
                var w = (x2 - x1) / 2;
                var h = (y2 - y1) / 2;
                ctx.ellipse(x1 + w , y1 + h, Math.abs(w), Math.abs(h), 0, 0, Math.PI*2);
            } else if (cur_tool_type == TOOL_TYPE.LINE) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            } 
            ctx.closePath();
            ctx.stroke();
            if (cur_tool_type == TOOL_TYPE.CAPTURE) {
                ctx.beginPath();
                ctx.strokeStyle = '#1c7fee';
                ctx.setLineDash([4, 2]);
                ctx.lineWidth = 1;
                if (resizeBoxHit != -1) {
                    x1 = pointm2Pixel(cur_resize_rectangle.left);
                    y1 = pointm2Pixel(cur_resize_rectangle.top);
                    x2 = pointm2Pixel(cur_resize_rectangle.right);
                    y2 = pointm2Pixel(cur_resize_rectangle.bottom);
                }
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x1, y1);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = '#40404040';
                var size = getPageSize(pageNumber);
                var cx = pointm2Pixel(size.cx);
                var cy = pointm2Pixel(size.cy);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x1, 0);
                ctx.lineTo(x1, cy);
                ctx.lineTo(0, cy);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x2, 0);
                ctx.lineTo(cx, 0);
                ctx.lineTo(cx, cy);
                ctx.lineTo(x2, cy);
                ctx.lineTo(x2, 0);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x1, 0);
                ctx.lineTo(x2, 0);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x1, 0);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x1, y2);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, cy);
                ctx.lineTo(x1, cy);
                ctx.lineTo(x1, y2);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
}
var resize_box_width = 24;
function addResizeBox(p, x, y, type) {
    var d = resize_box_width / 3;
    var e = d / 1.5;
    var f = 3;
    switch (type){
        case 1:
            p.moveTo(x - f, y + d);
            p.lineTo(x - f, y - f);
            p.lineTo(x + d, y - f);
            break;
        case 2:
            p.moveTo(x - d, y - f);
            p.lineTo(x + f, y - f);
            p.lineTo(x + f, y + d);
            break;
        case 3:
            p.moveTo(x + f, y - d);
            p.lineTo(x + f, y + f);
            p.lineTo(x - d, y + f);
            break;
        case 4:
            p.moveTo(x - f, y - d);
            p.lineTo(x - f, y + f);
            p.lineTo(x + d, y + f);
            break;
        case 5:
            p.moveTo(x - e, y - f);
            p.lineTo(x + e, y - f);
            break;
        case 6:
            p.moveTo(x - e, y + f);
            p.lineTo(x + e, y + f);
            break;
        case 7:
            p.moveTo(x - f, y - e);
            p.lineTo(x - f, y + e);
            break;
        case 8:
            p.moveTo(x + f, y - e);
            p.lineTo(x + f, y + e);
            break;
    }
}
var my_cursor_type = ["resize-nwse", "resize-ns", "resize-nesw", "resize-ew", 
                      "resize-nwse", "resize-ns", "resize-nesw", "resize-ew", "resize-move"];
var resizeBoxHit = -1;
function setCursor1(type) {
    $viewerContainer.removeClass("capture resize-ew resize-ns resize-nesw resize-nwse resize-move");
    if (type != -1) $viewerContainer.addClass(my_cursor_type[type]);
    else $viewerContainer.addClass('capture');
}
function setCursor() {
    $viewerContainer.removeClass("grab line note-cursor pen rectangle ellipse object");
    $viewerContainer.removeClass("capture resize-ew resize-ns resize-nesw resize-nwse resize-move");

    if (cur_tool_type == TOOL_TYPE.HAND) {
        $viewerContainer.addClass("grab");
    } else if (cur_tool_type == TOOL_TYPE.LINE) {
        $viewerContainer.addClass("line");
    } else if (cur_tool_type == TOOL_TYPE.RECTANGLE) {
        $viewerContainer.addClass("rectangle");
    } else if (cur_tool_type == TOOL_TYPE.ELLIPSE) {
        $viewerContainer.addClass("ellipse");
    } else if (cur_tool_type == TOOL_TYPE.NOTE) {
        $viewerContainer.addClass("note-cursor");
    } else if (cur_tool_type == TOOL_TYPE.PEN) {
        $viewerContainer.addClass("pen");
    } else if (cur_tool_type == TOOL_TYPE.CAPTURE) {
        $viewerContainer.addClass("capture");
    }
}
var origin_tool_type;
function captureImage() {
    if (cur_tool_type != TOOL_TYPE.CAPTURE) {
        origin_tool_type = cur_tool_type;
        cur_tool_type = TOOL_TYPE.CAPTURE;
        $viewerContainer.addClass("capture");
    } else {
        cur_tool_type = origin_tool_type;
        $viewerContainer.removeClass("capture");
        cur_resize_rectangle = null;
        select_rectangle = null;
    }
    refreshView();
}
function setupTextLayer( pageNumber, ctx) {
    let textLayer = document.getElementById('zpage-text-number-' + pageNumber);
    removeAllChild(textLayer);
    let pageText = getPageText(pageNumber);
    if (pageText && pageText.length > 0) {
        textLayer.style.visibility = 'visible';
        for (let j = 0; j < pageText.length; j++) {
            let charCount = pageText[j].charCount;
            if (charCount <= 0) {
                continue;
            }
            let charWidth =  pageText[j].charWidth;
            //console.log("charWidth:", charWidth);
            let xMin = pageText[j].xLeft[0];
            let xMax = pageText[j].xLeft[charCount - 1] + charWidth;
            let yMax = pageText[j].yMax;
    
            let spanObject = document.createElement("span");

            //console.log("xleft:", multiBy(xMin));
            spanObject.style.left = multiBy(xMin) + "pt";
            spanObject.style.top = multiBy(yMax) + "pt";
            spanObject.style.fontSize = multiBy(charWidth) + "pt";
            spanObject.style.fontFamily = "serif";
            spanObject.style.webkitUserSelect = 'none';
            //spanObject.style.transform = "scaleX(1)";
            var chars = pageText[j].text;
            ctx.font = multiBy(charWidth) + "pt serif";
            var textWidth = ctx.measureText(chars).width;
            var canvasWidth = xMax - xMin;
            canvasWidth = multiBy(canvasWidth) * DPI / 72;
            //console.log("textWidth:", textWidth, "canvasWidth:", canvasWidth);
            var scaleX =  canvasWidth/textWidth;
            //console.log("scaleX:", scaleX);
            spanObject.style.transform = "scaleX(" + scaleX + ")";
            spanObject.innerText = chars;
            textLayer.appendChild(spanObject);
        }
    }
}

function createAnnotation(annotationLayer, note) {
    
    if (note.type == 'Line' || note.type == 'Rectangle' || note.type == 'Ellipse' || note.type == 'Curve') return;
    // if (note.type == 'Note') {
    //     let section = document.createElement("section");
    //     section.setAttribute('section-note-id', note.id);
    //     section.className = 'linkAnnotation';
    //     section.style.left = multiBy(note.points[0].x) + "pt";
    //     section.style.top = multiBy(note.points[0].y) + "pt";
    //     section.style.width = multiBy(3200) + "pt";
    //     section.style.height = multiBy(3200) + "pt";
    //     section.style.background = '#' + note.color;
    //     section.style.opacity = '0.01';
    //     section.addEventListener('mouseenter', (event)=>{
    //         console.log('mouseenter:' + note.id);
    //         cur_hit_note_id = note.id;
    //     })
    //     section.addEventListener('mouseleave', (event)=>{
    //         console.log('mouseleave:' + note.id);
    //         cur_hit_note_id = null;
    //     })
    //     annotationLayer.appendChild(section);
    //     return;
    // }
    if (!note.rects || note.rects.length == 0) return;
    note.rects.forEach(rect=>{
        //console.log('section:', rect);
        let section = document.createElement("section");
        section.setAttribute('section-note-id', note.id);
        section.className = 'linkAnnotation';
        section.style.left = multiBy(rect.left) + "pt";
        section.style.top = multiBy(rect.top) + "pt";
        if (note.type == 'Note') {
            section.style.width = 16 + "pt";
            section.style.height = 16 + "pt";
        } else {
            section.style.width = multiBy(rect.right - rect.left) + "pt";
            section.style.height = multiBy(rect.bottom - rect.top) + "pt";
        }
        section.style.background = '#' + note.color;
        section.style.opacity = '0.01';
        section.addEventListener('mouseenter', (event)=>{
            console.log('mouseenter:' + note.id);
            if (cur_tool_type != TOOL_TYPE.CAPTURE) cur_hit_note_id = note.id;
        })
        section.addEventListener('mouseleave', (event)=>{
            console.log('mouseleave:' + note.id);
            cur_hit_note_id = null;
        })
        annotationLayer.appendChild(section);
    })
    if (note.desc && note.desc.length > 0 && (note.type == 'Highlight' || note.type == 'Underline' || note.type == 'Crossout')) {
        var rect = note.rects[note.rects.length - 1];
        var img = document.createElement('img');
        img.setAttribute('section-note-id-1', note.id);
        ///img.setAttribute('border', '0');
        img.className = 'annotation1';
        img.style.top = multiBy(rect.bottom) + "pt";
        img.style.left = multiBy(rect.right) + "pt";
        annotationLayer.appendChild(img);
        img.addEventListener("click", (e)=>{
            e.stopPropagation();
            if (cur_tool_type != TOOL_TYPE.CAPTURE) {
                showNoteDialog('写批注', note, false);
            }
        })
    }
}
function clearSelection() {
    var $items = $("[selection-id='text-selection']");
    $items.remove();
    if (cur_selection) {
        refreshPage(cur_selection.page)
        cur_selection = null;
    }
}
function createSelection(annotationLayer, rects, isSearchResult) {
    rects.forEach(rect=>{
        let section = document.createElement("section");
        if (isSearchResult) {
            section.setAttribute('search-result-id', 'search-result-selection');
        } else {
            section.setAttribute('selection-id', 'text-selection');
        }
        section.className = 'linkAnnotation';
        section.style.left = multiBy(rect.left) + "pt";
        section.style.top = multiBy(rect.top) + "pt";
        section.style.width = multiBy(rect.right - rect.left) + "pt";
        section.style.height = multiBy(rect.bottom - rect.top) + "pt";
        section.style.background = '#00ff00';
        section.style.opacity = '0.01';
        annotationLayer.appendChild(section);
    })
}
function createSelectionFromSearchResult(result) {
    var layer = document.getElementById('zpage-annotation-number-' + result.page);
    createSelection(layer, result.rects, true);
}

function addAnnotation(note) {
    let annotationLayer = document.getElementById('zpage-annotation-number-' + note.page);
    $("[section-note-id='" + note.id + "']").remove();
    $("[section-note-id-1='" + note.id + "']").remove();
    annotationLayer.style.visibility = caj_settings.showNote ? 'visible' : 'hidden';
    createAnnotation(annotationLayer, note);
    var org = getNoteById(note.id);
    if (org) {
        saveNote(note, false);
        notes.splice(org.index, 1);
    } else {
        saveNote(note, true);
    }
    notes.push(note);
    var pagenote = getPageNote(note.page);
    org = getNoteById1(pagenote, note.id);
    if (org) {
        pagenote.splice(org.index, 1);
    }
    setNoteBounding(note);
    pagenote.push(note);
    sortNote();
    setupNoteList();
}

function removeBookmark() {
    var note = getBookmark(curPage);
    if (note) {
        removeNote(note.note);
    }
}

function addBookmark() {
    var timest = new Date().getTime();
    var note = {type:'Bookmark', id:randomId(), page:curPage, desc:'', 
    title:'书签', cdate:timest, mdate:timest};
    note.points = [{x:1000, y:1000}];
    note['color'] = '00FF00';
    addAnnotation(note);
}
function updateNote(note) {
    saveNote(note, false);
    updateNoteEle(note);
    refreshPage(note.page);
}

function setupAnnotation(pageEl, pageNumber) {
    let annotationLayer = document.getElementById('zpage-annotation-number-' + pageNumber);
    removeAllChild(annotationLayer);
    let page_notes = getPageNote(pageNumber);
    if (page_notes && page_notes.length > 0) {
        annotationLayer.style.visibility = caj_settings.showNote ? 'visible' : 'hidden';
        page_notes.forEach(item=>{
            createAnnotation(annotationLayer, item);
        })
    }
}

function imageOnLoad() {
    var x = 0;
    var y = 0;
    var width = this.page.clientWidth;
    var height = this.page.clientHeight;
    let image_layer = document.getElementById( 'zpage-image-number-' + this.pageNumber);
    image_layer.style.visibility = 'visible';
    let pageCanvas = document.getElementById('zpage-image-canvas-' + this.pageNumber);
    pageCanvas.width = width;
    pageCanvas.height = height;
    let ctx = pageCanvas.getContext("2d");
    ctx.save();
    ctx.drawImage(this, x, y, this.width, this.height);
    console.log("imageOnLoad pageNumber:",  this.pageNumber);
    if (this.resetLayer) {
        //setupTextLayer(this.pageNumber, ctx);
        setupAnnotation(this.page, this.pageNumber);
        this.resetLayer = false;
    }
    drawAnnotation(this.pageNumber, ctx);
    ctx.restore();
}

let page_margin_t = 15;
let page_margin_l = 15;
function getLayoutSize() {
    var height = 0;
    var width = 0;
    for (var i = 0; i <pageCount; ++i) {
        height += pageSizes[i].cy;
        if (width < pageSizes[i].cx) width = pageSizes[i].cx;
        //height += 1500;
    }
   // width += 3000;
    return {cx:width * curScale / 10000 + page_margin_l * 2, cy:height * curScale / 10000 + page_margin_t * (pageCount+1)};
}

function createPageLayout() {
    var top = page_margin_t;
    var boundingSize = getLayoutSize();
    //let $viewerContainer = $("#viewerContainer");
    var vcWidth = pixel2Point($viewerContainer.width());
    var vcHeight = pixel2Point($viewerContainer.height());
    if (boundingSize.cx < vcWidth) boundingSize.cx = vcWidth;
    if (boundingSize.cy < vcHeight) {
        top += (vcHeight - boundingSize.cy) / 2;
        boundingSize.cy = vcHeight;
    }
    
    let viewer = document.getElementById("viewer");
    $(viewer).css({'width':boundingSize.cx + 'pt', 'height': boundingSize.cy + 'pt'});
    
    for (var i = 1; i <= pageCount; ++i) {
        let page = document.createElement("div");
        page.className = "page";
        page.setAttribute("data-page-number", i);
        page.setAttribute("id", 'zpage-number-' + i);
        let pageSize = getPageSize(i);
        
        page.style.width = (pageSize.cx * curScale / 10000) + 'pt';
        page.style.height = (pageSize.cy * curScale / 10000) + 'pt';
        page.style.left = (boundingSize.cx - (pageSize.cx * curScale / 10000))/2 + 'pt';
        page.style.top = top + 'pt';
        top += 15;

        let loading_div = document.createElement('div');
        loading_div.setAttribute('id', 'zpage-loading-number-' + i);
        loading_div.setAttribute('style', 'width:100%; height: 100%; display: flex; justify-content: center;   align-items: center;') ;
        let loading_img = document.createElement("img");
        loading_img.setAttribute('src', '../imgs/loading.gif');
        loading_div.appendChild(loading_img);

        page.appendChild(loading_div);

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
        annotation_layer.style.visibility = caj_settings.showNote ? 'visible' : 'hidden';
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
function removeAllChild(element) {
    if (element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}
function preparePageImage(pageNumber, scale, dpi) {
    return ipcRenderer.sendSync('caj-prepare-page-image', fileid, pageNumber, scale, dpi);
}
function relayoutPage(pageNumber) {
    let page = document.getElementById('zpage-number-' + pageNumber);
    let pageSize = getPageSize(pageNumber);
    //console.log(pageSize);
    
    if (pageInViewport(pageNumber)) {
        page.style.width = (pageSize.cx * curScale / 10000) + 'pt';
        page.style.height = (pageSize.cy * curScale / 10000) + 'pt';
        if (preparePageImage(pageNumber, curScale, DPI)) {
            drawPages([pageNumber], true);
        }
    } else {
        page.removeAttribute('drawn');
        page.setAttribute('relayout', 'true');
    }
    
}

function relayoutAllPage() {
    var top = page_margin_t;
    var boundingSize = getLayoutSize();
    //console.log('viewerContainer:w=', $viewerContainer.width(), ', h=', $viewerContainer.height());
    var vcWidth = pixel2Point($viewerContainer.width() - 20);
    var vcHeight = pixel2Point($viewerContainer.height());
    //console.log('vc:w=', vcWidth, ', h=', vcHeight);
    //console.log('boundingSize:w=',boundingSize.cx, ', h=', boundingSize.cy);
    if (boundingSize.cx < vcWidth) boundingSize.cx = vcWidth;
    if (boundingSize.cy < vcHeight) {
        top += (vcHeight - boundingSize.cy) / 2;
        boundingSize.cy = vcHeight;
    } 
    let viewer = document.getElementById("viewer");
    $(viewer).css({'width':boundingSize.cx + 'pt', 'height': boundingSize.cy + 'pt'});
    //let timest1 = new Date().getTime();
    
    for (var i = 1; i <= pageCount; ++i) {
        //relayoutPage(i);
        let page = document.getElementById('zpage-number-' + i);
        let pageSize = getPageSize(i);
        page.style.width = (pageSize.cx * curScale / 10000) + 'pt';
        page.style.height = (pageSize.cy * curScale / 10000) + 'pt';
        page.style.left = (boundingSize.cx - (pageSize.cx * curScale / 10000))/2 + 'pt';
        page.style.top = top + 'pt';
        top += page_margin_t;
        page.removeAttribute('drawn');
        page.setAttribute('relayout', 'true');
    }

    // let viewerContainerElement = document.getElementById("viewerContainer");
    // let pages = getVisiblePage(viewerContainerElement);
    // drawPages(pages, false);
    turnToPage(curPage);

    //let timest = new Date().getTime();
    //console.log('time:' + (timest - timest1));
}

function drawPageAsync(pageNumber, ret, reload) {
    // var image;
    // var d1 = Date.now();
    // //let nativeImage1 = nativeImage.createFromBuffer(ret.image);
    // //image = nativeImage1.toDataURL();
    // image = "data:image/png;base64," + Buffer.from(ret.image).toString('base64');
    // var d2 = Date.now();
    // console.log('createFromBuffer:', d2-d1);
    //console.log("drawPageAsync(pageNumber):", pageNumber);
    let page = document.getElementById('zpage-number-' + pageNumber);
    if (page.getAttribute('drawn')) {
        if (!reload) {
            return;
        }
    }
    if (page.getAttribute('relayout')) {
        let pageSize = getPageSize(pageNumber);
        page.style.width = (pageSize.cx * curScale / 10000) + 'pt';
        page.style.height = (pageSize.cy * curScale / 10000) + 'pt';
        page.removeAttribute('relayout');
    }
    let loading_div = document.getElementById('zpage-loading-number-' + pageNumber);
    if (loading_div)  page.removeChild(loading_div);
    page.setAttribute('drawn', 'true');
    let pageImg = new Image();
    pageImg.resetLayer = true;
    pageImg.page = page;
    pageImg.scale = ret.scale;
    pageImg.pageNumber = pageNumber;
    pageImg.onload = imageOnLoad;
    pageImg.src = "data:image/png;base64," + Buffer.from(ret.image).toString('base64');
    pageImages[pageNumber - 1] = pageImg;
}

function pageImageExist(page, scale) {
    if (page < 1 || page > pageCount) return false;
    if (!pageImages[page-1]) return false;
    if (pageImages[page-1].scale != scale) return false;
    return true;
}

function refreshPage(pageNumber) {
    var pageImg = pageImages[pageNumber - 1];
    if (pageImg) {
        pageImg.onload();
    }
}

function drawPagePromise(pageNumber, ret, reload){
    return new Promise((resolve, reject) =>
    {
        console.log("asyncFunc");
        drawPageAsync(pageNumber, ret, reload);
        resolve(pageNumber);
    });
}

function isPageDrawn(page) {
    let pageEl = document.getElementById('zpage-number-' + page);
    return Boolean(pageEl.getAttribute('drawn'));
}

function drawPages(pages, reload) {
    pages.forEach(element => {
        if ((pageInViewport(element) && !isPageDrawn(element)) || reload) {
            let ret = getPageImage(element, curScale, DPI, true, reload);
           // console.log("pageNumber:", element, "ret:", ret);
            // if (ret && ret.image) {
            //     drawPagePromise(element, ret.image, reload);
            // }
        }
    });
    if (pages.length) {
        var first = pages[0] - 1;
        if (first > 0 ) {
            if (!pageImageExist(first, curScale)) getPageImage(first, curScale, DPI, true, reload);
        }
        var last = pages[pages.length - 1];
        if (last < pageCount) {
            if (!pageImageExist(last, curScale)) getPageImage(last, curScale, DPI, true, reload);
        }
    }
}

//initAll();
function showToast(msg, success) {
    var $toast = $("#toast");
    $toast.removeClass("read-copy-bg read-close-bg no-bg");
    if (success == undefined) {
        $toast.addClass("no-bg");
    } else {
        if (success) {
            $toast.addClass("read-copy-bg");
        } else {
            $toast.addClass("read-close-bg");
        }
    }
    $toast.text(msg);
    $toast.show().delay(1000).hide(0);
}
function showWaitingDialog(msg) {
    $("#msg-text").text(msg);
    $("#waitingDialog").dialog({
        dialogClass: "no-titlebar",
        closeOnEscape: false,
        resizable: false, modal: true, width: "auto", minWidth: 400, minHeight: 0
    });
}

function closeWaitingDialog() {
    if ($("#waitingDialog").dialog) {
        $("#waitingDialog").dialog("close");
    }
}
function showPromptDialog(title, message, positive, negative, showclose) {
    if (title) {
        $("#prompt-title").show().text(title);
    } else {
        $("#prompt-title").hide();
    }
    $("#prompt-text").text(message);
    var $positive = $("#positive-btn");
    var $negative = $("#negative-btn");
    $positive.off("click").on("click", ()=>{
        $("#promptDialog").dialog("close");
    });
    $negative.off("click").on("click", ()=>{
        $("#promptDialog").dialog("close");
    });
    $positive.text("确定");
    $negative.text("取消");
    if (positive) {
        if (positive.callback) {
            $positive.off("click").on("click", ()=>{
                positive.callback();
                $("#promptDialog").dialog("close");
            });
        }
        if (positive.title) {
            $positive.text(positive.title);
        }
    }
    if (negative) {
        if (negative.callback) {
            $negative.off("click").on("click", ()=>{
                negative.callback();
                $("#promptDialog").dialog("close");
            });
        }
        if (negative.title) {
            $negative.text(negative.title);
        }
        $negative.show();
    } else {
        $negative.hide();
    }
    $(".toast-close").off("click").on("click", ()=>{
        if (negative && negative.callback) {
            negative.callback();
        }
        $("#promptDialog").dialog("close");
    })
    if (showclose) $(".toast-close").show(); else $(".toast-close").hide();
    $("#promptDialog").dialog({
        dialogClass: "no-titlebar",
        resizable: false, draggable: false, modal: true, width:"auto"
    });
}

function myKeypressListener(e) {
    last_event_time = e.timeStamp;
}
function myMouseEventListener(e) {
    last_event_time = new Date().getTime();
    if (!capture_mouse_event) return;
    switch(e.type) {
        case 'mouseup': mouseupListener(e);break;
        case 'mousedown': mousedownListener(e);break;
        case 'mousemove': mousemoveListener(e);break;
        case 'mousewheel': mousewheelListener(e);break;
        case 'contextmenu': contextMenuListener(e);break;
        case 'click': mouseClickListener(e);break;
    }
}
function contextMenuListener(e) {
    var $reader_opration = $("#reader_opration");
    if (!$reader_opration.is(":visible")) {
        if (isFileComplete()) {
            showContextMenu(window, document, e);
        }
    }
}
function mousedownListener(e) {
    //console.log(e);
    //clearSelection();
    console.log('mousedown');
    if (e.buttons == 1) {
        var className = e.target.className;
        cur_hit_page = -1;
        //console.log(className);
        if (className != 'textLayer' && className != 'annotationLayer' && className != 'canvasWrapper') {
            className = e.target.parentNode.className;
        }
        //console.log(className);
        if (className != 'textLayer' && className != 'annotationLayer' && className != 'canvasWrapper') {
            return;
        }
        if (cur_tool_type == TOOL_TYPE.POINTER) {
            cur_hit_page = getPageByPoint(e.pageX, e.pageY);
            start_select_text = true;
        } else if (cur_tool_type == TOOL_TYPE.HAND) {
            $viewerContainer.removeClass("grab");
            $viewerContainer.addClass("grabbing");
            _grabbing = true;
            grab_point = {x:e.x, y:e.y};
        } else if (cur_tool_type >= TOOL_TYPE.HAND && cur_tool_type <= TOOL_TYPE.LINE) {
            cur_hit_page = getPageByPoint(e.pageX, e.pageY);
            if (cur_hit_page != -1) {
                _drawing = true;
            }
            first_point.x = cur_hit_point.x;
            first_point.y = cur_hit_point.y;
            second_point.x = cur_hit_point.x;
            second_point.y = cur_hit_point.y;
            if (cur_tool_type == TOOL_TYPE.CAPTURE && resizeBoxHit != -1) {
                cur_resize_rectangle = new Rectangle();
                cur_resize_rectangle.set(select_rectangle.rect.left, select_rectangle.rect.top, 
                    select_rectangle.rect.right, select_rectangle.rect.bottom);
            } 
        } else if (cur_tool_type == TOOL_TYPE.PEN) {
            cur_hit_page = getPageByPoint(e.pageX, e.pageY);
            if (cur_hit_page != -1) {
                _drawing = true;
                curve_points = [];
                first_point.x = cur_hit_point.x;
                first_point.y = cur_hit_point.y;
                curve_points.push({x:first_point.x, y:first_point.y});
            }
        } else if (cur_tool_type == TOOL_TYPE.NOTE) {
            cur_hit_page = getPageByPoint(e.pageX, e.pageY);
            first_point.x = cur_hit_point.x;
            first_point.y = cur_hit_point.y;
        }
        e.preventDefault();
        e.stopPropagation();
    }
}
function getNoteTypeDesc(tool_type) {
    switch(tool_type){
        case TOOL_TYPE.RECTANGLE: return {desc:'矩形', type:'Rectangle'};
        case TOOL_TYPE.ELLIPSE: return {desc:'椭圆', type:'Ellipse'};
        case TOOL_TYPE.LINE: return {desc:'直线', type:'Line'};
        case TOOL_TYPE.PEN: return {desc:'曲线', type:'Curve'};
        case TOOL_TYPE.CAPTURE: return  {desc:'', type:'SelectRectangle'};
    }
}
function mouseupListener(e)
{
    console.log('mouseup');
    if (cur_tool_type == TOOL_TYPE.HAND) {
        $viewerContainer.addClass("grab");
        $viewerContainer.removeClass("grabbing");
        _grabbing = false;
    }
    if ( cur_tool_type >= TOOL_TYPE.RECTANGLE && cur_tool_type <= TOOL_TYPE.LINE && _drawing ) {
        _drawing = false;
        if (Math.abs(first_point.x - second_point.x) > 100 || Math.abs(first_point.y - second_point.y) > 100 || resizeBoxHit != -1) {
            var timest = new Date().getTime();
            var type = getNoteTypeDesc(cur_tool_type);
            var note = {type:type.type, id:randomId(), page:cur_hit_page, title: type.desc, 
            desc:'', cdate:timest, mdate:timest};
            if (cur_tool_type == TOOL_TYPE.ELLIPSE || cur_tool_type == TOOL_TYPE.RECTANGLE) {
                note.points = [{x:first_point.x, y:first_point.y}, {x:second_point.x, y:first_point.y},
                     {x:second_point.x, y:second_point.y}, {x:first_point.x, y:second_point.y}];
            } else {
                note.points = [{x:first_point.x, y:first_point.y}, {x:second_point.x, y:second_point.y}];
            }
            note['color'] = default_line_color;
            note['lineWidth'] = default_line_width;
            if (cur_tool_type == TOOL_TYPE.CAPTURE) {
                note.rect = new Rectangle();
                if (resizeBoxHit == -1) {
                    var x1 = Math.min(first_point.x, second_point.x);
                    var x2 = Math.max(first_point.x, second_point.x);
                    var y1 = Math.min(first_point.y, second_point.y);
                    var y2 = Math.max(first_point.y, second_point.y);
                    note.rect.set(x1, y1, x2, y2);
                } else {
                    note.rect.set(cur_resize_rectangle.left, cur_resize_rectangle.top, cur_resize_rectangle.right, cur_resize_rectangle.bottom);
                    resizeBoxHit = -1;
                }
                select_rectangle = note;
            } else {
                addAnnotation(note);
            }
            refreshPage(cur_hit_page);
        }
    }
    if (cur_tool_type == TOOL_TYPE.PEN && _drawing) {
        _drawing = false;
        if (curve_points.length > 1) {
            var timest = new Date().getTime();
            var type = getNoteTypeDesc(cur_tool_type);
            var note = {type: type.type, id:randomId(), page:cur_hit_page, title: type.desc, 
            desc: '', cdate: timest, mdate: timest};
            note.curve = [curve_points];
            curve_points = [];
            note['color'] = default_line_color;
            note['lineWidth'] = default_line_width;
            addAnnotation(note);
            refreshPage(cur_hit_page);
        }
    }
    if (cur_tool_type == TOOL_TYPE.NOTE) {
        if (cur_hit_page != -1) {
            var note = {type:'Note', id:randomId(), page:cur_hit_page, title:'', 
            desc:'', cdate:timest, mdate:timest};
            note.rects = [{
                left: first_point.x, right: first_point.x + 2000,
                top: first_point.y, bottom: first_point.y + 2000
            }];
            note.points = [{x: first_point.x, y: first_point.y}];
            //addAnnotation(note);
            //refreshPage(cur_hit_page);
            showNoteDialog('写批注', note, true);
            var $items = $(".tool-list >.tool-item");
            selectToolItem($($items[0]));
        }
    }
}
function selectToolItem($item) {
    var index = $item.index();
    $item.attr('selected', true).siblings().attr('selected', false);
    switch(index) {
        case 0:
            cur_tool_type = TOOL_TYPE.POINTER;
            $(".textLayer").removeClass("textLayer-disable-select");
            break;
        default: {
            $(".textLayer").addClass("textLayer-disable-select");
            switch(index) {
            case 1:
                cur_tool_type = TOOL_TYPE.HAND; break;
            case 2:
                cur_tool_type = TOOL_TYPE.CAPTURE; break;
            case 3:
                cur_tool_type = TOOL_TYPE.RECTANGLE; break;
            case 4:
                cur_tool_type = TOOL_TYPE.ELLIPSE; break;
            case 5:
                cur_tool_type = TOOL_TYPE.LINE; break;
            case 6:
                cur_tool_type = TOOL_TYPE.PEN; break;
            case 7:
                cur_tool_type = TOOL_TYPE.NOTE; break;
            }
        }
    }
    setCursor();
    if (cur_tool_type != TOOL_TYPE.CAPTURE) {
        cur_resize_rectangle = null;
        select_rectangle = null;
    }
    refreshView();
    console.log('selectToolItem');
}
function mousemoveListener(e) {
    if (e.buttons == 1) {
        if (cur_hit_page && start_select_text) {
            var x1, y1, x2, y2;
            x1 = cur_hit_point.x;
            y1 = cur_hit_point.y;
            x2 = pixel2mPoint( e.pageX - cur_el_coord.left);
            y2 = pixel2mPoint( e.pageY - cur_el_coord.top);

            var o = selectTextRemote(cur_hit_page, x1, y1, x2, y2);
            
            if (o && o.rects) {
                cur_selection = null;
                clearSelection();
                createSelection(cur_annotationLayer, o.rects);
                cur_selection = o;
                refreshPage(cur_hit_page);
            }
            return;
        }
        if (_grabbing) {
            var deltaX = e.x - grab_point.x;
            var deltaY = e.y - grab_point.y;
            scrollBy(deltaX, deltaY);
            grab_point = {x:e.x, y:e.y};
        }
        if (_drawing) {
            if (cur_tool_type == TOOL_TYPE.PEN) {
                second_point.x = pixel2mPoint( e.pageX - cur_el_coord.left);
                second_point.y = pixel2mPoint( e.pageY - cur_el_coord.top);
                if (Math.abs(first_point.x - second_point.x) > 100 || Math.abs(first_point.y - second_point.y) > 100) {
                    first_point.x = second_point.x;
                    first_point.y = second_point.y;
                    curve_points.push({x:first_point.x, y:first_point.y});
                    refreshPage(cur_hit_page);
                }
            } else {
                second_point.x = pixel2mPoint( e.pageX - cur_el_coord.left);
                second_point.y = pixel2mPoint( e.pageY - cur_el_coord.top);
                if (cur_tool_type == TOOL_TYPE.CAPTURE && resizeBoxHit != -1) {
                    moveOrResize(cur_resize_rectangle, resizeBoxHit, second_point.x - first_point.x, second_point.y - first_point.y);
                    first_point.x = second_point.x;
                    first_point.y = second_point.y;
                    console.log(cur_resize_rectangle);
                }
                refreshPage(cur_hit_page);
            }
        }
    } else {
        var className = e.target.className;
        cur_hit_page = -1;
        
        if (className != 'textLayer' && className != 'annotationLayer' && className != 'canvasWrapper') {
            className = e.target.parentNode.className;
        }
        
        if (className != 'textLayer' && className != 'annotationLayer' && className != 'canvasWrapper') {
            return;
        }
        if (cur_tool_type == TOOL_TYPE.POINTER && caj_settings.showNote) {
            cur_hit_page1 = getPageByPoint1(e.pageX, e.pageY);
            if (cur_hit_page1 != 0) {
                var x = pixel2mPoint( e.pageX - cur_el_coord1.left);
                var y = pixel2mPoint( e.pageY - cur_el_coord1.top);
                var pagenotes = getPageNote(cur_hit_page1);
                var mouse_move_note = null;
                for (var i = 0; i < pagenotes.length; ++i) {
                    if (pagenotes[i].bounding) {
                        if (pagenotes[i].bounding.contain(x, y)) {
                            mouse_move_note = pagenotes[i];
                            break;
                        }
                    }
                }
                if (mouse_move_note) {
                    cur_hit_note_id1 = mouse_move_note.id;
                    $viewerContainer.addClass("object");
                } else {
                    cur_hit_note_id1 = null;
                    $viewerContainer.removeClass("object");
                }
            }
        } else if (cur_tool_type == TOOL_TYPE.CAPTURE) {
            if (select_rectangle) {
                if (getPageByPoint1(e.pageX, e.pageY) == select_rectangle.page) {
                    var x = ( e.pageX - cur_el_coord1.left);
                    var y = ( e.pageY - cur_el_coord1.top);
                    resizeBoxHit = resizeBoxHitTest(pointm2Pixel(select_rectangle.rect.left), pointm2Pixel(select_rectangle.rect.top),
                    pointm2Pixel(select_rectangle.rect.right), pointm2Pixel(select_rectangle.rect.bottom), x, y);
                    //console.log(resizeBoxHit);
                    setCursor1(resizeBoxHit);
                }
            }
        }
    }
}

function resizeBoxHitTest(x1, y1, x2, y2, x, y) {
    var d = resize_box_width / 2;
    var resizeBox = new Rectangle();
    resizeBox.set(x1 - d, y1 - d, x1 + d, y1 + d);
    if (resizeBox.contain(x, y))
        return 0;
    resizeBox.set((x1+x2)/2 - d, y1 - d, (x1+x2)/2 + d, y1 + d);
    if (resizeBox.contain(x, y))
        return 1;
    resizeBox.set(x2 - d, y1 - d, x2 + d, y1 + d);
    if (resizeBox.contain(x, y))
        return 2;
    resizeBox.set(x2 - d, (y1+y2)/2 - d, x2 + d, (y1+y2)/2 + d);
    if (resizeBox.contain(x, y))
        return 3;
    resizeBox.set(x2 - d, y2 - d, x2 + d, y2 + d);
    if (resizeBox.contain(x, y))
        return 4;
    resizeBox.set((x1+x2)/2 - d, y2 - d, (x1+x2)/2 + d, y2 + d);
    if (resizeBox.contain(x, y))
        return 5;
    resizeBox.set(x1 - d, y2 - d, x1 + d, y2 + d);
    if (resizeBox.contain(x, y))
        return 6;
    resizeBox.set(x1 - d, (y1+y2)/2 - d, x1 + d, (y1+y2)/2 + d);
    if (resizeBox.contain(x, y))
        return 7;
    resizeBox.set(x1, y1, x2, y2);
    if (resizeBox.contain(x, y))
        return 8;
    return -1;
}
function moveOrResize(rect, t, dx, dy) {
    switch(t)
    {
        case 8://move
            rect.offset(dx, dy);
            break;
        case 0://left top
            rect.left += dx;
            rect.top += dy;
            break;
        case 1:// top
            rect.top += dy;
            break;
        case 2://top right
            rect.top += dy;
            rect.right += dx;
            break;
        case 3://right
            rect.right += dx;
            break;
        case 4://right bottom
            rect.right += dx;
            rect.bottom += dy;
            break;
        case 5://bottom
            rect.bottom += dy;
            break;
        case 6://left bottom
            rect.left += dx;
            rect.bottom += dy;
            break;
        case 7://left
            rect.left += dx;
            break;
    }
    //rect.sort();
}
function scrollBy(deltaX, deltaY) {
    $viewerContainer[0].scrollBy(-deltaX, -deltaY);
}
function mousewheelListener(e) {
    console.log(e);
        if (e.ctrlKey) {
            if (e.wheelDelta > 0) {
                setScale(curScale + 10);
            } else {
                setScale(curScale - 10);
            }
        }
}
function hideToolbar() {
    $("#reader_opration").hide();
    cur_select_note_id = null;
}
function getCurSelectNote() {
    return getNoteById(cur_select_note_id).note;
}
function calcToolbarPosition(__bounding, reader_opration_width, reader_opration_height, page) {
    var x, y;
    var offset = $("#zpage-number-" + page).offset();
    //var clientRect = document.documentElement.getBoundingClientRect();
    var clientRect = $viewerContainer[0].getBoundingClientRect();
    var bounding = JSON.parse(JSON.stringify(__bounding));
    bounding.left += offset.left;
    bounding.right += offset.left;
    bounding.top += offset.top;
    bounding.bottom += offset.top;

    x = bounding.left + bounding.width / 2 - reader_opration_width / 2;
    y = bounding.bottom + 10;
    //x += 30;
    //y += 60;
    
    console.log(offset);
    if ((y + reader_opration_height) > clientRect.bottom) {
        y = bounding.top - 20 - reader_opration_height;
    }

    if (y < 0) {
        y = (bounding.top + bounding.bottom) / 2;
    }
    if ((x + reader_opration_width) > clientRect.right) {
        x = clientRect.right - reader_opration_width;
    }
    x -= clientRect.left;

    if (x < 0) x = 0;
    var $top_sj = $(".top-sj");
    var $bottom_sj = $(".bottom-sj");
    if ((y)< bounding.top) {
        $top_sj.hide();
        $bottom_sj.show();
    } else {
        $top_sj.show();
        $bottom_sj.hide();
    }
    return { 'top':y+"px", 'left': x+"px"};
}
function mouseClickListener(e) {
    var elem = e.target || e.srcElement;
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
    var menuTool = document.getElementById("menu-tool");
    var linesizeBox = document.getElementById("line-size");

    if(!(menuTool==elem || menuTool.contains(elem) || linesizeBox==elem || linesizeBox.contains(elem))) {
          linesizeBox.classList.add("hide")
          $("#line-color-list").addClass("hide");
    }
    //缩放尺寸下拉框
    var sizeBlock = document.getElementById("size-btn-item");
    var sizeSelect = document.getElementById("size-number-select");
    if(!(sizeBlock==elem || sizeBlock.contains(elem) || sizeSelect==elem || sizeSelect.contains(elem))) {
          sizeSelect.classList.add("hide")
    }
    if (cur_tool_type != TOOL_TYPE.POINTER && cur_tool_type != TOOL_TYPE.HAND) {
        return;
    }
    var $reader_opration = $("#reader_opration");
    start_select_text = false;
    if ($reader_opration.is(":visible")) {
        hideToolbar();
        clearSelection();
    } else {
        var $note_toolbar = $("#note-toolbar");
        var $note_toolbar1 = $("#note-toolbar1");
        var $text_toolbar = $("#text-toolbar");
        var $color_toolbar = $("#color-toolbar");
        
        if (cur_selection && cur_selection.text) {
            $note_toolbar.hide();
            $note_toolbar1.hide();
            $color_toolbar.hide();
            $text_toolbar.show();
            var reader_opration_width = $reader_opration.width();
            var reader_opration_height = $reader_opration.height();
            
            var bounding = calcBounding(cur_selection.rects, true);
            var pos = calcToolbarPosition(bounding, reader_opration_width, reader_opration_height, cur_hit_page);
            $reader_opration.show().css(pos);
        } else if (cur_hit_note_id || cur_hit_note_id1) {
            cur_select_note_id = cur_hit_note_id || cur_hit_note_id1;
            if (cur_hit_note_id) {
                $note_toolbar1.hide();
                $note_toolbar.show();
            } else {
                $note_toolbar.hide();
                $note_toolbar1.show();
            }
            
            $color_toolbar.show();
            $text_toolbar.hide();
            var note = getNoteById(cur_select_note_id).note;
            if (note.title && note.title.length > 0) {
                $("#markingDown1").text('改批注');
            } else {
                $("#markingDown1").text('写批注');
            }
            var reader_opration_width = $reader_opration.width();
            var reader_opration_height = $reader_opration.height();
            
            var pos = calcToolbarPosition(calcBounding(note.rects, true), 
            reader_opration_width, reader_opration_height, note.page);
            $reader_opration.show().css(pos);
        }  else {
            hideToolbar();
            clearSelection();
        }
    }
}
function addMouseEventListener() {
    window.addEventListener('contextmenu', myMouseEventListener);
    window.addEventListener('mousedown', myMouseEventListener);
    window.addEventListener('mouseup', myMouseEventListener);
    window.addEventListener('mousemove', myMouseEventListener);
    window.addEventListener('mousewheel', myMouseEventListener);
    window.addEventListener('click', myMouseEventListener);
}

// function removeMouseEventListener() {
//     window.removeEventListener('contextmenu', contextMenuListener);
//     window.removeEventListener('mousedown', mousedownListener);
//     window.removeEventListener('mouseup', mousedownListener);
//     window.removeEventListener('mousemove', mousemoveListener);
//     window.removeEventListener('mousewheel', mousewheelListener);
//     window.removeEventListener('click', mousewheelListener);
// }
function randomId() {
    //var id = stringRandom(16, {letters: 'abcdefghijklmnopqrsquvwxyz'});
    var timestamp2 = new Date().getTime();
    return timestamp2.toString();
}
function removeDuplicateRect(rects) {
    var newRects =[];
    Array.prototype.forEach.call(rects, function(rect, idx){
        for (var i = 0; i < newRects.length; ++i) {
            if (newRects[i].left == rect.left && newRects[i].right == rect.right &&
                newRects[i].top == rect.top && newRects[i].bottom == rect.bottom) {
                return;
            }
        }
        newRects.push(rect);
    })
    return newRects;
}
function noteFromSelection() {
    var timest = new Date().getTime();
//     return {id:randomId(), page:page, title:text, desc:text, rects:rects, cdate:timest, mdate:timest};
    return {id:randomId(), page:cur_selection.page, desc:'', 
        title:cur_selection.text, rects:cur_selection.rects, cdate:timest, mdate:timest};
}
function addNoteFromSelection(type) {
    var note = noteFromSelection();
    note['type'] = type;
    note['color'] = caj_settings.note_default_color?caj_settings.note_default_color:'FFEB85';
    addAnnotation(note);
    clearSelection();
    refreshPage(note.page);
}
function setTextToClipbord(text) {
    clipboard.writeText(text);
}
function getSelectImage() {
    var pageImg = pageImages[select_rectangle.page - 1];
    if (pageImg) {
        var x1 = pointm2Pixel(select_rectangle.rect.left, pageImg.scale);
        var y1 = pointm2Pixel(select_rectangle.rect.top, pageImg.scale);
        var x2 = pointm2Pixel(select_rectangle.rect.right, pageImg.scale);
        var y2 = pointm2Pixel(select_rectangle.rect.bottom, pageImg.scale);
        //var image = nativeImage.createFromDataURL(pageImg.src);
        var image = nativeImage.createFromBuffer(Buffer.from(pageImg.src.substring(22), 'base64'));
        if (image) {
            var cropImage = image.crop({x: x1, y: y1, width: x2 - x1, height: y2 - y1});
            if (cropImage) {
                return cropImage;
            }
        }
    }
    return null;
}
function showContextMenu(win, doc, e) {
    //alert('showContextMenu');
    const menu = new Menu();
    if (cur_tool_type == TOOL_TYPE.CAPTURE) {
        if (select_rectangle) {
            menu.append(new MenuItem({
                label: "复制",
                click: function() {
                    var image = getSelectImage();
                    if (image) {
                        clipboard.writeImage(image);
                        showToast("所选内容已复制", true);
                    }
                }
            }));
            menu.append(new MenuItem({
                label: "另存为...",
                click: function() {
                    var image = getSelectImage();
                    if (image) {
                        saveImage(image);
                    }
                }
            }));
            menu.popup();
        }
    } else {
        menu.append(new MenuItem({
            label: "拷贝当前页",
            click: function() {
                if (cur_hit_page >=1 && cur_hit_page <= pageCount) {
                    var text = getPagePlainTextRemote(cur_hit_page);
                    setTextToClipbord(text);
                    showToast("所选内容已复制", true);
                }
            }
            }));
        menu.append(new MenuItem({
                label: "另存为...",
                click: function() {
                    saveAs();
                }
                }));
        menu.append(new MenuItem({
            type: "separator"}));
        menu.append(new MenuItem({
            label: "打印",
            click: function() {
                print();
            }
            }));
        menu.popup()
    }
}
function getFileName(title) {
    return title.replace(/[\^:?*<>|\r\n"]/g, '_');
}
function showSaveAsDialog(filename, ext) {
    var pathname = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        title: '另存为',
        defaultPath: filename,
        filters: ext
    });
    console.log(pathname);
    return pathname;
}
function saveAs() {
    var title = getFileTitle();
    var pathname = showSaveAsDialog(getFileName(title) + '.pdf');
    if (pathname) {
        if (ipcRenderer.sendSync("file-save-as", getFilePath(), pathname)) {
            showToast("文件另存成功", true);
        } else {
            showToast("文件另存失败", false);
        }
    }
}
function saveImage(image) {
    var pathname = showSaveAsDialog('', [{extensions:['png'], name: 'PNG'}]);
    if (pathname) {
        //var data = image.toPNG();
        if (ipcRenderer.sendSync("image-save-as", pathname, image.toPNG())) {
            showToast("保存成功", true);
        } else {
            showToast("保存失败", false);
        }
    }
}
function exportNote() {
    var title = getFileTitle();
    var pathname = showSaveAsDialog(getFileName(title) + '_标注.txt');
    if (pathname) {
        showWaitingDialog("正在导出标注...")
        ipcRenderer.send("export-note", pathname, [fileid]);
    }
}
ipcRenderer.on("export-note-result", (event, result)=>{
    closeWaitingDialog();
    if (result) {
        showToast("标注导出成功", true);
    } else {
        showToast("标注导出失败", false);
    }
})
ipcRenderer.on("shortcut-print", (event)=>{
    print();
})
ipcRenderer.on("shortcut-save", (event)=>{
    saveAs();
})
function setupPrinter(printercap) {
    var paper_list = document.getElementById("paper-list");
    $("#paper-list").empty();
    printercap.papers.forEach(element => {
        var li = document.createElement('li');
        li.className = "paper-item";
        li.textContent = element.name;
        if (cur_print_settings.paper) {
            if (element.name == cur_print_settings.paper.name) {
                li.className = "paper-item paper-selected";
                $("#selected-paper").text(element.name);
            }
        } else {
            if (element.isDefault) {
                $("#selected-paper").text(element.name);
                li.className = "paper-item paper-selected";
                cur_print_settings.paper = {};
                cur_print_settings.paper.name = element.name;
                cur_print_settings.paper.size = {width:element.width, height:element.height};
                cur_print_settings.paper.margin = { left: 10, right: 10, top: 10, bottom: 10 };
            }
        }
        li.addEventListener('click', ()=>{
            if (!$(this).hasClass("paper-selected")) {
                $(this).addClass("paper-selected").siblings().removeClass("paper-selected");
                $("#selected-paper").text(element.name);
                var paper = getSelectedPaper(printercap.papers, element.name);
                console.log(paper);
                cur_print_settings.paper.name = paper.name;
                cur_print_settings.paper.size = {width:paper.width, height:paper.height};
            }
        })
        paper_list.appendChild(li);
    });
    
    if (printercap.duplex) {
        $("#print-type").removeClass("disable");
        $("#print-duplex").attr('checked', cur_print_settings.duplex);
    } else {
        //disable duplex setup
        cur_print_settings.duplex = 0;
        $("#print-type").addClass("disable");
    }
    $("#print-duplex").off("change").on("change",function(){
        var value = $("#print-duplex").is(':checked');
        cur_print_settings.duplex = value?1:0;
    })

    $("input:radio[name='print-direction-radio'][value='" + cur_print_settings.orientation + "']").attr('checked','true');

    if (printercap.ps) {
        cur_print_settings.ps = true;
    }
}
let cur_print_settings = null;
// let cur_print_settings = {
//     printerName:'PDF Scribe',
//     //printerName: 'HP LaserJet Pro M201-M202 PCL 6',
//     //printerName: 'HP-LaserJet-Pro-M202dw',
//     //printerName: '_192_168_168_152',
//     page:'1-2',
//     copies: 1,
//     duplex: 2,
//     orientation: 0,
//     paper: {
//         name: 'A4',
//         size : {
//             width: 2100,
//             height: 2900
//         },
//         margin: {
//             left: 10,
//             right: 10,
//             top: 10,
//             bottom: 10
//         },
//     },
//     ps: true
// };
function initPrintSetting(printers) {
    if (!cur_print_settings) {
        cur_print_settings = {};
        var printer = null;
        for (var i = 0; i < printers.length; ++i) {
            if (printers[i].isDefault) {
                printer = printers[i];
                break;
            }
        }
        if (printer) {
            cur_print_settings.printerName = printer.printerName;
            cur_print_settings.portName = printer.portName;
            cur_print_settings.page = '';
            cur_print_settings.copies = 1;
            cur_print_settings.duplex = 0;
            cur_print_settings.orientation = 0;
            cur_print_settings.ps = false;
        }
    }
}
function showPrintDialog(print_fn, cancel_fn, close_fn) {
    var printer_list = document.getElementById("printer-list");
    $(printer_list).empty();
    var printers = getPrinter();
    initPrintSetting(printers);
    printers.forEach(element => {
      var li = document.createElement('li');
      if (element.printerName == cur_print_settings.printerName) {
        li.className = "machine-item machine-selected";
        $("#selected-printer").text(element.printerName);
      } else {
          li.className = "machine-item";
      }
      li.textContent = element.printerName;
      li.setAttribute("port-name", element.portName);
      li.addEventListener("click", ()=>{
          if (!$(li).hasClass("machine-selected")) {
            $(li).addClass("machine-selected").siblings().removeClass("machine-selected");
            $("#selected-printer").text(element.printerName);
            cur_print_settings.printerName = li.textContent;
            cur_print_settings.portName = li.getAttribute("port-name");
            printercap = getPrinterCapabilities(cur_print_settings.printerName, cur_print_settings.portName);
            cur_print_settings.paper = null;
            setupPrinter(printercap);
          }
      })
      printer_list.appendChild(li);
    });
    var printercap = getPrinterCapabilities(cur_print_settings.printerName, cur_print_settings.portName);
    setupPrinter(printercap);

    $("#print-page-range-from").attr('max', pageCount);
    $("#print-page-range-to").attr('max', pageCount);
    $("#print-page-range-from").off('focusin').on('focusin', ()=>{
        $("input[name='print-page-range-radio'][value='1'").attr('checked', true);
    })
    $("#print-page-range-to").off('focusin').on('focusin', ()=>{
        $("input[name='print-page-range-radio'][value='1'").attr('checked', true);
    })
    
    $("#print-dialog-print").off("click").on("click", ()=>{
        $( "#printDialog" ).dialog( "close" );
        if (print_fn){print_fn();}
    })
    $("#print-dialog-cancel").off("click").on("click", ()=>{
        $( "#printDialog" ).dialog( "close" );
        if (cancel_fn){cancel_fn();}
    })
    $("#printDialog").dialog({dialogClass:"topmost", title: '打印',
        resizable: false, modal: true, draggable:true, close:()=>{
            var checked = $("input[name='print-page-range-radio']:checked").val();
            if (checked == '0') {
                cur_print_settings.page = '';
            } else if (checked == '1') {
                var from = Number($("#print-page-range-from").val());
                var to = Number($("#print-page-range-to").val());
                if (from <= to) cur_print_settings.page = from + '-' + to;
                else cur_print_settings.page = to + '-' + from;
            }
            checked = $("input[name='print-direction-radio']:checked").val();
            cur_print_settings.orientation = Number(checked);
            cur_print_settings.paper.margin.left = Number($("#print-margin-left").val());
            cur_print_settings.paper.margin.right = Number($("#print-margin-right").val());
            cur_print_settings.paper.margin.top = Number($("#print-margin-top").val());
            cur_print_settings.paper.margin.bottom = Number($("#print-margin-bottom").val());
            if (close_fn) close_fn();
        },
        mousedown_callback: (event)=>{
            var target = event.target;
            var printer_box = document.getElementById("printer-box");
            if (printer_box == target || printer_box.contains(target)) {
                return;
            }
            var paper_box = document.getElementById("paper-list-box");
            if (paper_box == target || paper_box.contains(target)) {
                return;
            }
            
            $("#printer-list-box").addClass("hide");
            $("#paper-list").addClass("hide");
        },
        closeText: '关闭',
        width:"auto",
    });
  }

  function print() {
    if (isPrinting()) {
        showToast('正在打印中...', undefined);
        return;
    }
    if (!isFileComplete()) {
        showToast('文件还没有下载完，不能打印', undefined);
        return;
    }
    //removeMouseEventListener();
    capture_mouse_event = false;
    showPrintDialog( ()=>{
        var filepath = getFilePath();
        
        if (remotePrint(filepath, getFileTitle(), cur_print_settings) == 0) {
            var interval = setInterval(()=>{
                var status = getPrintProgress();
                if (status) {
                    if (!status.printing) {
                        clearInterval(interval);
                        //alert('打印完成');
                        closePrintingDialog();
                    }
                    else {
                        //console.log('正在打印', status.current, '/', status.count);
                        showPrintProgress(status.current, status.count);
                    }
                }
            }, 500);
        }
        showPrintingDialog();
    }, null, ()=>{
        //addMouseEventListener();
        capture_mouse_event = true;
    });
}

function showPrintProgress(current, count) {
    document.getElementById('prompt-text').textContent = '正在打印: '+ current + '/' + count;
}
function closePrintingDialog() {
    printing = false;
    $("#promptDialog").dialog("close");
}
function showPrintingDialog() {
    printing = true;
    //removeMouseEventListener();
    capture_mouse_event = false;
    // $("#printingDialog").dialog({dialogClass:"no-close",
    //     close: ()=>{
    //         //addMouseEventListener();
    //         capture_mouse_event = true;
    //     },
    //     resizable: false, modal: true, draggable:false,
    //     width:300,
    //     buttons: [
    //         {
    //             text: "取消",
    //             click: function() {
    //                 $( this ).dialog( "close" );
    //                 abortPrint();
    //             }
    //         }
    //     ]
    // });
    showPromptDialog(null, '正在打印', {title: '取消', callback: ()=>{
        $( this ).dialog( "close" );
        abortPrint();
    }}, null, false);
}
function showPromptDialog(title, message, positive, negative, showclose) {
    if (title) {
        $("#prompt-title").show().text(title);
    } else {
        $("#prompt-title").hide();
    }
    $("#prompt-text").text(message);
    var $positive = $("#positive-btn");
    var $negative = $("#negative-btn");
    $positive.off("click").on("click", ()=>{
        $("#promptDialog").dialog("close");
    });
    $negative.off("click").on("click", ()=>{
        $("#promptDialog").dialog("close");
    });
    $positive.text("确定");
    $negative.text("取消");
    if (positive) {
        if (positive.callback) {
            $positive.off("click").on("click", ()=>{
                positive.callback();
                $("#promptDialog").dialog("close");
            });
        }
        if (positive.title) {
            $positive.text(positive.title);
        }
    }
    if (negative) {
        if (negative.callback) {
            $negative.off("click").on("click", ()=>{
                negative.callback();
                $("#promptDialog").dialog("close");
            });
        }
        if (negative.title) {
            $negative.text(negative.title);
        }
        $negative.show();
    } else {
        $negative.hide();
    }
    $(".toast-close").off("click").on("click", ()=>{
        if (negative && negative.callback) {
            negative.callback();
        }
        $("#promptDialog").dialog("close");
    })
    if (showclose) $(".toast-close").show(); else $(".toast-close").hide();
    $("#promptDialog").dialog({
        dialogClass: "no-titlebar",
        resizable: false, draggable: false, modal: true, width:"auto"
    });
}
function showNoteDialog(title, note, removeOnCancel) {
    var cancel = true;
    if (note.desc && note.desc.length > 0){
        $("#note-annot").val(note.desc);
        $(".marking-edit").find(".sure-btn ").removeClass("disable");
    } 
    else {
        $(".marking-edit").find(".sure-btn ").addClass("disable");
        $("#note-annot").val('');
    }
    //if (note.text) $("#note_text").text(note.text);
    var $ok_btn = $("#note-save-publish");
    var $radio = $("#note-send-to");
    if (caj_settings.publish_to_forum) {
        $radio.addClass("radio-selected");
        $ok_btn[0].textContent = '发表';
    } else {
        $radio.removeClass("radio-selected");
        $ok_btn[0].textContent = '保存';
    }
    //$ok_btn.off('click');
    $ok_btn.off('click').on('click', (e)=>{
        cancel = false;
        note.desc = $("#note-annot").val();
        var publish = $radio.hasClass("radio-selected");
        if (postEditNote(note, publish, false)) {
            $( "#note-dialog" ).dialog( "close" );
            if (publish) {
                showToast('发布成功', true);
                question_and_public_note_count ++;
                updateQuestionAndPublicNoteCount();
            }
            clearSelection();
            refreshPage(note.page);
        } else {
            if (publish) {
                showToast('发布失败', false);
            }
        }
    });
    
    $radio.off('click').on('click', (e)=>{
        if($radio.hasClass("radio-selected")){
            $radio.removeClass("radio-selected");
            caj_settings.publish_to_forum = false;
            $ok_btn[0].textContent = '保存';
        }else{//发表到交流区
            $radio.addClass("radio-selected");
            caj_settings.publish_to_forum = true;
            $ok_btn[0].textContent = '发表';
        }
    });
    // if($radio.hasClass("radio-selected")){
    //     $ok_btn[0].textContent = '发表';
    // }else{//发表到交流区
    //     $ok_btn[0].textContent = '保存';
    // }
    $("#note-dialog").dialog({width:400, height:'auto', modal: true, resizable: false,
        title: title, close: ()=>{
            if (cancel && removeOnCancel) {
                clearSelection();
            }
        }
    });
}
function showQuestionDialog(title, note, removeOnCancel) {
    //var cancel = true;
    //if (note.annot) $("#question-text").val(note.annot);
    //if (note.text) $("#note_text").text(note.text);
    var $ok_btn = $("#question-publish");
    $ok_btn.off('click').on('click', (e)=>{
        note.question = $("#question-text").val();
        if (postEditNote(note, false, true)) {
            showToast('发布成功', true);
            $( "#question-dialog" ).dialog( "close" );
            question_and_public_note_count ++;
            updateQuestionAndPublicNoteCount();
            clearSelection();
        } else {
            showToast('发布失败', false);
        }
    });
    $("#question-dialog").dialog({width:400, height:'auto', modal: true, resizable: false,
        title: title, close: ()=>{
            if (removeOnCancel) {
                //ReadiumSDK.reader.removeHighlight(note.id);
                clearSelection();
            }
        }
    });
}

function postEditNote(note, publish, question) {
    if (question) {
        var id;
        var note1 = {id: note.id, text: note.title, question: note.question, idref: '', contentCFI: '', type: 'underline'};
        if ((id = publishQuestion(note1))) {
            note1.id = id;
            var note1 = Object.assign(note1, {content: note.title, username: login_username, time: timestToString(Date.now())});
            g_questions.set(id, {question: note1, answers: [], collect_count: 0});
            var usernames = new Set();
            setupQuestion($("#question-list"), note1, null, usernames, true);
            getUserHeadImage(usernames, 0);
            getUserNickname(usernames, 0);
            return true;
        }
        return false;
    }
    var publish_result = true;
    if (publish) {
        var id;
        var note1 = {id: note.id, text: note.title, annot: note.desc, idref: '', contentCFI: '', type: 'underline'};
        if ((id = publishPublicNote(note1))) {
            note1.id = id;
            var note1 = Object.assign(note1, {content: note.title, annotation: note.desc,  username: login_username, time: timestToString(Date.now())});
            g_public_notes.push(note1);
            var usernames = new Set();
            setupPublicNote($("#public-note-list"), note1, null, usernames, true);
            getUserHeadImage(usernames, 0);
            getUserNickname(usernames, 0);
        } else {
            publish_result = false;
        }
    }
    if (publish_result || !publish) {
        addAnnotation(note);
    }
    return publish_result;
}
function publishQuestion(note) {
    showWaitingDialog('发布中...')
    var result = ipcRenderer.sendSync("publish-question", fileid, note);
    closeWaitingDialog();
    return result;
}
function publishPublicNote(note) {
    showWaitingDialog('发布中...')
    var result = ipcRenderer.sendSync("publish-public-note", fileid, note);
    closeWaitingDialog();
    return result;
} 
function checkCanPublish() {
    ipcRenderer.send('can-publish-question-note', fileid);
}
ipcRenderer.on('can-publish-question-note-result', (event, result)=>{
    if (result) {
        can_publish = true;
        //initReader();
        getQuestionAndPublicNote();
    }
})
function getLoginUser() {
    login_username = ipcRenderer.sendSync("get-login-username");
}

function getAnswerPraiseCount(answerids) {
    ipcRenderer.send("get-answer-praise-count", fileid, answerids);
}
ipcRenderer.on("get-answer-praise-count-result", (event, fileid, answerids, data)=>{
    console.log(data);
    if (answerids instanceof Set) {
        data.forEach((value, key)=>{
            if (value instanceof Array) {
                if (value[0] > 0) {
                    $("[answer-praise-id='" + key + "']").text(value[0]);
                }
                if (value[1]) {
                    $("[answer-praise-id='" + key + "']").addClass("praised");
                }
            } else {
                if (value > 0) {
                    $("[answer-praise-id='" + key + "']").text(value);
                }
            }
        });
    }
})
function getPublicNotePraiseCount(annotationids, arg) {
    ipcRenderer.send('get-public-note-praise-count', arg, fileid, annotationids);
}
ipcRenderer.on("get-public-note-praise-count-result", (event, arg, fileid, annotationids, data)=>{
    //console.log(data);
    if (annotationids instanceof Set) {
        data.forEach((value, key)=>{
            if (value instanceof Array) {
                if (value[0] > 0) {
                    $("[praise-number-" + arg + "='" + key + "']").text(value[0]);
                }
                if (value[1]) {
                    $("[praise-number-" + arg + "='" + key + "']").addClass("praised");
                }
            } else {
                if (value > 0) {
                    $("[praise-number-" + arg + "='" + key + "']").text(value);
                }
            }
        });
    }
})
function updateQuestionAndPublicNoteCount() {
    if (question_and_public_note_count > 0) {
        $("#forum").children().text('交流区（' + question_and_public_note_count + '）');
    } else {
        $("#forum").children().text('交流区');
    }
}
function getQuestionAndPublicNote() {
    ipcRenderer.send('get-question', fileid);
    ipcRenderer.send('get-public-note', fileid);
    question_and_public_note_count = 0;
    updateQuestionAndPublicNoteCount();
}
ipcRenderer.on('get-question-result', (event, fn, data)=>{
    //console.log(fn, data);
    if (data && data.length > 0) {
        //g_questions = new Map();
        //public_note_database.addNote(data);
        g_questions.clear();
        setupQuestionList(data);
        data.forEach(v=>{
            g_questions.set(v.id, {question: v, answers: [], collect_count: 0});
        })
        question_and_public_note_count = g_questions.size + g_public_notes.length;
        updateQuestionAndPublicNoteCount();
    }
})
ipcRenderer.on('get-public-note-result', (event, fn, data)=>{
    //console.log(fn, data);
    if (data && data.length > 0) {
        //public_note_database.addNote(data);
        setupPublicNoteList(data);
        g_public_notes = data;
        question_and_public_note_count = g_questions.size + g_public_notes.length;
        updateQuestionAndPublicNoteCount();
    }
})
function getQuestionAnswer(questionids) {
    ipcRenderer.send('get-question-answer', fileid, questionids);
}
ipcRenderer.on('get-question-answer-result', (event, fn, questionids, data)=>{
    if (questionids instanceof Set) {
        data.forEach((value, key)=>{
            if (value && value.length > 0) {
                setupAnswer(key, value[0], value.length);
                var qcontainer = g_questions.get(key);
                qcontainer.answers = value;
            }
        });
    } else {
        setupAnswer(questionids, data[0], data.length);
    }
})
function getQuestionCollectCount(questionids, arg) {
    ipcRenderer.send('get-question-collect-count', arg, fileid, questionids);
}
ipcRenderer.on("get-question-collect-count-result", (event, arg, fileid, questionids, data)=>{
    if (questionids instanceof Set) {
        data.forEach((value, key)=>{
            if (arg == 0) {
                $("[question-answer-number='" + key + "']").children(":nth-child(1)").text(value);
            } else {
                $("[question-like-number='" + key + "']").text(value);
            }
        });
    }
})

function getUserHeadImage(usernames, arg) {
    if ( (typeof(usernames) == 'string') || usernames.size > 0) {
        ipcRenderer.send("get-user-head-image", arg, usernames);
    }
}
function addUserInfo(username, nickname, image) {
    var info = user_head_image_and_nickname.get(username);
    if (!info) {
        info = {nickname: null, image: null};
        user_head_image_and_nickname.set(username, info);
    }
    if (nickname) info.nickname = nickname;
    if (image) info.image = image;
}
function getUserInfo(username) {
    return user_head_image_and_nickname.get(username);
}
ipcRenderer.on("get-user-head-image-result", (event, arg, usernames, data)=>{
    if (usernames instanceof  Set) {
        usernames.forEach(username=>{
            if (data.get(username)) {
                //var image = nativeImage.createFromBuffer(Buffer.from(data.get(username), "base64"));
                var image = "data:image/png;base64," + data.get(username);
                if (arg == 1) {
                    $("[qa-user='" + username + "']").children(":nth-child(1)").css({'background-image': 'url(' + image + ')'});
                } else if (arg == 2) {
                    $("[reply-user-head='" + username + "']").css({'background-image': 'url(' + image + ')'});
       
                } else {
                    $("[user-head-image='" + username + "']").attr('src', image);
                }
                addUserInfo(username, null, image);
            }
        })
    } else {
        //var image = nativeImage.createFromBuffer(Buffer.from(data, "base64"));
        var image = "data:image/png;base64," + data;
        if (arg == 1) {
            $("[qa-user='" + usernames + "']").children(":nth-child(1)").css({'background-image': 'url(' + image + ')'});
        } else if (arg == 2) {
            $("[reply-user-head='" + usernames + "']").css({'background-image': 'url(' + image + ')'});
        } else {
            $("[user-head-image='" + usernames + "']").attr('src', image);
        }
        addUserInfo(usernames, null, image);
    }
}) 
function getUserNickname(usernames, arg) {
    if ( (typeof(usernames) == 'string') || usernames.size > 0) {
        ipcRenderer.send("get-user-nickname", arg, usernames);
    }
}
ipcRenderer.on("get-user-nickname-result", (event, arg, usernames, nicknames)=>{
    if (usernames instanceof  Set) {
        usernames.forEach(username=>{
            if (arg == 1) {
                $("[qa-user='" + username + "']").children(":nth-child(2)").text(nicknames.get(username));
            } else if (arg == 2) {
                $("[reply-usernm='" + username + "']").text(nicknames.get(username));
            } else {
                $("[user-nickname='" + username + "']").text(nicknames.get(username));
            }
            addUserInfo(username, nicknames.get(username), null);
        })
    } else {
        if (arg && arg == 1) {
            $("[qa-user='" + usernames + "']").children(":nth-child(2)").text(nicknames);
        } else if (arg == 2) {
            $("[reply-usernm='" + usernames + "']").text(nicknames);
        } else {
            $("[user-nickname='" + usernames + "']").text(nicknames);
        }
        addUserInfo(username, nicknames, null);
    }
})

function getMyCollectQuestion() {
    ipcRenderer.send("get-my-collect-question");
}
ipcRenderer.on("get-my-collect-question-result", (event, data)=>{
    g_my_collect_questions = data;
})
function isCollection(questionid) {
    if (g_my_collect_questions) {
        return g_my_collect_questions.has(questionid);
    }
    return false;
}
function collectQuestion($follow0, $follow, questionid, question, collect) {
    var result;
    if (collect) {
        result = ipcRenderer.sendSync("collect-question", fileid, questionid, question);
        if (result) {
            g_my_collect_questions.set(questionid, question);
        }
    } else {
        result = ipcRenderer.sendSync("cancel-collect-question", fileid, questionid);
        if (result) {
            g_my_collect_questions.delete(questionid);
        }
    }
    if (result) {
        if (collect) {
            if ($follow) $follow.addClass("followed");
            if ($follow0) {
                $follow0.addClass("liked");
                $follow0.text(Number($follow0.text()) + 1);
            }
        } else {
            if ($follow) $follow.removeClass("followed");
            if ($follow0) {
                $follow0.removeClass("liked");
                $follow0.text(Number($follow0.text()) - 1);
            }
        }
    }
    return result;
}
function setupQuestion($question_list, elem, questionids, usernames, insertToHead) {
    var item = document.createElement('li');
    item.className = 'QA-item';
    item.setAttribute('question-id', elem.id);
    var div = document.createElement('div');
    div.className = 'answer-user';
    var div_head = document.createElement('img');
    div_head.className = 'answer-head';
    var info = getUserInfo(elem.username);
    if (info && info.image) {
        div_head.setAttribute('src', info.image);
    } else {
        div_head.setAttribute('user-head-image', elem.username);
        div_head.setAttribute('src', '../imgs/default/scholar_claim@2x.png')
        if (usernames) usernames.add(elem.username);
    }
    div.appendChild(div_head);
    var div_nickname = document.createElement('div');
    div_nickname.className = 'answer-name';
    if (info && info.nickname) {
        div_nickname.textContent = info.nickname;
    } else {
        div_nickname.setAttribute('user-nickname', elem.username);
        if (usernames) usernames.add(elem.username);
    }
    div.appendChild(div_nickname);
    item.appendChild(div);

    div = document.createElement('div');
    div.className = 'answer-content';
    div.textContent = elem.question;
    item.appendChild(div);

    div = document.createElement('div');
    if (elem.content && elem.content.length > 0) {
        div.className = 'annotation-origin';
        div.textContent = elem.content;
    } else {
        div.className = 'annotation-origin hide';
    }
    
    item.appendChild(div);

    div = document.createElement('div');
    div.className = 'from-question hide';
    div.setAttribute('question-answer', elem.id);
    var span = document.createElement('span');
    span.className = 'to-user';
    div.appendChild(span);
    span = document.createElement('span');
    span.className = 'to-user';
    span.innerHTML = ':&nbsp;&nbsp;';
    div.appendChild(span);
    span = document.createElement('span');
    div.appendChild(span);
    item.appendChild(div);

    div = document.createElement('div');
    div.className = 'answer-other';
    
    var date = document.createElement('div');
    date.className = 'answer-date';
    date.textContent = elem.time.substring(0, 10);
    div.appendChild(date);
    
    var number_area = document.createElement('div');
    number_area.className = 'number-area';
    number_area.setAttribute('question-answer-number', elem.id);
    var like = document.createElement('div');
    if (isCollection(elem.id)) {
        like.className = 'like-number liked';
    } else {
        like.className = 'like-number';
    }
    like.textContent = '0';
    like.addEventListener("click", (e)=>{
        e.stopPropagation();
        var $like = $(like);
        collectQuestion($like, null, elem.id, elem, !$like.hasClass("liked"));
    })
    number_area.appendChild(like);
    var answer_number = document.createElement('div');
    answer_number.className = 'answer-number';
    answer_number.textContent = '0';
    number_area.appendChild(answer_number);

    div.appendChild(number_area);

    item.appendChild(div);
    item.addEventListener("click", (e)=>{
        e.stopPropagation();
        showQuestionDetail(elem.id);
    })
    if (insertToHead) {
        $question_list[0].insertBefore(item, $question_list[0].firstChild);
    } else {
        $question_list[0].appendChild(item);
    }
    if (questionids) questionids.add(elem.id);
}
function setupQuestionList(data) {
    var $question_list = $("#question-list");
    $question_list.empty();
    var questionids = new Set();
    var usernames = new Set();
    
    data.forEach(elem=>{
        setupQuestion($question_list, elem, questionids, usernames, false);
    })
    getQuestionAnswer(questionids);
    getQuestionCollectCount(questionids, 0);
    getUserHeadImage(usernames, 0);
    getUserNickname(usernames, 0);
}
function setupAnswer(questionid, data, count) {
    var $answer = $("[question-answer='" + questionid + "']");
    if (count > 0) {
        var $spans = $answer.children('span');
        $spans[0].setAttribute('user-nickname', data.username);
        $spans[2].textContent = data.answer;
        $answer.show();
    } else {
        $answer.hide();
    }
    $("[question-answer-number='" + questionid + "']").children(":nth-child(2)").text(count);
}

function praisePublicNote($praise, annotationid, praise) {
    var result;
    if (praise) {
        result = ipcRenderer.sendSync("praise-public-note", fileid, annotationid);
    } else {
        result = ipcRenderer.sendSync("cancel-praise-public-note", fileid, annotationid);
    }
    if (result) {
        if (praise){
            $praise.addClass("praised");
            $praise.text(Number($praise.text()) + 1);
        } else {
            $praise.removeClass("praised");
            $praise.text(Number($praise.text()) - 1);
        }
    }
}
function praiseAnswer($praise, questionid, answerid, owner, praise) {
    var result;
    if (praise) {
        result = ipcRenderer.sendSync("praise-answer", fileid, questionid, answerid, owner);
    } else {
        result = ipcRenderer.sendSync("cancel-praise-answer", fileid, questionid, answerid, owner);
    }
    if (result) {
        if (praise){
            $praise.addClass("praised");
            $praise.text(Number($praise.text()) + 1);
        } else {
            $praise.removeClass("praised");
            $praise.text(Number($praise.text()) - 1);
        }
    }
}
function setupPublicNote($public_note_list, elem, annotationids, usernames, insertToHead) {
    var item = document.createElement('li');
    item.className = 'annotation-li';
    item.setAttribute('public-note-id', elem.itemid);
    var div = document.createElement('div');
    div.className = 'user-mesg';
    var div_head = document.createElement('img');
    div_head.className = 'head';
    var info = getUserInfo(elem.username);
    if (info && info.image) {
        div_head.setAttribute('src', info.image);
    } else {
        div_head.setAttribute('user-head-image', elem.username);
        div_head.setAttribute('src', '../imgs/default/scholar_claim@2x.png');
        if (usernames) usernames.add(elem.username);
    }
    div.appendChild(div_head);
    var div_nickname = document.createElement('div');
    div_nickname.className = 'name';
    
    if (info && info.nickname) {
        div_nickname.textContent = info.nickname;
    } else {
        div_nickname.setAttribute('user-nickname', elem.username);
        if (usernames) usernames.add(elem.username);
    }
    div.appendChild(div_nickname);
    item.appendChild(div);

    div = document.createElement('div');
    div.className = 'annotation';
    div.textContent = elem.annotation;
    item.appendChild(div);

    div = document.createElement('div');
    div.className = 'annotation-origin';
    div.textContent = elem.content;
    item.appendChild(div);

    div = document.createElement('div');
    div.className = 'other';

    var qa_time = document.createElement('div');
    qa_time.className = 'QA-time';
    var time = document.createElement('span');
    time.textContent = elem.time.substring(0, 10);
    qa_time.appendChild(time);

    if (elem.username == login_username) {
        var del = document.createElement('div');
        del.className = 'del';
        del.textContent = '删除';
        del.addEventListener('click', (e)=>{
            e.stopPropagation();
            deletePublicNote(elem.itemid);
        })
        qa_time.appendChild(del);
    }
    div.appendChild(qa_time);
    var praise = document.createElement('div');
    praise.className = 'praise-number';
    praise.setAttribute('praise-number-0', elem.itemid);
    praise.textContent = '0';
    praise.addEventListener("click", (e)=>{
        e.stopPropagation();
        var $praise = $(praise);
        praisePublicNote($praise, elem.itemid, !$praise.hasClass("praised"));
    })
    div.appendChild(praise);
    //div.textContent = elem.title;
    item.appendChild(div);
    
    if (annotationids) annotationids.add(elem.itemid);
    if (insertToHead) {
        $public_note_list[0].insertBefore(item,  $public_note_list[0].firstChild);
    } else {
        $public_note_list[0].appendChild(item);
    }
}
function setupPublicNoteList(data) {
    var $public_note_list = $("#public-note-list");
    $public_note_list.empty();
    var usernames = new Set();
    var annotationids = new Set();
    data.forEach(elem=>{
        setupPublicNote($public_note_list, elem, annotationids, usernames);
    })
    getUserHeadImage(usernames, 0);
    getUserNickname(usernames, 0);
    getPublicNotePraiseCount(annotationids, 0);
}

function deletePublicNote(annotationid) {
    showWaitingDialog('正在删除...');
    var result = ipcRenderer.sendSync("delete-public-note", fileid, annotationid);
    closeWaitingDialog();
    if (result) {
        showToast('删除成功', true);
        $("#public-note-list").find("[public-note-id='" + annotationid + "']").remove();
        var idx = g_public_notes.findIndex((value, index)=>{
            if (value.itemid == annotationid) {
                return true;
            }
            return false;
        });
        if (idx >= 0) {
            //public_note_database.remove(g_public_notes[idx]);
            //ReadiumSDK.reader.importPublicNotes(public_note_database.toImport(g_public_notes[idx].idref));
            g_public_notes.splice(idx, 1);
        }
        question_and_public_note_count --;
        updateQuestionAndPublicNoteCount();
    } else {
        showToast('删除失败', false);
    }
}

function deleteQuestion(questionid) {
    showWaitingDialog('正在删除...');
    var result = ipcRenderer.sendSync("delete-question", fileid, questionid);
    closeWaitingDialog();
    if (result) {
        showToast('删除成功', true);
        $("#QA-detail").hide();
        $("#exchange-block-1").show();
        $("#question-list").find("[question-id='" + questionid + "']").remove();
        var qcontainer = g_questions.get(questionid);
        if (qcontainer) {
            g_questions.delete(questionid);
            //public_note_database.remove(qcontainer.question);
            //ReadiumSDK.reader.importPublicNotes(public_note_database.toImport(qcontainer.question.idref));
        }
        question_and_public_note_count --;
        updateQuestionAndPublicNoteCount();
    } else {
        showToast('删除失败', false);
    }
}

function praisePublicNote($praise, annotationid, praise) {
    var result;
    if (praise) {
        result = ipcRenderer.sendSync("praise-public-note", fileid, annotationid);
    } else {
        result = ipcRenderer.sendSync("cancel-praise-public-note", fileid, annotationid);
    }
    if (result) {
        if (praise){
            $praise.addClass("praised");
            $praise.text(Number($praise.text()) + 1);
        } else {
            $praise.removeClass("praised");
            $praise.text(Number($praise.text()) - 1);
        }
    }
}
function praiseAnswer($praise, questionid, answerid, owner, praise) {
    var result;
    if (praise) {
        result = ipcRenderer.sendSync("praise-answer", fileid, questionid, answerid, owner);
    } else {
        result = ipcRenderer.sendSync("cancel-praise-answer", fileid, questionid, answerid, owner);
    }
    if (result) {
        if (praise){
            $praise.addClass("praised");
            $praise.text(Number($praise.text()) + 1);
        } else {
            $praise.removeClass("praised");
            $praise.text(Number($praise.text()) - 1);
        }
    }
}

function showQuestionDetail(questionid) {
    var qcontainer = g_questions.get(questionid);
    //var answers = question.answers;
    var $QA_detail =  $("#QA-detail");
    $QA_detail.attr("questionid", questionid);
    setupQuestionDetail($QA_detail, qcontainer);
    $QA_detail.show();
    $("#exchange-block-1").hide();
    $QA_detail.find("#detail-top-back").off("click").on("click", ()=>{
        $QA_detail.hide();
        $("#exchange-block-1").show();
    })
}

function setupQuestionAnswer($QA_detail, qcontainer, usernames, answerids) {
    var $reply_btn = $QA_detail.find(".QA-reply-btn");
    $reply_btn.text(qcontainer.answers.length);
    var $reply_list = $QA_detail.find(".reply-list");
    $reply_list.empty();
    qcontainer.answers.forEach(answer=>{
        var userinfo = getUserInfo(answer.username);
        var reply_item = document.createElement('div');
        reply_item.className = 'reply-item';
        reply_item.setAttribute('reply-item', answer.id);

        var reply_user_head = document.createElement('div');
        reply_user_head.className = 'reply-user-head';
        reply_user_head.setAttribute('reply-user-head', answer.username);
        if (userinfo && userinfo.image) {
            $(reply_user_head).css({'background-image': 'url(' + userinfo.image + ')'});
        } else {
            $(reply_user_head).css({'background-image': 'url(../imgs/default/scholar_claim@2x.png)'});
            usernames.add(answer.username);
        }
        reply_item.appendChild(reply_user_head);

        var reply_mesg = document.createElement('div');
        reply_mesg.className = 'reply-mesg';
        var reply_usernm = document.createElement('div');
        reply_usernm.className = 'reply-usernm';
        reply_usernm.setAttribute('reply-usernm', answer.username);
        if (userinfo && userinfo.nickname) {
            reply_usernm.textContent = userinfo.nickname;
        } else {
            usernames.add(answer.username);
        }
        reply_mesg.appendChild(reply_usernm);
        var reply_content = document.createElement('div');
        reply_content.className = 'reply-content';
        reply_content.textContent = answer.answer;
        reply_mesg.appendChild(reply_content);
        var reply_time = document.createElement('div');
        reply_time.className = 'reply-time';
        var span = document.createElement('span');
        span.className = 'time';
        span.textContent = answer.time.substring(0, 10);
        reply_time.appendChild(span);
        if (login_username == answer.username) {
            span = document.createElement('span');
            span.className = 'reply-del';
            span.textContent = '删除';
            span.addEventListener('click', (e)=>{
                e.stopPropagation();
                deleteAnswer($QA_detail, qcontainer.question.id, answer.id);
            })
            reply_time.appendChild(span);
        }
        reply_mesg.appendChild(reply_time);

        reply_item.appendChild(reply_mesg);

        var praise = document.createElement('div');
        praise.className = 'praise';
        praise.setAttribute("answer-praise-id", answer.id);
        praise.textContent = '0';
        praise.addEventListener("click", (e)=>{
            e.stopPropagation();
            praiseAnswer($(praise), qcontainer.question.id, answer.id, answer.username, !$(praise).hasClass("praised"));
        })
        answerids.add(answer.id);
        reply_item.appendChild(praise);

        $reply_list[0].appendChild(reply_item);
    });
}
function setupQuestionDetail($QA_detail, qcontainer) {
    var question = qcontainer.question;
    var $QA_user = $QA_detail.find(".QA-user");
    $QA_user.attr("qa-user", question.username);
    var userinfo = getUserInfo(question.username);
    
    if (userinfo) {
        if (userinfo.image) {
            $QA_user.children(":nth-child(1)").css({'background-image': 'url(' + userinfo.image+ ')'});
        }
        else {
            $QA_user.children(":nth-child(1)").css({'background-image': 'url(../imgs/default/scholar_claim@2x.png)'});
            getUserHeadImage(question.username, 1);
        }
        if (userinfo.nickname) {
            $QA_user.children(":nth-child(2)").text(userinfo.nickname);
        } else {
            getUserNickname(question.username, 1);
        }
    } else {
        $QA_user.children(":nth-child(1)").css({'background-image': 'url(../imgs/default/scholar_claim@2x.png)'});
        getUserHeadImage(question.username, 1);
        getUserNickname(question.username, 1);
    }
    var $follow = $QA_user.children(":nth-child(3)");
    if (isCollection(question.id)) {
        $follow.addClass("followed");
    } else {
        $follow.removeClass("followed");
    }
    $follow.off("click").on("click", (e)=>{
        e.stopPropagation();
        var collect = !$follow.hasClass("followed");
        var $follow0 = $("[question-answer-number='" + question.id + "']").children(":nth-child(1)");
        collectQuestion($follow0, $follow, question.id, question, collect);
    })
    var usernames = new Set();
    var answerids = new Set();
    var $QA_original = $QA_detail.find(".QA-original");
    $QA_original.text(question.content);
    var $QA_txt = $QA_detail.find(".QA-txt");
    $QA_txt.text(question.question);
    var $QA_time = $QA_detail.find(".QA-time").children(":nth-child(1)");
    $QA_time.text(question.time.substring(0, 10));
    var $QA_delete = $QA_detail.find(".QA-time").children(":nth-child(2)");
    if (login_username == question.username && qcontainer.answers.length == 0) {
        $QA_delete.show();
        $QA_delete.off('click').on('click', (e)=>{
            e.stopPropagation();
            deleteQuestion(question.id);
        })
    } else {
        $QA_delete.hide();
    }
    var $qa_reply_btn = $QA_detail.find(".QA-reply-btn");
    var $reply_box = $QA_detail.find(".reply-box");
    $qa_reply_btn.off("click").on("click", function() {
		if($reply_box.hasClass("hide")){
			$reply_box.removeClass("hide");
		} else {
			$reply_box.removeClass("hide");
		}
	})
    var $reply_input = $QA_detail.find("#inputBox");
	var $reply_btn = $QA_detail.find(".reply-btn");
	function inputChange(){
		if($reply_input.val() != ""){
			$reply_btn.removeClass("disabled")
		}else{
			$reply_btn.addClass("disabled")
		}
	}
    $reply_input.off("input porpertychange");
    $reply_input.on("input porpertychange", inputChange);
	$reply_btn.off("click").on("click", (e)=>{
		e.stopPropagation();
		if (addAnswer($QA_detail, question.id, $reply_input.val())) {
			$reply_input.val("");
			$reply_box.addClass("hide");
		}
	})
    setupQuestionAnswer($QA_detail, qcontainer, usernames, answerids);

    getUserHeadImage(usernames, 2);
    getUserNickname(usernames, 2);
    getAnswerPraiseCount(answerids);
}
function addAnswer($QA_detail, questionid, reply) {
    showWaitingDialog("正在提交...");
    var result = ipcRenderer.sendSync("add-answer", fileid, questionid, reply);
    closeWaitingDialog();
    if (result) {
        var qcontainer = g_questions.get(questionid);
        if (qcontainer) {
            qcontainer.answers.push({id: result, username: login_username, answer: reply, time: timestToString(Date.now())});
        }
        setupAnswer(questionid, qcontainer.answers[0], qcontainer.answers.length);
        var usernames = new Set();
        var answerids = new Set();
        //var $QA_detail =  $("#QA-detail");
        setupQuestionAnswer($QA_detail, qcontainer, usernames, answerids);
    } else {
        showToast("回复发布失败");
    }
    
    return result;
}
function deleteAnswer($QA_detail, questionid, answerid) {
    showWaitingDialog('正在删除...');
    var result = ipcRenderer.sendSync("delete-answer", fileid, questionid, answerid);
    closeWaitingDialog();
    if (result) {
        showToast('删除成功', true);
        $("#reply-list").find("[reply-item='" + answerid + "']").remove();
        var qcontainer = g_questions.get(questionid);
        var idx = qcontainer.answers.findIndex((value, index)=>{
            if (value.id == answerid) {
                return true;
            }
            return false;
        })
        if (idx >= 0) {
            qcontainer.answers.splice(idx, 1);
            if (qcontainer.answers.length > 0) {
                setupAnswer(questionid, qcontainer.answers[0], qcontainer.answers.length);
            } else {
                setupAnswer(questionid, null, 0);
            }
            var usernames = new Set();
            var answerids = new Set();
            //var $QA_detail =  $("#QA-detail");
            setupQuestionAnswer($QA_detail, qcontainer, usernames, answerids);
        }
    } else {
        showToast('删除失败', false);
    }
}
function readyToShow() {
    let viewerContainerElement = $viewerContainer[0];
    let pages = getVisiblePage(viewerContainerElement);
    drawPages(pages, false);
    var page = getReadStatusRemote();
    if (page) {
        turnToPage(page);
    }
}
function setToggleNoteBtn() {
    if (caj_settings.showNote) {
        $(".show-hide-note-btn").attr("selected", true);
    } else {
        $(".show-hide-note-btn").attr("selected", false);
    }
    
}
function toggleNoteStatus() {
    caj_settings.showNote = !caj_settings.showNote;
    var $layers = $(".annotationLayer");
    var vset = caj_settings.showNote ? 'visible' : 'hidden';
    $layers.each((idx, el)=>{
        el.style.visibility = vset;
    })
    setToggleNoteBtn();
    refreshView();
}
function refreshView() {
    let viewerContainerElement = $viewerContainer[0];
    let pages = getVisiblePage(viewerContainerElement);
    if (pages) {
        pages.forEach(page=>{
            refreshPage(page);
        })
    }
}
// $(function() {
//     console.log('ready-to-show');
//     initAll();
//     //$(document).on('ready', ()=> {
//         //ipcRenderer.on('ready-to-show', (event)=>{
            
            
//             //webContents.openDevTools()
//     //    })
// })