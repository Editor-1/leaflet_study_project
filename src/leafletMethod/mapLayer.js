function AllLayer() {
    const defaultTDTKey = '51d96270d898419fc64bbb89e26f199a'
    const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
    const tdtBaseUrl = 'style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk='
    const tdt = {
      url_open: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url_vec_w: 'http://t{s}.tianditu.gov.cn/vec_w/wmts?layer=vec&' + tdtBaseUrl,
      url_cva_w: 'http://t{s}.tianditu.gov.cn/cva_w/wmts?layer=cva&' + tdtBaseUrl,
      url_img_w: 'http://t{s}.tianditu.gov.cn/img_w/wmts?layer=img&' + tdtBaseUrl,
      url_cia_w: 'http://t{s}.tianditu.gov.cn/cia_w/wmts?layer=cia&' + tdtBaseUrl,
      url_ter_w: 'http://t{s}.tianditu.gov.cn/ter_w/wmts?layer=ter&' + tdtBaseUrl,
      url_cta_w: 'http://t{s}.tianditu.gov.cn/cta_w/wmts?layer=cta&' + tdtBaseUrl
    }
    const layerList = [
      {
        name: '街道',
        options: {
          zoomOffset: 0,
          subdomains,
          name: 'tiandi_vec'
        },
        list: [
          { url: tdt.url_vec_w + defaultTDTKey, bUrl: tdt.url_vec_w },
          { url: tdt.url_cva_w + defaultTDTKey, bUrl: tdt.url_cva_w }
        ],
      },
      {
        name: '卫星',
        options: {
          zoomOffset: 0,
          subdomains,
          name: 'tiandi_Image'
        },
        list: [
          { url: tdt.url_img_w + defaultTDTKey, bUrl: tdt.url_img_w },
          { url: tdt.url_cia_w + defaultTDTKey, bUrl: tdt.url_cia_w }
        ],
      },
      {
        name: '地形',
        options: {
          zoomOffset: 0,
          subdomains,
          name: 'tiandi_ter'
        },
        list: [
          { url: tdt.url_ter_w + defaultTDTKey, bUrl: tdt.url_ter_w },
          { url: tdt.url_cta_w + defaultTDTKey, bUrl: tdt.url_cta_w }
        ],
      },
      {
        name: '街道',
        options: {
            zoomOffset: 0,
            name: 'mapbox_Image'
        },
        list: [
            { url: tdt.url_open, bUrl: '' },
        ],
      }
    ]
    return layerList
}

export default{
    AllLayer
};