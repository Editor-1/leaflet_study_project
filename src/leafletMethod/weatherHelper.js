import L from 'leaflet'
import WindJSLeaflet from '../leafletMethod/windyMethod/wind-js-leaflet'
function weatherDisplay(){
    //step1.数据获取
    // var weatherDataList = dataTransform(weatherData)
    //step2.加载图层
    WindJSLeaflet.init({
        localMode: true,
        map: map,
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
        errorCallback: (e) => { console.log('ee', e)}
      });
}
function tempDisplay(){
    fetch('../static/test2.json').then(response => response.json()).then(weatherData => {
        console.log('加载温度数据成功:', weatherData);
        const { header, data } = weatherData[0];
        const { nx, ny, lo1, lo2, la1, la2 } = header;
        var λ0, φ0, Δλ, Δφ, ni, nj;
            λ0 = header.lo1;
            φ0 = header.la1; // the grid's origin (e.g., 0.0E, 90.0N)

            Δλ = header.dx;
            Δφ = header.dy; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

            ni = header.nx;
            nj = header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)
        var floorMod = function floorMod(a, n) {
            return a - n * Math.floor(a / n);
        };
        var isValue = function isValue(x) {
            return x !== null && x !== undefined;
        };
        var bilinearInterpolateVector = function interpolatePoint(x, y, g00, g10, g01, g11) {
            var rx = 1 - x;
            var ry = 1 - y;
            var a = rx * ry,
            b = x * ry,
            c = rx * y,
            d = x * y;
            var tmp = g00 * a + g10 * b + g01 * c + g11 * d;
            return [tmp];
        };
        // 将一维数据重塑为二维
        const dataGrid = [];
        for (let y = 0; y < ny; y++) {
            const row = [];
            for (let x = 0; x < nx; x++) {
                row.push(data[y * nx + x]);
            }
            dataGrid.push(row);
        }
       
       
        var tempInterpolate = function interpolate(λ, φ) {
            if (!dataGrid) return null;
            var i = floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)
            var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

            var fi = Math.floor(i),
            ci = fi + 1;
            var fj = Math.floor(j),
            cj = fj + 1;

            var row;
            if (row = dataGrid[fj]) {
            var g00 = row[fi];
            var g10 = row[ci];
            if (isValue(g00) && isValue(g10) && (row = dataGrid[cj])) {
                var g01 = row[fi];
                var g11 = row[ci];
                if (isValue(g01) && isValue(g11)) {
                // All four points found, so interpolate the value.
                return bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
                }
            }
            }
            return null;
        };

        // 创建一个新的 div 元素用于显示信息
        var infoDiv = document.createElement('div');
        infoDiv.id = 'info'; // 给它一个 ID 以便后续可以轻松地通过 CSS 或 JavaScript 选择它
        infoDiv.style.position = 'absolute'; // 设置绝对定位
        infoDiv.style.bottom = '10px'; // 距离底部 10px
        infoDiv.style.left = '10px'; // 距离左侧 10px
        infoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // 设置背景色和透明度
        infoDiv.style.padding = '5px'; // 设置内边距
        infoDiv.style.borderRadius = '5px'; // 设置圆角
        infoDiv.style.zIndex = 1000; // 确保它位于其他内容的上方

        // 将这个 div 添加到地图容器的末尾
        // window.map._container.appendChild(infoDiv);

        // 添加点击事件监听器
        window.map.on('mousemove', function(e) {
            // 获取点击的经纬度
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            // 使用点击的经纬度进行插值或其他处理
            var gridValue = tempInterpolate(lng, lat); // 注意参数顺序，通常是先经度后纬度
            // 构建输出的 HTML
            var htmlOut = "<strong>Temp: </strong>" + (gridValue[0] - 273.15).toFixed(1) + "°C";
            // 更新 infoDiv 的内容
            infoDiv.innerHTML = htmlOut;
        });
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const size = 1024
        canvas.width = size;
        canvas.height = size;
        // map.getPanes().overlayPane.appendChild(canvas);
        const imageData = ctx.createImageData(size, size);
        const pixelData = imageData.data;
        const latDelta = la2 - la1; // -180
        const lonDelta = lo2 - lo1; // 359.75003

        const widthPerPixel = size / nx; //1.179861111111111
        const heightPerPixel = size / ny; //0.3897364771151179

        var deg2rad = function deg2rad(deg) {
            return deg / 180 * Math.PI;
        };

        var rad2deg = function rad2deg(ang) {
            return ang / (Math.PI / 180.0);
        };

        var mercY = function mercY(lat) {
            return Math.log(Math.tan(lat / 2 + Math.PI / 4));
        }
        const windy = {
            south: deg2rad(-85),
            north: deg2rad(85),
            east: deg2rad(180),
            west: deg2rad(-180),
            width: size,
            height: size
        }
        var project = function (lat, lon) {
            // both in radians, use deg2rad if neccessary
            var ymin = mercY(windy.south);
            var ymax = mercY(windy.north);
            var xFactor = windy.width / (windy.east - windy.west);
            var yFactor = windy.height / (ymax - ymin);

            var y = mercY(deg2rad(lat));
            var x = (deg2rad(lon) - windy.west) * xFactor;
            var y = (ymax - y) * yFactor; // y points south
            return {x, y}
        }
        const gridData = {}
        // debugger;
        for (let y = 0; y < ny; y++) { // 1440
            const row = []
            for (let x = 0; x < nx; x++) { // 720

                const value = data[y * nx + x] - 273.15; // 转换为摄氏温度
                // const color = interpolateColor(value);
                
                // 计算像素对应的地图位置
                const lat = la1 + (latDelta / ny) * y;
                let lon = (lonDelta / nx) * x - 180;
                // const point = map.latLngToLayerPoint([lat, lon]);
                if (lon > 0 && lon <= 180) {
                    lon = lon - 180
                } else if (lon > -180 && lon <= 0) {
                    lon += 180
                }
                const point = project(lat, lon);
                const kk1 = `${Math.ceil( point.x)}-${Math.floor( point.y)}` // 1.3 1 2
                const kk2 = `${Math.floor( point.x)}-${Math.ceil( point.y)}` // 34.5 34 35
                const kk3 = `${Math.ceil( point.x)}-${Math.ceil( point.y)}`
                const kk4 = `${Math.floor( point.x)}-${Math.floor( point.y)}`
                gridData[kk1] = value
                gridData[kk2] = value
                gridData[kk3] = value
                gridData[kk4] = value
            }
        }
        
        // 定义温度和对应颜色的关键点
        // 关键点颜色和对应的温度
        const colorStops = [
            { temp: -32, color: [0, 0, 150] },
            { temp: -28, color: [0, 0, 255] },
            { temp: -24, color: [0, 75, 255] },
            { temp: -20, color: [0, 150, 255] },
            { temp: -16, color: [0, 200, 255] },
            { temp: -12, color: [50, 255, 255] },
            { temp: 8, color: [255, 200, 0] },
            { temp: -8, color: [150, 255, 255] },
            { temp: -4, color: [200, 255, 255] },
            { temp: 0, color: [255, 255, 150] },
            { temp: 4, color: [255, 255, 50] },
            { temp: 12, color: [255, 150, 100] },
            { temp: 16, color: [255, 150, 50] }, 
            { temp: 20, color: [255, 100, 0] },
            { temp: 24, color: [230, 0, 0] },
            { temp: 28, color: [150, 0, 0] },
            { temp: 32, color: [100, 0, 0] }
        ];
            
                    // 线性插值函数
        function interpolate(start, end, ratio) {
            return Math.round(start + ratio * (end - start));
        }

        // 根据温度计算插值颜色
        function getGradientColor(temp) {
            // 确定在哪两个颜色点之间插值
            for (let i = 0; i < colorStops.length - 1; i++) {
                // debugger
                const start = colorStops[i];
                const end = colorStops[i + 1];
                if (temp >= start.temp && temp <= end.temp) {
                    const ratio = (temp - start.temp) / (end.temp - start.temp); // 温度比例
                    const r = interpolate(start.color[0], end.color[0], ratio);
                    const g = interpolate(start.color[1], end.color[1], ratio);
                    const b = interpolate(start.color[2], end.color[2], ratio);
                    return { r, g, b };
                }
            }
            // 如果温度超出范围，返回最近的颜色
            if (temp < colorStops[0].temp) return { r: colorStops[0].color[0], g: colorStops[0].color[1], b: colorStops[0].color[2] };
            if (temp > colorStops[colorStops.length - 1].temp) return { r: colorStops[colorStops.length - 1].color[0], g: colorStops[colorStops.length - 1].color[1], b: colorStops[colorStops.length - 1].color[2] };
        }
        // 填充 ImageData 的逻辑
        // const interpolatedGrid = interpolateMissingPixels(gridData, size, size);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const value = gridData[x+'-'+y]
                const index = (y * size + x) * 4;
                if(value){
                    const { r, g, b } = getGradientColor(value); // 获取插值颜色
                    pixelData[index] = r;     // Red
                    pixelData[index + 1] = g; // Green
                    pixelData[index + 2] = b; // Blue
                    pixelData[index + 3] = 255; // Alpha
                } else {
                    if (y < size / 2) {
                        for(let i=y; i < size / 2; i++){
                            if (gridData[x+'-'+i]) {
                                const { r, g, b } = getGradientColor(gridData[x+'-'+i]); // 获取插值颜色
                                pixelData[index] = r;     // Red
                                pixelData[index + 1] = g; // Green
                                pixelData[index + 2] = b; // Blue
                                pixelData[index + 3] = 255; // Alpha
                                break
                            }
                        }
                    } else {
                        for(let i=y; i > size / 2; i--){
                            if (gridData[x+'-'+i]) {
                                const { r, g, b } = getGradientColor(gridData[x+'-'+i]); // 获取插值颜色
                                pixelData[index] = r;     // Red
                                pixelData[index + 1] = g; // Green
                                pixelData[index + 2] = b; // Blue
                                pixelData[index + 3] = 255; // Alpha
                                break
                            }
                        }
                    }
                }
            }   
        }

        ctx.putImageData(imageData, 0, 0);
        const src = canvas.toDataURL('image/png');
        // 定义图片的地理边界
        const bounds = [[-90, -180], [90, 180]];

        // 使用 Leaflet 的 Image Overlay 加载图片
        L.imageOverlay(src, bounds, { opacity: 0.3 }).addTo(map);
    }).catch(error => {
        console.error('加载温度数据失败:', error);
    });;
}

function dataTransform(data){
    var weatherDataList = []
    for(let i = 0; i < data[0].data.length; i++){
        var pointData = []
        for(let j = 0; j < data.length; j++){
            pointData.push(data[j].data[i])
        }
        weatherDataList.push(pointData)
    }
    return weatherDataList
}
export default { 
    weatherDisplay,tempDisplay
};