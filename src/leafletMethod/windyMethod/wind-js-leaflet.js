'use strict'; //严格模式下你不能使用未声明的变量。
import Windy from './wind-windy'
import $ from 'jquery';  
// shim layer with setTimeout fallback
window.requestAnimationFrame = function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
		return window.setTimeout(callback, 1000 / FRAME_RATE);
	};
}();

if (!window.cancelAnimationFrame) {
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}
L.Control.WindPosition = L.Control.extend({

	options: {
		position: 'bottomleft',
		emptyString: 'Unavailable'
	},

	onAdd: function onAdd(map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-wind-position');
		L.DomEvent.disableClickPropagation(this._container);
		map.on('mousemove', this._onMouseMove, this);
		this._container.innerHTML = this.options.emptyString;
		return this._container;
	},

	onRemove: function onRemove(map) {
		map.off('mousemove', this._onMouseMove, this);
	},

	vectorToSpeed: function vectorToSpeed(uMs, vMs) {
		var windAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
		return windAbs;
	},

	vectorToDegrees: function vectorToDegrees(uMs, vMs) {
		var windAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
		var windDirTrigTo = Math.atan2(uMs / windAbs, vMs / windAbs);
		var windDirTrigToDegrees = windDirTrigTo * 180 / Math.PI;
		var windDirTrigFromDegrees = windDirTrigToDegrees + 180;
		return windDirTrigFromDegrees.toFixed(3);
	},

	_onMouseMove: function _onMouseMove(e) {

		var self = this;
		var pos = this.options.WindJSLeaflet._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
		var gridValue = this.options.WindJSLeaflet._windy.interpolatePoint(pos.lng, pos.lat);
		var htmlOut = "";

		if (gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1]) && gridValue[2]) {

			// vMs comes out upside-down..
			var vMs = gridValue[1];
			vMs = vMs > 0 ? vMs = vMs - vMs * 2 : Math.abs(vMs);

			htmlOut = "<strong>Wind Direction: </strong>" + self.vectorToDegrees(gridValue[0], vMs) + "°" + ", <strong>Wind Speed: </strong>" + self.vectorToSpeed(gridValue[0], vMs).toFixed(1) + "m/s" + ", <strong>Temp: </strong>" + (gridValue[2] - 273.15).toFixed(1) + "°C";
		} else {
			htmlOut = "no wind data";
		}

		self._container.innerHTML = htmlOut;

		// move control to bottom row
    // document.getElementsByClassName('leaflet-control-wind-position')
		// if ($('.leaflet-control-wind-position').index() == 0) {
		// 	$('.leaflet-control-wind-position').insertAfter('.leaflet-control-mouseposition');
		// }
	}

});

