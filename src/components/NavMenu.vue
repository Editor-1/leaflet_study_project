<template>
  <div>
    <el-menu
    :default-active="activeIndex2"
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-submenu index="1">
        <template slot="title">切换底图</template>
        <el-menu-item index="1-1" onclick='setLayer("mapbox_Image")'>加载世界地图</el-menu-item>
        <el-menu-item index="1-2" onclick='setLayer("tiandi_Image")'>加载影像天地图</el-menu-item>
        <el-menu-item index="1-3" onclick='setLayer("tiandi_vec")'>加载矢量天地图</el-menu-item>
        <el-menu-item index="1-4" onclick='setLayer("tiandi_ter")'>加载地形天地图</el-menu-item>
    </el-submenu>
    
    <el-submenu index="2">
        <template slot="title">图上作业</template>
        <el-menu-item index="2-1" onclick="drawPoint()">画点</el-menu-item>
        <el-menu-item index="2-2" onclick="drawArrow()">画线</el-menu-item>
        <el-menu-item index="2-3" onclick="drawCircle()">画圈</el-menu-item>
        <el-menu-item index="2-4" onclick="drawRectangle()">画矩形</el-menu-item>
    </el-submenu>
    
    <el-submenu index="3">
        <template slot="title">地图移动</template>
        <el-menu-item index="3-1" onclick="mapScaling()">地图缩放</el-menu-item>
        <el-menu-item index="3-2" onclick="mapTranslation()">地图平移</el-menu-item>
        <el-menu-item index="3-3" onclick="TransToPoint()">定位平移到位点</el-menu-item>
        <el-menu-item index="3-4" onclick="flyToPoint()">定位飞到位点</el-menu-item>
    </el-submenu>

    <el-submenu index="4">
        <template slot="title">图上作业Plus</template>
        <el-menu-item index="4-1" onclick="drawLightPoint()">画亮点</el-menu-item>
        <el-menu-item index="4-2" onclick="drawLightCircle()">画亮圆圈</el-menu-item>
    </el-submenu>

    <el-menu-item index="5">geojson数据绘制边界</el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
export default {
    name : 'navmenu'
}
</script>

<style scoped>
</style>
