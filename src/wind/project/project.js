
export function deg2rad(deg) {
  return deg / 180 * Math.PI;
}
function rad2deg(ang) {
  return ang / (Math.PI / 180.0);
}
function mercY(lat) {
  return Math.log(Math.tan(lat / 2 + Math.PI / 4));
}
export function project(lat, lon) {
  const size = 1024 // 图片高宽
  const windy = {
    south: deg2rad(-85),
    north: deg2rad(85),
    east: deg2rad(180),
    west: deg2rad(-180),
    width: size,
    height: size
  }
  // both in radians, use deg2rad if neccessary
  const ymin = mercY(windy.south);
  const ymax = mercY(windy.north);
  const xFactor = windy.width / (windy.east - windy.west);
  const yFactor = windy.height / (ymax - ymin);

  let y = mercY(deg2rad(lat));
  const x = (deg2rad(lon) - windy.west) * xFactor;
  y = (ymax - y) * yFactor; // y points south
  return { x, y }
}

/// 暂时不用
// 随图实时变化暂时不用
export function projectMap(lat, lon) {
  var xy = map.latLngToContainerPoint(L.latLng(lat, lon));
  return [xy.x, xy.y];
}
// 像素点转坐标 暂时不用
export function invert(x, y) {
  const s = -89
  const n = 89
  const e = 180
  const w = -180
  const windy = {
    south: deg2rad(s),
    north: deg2rad(n),
    east: deg2rad(e),
    west: deg2rad(w),
    width: 1024,
    height: 1024
  };
  var mapLonDelta = windy.east - windy.west;
  var worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
  var mapOffsetY = worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south)));
  var equatorY = windy.height + mapOffsetY;
  var a = (equatorY - y) / worldMapRadius;

  var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
  var lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
  return [lon, lat];
}

/**
 * 拉伸形变方法 暂时不用
 * @param λ 表示经度
 * @param φ 表示纬度（单位：度）。
 * @param x x 和 y：表示某点在地图上的投影坐标，通常是二维平面上的点。
 * @param y
 * @returns {number[]}
 */
export function distortion(λ, φ, x, y) {
  var τ = 2 * Math.PI;
  var H = Math.pow(10, -5.2);
  var hλ = λ < 0 ? H : -H;
  var hφ = φ < 0 ? H : -H;

  var pλ = project2(φ, λ + hλ);
  var pφ = project2(φ + hφ, λ);
  console.log('pλ', pλ)
  console.log('pφ', pφ)

  // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
  // changes depending on φ. Without this, there is a pinching effect at the poles.
  var k = Math.cos(φ / 360 * τ);
  return [(pλ[0] - x) / hλ / k, (pλ[1] - y) / hλ / k, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
}
