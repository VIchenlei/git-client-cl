import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'

export default class OlMapFaultLayer extends OlMapWorkLayer {
  constructor(workspace) {
    super(workspace)
    this.map = workspace.map
    this.isInnerIP = false // 默认是外网
    this.registerGlobalEventHandlers()
    // this.loadDC()
  }

  registerGlobalEventHandlers() {
    xbus.on('DRAW-FAULT-LAYER', () => {
      this.loadDC()
    })
  }

  getIpNum(ipAddress) {
    let ip = ipAddress.split(".")
    let a = parseInt(ip[0])
    let b = parseInt(ip[1])
    let c = parseInt(ip[2])
    let d = parseInt(ip[3])
    let ipNum = a * 256 * 256 * 256 + b * 256 * 256 + c * 256 + d
    return ipNum
  }

  isInner(userIp, begin, end) {
    return (userIp >= begin) && (userIp <= end)
  }

  judgeURL() {
    let userIP = xdata.userIP
    let reg = /(http|ftp|https|www):\/\//g //去掉前缀
    if (userIP) {
      userIP = userIP.replace(reg, '')
      let reg1 = /\:+/g //替换冒号为一点
      userIP = userIP.replace(reg1, '.')
      userIP = userIP.split('.')
      let ipAddress = `${userIP[0]}.${userIP[1]}.${userIP[2]}.${userIP[3]}`
      let ipNum = this.getIpNum(ipAddress)
      let ips = xdata.metaStore.data.ip_address && Array.from(xdata.metaStore.data.ip_address.values())
      ips = ips ? ips : []
      for (let i = 0; i < ips.length; i++) {
        let ip = ips[i]
        let begin = ip.ip_begin && this.getIpNum(ip.ip_begin)
        let end = ip.ip_end && this.getIpNum(ip.ip_end)
        let isInner = this.isInner(ipNum, begin, end)
        if (isInner) {
          this.isInnerIP = isInner
          break
        }
      }
    }
    return this.isInnerIP
  }

  dealMapUrl(url) {
    let dealUrl = url.split('/geoserver')[1]
    return `/geoserver${dealUrl}`
  }
  
  loadDC() {
    //配置对象
    let mapID = 5
    let map = xdata.mapStore.maps && xdata.mapStore.maps.get(7)
    let row = xdata.metaStore.data.map_gis && xdata.metaStore.data.map_gis.get(7)
    if (!map) return
    // 判断是否是内网IP
    // this.judgeURL()
    // let mapURL = map.tileWmsOpts.url
    // map.tileWmsOpts.url = this.isInnerIP && row ? row.inner_url : mapURL
    let mapURL = this.dealMapUrl(map.tileWmsOpts.url)
    map.tileWmsOpts.url = mapURL
    let mapDef = map
    if (!mapDef) {
      console.warn('NO map definition of the mapID : ', mapID)
      return
    }

    let chooseMap = xdata.mapStore.gisMap && xdata.mapStore.gisMap.get(mapID)
    let projExtent = ol.proj.get('EPSG:3857').getExtent()
    let startResolution = ol.extent.getWidth(projExtent) / 256
    let resolutions = new Array(22)

    for (var i = 0, len = resolutions.length; i < len; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i)
    }

    let extent = [2000, -1500, 12000, 4000] // 地图范围 默认高河地图范围
    if (row) {
      extent = [parseInt(row.minX), parseInt(row.minY), parseInt(row.maxX), parseInt(row.maxY)]
    } else if (chooseMap) {
      extent = [parseInt(chooseMap.minX), parseInt(chooseMap.minY), parseInt(chooseMap.maxX), parseInt(chooseMap.maxY)]
    }

    let tileGrid = new ol.tilegrid.TileGrid({
      extent: extent,
      resolutions: resolutions,
      tileSize: [512, 256]
    })

    let tileWmsOpts = mapDef.tileWmsOpts,
      wmsLayer
    tileWmsOpts.tileGrid = tileGrid
    let mapType = mapDef.type
    if (!mapDef.type) {
      let str = mapDef.tileWmsOpts.url
      mapType = mapDef.tileWmsOpts.url.includes('wms')
      mapType = mapType ? 'wms' : 'wmts'
    }

    chooseMap = {
      map_type: mapType
    }
    if (mapType === 'wmts') {
      chooseMap.url = tileWmsOpts.url
      chooseMap.layers = tileWmsOpts.params.LAYERS
      chooseMap.matrixId = DEAFULT_MAP_MATRIXID
    }

    if (chooseMap.map_type === 'wms') {
      this.wmsLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS(tileWmsOpts),
        zIndex: 20
      })
    } else if (chooseMap.map_type === 'wmts') {
      let matrixIds = [],
        resolution = []
      let startResolutions = ol.extent.getHeight(extent) / 256
      for (let i = 0; i <= spliceLevel; i++) {
        matrixIds[i] = chooseMap.matrixId + i
        resolution[i] = startResolutions / Math.pow(2, i)
      }
      let matrixSet = chooseMap.matrixId && chooseMap.matrixId.slice(0, chooseMap.matrixId.indexOf(':'))
      wmsLayer = new ol.layer.Tile({
        source: new ol.source.WMTS({
          url: chooseMap.url,
          layer: chooseMap.layers,
          tileGrid: new ol.tilegrid.WMTS({
            extent: extent,
            resolutions: resolution,
            matrixIds: matrixIds,
            tileSize: [256, 256]
          }),
          matrixSet: matrixSet,
          format: 'image/png',
          projection: 'EPSG:3857'
        })
      })
    } else {
      console.warn('unknow map type!')
    }
    this.map.addLayer(this.wmsLayer)
    this.wmsLayer.setVisible(false)
    xbus.on('MAP-SHOW-FAULT', (msg) => {
      if (msg.isVisible) {
        this.wmsLayer.setVisible(true)
      } else {
        this.wmsLayer.setVisible(false)
      }
    })
  }


}
