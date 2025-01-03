import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import imageUrl from '../assets/images/image.png'
import 'leaflet-pulse-icon/src/L.Icon.Pulse'
import 'leaflet-pulse-icon/src/L.Icon.Pulse.css'
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
function drwaPointPlus(){
    let drawnItems = new L.FeatureGroup();
    window.map.addLayer(drawnItems);
    var leafletDraw = new L.Control.Draw({
        position: 'topleft',
        draw: {
            polyline: true, //绘制线
            polygon: true,  //绘制多边形
            rectangle: true, //绘制矩形
            circle: true,//绘制圆
            marker: true,   //绘制标注
            circlemarker: true, //绘制圆形标注

        },
        edit: {
            featureGroup: drawnItems, //绘制图层   
            edit: true,   //图形编辑控件
            remove: true, //图形删除控件
        }
    }).addTo(window.map)
    // 线段提示
    L.drawLocal = {
        draw: {
            toolbar: {
              actions: {
                title: '取消绘图', 
                text: '取消', 
              },
              finish: {
                title: '完成绘图', 
                text: '完成',
              },
              undo: {
                title: '删除最后绘制的点',
                text: '删除最后的点', 
              },
              buttons: {
                polyline: '绘制一个多段线', 
                polygon: '绘制一个多边形',
                rectangle: '绘制一个矩形', 
                circle: '绘制一个圆',
                marker: '绘制一个标记',
                circlemarker: '绘制一个圆形标记',
              },
            },
            handlers: {
              circle: {
                tooltip: {
                  start: '单击并拖动以绘制圆',
                },
                radius: 'Radius',
              },
              circlemarker: {
                tooltip: {
                  start: '单击“地图”以放置圆标记',
                },
              },
              marker: {
                tooltip: {
                  start: '单击“地图”以放置标记',
                },
              },
              polygon: {
                tooltip: {
                  start: '单击开始绘制形状', 
                  cont: '单击继续绘制形状', 
                  end: '单击第一个点关闭此形状', 
                },
              },
              polyline: {
                error: '<strong>错误:</strong>形状边缘不能交叉！',
                tooltip: {
                  start: '单击开始绘制线', 
                  cont: '单击以继续绘制线', 
                  end: '单击“最后一点”以结束线', 
                },
              },
              rectangle: {
                tooltip: {
                  start: '单击并拖动以绘制矩形', 
                },
              },
              simpleshape: {
                tooltip: {
                  end: '释放鼠标完成绘图',
                },
              },
            },
        },
        edit: {
            toolbar: {
              actions: {
                save: {
                  title: '保存更改',
                  text: '保存', 
                },
                cancel: {
                  title: '取消编辑，放弃所有更改', 
                  text: '取消', 
                },
                clearAll: {
                  title: '清除所有图层', 
                  text: '清除所有', 
                },
              },
              buttons: {
                edit: '编辑图层', 
                editDisabled: '无可编辑的图层', 
                remove: '删除图层', 
                removeDisabled: '无可删除的图层',
              },
            },
            handlers: {
              edit: {
                tooltip: {
                  text: '拖动控制柄或标记以编辑要素', 
                  subtext: '单击“取消”撤消更改', 
                },
              },
              remove: {
                tooltip: {
                  text: '单击要删除的要素',
                },
              },
            },
          },
        };
    //绘制事件
    window.map.on(L.Draw.Event.CREATED, function (e) {
        console.log('ejs', e);
        let type = e.layerType;
        //获取绘制图层
        let drawlayer = e.layer;
        console.log('type', type, 'drawlayer', drawlayer);
        if (type === 'marker') {
            L.icon({
                iconUrl: imageUrl,
                iconSize: [50, 50],
            })
            drawlayer.bindPopup('A popup!');
        }
        drawnItems.addLayer(drawlayer);
    });

}
//使用插件leaflet-pulse-icon
/**
 * @apiGroup 组件图层
 * @api drawPulseMarker 闪烁点
 * @apiParam {String} [color='red'] 波纹颜色
 * @apiParam {String} [fillColor='red'] 填充颜色
 * @apiParam {Array} [iconSize=[12,12]] 中心点大小
 * @apiParam {Boolean} [animate=true] 是否打开波纹动画
 * @apiParam {Number} [heartbeat=1] 波纹速率 (n=1)秒/次
 * @apiDescription 其它参数content参见drawMarker方法
 * @apiParamExample 示例
      overlay.drawPulseMarker({
        x: 120.7015499943696,
        y: 31.85071755057768,
        content: {
          popup: '还记得那年夕阳下的奔跑吗'
        },
        color: 'green',
        fillColor: '#0000FF',
        iconSize: [20, 20],
        animate: true,
        heartbeat: 0.5
      })
 */
function drawLightPoint(){
    // 创建脉动图标实例
    var pulsingIcon = L.icon.pulse({
        iconSize: [20, 20],
        color: 'red'
    });
    // 应用于标记点
    window.map.once('click',function(e){
        L.marker(e.latlng, {icon: pulsingIcon ,draggable: true}).addTo(window.map);
    })
}
// 生成一个n到m之间的随机浮点数
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
//使用markercluster插件实现点位聚合效果
function clusterPoints(){
    const pointIcon = L.icon({
        iconUrl: imageUrl,
        iconSize: [50, 50],
    });
    const markerClusterLayer = L.markerClusterGroup({
        showCoverageOnHover: false, // 为true时,当鼠标悬停在点上时，它会显示它聚合的边界
        zoomToBoundsOnClick: true, //  为true时,当鼠标点击某个点时，会缩放到它的边界范围
        chunkedLoading: true, 
        maxClusterRadius: 80, // 聚类从中心标记覆盖的最大半径（以像素为单位）,默认值 80
    }).addTo(window.map);
    for(let i = 0; i < 1000; i++){
        var lng = getRandomArbitrary(27,35);
        var lat = getRandomArbitrary(112,130);
        markerClusterLayer.addLayer(L.marker([lng,lat], {icon: pointIcon}))
    }
}
export default{
    drwaPointPlus,drawLightPoint,clusterPoints
}