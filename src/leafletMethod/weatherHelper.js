import L from 'leaflet'
import d3 from 'd3'
import demoData from '../demoData.json'
import WindJSLeaflet from '../leafletMethod/windyMethod/wind-js-leaflet'
let weatherData = demoData
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
    weatherDisplay
};