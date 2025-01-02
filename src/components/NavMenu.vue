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
        <el-menu-item index="1-1" @click="setLayer('mapbox_Image')" id="mapbox_Image">加载世界地图</el-menu-item>
        <el-menu-item index="1-2" @click="setLayer('tiandi_Image')" id="tiandi_Image">加载影像天地图</el-menu-item>
        <el-menu-item index="1-3" @click="setLayer('tiandi_vec')" id="tiandi_vec">加载矢量天地图</el-menu-item>
        <el-menu-item index="1-4" @click="setLayer('tiandi_ter')" id="tiandi_ter">加载地形天地图</el-menu-item>
    </el-submenu>
    
    <el-submenu index="2">
        <template slot="title">图上作业</template>
        <el-menu-item index="2-1" @click="drawPoint()">画点</el-menu-item>
        <el-menu-item index="2-2" @click="drawArrow()">画线</el-menu-item>
        <el-menu-item index="2-3" @click="drawCircle()">画圈</el-menu-item>
        <el-menu-item index="2-4" @click="drawRectangle()">画矩形</el-menu-item>
    </el-submenu>
    
    <el-submenu index="3">
        <template slot="title">地图移动</template>
        <el-menu-item index="3-1" @click="mapScaling()">地图缩放</el-menu-item>
        <el-menu-item index="3-2" @click="mapTranslation()">地图平移</el-menu-item>
        <el-menu-item index="3-3" @click="TransToPoint()">定位平移到位点</el-menu-item>
        <el-menu-item index="3-4" @click="flyToPoint()">定位飞到位点</el-menu-item>
    </el-submenu>

    <el-submenu index="4">
        <template slot="title">图上作业Plus</template>
        <el-menu-item index="4-1" @click="drawLightPoint()">画亮点</el-menu-item>
        <el-menu-item index="4-2" @click="drawLightCircle()">画亮圆圈</el-menu-item>
    </el-submenu>

    <el-menu-item index="5">geojson数据绘制边界</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import mapLayer from '../leafletMethod/mapLayer'
import L from 'leaflet'
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
            console.log(item)
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
        if (!flag) {
          console.error('未找到对应的地图图层');
        }
      }
    }
}

</script>

<style scoped>
</style>
