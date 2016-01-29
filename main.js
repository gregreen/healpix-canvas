// DRAW is a namespace containing - you guessed it - functions that draw to a canvas
var DRAW = (function(canvasID) {
  "use strict"

  // Any function/variable added to this dictionary will be exposed outside the script
  var nmspace = {};

  // Set up the canvas and 2D context variables
  var canvas, ctx;
  $(document).ready(function() {
    canvas = document.getElementById(canvasID);
    ctx = canvas.getContext("2d");
  });

  function setPixel(imgData, x, y, rgba) {
    var idx = (x + y * imgData.width) * 4;
    imgData.data[idx] = rgba.r;
    imgData.data[idx+1] = rgba.g;
    imgData.data[idx+2] = rgba.b;
    imgData.data[idx+3] = rgba.a;
  }

  function addPixel(imgData, x, y, rgba, oversample) {
    var idx = (x + y * imgData.width) * 4;
    imgData.data[idx] += rgba.r / oversample;
    imgData.data[idx+1] += rgba.g / oversample;
    imgData.data[idx+2] += rgba.b / oversample;
    imgData.data[idx+3] += rgba.a / oversample;
  }

  // Draw HEALPix map stored in a JSON file. JSON structure:
  //   nside: 32
  //   order: 'nest'
  //   vmin: 0
  //   vmax: 1
  //   pixval: [0.5, 1, 0, 0.2, 0.3, ...]
  nmspace.drawHealpixMap = function(fName) {
    if (canvas.getContext) {
      d3.json(fName, function(error, data) {
        var hp = new HEALPix();

        var nSide = data.nside;
        var nPix = 12 * nSide * nSide;

        var ang2pix = (function() {
          if (data.order == 'nest') {
            return hp.ang2pix_nest;
          } else if (data.order == 'ring') {
            return hp.ang2pix_ring;
          } else {
            console.log('Unknown HEALPix ordering scheme: ' + data.order);
            return null;
          }
        })();

        var colorScale = d3.scale.linear()
          .domain([data.vmin, data.vmax])
          .range(['red', 'blue']);

        var width = canvas.width;
        var height = canvas.height;

        // Empty image buffer
        var imgData = ctx.createImageData(width, height);

        // Fill pixels with HEALPix map
        var oversample = 1; // # of subsamples to take for each pixel
        for (var i = 0; i < oversample; i++) {
          for (var j = 0; j < width; j++) {
            var p = 2.0 * Math.PI * (j + Math.random()) / (width+1);

            for (var k = 0; k < height; k++) {
              var t = Math.PI * (k + Math.random()) / (height+1);
              var pixIdx = ang2pix(nSide, t, p);
              var rgb = d3.rgb(colorScale(data.pixval[pixIdx]));
              rgb.a = 255;
              addPixel(imgData, j, k, rgb, oversample);
            }
          }
        }

        // Copy image to canvas
        ctx.putImageData(imgData, 0, 0);
      });
    }
  };

  return nmspace;
})("canvas");
