import L from 'leaflet'
import $ from 'jquery'
function loadJsonData() {
    const legend = L.control({ position: 'bottomright' });
    const oPolygon_VilPop = []; // 声明变量
    console.log('here A')
    const population = () => {
        $.get('../assets/geojson.json')
            .done(function (response) {
                const poplData = response.data;
                const PolygonsCenter = response.geopoint;
                drawPolygons(poplData, PolygonsCenter);
            })
            .fail(function () {
                console.error('Failed to load GeoJSON data');
            });
        console.log('here B')
    };
    // Step 2: 画多边形
    const drawPolygons = (poplData, PolygonsCenter) => {
        for (const i in poplData) {
            poplData[i].geoJson = JSON.parse(poplData[i].geoJson);
            oPolygon_VilPop[i] = L.geoJSON(poplData[i].geoJson, {
                style: function () {
                return {
                    color: 'white',
                    fillColor: getBgColor(poplData[i].population), //获取边界的填充色
                    fillOpacity: 0.6,
                    weight: 3,
                    dashArray: '10',
                };
                },
            }).bindTooltip(poplData[i].villageName + '<br><br>人口' + poplData[i].population + '人', {
                direction: 'top',
            }).on({
                mouseover: highlight, //鼠标移动上去高亮
                mouseout: resetHighlight, //鼠标移出恢复原样式
                click: zoomTo, //点击最大化
            }).addTo(window.map);
            console.log('加载成功' + poplData)
        }

        // 添加图例
        legend.onAdd = () => legendHtml();
        legend.addTo(window.map);
    };

    // 图例 HTML
    const legendHtml = () => {
        let div = L.DomUtil.create('div', 'legend locateVP_legend'),
            grades = [0, 50, 100, 200, 400],
            labels = [],
            from,
            to;
        for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(
                '<i style="background:' + getBgColor(from + 1) + '"></i> ' + from + (to ? ' &sim; ' + to + '人' : '以上')
            );
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    // 获取背景色
    const getBgColor = (d) => {
        return d > 400
            ? '#800026'
            : d > 300
            ? '#BD0026'
            : d > 200
            ? '#FC4E2A'
            : d > 100
            ? '#FD8D3C'
            : d > 50
            ? '#FED976'
            : '#FFEDA0';
    };

    // 高亮效果
    const highlight = (e) => {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7,
        });
    };

    // 恢复原样
    const resetHighlight = (e) => {
        var layer = e.target;
        layer.setStyle({
            weight: 3,
            color: 'white',
            dashArray: '10',
            fillOpacity: 0.6,
        });
    };

    // 缩放到多边形区域
    const zoomTo = (e) => {
        window.map.fitBounds(e.target.getBounds());
    };
}

export default {
    loadJsonData
};

