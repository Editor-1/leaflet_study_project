<template>
  <div>
    <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-submenu index="1">
        <template slot="title">切换底图</template>
        <el-menu-item index="1-1" @click="setLayer('tiandi_Image')" id="tiandi_Image">加载影像天地图</el-menu-item>
        <el-menu-item index="1-2" @click="setLayer('tiandi_vec')" id="tiandi_vec">加载矢量天地图</el-menu-item>
        <el-menu-item index="1-3" @click="setLayer('tiandi_ter')" id="tiandi_ter">加载地形天地图</el-menu-item>
        <el-menu-item index="1-4" @click="setLayer('mapbox_Image')" id="mapbox_Image">加载世界地图</el-menu-item>
    </el-submenu>
    
    <el-submenu index="2">
        <template slot="title">图上作业</template>
        <el-menu-item index="2-1" @click="drawPoint()">画点</el-menu-item>
        <el-menu-item index="2-2" @click="drawLine()">画线</el-menu-item>
        <el-menu-item index="2-3" @click="drawCircle()">画圈</el-menu-item>
        <el-menu-item index="2-4" @click="drawRectangle()">画矩形</el-menu-item>
    </el-submenu>
    
    <el-submenu index="3">
        <template slot="title">地图移动</template>
        <el-menu-item index="3-1" @click="mapLarge()">地图放大</el-menu-item>
        <el-menu-item index="3-2" @click="mapDown()">地图缩小</el-menu-item>
        <el-menu-item index="3-3" @click="mapTranslation()">地图平移</el-menu-item>
        <el-menu-item index="3-4" @click="transToPoint()">定位平移到位点</el-menu-item>
        <el-menu-item index="3-5" @click="flyToPoint()">定位飞到位点</el-menu-item>
    </el-submenu>

    <el-submenu index="4">
        <template slot="title">图上作业Plus</template>
        <el-menu-item index="4-1" @click="drawLightPoint()">画亮点</el-menu-item>
        <el-menu-item index="4-2" @click="clusterPoints()">聚合点位</el-menu-item>
        <el-menu-item index="4-3" @click="drwaPointPlus()">使用leaflet.draw插件</el-menu-item>
    </el-submenu>

    <el-menu-item index="5" @click="drawByGeoJson()">geojson数据绘制边界</el-menu-item>

    <el-submenu index="6">
        <template slot="title">天气气象展示</template>
        <el-menu-item index="6-1" @click="weatherDisplay()">风向风速温度</el-menu-item>
        <el-menu-item index="6-2" @click="tempDisplay()">温度气象图</el-menu-item>
        <el-menu-item index="6-3" @click="initMap()">温度图</el-menu-item>
    </el-submenu>

    <el-submenu index="7">
        <template slot="title">geoServer请求</template>
        <el-menu-item index="7-1" @click="geoServerPot()">请求点</el-menu-item>
        <el-menu-item index="7-2" @click="geoServerLine()">请求国界线</el-menu-item>
        <el-menu-item index="7-3" @click="geoServerPolygone()">请求国界面</el-menu-item>
        <el-menu-item index="7-4" @click="geoServerLayer()">请求图层</el-menu-item>
    </el-submenu>

    <el-submenu index="8">
        <template slot="title">cesium</template>
        <el-menu-item index="8-1" @click="cesuimStart()">地图初始化</el-menu-item>
    </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import mapLayer from '../leafletMethod/mapLayer'
import drawHelper from '../leafletMethod/drawHelper'
import mapAction from '../leafletMethod/mapAction'
import mapActionByLeafletDraw from '../leafletMethod/mapActionByLeafletDraw'
import geojsonHelper from '../leafletMethod/geojsonHelper'
import weatherHelper from '../leafletMethod/weatherHelper'
import tempMethod from '../leafletMethod/tempMethod/tempMehtod'
import geoServerHelper from '../leafletMethod/geoServerHelper'
import cesuimHelper from '../cesiumMethod/cesuimHelper'

import L from 'leaflet'
let controllerFlag = false;
export default {
    name : 'navmenu',
    data() {
      return {
        activeIndex: '1-1',
        currentLayer: [[L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {  attribution: '&copy; editor_1_study'})],[]]
        // currentLayer: [[],[]]
      };
    },
    methods: {
      setLayer(options) {
        const mapLayers = mapLayer.AllLayer();
        var flag = false;
        if (this.currentLayer) {
          this.currentLayer.forEach(item =>{
            window.map.removeLayer(item);
          })
          this.currentLayer = [[],[]]
        }
        for (let i = 0; i < mapLayers.length; i++) {
          if (mapLayers[i].options.name === options) {
            flag = true;
            mapLayers[i].list
            for(let j = 0; j < mapLayers[i].list.length; j++){
              const sub = mapLayers[i].list[j];
              const layer = L.tileLayer(sub.url, Object.assign({}, mapLayers[i].options, sub));
              layer.addTo(window.map);  // 将新的底图添加到地图
              this.currentLayer[j] = layer;  // 更新 currentLayer 为新的底图
            }
          }
        }
        const controller = L.control.layers(window.map.baseMaps)
        if(!controllerFlag){
          controllerFlag = true
          controller.addTo(window.map)
          window.layerControl = controller
        }
        if (!flag) {
          console.error('未找到对应的地图图层');
        }
      },
      drawPoint(){
        drawHelper.drawPoint()
      },
      drawLine(){
        drawHelper.drawLine()
      },
      drawCircle(){
        drawHelper.drwaCircle()
      },
      drawRectangle(){
        drawHelper.drawRectangle()
      },
      mapLarge(){
        mapAction.largeZoom()
      },
      mapDown(){
        mapAction.downZoom()
      },
      mapTranslation(){
        mapAction.mapTranslation()
      },
      transToPoint(){
        mapAction.transToPoint()
      },
      flyToPoint(){
        mapAction.flyToPoint()
      },
      drwaPointPlus(){
        mapActionByLeafletDraw.drwaPointPlus()
      },
      drawLightPoint(){
        mapActionByLeafletDraw.drawLightPoint()
      },
      clusterPoints(){
        mapActionByLeafletDraw.clusterPoints()
      },
      drawByGeoJson(){
        geojsonHelper.loadJsonData()
      },
      weatherDisplay(){
        weatherHelper.weatherDisplay();
      },
      tempDisplay(){
        weatherHelper.tempDisplay();
      },
      initMap(){
        tempMethod.initTempMap();
      },
      geoServerPot(){
        geoServerHelper.geoServerPot();
      },
      geoServerLine(){
        geoServerHelper.geoServerLine();
      },
      geoServerPolygone(){
        geoServerHelper.geoServerPolygone();
      },
      geoServerLayer(){
        geoServerHelper.geoServerLayer();
      },
      cesuimStart(){
        cesuimHelper.initMap();
      }
    }
}

</script>

<style scoped>
</style>
