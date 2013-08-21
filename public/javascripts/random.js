// Feature Check
if (typeof window.WebSocket === "undefined"
  || typeof window.Int8Array === "undefined"
  || typeof window.Uint8Array === "undefined") {
  window.location = document.URL + "browser";
}

// Get the format from the cookie
function getFormat() {
  var arr = document.cookie.split(';')
    , len = arr.length
    , pair, key, val, i;

  for (i = 0; i < len; i++) {
    pair = arr[i];
    key = pair.substr(0, pair.indexOf('=')).trim();
    val = pair.substr(pair.indexOf('=') + 1).trim();

    // Return "format" from the cookie
    if (key === "format") {
      return val;
    }
  }

  // Default to binary
  return "2";
}

// Save the format to the cookie
function setFormat(val) {
  // If val isn't binary, decimal, or hex, default to binary
  val = [ '2', "10", "16" ].indexOf(val) !== -1 ? val : '2';

  // Save it
  document.cookie = "format=" + val;
}

// Set the format select easily
function formatIndex(val) {
  switch(val) {
    case "10":
      return 1;
    case "16":
      return 2;
    case "2":
    default:
      return 0;
  }
}

// The good stuff
(function () {
  "use strict";
  var random = document.getElementById("random")
    , body = document.body
    , header = document.getElementsByTagName("h1")[0]
    , pauseButton = document.getElementById("pause")
    , formatChoice = document.getElementById("format")
    , format = getFormat()
    , OutFormat = format === "10" ? Int8Array : Uint8Array // Might as well sign decimal
    , isntReloading = true;

  // Connecting/Loading stuff
  random.appendChild(document.createTextNode("Connecting"));

  var interval = setInterval(function () {
    random.appendChild(document.createTextNode(" ."));
  }, 1000);

  // Format
  formatChoice.selectedIndex = formatIndex(format);
  formatChoice.addEventListener("change", function () {
    // Save the cookie and then reload the page
    setFormat(formatChoice[formatChoice.selectedIndex].value);
    window.location.reload();
  });

  // Wait for everything to load before we start doing stuff
  window.addEventListener("load", function () {
    var port = document.getElementById("port").value
      , url = document.URL
      , client;

    url = url.replace(/^http|^https/, "ws");

    // Make sure we're trying to connect to the correct port
    if (port !== "80" && !url.match(/:\d*$/)) {
      url += ':' + port;
    }

    client = new BinaryClient(url);

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
        data = new OutFormat(data);
        len = data.length;

        // Parse it to binary
        for (i; i < len; i++) {
          // Convert to whatever format we've chosen
          out.push(data[i].toString(parseInt(format, 10)));
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

      // Pause / Unpause
      pauseButton.addEventListener("click", function () {
        var stat = pauseButton.innerHTML.trim();

        if (stat === "Unpause") {
          pauseButton.innerHTML = "&nbsp;Pause&nbsp;";
          stream.resume();
        } else {
          pauseButton.innerHTML = "Unpause";
          stream.pause();
        }
      });
    });
  });
})();