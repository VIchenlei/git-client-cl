import OlMapWorkLayer from './OlMapWorkLayer.js'
import {initgasLayer, updateTextData} from './OlMapPublic.js'
import {gasDef} from '../def/gas_pos_def.js'
import {drawSymbol} from './OlMapUtils.js'
import ol from 'openlayers'
import { testMapID } from '../utils/utils.js'

const sensor_def = {
  name: 'sensor',
  label: '模块',
  table: '',
  keyIndex: 0,
  fields: {
    names: ['dev_pos_module_id', 'sensor_id', 'card_id', 'module_desc'],
    types: ['NUMBER', 'SELECT', 'SELECT', 'STRING'],
    labels: ['模块ID', '传感器', '标识卡号', '描述']
  }
}


export default class OlMapGasLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)

    this.map = workspace.map
    this.mapID = workspace.mapID
    this.sensorAlarm = new Map()
    this.groups = new Map()
    this.modules = new Map()

    this.initLayers()
    this.registerGlobalEventHandlers()
  }

  initLayers () {
    this.sensorLayerSource = new ol.source.Vector()
    this.sensorLayer = new ol.layer.Vector({
      source: this.sensorLayerSource,
      zIndex: 6
    })
    this.map.addLayer(this.sensorLayer)
  }

  registerGlobalEventHandlers () {
    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
      if (feature && feature.getProperties()['data-subtype'] === 'sensor') {
        this.showTips(evt, feature)
      }
    })

    xbus.on('MAP-SHOW-GAS', (msg) => {
      let mapId = xdata.metaStore.defaultMapID
      if(msg.mapID !== mapId) return
      if (msg.mapType === this.mapType) {
        if (msg.isVisible) {
          this.layerVisible = true
          let returnData = initgasLayer(this.map, gasDef, 'rgba(255, 255, 0, 1)')
          this.source = returnData.vectorSource
          this.vectorLayer = returnData.vectorLayer
        } else {
          this.layerVisible = false
          this.vectorLayer.setVisible(false)
        }
      }
    })

    xbus.on('ENVIRONMENTAL-DATA-UPDATE', () => {
      if (this.layerVisible) { // 图层可见时更新数据
        updateTextData(gasDef, this.source)
      }
    })

    xbus.on('SENSOR-POS-UPDATE', data => {
      // console.log(data)
      // this.storeModule(data)
      const {values} = data
      let doDraw = true
      for (let i = 0; i < values.length; i++) {
        const item = values[i]
        const {value} = item
        if (value < 0) {
          doDraw = false
          break
        }
      }
      doDraw && this.drawSensor(data)
    })

    xbus.on('MAP-UPDATE-SENSOR-STATE', msg => {
      if (testMapID(msg.map_id, this.mapID) && this.mapType === 'MONITOR') {
        this.updateStateColor(msg)
      }
    })
  }

  storeModule (data) {
    const {dev_pos_module_id, values} = data
    const module = this.modules.get(dev_pos_module_id)
    if (module) {
      const [value] = values
      const {direction} = value

      const curDirection = module.find(item => item.direction === direction)
      if (curDirection) {
        curDirection.value = value.value
      } else {
        module.push(value)
      }
      this.modules.set(dev_pos_module_id, module)
    } else {
      this.modules.set(dev_pos_module_id, values)
    }
  }

  updateStateColor (msg) {
    const {id, state} = msg
    const key = `sensor_${id}`

    state === 0 ? this.sensorAlarm.delete(key) : this.sensorAlarm.set(key, state)

    const group = this.groups.get(key)
    if (group) {
      const {x, y, values} = group
      const feature = this.sensorLayerSource.getFeatureById(key)
      this.sensorLayerSource.removeFeature(feature)

      this.drawSensorOn({dev_pos_module_id: id, x, y, values, state})
    }
  }

  drawSensorOn ({dev_pos_module_id, x, y, values, state}) {
    const key = `sensor_${dev_pos_module_id}`
    // const moduleValues = this.modules.get(dev_pos_module_id)

    const attrs = {
      id: dev_pos_module_id,
      x: x,
      y: y,
      'data-type': 'sensor',
      'data-subtype': 'sensor',
      'data-id': key,
      values: values,
      state: state
    }

    this.groups.set(`sensor_${dev_pos_module_id}`, attrs)

    return drawSymbol(attrs, this.sensorLayerSource, this.map)
  }

  drawSensor (data) {
    let {dev_pos_module_id, x, y, values} = data
    const key = `sensor_${dev_pos_module_id}`
    const feature = this.sensorLayerSource.getFeatureById(key)
    const sensorAlarm = this.sensorAlarm.get(key)
    const currentState = sensorAlarm || 0

    // TODO: 坐标前端写死
    x = 3087
    y = -11

    if (feature) {
      const properties = feature.getProperties()
      const {state} = properties

      if (state !== currentState) {
        this.sensorLayerSource.removeFeature(feature)
        this.drawSensorOn({dev_pos_module_id, x, y, values, state: currentState})
      } else {
        const pos = [x, -y]
        const geom = new ol.geom.Point(pos)
        feature.setGeometry(geom)
        feature.getProperties().values = values
      }
    } else {
      this.drawSensorOn({dev_pos_module_id, x, y, values, state: currentState})
    }

    // const module = this.modules.get(dev_pos_module_id)
    // data.values = module || values
    xbus.trigger('MAP-UPDATE-SENSOR', data)
  }

  showTips (evt, feature) {
    const attrs = feature.getProperties()
    const coord = feature.getGeometry().getCoordinates()

    const [x, y] = coord

    const {id, values} = attrs

    const deviceInfoDef = xdata.metaStore.defs['dev_pos_module']
    const deviceInfo = xdata.metaStore.data['dev_pos_module'].get(parseInt(id, 10))
    const formatedInfo = xdata.metaStore.formatRecord(deviceInfoDef, deviceInfo, null)

    const modules = xdata.metaStore.data.dev_pos_module
    const module = modules && modules.get(id)
    const {sensor_id, card_id, module_desc} = module || {}
    const sensors = xdata.metaStore.data.sensor
    const sensor = sensors && sensors.get(sensor_id)
    const sensorDesc = sensor ? sensor.sensor_desc : sensor_id

    const state = {
      dev_pos_module_id: id,
      sensor_id: sensorDesc,
      card_id,
      module_desc,
      values,
      x: 3087,
      y: 11,
      state: this.sensorAlarm.get(`sensor_${id}`) || 0
    }

    let msg = {
      id: id,
      cardtype: 'sensor',
      event: evt,
      // 以下数据，直接放到 tooltips 中处理，当需要使用时才获取
      state: { // 当前状态
        def: sensor_def,
        rec: state
      },
      info: {
        def: deviceInfoDef,
        rec: formatedInfo
      },
      curTitleType: this.mapType
    }

    window.cardtips.show(msg)
  }
}