L.Map.mergeOptions({
	positionControl: false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

L.control.windPosition = function (options) {
	return new L.Control.WindPosition(options);
};



const WindJSLeaflet = {

    _map: null,
    _data: null,
    _options: null,
    _canvasLayer: null,
    _windy: null,
    _context: null,
    _timer: 0,
    _mouseControl: null,

    init: function init(options) {

      // don't bother setting up if the service is unavailable
      WindJSLeaflet._checkWind(options).then(function() {

        // set properties
        WindJSLeaflet._map = options.map;
        WindJSLeaflet._options = options;

        // create canvas, add overlay control
        WindJSLeaflet._canvasLayer = L.canvasLayer().delegate(WindJSLeaflet);
        WindJSLeaflet._options.layerControl.addOverlay(WindJSLeaflet._canvasLayer, options.overlayName || 'wind');

        // ensure clean up on deselect overlay
        WindJSLeaflet._map.on('overlayremove', function(e) {
          if (e.layer == WindJSLeaflet._canvasLayer) {
            WindJSLeaflet._destroyWind();
          }
        });
      }).catch(function(err) {
        console.log('err');
        WindJSLeaflet._options.errorCallback(err);
      });
    },

    setTime: function setTime(timeIso) {
      WindJSLeaflet._options.timeISO = timeIso;
    },

    /*------------------------------------ PRIVATE ------------------------------------------*/

    /**
     * Ping the test endpoint to check if wind server is available
     *
     * @param options
     * @returns {Promise}
     */
    _checkWind: function _checkWind(options) {

      return new Promise(function(resolve, reject) {

        if (options.localMode) resolve(true);

        $.ajax({
          type: 'GET',
          url: options.pingUrl,
          error: function error(err) {
            reject(err);
          },
          success: function success(data) {
            resolve(data);
          }
        });
      });
    },

    _getRequestUrl: function _getRequestUrl() {

      if (!this._options.useNearest) {
        return this._options.latestUrl;
      }

      var params = {
        "timeIso": this._options.timeISO || new Date().toISOString(),
        "searchLimit": this._options.nearestDaysLimit || 7 // don't show data out by more than limit
      };

      return this._options.nearestUrl + '?' + $.param(params);
    },

    _loadLocalData: function _loadLocalData() {

      console.log('using local data..');
      // axios.get('./static/demoData.json').then(res => {
      //   console.log('res', res)
      //   WindJSLeaflet._data = res.data;
      //   WindJSLeaflet._initWindy(res.data);
      // })
      $.get('./static/demoData.json').then(res => {
        console.log('res', res)
        WindJSLeaflet._data = res;
        WindJSLeaflet._initWindy(res);
      })
    },

    _loadWindData: function _loadWindData() {

      if (this._options.localMode) {
        this._loadLocalData();
        return;
      }

      var request = this._getRequestUrl();
      console.log(request);

      $.ajax({
        type: 'GET',
        url: request,
        error: function error(err) {
          console.log('error loading data');
          WindJSLeaflet._options.errorCallback(err) || console.log(err);
          WindJSLeaflet._loadLocalData();
        },
        success: function success(data) {
          WindJSLeaflet._data = data;
          WindJSLeaflet._initWindy(data);
        }
      });
    },

    onDrawLayer: function onDrawLayer(overlay, params) {

      if (!WindJSLeaflet._windy) {
        WindJSLeaflet._loadWindData();
        return;
      }

      if (this._timer) clearTimeout(WindJSLeaflet._timer);

      this._timer = setTimeout(function() {

        var bounds = WindJSLeaflet._map.getBounds();
        var size = WindJSLeaflet._map.getSize();

        // bounds, width, height, extent
        WindJSLeaflet._windy.start([[0, 0], [size.x, size.y]], size.x, size.y, [[bounds._southWest.lng, bounds._southWest.lat], [bounds._northEast.lng, bounds._northEast.lat]]);
      }, 750); // showing wind is delayed
    },

    _initWindy: function _initWindy(data) {

      // windy object
      this._windy = new Windy({ canvas: WindJSLeaflet._canvasLayer._canvas, data: data });

      // prepare context global var, start drawing
      this._context = this._canvasLayer._canvas.getContext('2d');
      this._canvasLayer._canvas.classList.add("wind-overlay");
      this.onDrawLayer();

      this._map.on('dragstart', WindJSLeaflet._windy.stop);
      this._map.on('zoomstart', WindJSLeaflet._clearWind);
      this._map.on('resize', WindJSLeaflet._clearWind);

      this._initMouseHandler();
    },

    _initMouseHandler: function _initMouseHandler() {
      if (!this._mouseControl && this._options.displayValues) {
        var options = this._options.displayOptions || {};
        options['WindJSLeaflet'] = WindJSLeaflet;
        this._mouseControl = L.control.windPosition(options).addTo(this._map);
      }
    },

    _clearWind: function _clearWind() {
      if (this._windy) this._windy.stop();
      if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    },

    _destroyWind: function _destroyWind() {
      if (this._timer) clearTimeout(this._timer);
      if (this._windy) this._windy.stop();
      if (this._context) this._context.clearRect(0, 0, 3000, 3000);
      if (this._mouseControl) this._map.removeControl(this._mouseControl);
      this._mouseControl = null;
      this._windy = null;
      this._map.removeLayer(this._canvasLayer);
    }

  };

export default WindJSLeaflet
