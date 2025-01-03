/**
 * 计算两个点的距离，使用Haversine球面模型计算方法
 * @param {} point1 
 * @param {*} point2 
 * @returns 
 */
function calculateDistance(point1_lat,point1_lng, point2_lat,point2_lng,) {
    const lat1 = parseFloat(point1_lat);
    const lng1 = parseFloat(point1_lng);
    const lat2 = parseFloat(point2_lat);
    const lng2 = parseFloat(point2_lng);

    const radLat1 = lat1 * Math.PI / 180.0;
    const radLat2 = lat2 * Math.PI / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0);
    const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    return s * 6371000.00;
}

export default{
    calculateDistance
}
