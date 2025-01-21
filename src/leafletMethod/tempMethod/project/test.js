
import axios from 'axios'
import L from 'leaflet'
// TODO del
let map

export function init(m) {
  map = m
}
export function add() {

  axios.get('/wind/test1.json').then(res => {
    console.log('ee', res)
    const d = res.data[0]
    const grid = buildGrid(d)
    console.log('grid', grid)
    add2(grid)
  })
}
function buildGrid(data) {
  const ni = data.header.nx;
  const nj = data.header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)
  const values = data.data
  const grid = [];
  let p = 0;

  for (let j = 0; j < nj; j++) {
    let row = [];
    for (let i = 0; i < ni; i++, p++) {
      row[i] = values[p];
    }
    grid[j] = row;
  }
  return grid
}
export function add2(weatherData) {
  console.log('weatherData', weatherData)
  // 墨卡托投影公式
  function mercatorProjection(lon, lat) {
    const R = 6378137; // 地球半径（米）
    const x = R * (lon * Math.PI / 180);
    const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 360)));
    return [x, y];
  }

  // 创建网格数据
  const lonGridSize = 1440; // 经度分辨率
  const latGridSize = 721;  // 纬度分辨率
  const lonRange = Array.from({ length: lonGridSize }, (_, i) => -180 + i * 360 / lonGridSize);
  const latRange = Array.from({ length: latGridSize }, (_, i) => -90 + i * 180 / latGridSize);

  // 墨卡托投影转换网格数据
  const mercatorCoordinates = [];
  for (let i = 0; i < latGridSize; i++) {
    const lat = latRange[i];
    const row = [];
    for (let j = 0; j < lonGridSize; j++) {
      const lon = lonRange[j];
      const [x, y] = mercatorProjection(lon, lat);
      row.push([x, y, weatherData[i][j]]);
    }
    mercatorCoordinates.push(row);
  }

  // 缩放至 1024x1024
  const targetSize = 1024;
  function resample(data, newWidth, newHeight) {
    const scaledData = new Array(newHeight).fill(null).map(() => new Array(newWidth).fill(0));
    const scaleX = data[0].length / newWidth;
    const scaleY = data.length / newHeight;
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        scaledData[y][x] = data[srcY][srcX];
      }
    }
    return scaledData;
  }

  // 提取投影数据的值，并将其缩放至 1024x1024
  const resizedData = resample(mercatorCoordinates, targetSize, targetSize);

  console.log('resizedData', resizedData)
  // 渲染到 Canvas
  const canvas = document.createElement("canvas");
  canvas.height = 1024
  canvas.width = 1024
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(targetSize, targetSize);

  const colorStops = [
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

  function interpolateColor(temp) {
    if (temp < colorStops[0].temp) {
      console.log('t', temp)
    }
    if (temp > colorStops[colorStops.length - 1].temp) {
      console.log('tt', temp)
    }
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
    return { r: 1, g: 6, b: 9 }
  }

  // 将数据映射到颜色值
  resizedData.forEach((row, y) => {
    row.forEach(([, , value], x) => {
      const { r, g, b } = interpolateColor(value - 173.15)
      const index =(y * targetSize + x) * 4;
      imageData.data[index] = r     // Red
      imageData.data[index + 1] = g // Green
      imageData.data[index + 2] = b // Blue
      imageData.data[index + 3] = 255 // Alpha
    });
  });

  // 绘制图像
  ctx.putImageData(imageData, 0, 0);
  const sr = canvas.toDataURL('image/png')
  console.log('src', sr)

  const bounds = [[-90, -180], [90, 180]];
  L.imageOverlay(sr, bounds, { opacity: 0.5 }).addTo(map);
}
