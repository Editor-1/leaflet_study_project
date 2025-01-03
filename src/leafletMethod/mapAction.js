import L from 'leaflet'
function largeZoom(){
    window.map.zoomIn();
}
function downZoom(){
    window.map.zoomOut();
}
function mapTranslation(){
    let polygon = L.polygon(
        [
          [37, -109.05],
          [41, -109.03],
          [41, -102.05],
          [37, -102.04],
        ],
        [40.774, -74.125],
        {
          color: 'green',
          fillColor: '#f03',
          fillOpacity: 0.5,
        }
      ).addTo(window.map); //地图上绘制一个多边形
      window.map.fitBounds(polygon.getBounds());
}
function transToPoint(){
    var latlng = [36.30,104.48]
    L.circleMarker(latlng,{color: 'red', draggable: true}).addTo(window.map)
    window.map.panTo(latlng,{
        animate: true,
    });//地图平移，默认就是true，将地图平移到给定的中心。如果新的中心点在屏幕内与现有的中心点不同则产生平移动作。
}
function flyToPoint(){
    var latlng = [18.30,114.48]
    L.circleMarker(latlng,{color: 'red', draggable: true}).addTo(window.map)
    window.map.flyTo(latlng);
}
export default{
    largeZoom,downZoom,mapTranslation,transToPoint,flyToPoint
}