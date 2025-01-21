import imageUrl from '../assets/images/image.png'
const pointIcon = L.icon({
    iconUrl: imageUrl,
    iconSize: [50, 50],
});
const geoUrlHead = 'http://localhost:8080/geoserver/';
const geoUrlCenter = '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=';
const geoUrlTail = '&outputFormat=application/json&srsName=';
/**
 * 从GeoServer中获取数据，加载点
 */
function geoServerPot() {
   //使用WFS服务获取数据图层
   //http://<geoserver_url>/geoserver/<workspace>/ows?service=WFS&version=1.0.0
   //&request=GetFeature&typeName=<workspace>:<layer_name>&outputFormat=application/json&srsName=EPSG:4490
   //tiger:poi
   const workspace = 'test';
   const type = ':lookput';
   const crs = 'EPSG:4326';
   const typeName = workspace + type;
//    const geoServerUrl = 'http://localhost:8080/geoserver/' + workspace + '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + typeName + '&outputFormat=application/json&srsName=EPSG:4326';
   const geoServerUrl = geoUrlHead + workspace + geoUrlCenter + typeName + geoUrlTail + crs;
    fetch(geoServerUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const features = data.features;
        features.forEach(feature => {
            const geometry = feature.geometry;
            const properties = feature.properties;
            const coordinates = geometry.coordinates;
            const latlng = L.latLng(coordinates[1], -coordinates[0]);
            const marker = L.marker(latlng, {icon: pointIcon}).addTo(map);
            marker.bindPopup('ID：<b>' + properties.ID + '</b><br>塔高：' + properties.塔高 + 'm');
        });
    })
    //http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:lookput&outputFormat=application/json&srsName=EPSG:4326
}
/**
 * 从GeoServer中获取数据，加载线
 */
function geoServerLine(){
    // 	ne:boundary_lines
    const workspace = 'ne';
    const type = ':boundary_lines';
    const crs = 'EPSG:4326';
    const typeName = workspace + type;
    const geoServerUrl = geoUrlHead + workspace + geoUrlCenter + typeName + geoUrlTail + crs;
    fetch(geoServerUrl)
    .then(response => response.json())
    .then(data => {
        const features = data.features;
        features.forEach(feature => {
            const geometry = feature.geometry;
            const coordinates = geometry.coordinates;
            const latlngs = [];
            coordinates.forEach(coordinate => {
                coordinate.forEach(item => {
                    latlngs.push(L.latLng(item[1], item[0]));
                });
            });
            L.polyline(latlngs, {color: 'yellow',opacity: 0.3}).addTo(map);
        });
    })
}
/**
 * 从GeoServer中获取数据，加载面
 */
function geoServerPolygone(){
    // ne:countries
    const workspace = 'ne';
    const type = ':countries';
    const crs = 'EPSG:4326';
    const typeName = workspace + type;
    const geoServerUrl = geoUrlHead + workspace + geoUrlCenter + typeName + geoUrlTail + crs;
    fetch(geoServerUrl)
    .then(response => response.json())
    .then(data => {
        const features = data.features;
        features.forEach(feature => {
            const geometry = feature.geometry;
            const coordinates = geometry.coordinates;
            const latlngs = [];
            // 多边形
            coordinates.forEach(coordinate => {
                console.log('coordinate:', coordinate);
                coordinate.forEach(item => {
                    item.forEach(p =>{
                        latlngs.push(L.latLng(p[1], p[0]));
                    })
                    const polygon =  L.polyline(latlngs, {color: 'red',opacity: 0.3}).addTo(map);
                    polygon.bindPopup('国家：<b>' + feature.properties.NAME_ZH + '</b>')
                });
            });
        });
    })
};
/**
 * 从GeoServer中获取数据，加载图层
 */
function geoServerLayer(){
    //tiger:poly_landmarks
    const workspace = 'tiger';
    const type = ':poly_landmarks';
    const crs = 'EPSG:4326';
    const typeName = workspace + type;
    const geoServerUrl = geoUrlHead + workspace + geoUrlCenter + typeName + geoUrlTail + crs;
    const geojsonLayer = L.geoJSON(null, {
        style: function (feature) {
            return {
                color: 'yellow',
                opacity: 0.3
            };
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup('地区名：<b>' + feature.properties.LANAME + '</b>');
        }
    }).addTo(map);
    fetch(geoServerUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        geojsonLayer.addData(data);
    })
}
export default{
    geoServerPot,
    geoServerLine,
    geoServerPolygone,
    geoServerLayer
}
