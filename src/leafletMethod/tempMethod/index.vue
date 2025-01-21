<template>
  <div>
    <div style="position: fixed;z-index: 1000;right: 100px;top:100px;">123123</div>
    <div style="position: fixed;z-index: 1000;bottom: 10px;left:220px;background: gray;padding: 1px 3px;">{{ msg }}</div>
  </div>
</template>

<script>
import { decodeGRIB2File } from './js/grib2utils'
import WindJSLeaflet from './windy/wind-js-leaflet'
import L from 'leaflet'
import axios from 'axios'
import * as project from './project/project'

const size = 1024
const ImageGridData = Array.from({ length: size }, () => Array.from({ length: size }).fill(0))
export default {
  name: 'Wind',
  data() {
    return {
      msg: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      // this.loadWind()
      // this.loadData() // 直接使用经纬度格式
      // this.loadTemperatureFile() // 加载本地文件
      this.loadTemperatureOnline() // 加载在线数据
      this.initMouseMove()
    })
  },
  methods: {
    loadTemperatureOnline() {
      // 不用范围参数 纬度是反的
      // fetch('/weather/cgi-bin/filter_gdas_0p25.pl?dir=%2Fgdas.20250109%2F00%2Fatmos&file=gdas.t00z.pgrb2.0p25.f009&var_TMP=on&lev_2_m_above_ground=on&subregion=&toplat=90&leftlon=0&rightlon=360&bottomlat=-90')
      fetch('/weather/cgi-bin/filter_gfs_0p25.pl?dir=%2Fgfs.20250111%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f009&var_TMP=on&lev_surface=on&subregion=&toplat=90&leftlon=0&rightlon=360&bottomlat=-90')
        .then(response => response.arrayBuffer())
        .then(buffer => {
        const gribFiles = decodeGRIB2File(buffer)
        console.log('gribFiles', gribFiles)
        for (let i = 0; i < gribFiles.length; i++) {
          console.log('gribFiles[i]', gribFiles[i])
          const data = gribFiles[i].data
          const product = data.product
          const grid = data.grid
          for (const productKey in product) {
            if (productKey.indexOf('Parameter number') !== -1) {
              if (product[productKey].parameter === 'Temperature') {
                const header = {
                  nx: grid.numLongPoints,
                  ny: grid.numLatPoints,
                  lo1: grid.lonStart,
                  lo2: grid.lonEnd,
                  la1: grid.latEnd,
                  la2: grid.latStart
                }
                this.loadTemperatureData({
                  header,
                  values: data.values
                })
              }
            }
          }
        }
      })
    },
    loadTemperatureFile() {
      axios.get('/wind/test2.json').then(res => {
        console.log('res', res)
        const { header, data } = res.data[0]
        this.loadTemperatureData({
          header, values: data
        })
      })
    },
    loadTemperatureData(param) {
      /**
       * 气象原始数据参数，目前单位是度
       * nx 1440 x 方向分辨率（格子数量）
       * ny 721 y 方向分辨率
       * lo1, lo2, la1, la2 经纬度范围 lng: 0 到 360 lat: -90 到 90
       */
      const values = param.values
      const header = param.header
      const { nx, ny, lo1, lo2, la1, la2 } = header

      const latDelta = la2 - la1; // -180
      const lonDelta = lo2 - lo1; // 359.75003

      // 1、将经纬度投影到莫卡托并转为平面坐标（将20037508 * 20037508 到 1024 * 1024）
      //    0 到 360 转为 -180 到 180
      //   将平面坐标的近似值，保存到缓存中
      const gridData = { }
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const value = values[y * nx + x] - 273.15 // 转换为摄氏温度
          const lat = la1 + (latDelta / ny) * y
          let lon = lo1 + (lonDelta / nx) * x - 180
          if (lon > 0 && lon <= 180) { // 0-359.7 转 180
            lon = lon - 180
          } else if (lon > -180 && lon <= 0) {
            lon += 180
          }
          const point = project.project(lat, lon)
          gridData[Math.ceil(point.x) + '-' + Math.floor(point.y)] = value
          gridData[Math.floor(point.x) + '-' + Math.ceil(point.y)] = value
          gridData[Math.ceil(point.x) + '-' + Math.ceil(point.y)] = value
          gridData[Math.floor(point.x) + '-' + Math.floor(point.y)] = value
        }
      }
      this.drawPic({
        values: gridData
      })
    },
    loadWind() {
      var handleError = function(err){
        console.log('handleError...');
        console.log(err);
      };
      WindJSLeaflet.init({
        localMode: true,
        map: window.map,
        layerControl: window.layerControl,
        useNearest: false,
        timeISO: null,
        nearestDaysLimit: 7,
        displayValues: true,
        displayOptions: {
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data'
        },
        overlayName: 'wind',

        // https://github.com/danwild/wind-js-server
        // pingUrl: 'http://localhost:7000/alive',
        // latestUrl: 'http://localhost:7000/latest',
        // nearestUrl: 'http://localhost:7000/nearest',
        // errorCallback: handleError,
        errorCallback: handleError
      });
    },
    drawPic(data) {
      const values = data.values
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      const imageData = ctx.createImageData(size, size)
      const pixelData = imageData.data

      // 定义温度和对应颜色的关键点
      const colorStopsB = [
        { temp: -150, color: [240, 248, 255] },  // #664159
        { temp: -30, color: [240, 255, 255] },  // #bc613d
        { temp: -25, color: [173, 216, 230] }, // #c6b64f
        { temp: -20, color: [175, 238, 238] },  // #5a9935
        { temp: -15, color: [77, 133, 195] }, // #4d85c3
        { temp: -10, color: [109, 200, 194] },// #6dc8c2
        { temp: -5, color: [142, 118, 255] }, // #8e76ff
        { temp: 0, color: [91, 99, 232] },    // #5b63e8
        { temp: 5, color: [70, 51, 244] },    // #4633f4
        { temp: 10, color: [0, 200, 200] },   // 自定义中间色
        { temp: 15, color: [255, 165, 0] },   // 橙色
        { temp: 20, color: [255, 100, 100] }, // 红色
        { temp: 30, color: [255, 50, 50] },   // 深红色
        { temp: 40, color: [131, 81, 88] }, // 褐色
        { temp: 150, color: [10, 6, 9] },   //
      ];
      const colorStops = [
        { temp: -50, color: [95, 90, 200] },
        { temp: -45, color: [95, 90, 200] },
        { temp: -40, color: [100, 100, 210] },
        { temp: -35, color: [111, 114, 217] },
        { temp: -30, color: [120, 144, 235] },
        { temp: -25, color: [148, 187, 235] },
        { temp: -20, color: [180, 200, 240] },
        { temp: -15, color: [210, 220, 250] },
        { temp: -10, color: [230, 240, 255] },
        { temp: -5, color: [255, 250, 200] },
        { temp: 0, color: [255, 230, 150] },
        { temp: 5, color: [255, 200, 100] },
        { temp: 10, color: [255, 150, 50] },
        { temp: 15, color: [255, 100, 0] },
        { temp: 20, color: [200, 50, 0] },
        { temp: 25, color: [150, 0, 0] },
        { temp: 30, color: [100, 0, 0] },
        { temp: 35, color: [75, 0, 0] },
        { temp: 40, color: [50, 0, 0] },
        { temp: 45, color: [25, 0, 0] },
        { temp: 50, color: [0, 0, 0] }
      ];

      function interpolateColor(temp) {
        let r, g, b
        // 找到当前温度所在的区间
        for (let i = 0; i < colorStops.length - 1; i++) {
          const start = colorStops[i]
          const end = colorStops[i + 1]
          if (temp >= start.temp && temp <= end.temp) {
            const ratio = (temp - start.temp) / (end.temp - start.temp)
            r = Math.round(start.color[0] + ratio * (end.color[0] - start.color[0]))
            g = Math.round(start.color[1] + ratio * (end.color[1] - start.color[1]))
            b = Math.round(start.color[2] + ratio * (end.color[2] - start.color[2]))
            return { r, g, b }
          }
        }
        return { r: 0, g: 0, b: 0 }
      }
      // 填充 ImageData
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let value = values[x + '-' + y]
          const index = (y * size + x) * 4
          if (!value) {
            if (y > size / 2) { // 向下找最近的值
              for (let i = y; i > size / 2; i--) {
                if (values[x + '-' + i]) {
                  value = values[x + '-' + i]
                  break
                }
              }
            } else { // 向上找最近的值
              for (let i = y; i < size / 2; i++) {
                if (values[x + '-' + i]) {
                  value = values[x + '-' + i]
                  break
                }
              }
            }
          }
          if (value) {
            const { r, g, b } = interpolateColor(value)
            pixelData[index] = r     // Red
            pixelData[index + 1] = g // Green
            pixelData[index + 2] = b // Blue
            pixelData[index + 3] = 255 // Alpha
            ImageGridData[x][y] = value
          }
        }
      }
      // 将 ImageData 绘制到 Canvas
      ctx.putImageData(imageData, 0, 0)

      const imgData = canvas.toDataURL('image/png')
      const bounds = [[-90, -180], [90, 180]]
      L.imageOverlay(imgData, bounds, { opacity: 0.5 }).addTo(map)
      // document.body.append(canvas)
    },
    loadData() {
      // fetch('datasets/gdas.t12z.pgrb2.0p25.f005')
      // fetch('datasets/COSMODE_single_level_elements_PS_2018020500_000.grib2')
      // fetch('datasets/COSMODE_single_level_elements_ASWDIR_S_2018011803_006.grib2')
      // fetch('datasets/gdas.t00z.pgrb2.0p25.f000.grib2') // temperature in kelvins
      //   fetch('datasets/gdas.t00z.pgrb2.1p00.f000.grib2') // winds
      //   fetch('datasets/CODAR_EBRO_2022_05_16_0200-fromnc.grib2')
      //   fetch('datasets/winds.grb')
      fetch('/weather/cgi-bin/filter_gdas_0p25.pl?dir=%2Fgdas.20250109%2F00%2Fatmos&file=gdas.t00z.pgrb2.0p25.f009&var_TMP=on&lev_2_m_above_ground=on&subregion=&toplat=90&leftlon=0&rightlon=360&bottomlat=-90')
        // fetch('/weather/cgi-bin/filter_gdas_0p25.pl?dir=%2Fgdas.20250109%2F00%2Fatmos&file=gdas.t00z.pgrb2.0p25.f000&var_TMP=on&lev_2_m_above_ground=on&subregion=&toplat=90&leftlon=0&rightlon=180.00&bottomlat=-90')
        // fetch('/weather/cgi-bin/filter_gdas_0p25.pl?dir=%2Fgdas.20250109%2F00%2Fatmos&file=gdas.t00z.pgrb2.0p25.f000&var_TMP=on&lev_2_m_above_ground=on&subregion=&toplat=90&leftlon=180.00&rightlon=360&bottomlat=-90')
        .then(response => response.arrayBuffer())
        .then(buffer => {
          console.log(buffer)
          const gribFiles = decodeGRIB2File(buffer)
          console.log('gribFiles', gribFiles)
          for (let i = 0; i < gribFiles.length; i++) {
            const gribFile = gribFiles[i]
            if (gribFile.imgEl) {
              const grid = gribFile.data.grid
              // 定义图片的地理边界
              // const bounds = [[grid.latStart, grid.lonEnd], [grid.latEnd, grid.lonStart]];
              const bounds = [[0, -180], [90, 180]];
              // const bounds = [[0, -180], [90, 0]];

              // 使用 Leaflet 的 Image Overlay 加载图片
              L.imageOverlay(gribFile.imgEl.src, bounds, { opacity: 0.5 }).addTo(map);
            }
          }
        }).then(gribFiles => {
        console.log('gribFiles', gribFiles)
        // this.addGribToMap(gribFiles, 'example')
      })
        .catch(error => console.log(error));
    },
    initMouseMove() {
      const map = window.map
      map.on('mousemove', e => {
        const latLng = map.mouseEventToLatLng(e.originalEvent)
        const point = project.project(latLng.lat, latLng.lng)
        const x = Math.floor(point.x)
        const y = Math.floor(point.y)
        if (ImageGridData[x]) {
          this.msg = ImageGridData[x][y].toFixed(2) + '°C'
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
