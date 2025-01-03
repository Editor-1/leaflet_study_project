import L from 'leaflet'
import pointIconUrl from '../assets/images/marker-icon.png'
import smallPointIconUrl from '../assets/images/blueCar.png'
import calDistance from '../leafletMethod/calDistance'
function drawPoint(){
    var pointIcon = L.icon({
        iconUrl: pointIconUrl,
        iconSize: [30,50]
    })
    window.map.once('click',function(e){
        var latlng = e.latlng
        L.marker(latlng,{icon: pointIcon}).bindPopup('newPoint').addTo(window.map)
    })
}
function drawLine(){
    var pArray = new Array()
    var smallPointIcon = L.icon({iconUrl: smallPointIconUrl, iconSize: [20,40]});
    //绑定一个事件
    const clickLineHandler = function(e){
        var latlng = e.latlng
        L.marker(latlng,{icon: smallPointIcon}).bindPopup('点' + pArray.length).addTo(window.map)
        pArray.push(latlng)
        let l = pArray.length
        if(l>1){
            const distance = calDistance.calculateDistance(pArray[l-2].lat,pArray[l-2].lng,
                pArray[l-1].lat,pArray[l-1].lng,
            )
            L.polyline(
                [pArray[l-2], pArray[l-1]],{
                opacity: 1, color: 'red'
            }).bindPopup('线段A---->B  距离为：' + parseFloat(distance).toFixed(3) + '米').addTo(map)
            window.map.off('click',clickLineHandler);
        }
    };
    window.map.on('click',clickLineHandler);
}
//画圈
function drwaCircle(){
    window.map.once('click',function(e){
        L.circleMarker(e.latlng,{color: 'red'}).addTo(window.map)
    })
}
//画矩形
function drawRectangle(){
    // 假设 window.map 已经是初始化好的 Leaflet 地图实例
    let firstPoint = null;

    // 监听第一次点击事件来获取矩形的第一个角点
    window.map.on('click', function(e) {
        if (!firstPoint) {
            firstPoint = e.latlng;
            alert('请点击矩形的第二个角点'); // 提示用户进行第二次点击
        } else {
            // 第二次点击后，创建矩形并添加到地图上
            const secondPoint = e.latlng;
            const bounds = L.latLngBounds([firstPoint, secondPoint]);
            const rectangle = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(window.map);

            // 清除点击事件监听器，避免再次触发
            window.map.off('click');

            // 可选：重置 firstPoint 以便函数可以重复使用
            firstPoint = null;
        }
    });
}
export default {
    drawPoint,drawLine,drwaCircle,drawRectangle
}