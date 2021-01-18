onmessage = function(event) {
    var n = parseInt(event.data);
  
    // if (n == 0 || n == 1) {
    //   postMessage(n);
    //   return;
    // }
  
    // for (var i = 1; i <= 2; i++) {
    //   var worker = new Worker("fibonacci.js");
    //   worker.onmessage = resultReceiver;
    //   worker.onerror = errorReceiver;
    //   worker.postMessage(n - i);
    // }
   };