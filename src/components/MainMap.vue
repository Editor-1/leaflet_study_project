<template>
    <div id="map"></div>
  </template>
  
  <script>
  import L from 'leaflet';
  import '../assets/css/leaflet.css';
  import '../assets/css/iclient-leaflet.min.css';
  export default {
      name: 'MainMap',
      mounted() {        
        var map = L.map('map').setView([32, 118], 5);
        this.map = map
        window.map = map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; editor_1_study'
        }).addTo(this.map);
        var baseLayers = {
            "天地街道图" : L.tileLayer(),
            "天地街道图" : L.tileLayer(),
            "天地地形图" : L.tileLayer(),
            "open地图": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            })
        }
        L.control.layers(baseLayers,{},{
            position: "topright"
        }).addTo(this.map)
      },
      data() {
          return {
              map: null,
          };
      },
      beforeDestroy() {
          if (this.map) {
              this.map.remove();
          }
      }
  };
  </script>
  
  <style scoped>
  #map {
      height: 85vh; /* 或者其他您需要的尺寸 */
      width: 100%;
  }
  </style>