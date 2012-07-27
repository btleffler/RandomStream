(function () {
  "use strict";
  var random = document.getElementById("random")
    , body = document.body
    , header = document.getElementsByTagName("h1")[0]
    , isntReloading = true;

  // Connecting/Loading stuff
  random.appendChild(document.createTextNode("Connecting"));

  var interval = setInterval(function () {
    random.appendChild(document.createTextNode(" ."));
  }, 1000);

  window.addEventListener("load", function () {
    var client = new BinaryClient(document.URL.replace(/^http/, "ws"));

    // Stop "loading" and clear everything out
    client.on("open", function () {
      var div = document.createElement("div");

      clearInterval(interval);

      div.id = "random";

      body.removeChild(random);
      body.appendChild(div);

      random = div;
      random.style.height = (window.innerHeight - header.clientHeight - 175) + "px";
    });

    // Handle incoming data
    client.on("stream", function (stream) {
      stream.on("data", function (data) {
        var i = 0
          , out = []
          , len;

        // Get data from the ArrayBuffer
        data = new Uint8Array(data);
        len = data.length;

        // Parse it to binary
        for (i; i < len; i++) {
          out.push(data[i].toString(2));
        }
        
        // Output the numbers
        random.appendChild(document.createTextNode(' ' + out.join(' ')));

        // Don't clutter things up too, too much
        if (random.childNodes.length > 2000 && isntReloading) {
          window.location.reload();
          isntReloading = false; // keep from spamming reload()
        }

        // Scroll to the bottom
        random.scrollTop = random.scrollHeight;
      });
    });
  });
})();