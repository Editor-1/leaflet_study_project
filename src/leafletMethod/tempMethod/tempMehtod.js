import { decodeGRIB2File } from './js/grib2utils'
// import WindJSLeaflet from './windy/wind-js-leaflet'
// import L from 'leaflet'
// import axios from 'axios'
// import * as project from './project/project'
function initTempMap() {
    //step1.加载在线数据
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
}
function loadTemperatureData(param) {
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
}
export default{
    initTempMap
}
