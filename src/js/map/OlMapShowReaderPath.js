import ol from 'openlayers'
import { composeUpdateDBReq } from '../utils/utils.js'
import { metaUpdateRes } from '../../config/utils.js'
export default class OlMapShowReaderPath {
    constructor(workspace) {
        this.workspace = workspace
        this.map = workspace.map
        this.draw = null
        this.snap = null // 地图鼠标吸附工具
        this.point = null // 存储点击的点坐标
        this.pathLayer = false // 是否处于编辑交点状态
        this.cmd = null

        this.initReaderLayer()
        // this.registerEventHandler()
        /**
         * @description: 点击实时界面左侧分站列表操作按钮 显示隐藏分站覆盖范围 
         */
        xbus.on('MAP-SHOW-READERPATH', (msg) => {
            this.showHidePaths(msg)
        })

        xbus.on('MAP-DRAW-POINT', msg => {
            const {status, name} = msg
            if (status) {
                if (!this.pathLayer) {
                    this.showHidePaths({checked: status})
                    this.showPoints()
                }
                if (name === 'edit_point' && !this.draw) {
                    this.addInteraction()
                    this.obtainDrawend()
                } else {
                    this.removeInteraction()
                    this.registerEventHandler()
                }
                this.pathLayer = true
            } else if (!status) {
                if (name === 'edit_point') {
                    this.showHidePaths({checked: status})
                    this.removeInteraction()
                    this.pathLayer = false
                } else if (this.pathLayer) {
                    this.addInteraction()
                    this.obtainDrawend()
                }
            }
        })

        xbus.on('META-UPDATE-DB-RES', res => {
            if (res.data.name === 'intersection_point') {
                metaUpdateRes(res, 'intersection_point', this.cmd)
                if (res.code === 0) {
                    this.cmd === 'INSERT' ? this.drawPoint(this.point) : this.deletePoint(this.point)
                }
            }
        })
    }

    registerEventHandler () {
        if (!this.map) return

        this.map.addEventListener('click', evt => {
            let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
            if (feature && feature.getProperties().type === 'intersection_point') {
                const {point} = feature.getProperties()
                this.point = point
                this.cmd = 'DELETE'
                let sql = `DELETE FROM dat_intersection_point where point = '${point}'`
                const req = composeUpdateDBReq(this.cmd, 'intersection_point', 1, sql)
                xbus.trigger('META-UPDATE-DB', {
                    req: req
                })
            }
        })
    }

    obtainDrawend () {
        if (typeof this.draw === 'string') return
        this.draw.on('drawend', evt => {
            const coordinates = evt.feature.getGeometry().getCoordinates()
            const px = coordinates[0]
            const py = -coordinates[1]
            const readerPaths = xdata.metaStore.data.reader_path_tof_n && Array.from(xdata.metaStore.data.reader_path_tof_n.values())
            // let paths = []
            // let slopeArr = [] // 斜率
            const paths = readerPaths.filter(path => {
                const { b_x, b_y, e_x, e_y } = path
                const olineLength = Math.sqrt(Math.pow((e_x - b_x), 2) + Math.pow((e_y - b_y), 2))
                const clineLength = Math.sqrt(Math.pow((px - e_x), 2) + Math.pow((py - e_y), 2)) + Math.sqrt(Math.pow((b_x - px), 2) + Math.pow((b_y - py), 2))
                
                if (Math.abs(olineLength - clineLength) <= 0.03) {
                    return true
                    // let slope = null
                    // if (b_x === e_x) {
                    //     slope = 1
                    // } else {
                    //     slope = (e_y - b_y) / (e_x - b_x)
                    // }
                    // if (!slopeArr.includes(slope)) {
                    //     paths.push(path)
                    //     slopeArr.push(slope)
                    // }
                }
            })
            if (paths.length >= 2) {
                const point = `${px.toFixed(1)},${py.toFixed(1)}`
                this.point = point
                this.cmd = 'INSERT'
                const sql = `REPLACE INTO dat_intersection_point (point) VALUES('${point}')`
                const req = composeUpdateDBReq(this.cmd, 'intersection_point', 1, sql)
                xbus.trigger('META-UPDATE-DB', {
                    req: req
                })
            }
        })
    }

    deletePoint (msg) {
        const features = this.layerSource.getFeatures()
        const feature = features.filter(feature => {
            const properties = feature.getProperties()
            const { type, point } = properties
            if (type === 'intersection_point' && point === msg) return true
            return false
        })
        feature[0] && this.layerSource.removeFeature(feature[0])
    }

    drawPoint (msg) {
        let point = msg.split(',')
        let feature = new ol.Feature(new ol.geom.Point([Number(point[0]), -Number(point[1])]))
        feature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({  
                color: 'rgba(255, 255, 255, 0.2)'  
            }),  
            stroke: new ol.style.Stroke({  
                color: '#ff00b1',  
                width: 2  
            }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                  color: '#ff00b1'
                })
            })
        }))
        feature.setProperties({
            point: msg,
            type: 'intersection_point'
        })
        this.layerSource.addFeature(feature)
    }

    removeInteraction () {
        this.map.removeInteraction(this.draw)
        this.map.removeInteraction(this.snap)
        this.draw = null
        this.snap = null
    }

    addInteraction () {
        const source = this.layerSource
        this.draw = new ol.interaction.Draw({
            source: source,
            type: 'Point',
            style: new ol.style.Style({
                fill: new ol.style.Fill({  
                    color: 'rgba(255, 255, 255, 0.2)'  
                }),  
                stroke: new ol.style.Stroke({  
                    color: '#ffcc33',  
                    width: 2  
                }),
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({
                      color: '#ffcc33'
                    })
                })
            })
        })
        this.map.addInteraction(this.draw)

        this.snap = new ol.interaction.Snap({
            source: source,
            pixelTolerance: 20
        })
        this.map.addInteraction(this.snap)
    }

    initReaderLayer() {
        this.layerSource = new ol.source.Vector()
        this.readerLayer = new ol.layer.Vector({
            source: this.layerSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 3
                })
            })
        })
        this.map.addLayer(this.readerLayer)
    }

    showPoints () {
        const self = this
        const points = xdata.metaStore.data.intersection_point && Array.from(xdata.metaStore.data.intersection_point.values())
        points && points.forEach(item => {
            const {point} = item
            self.drawPoint(point)
        })
    }

    showHidePaths (msg) {
        let readerPaths = xdata.metaStore.data.reader_path_tof_n && Array.from(xdata.metaStore.data.reader_path_tof_n.values())
        let value = Number(msg.name) //分站id
        const readerPathResult = value ? readerPaths.filter(item => item.reader_id === value) : readerPaths
        if (msg.checked) {
            readerPathResult.forEach(path => {
                const pathArray = this.getPathArrayWithoutName(path)
                this.drawOLLine(this.layerSource, pathArray, path)
            })
        } else {
            if (!msg.name) return this.layerSource.clear()
            // 获取图层所有feature  分站覆盖范围有id属性 判断筛选有无id属性 有则是分站覆盖范围feature 
            const features = this.layerSource.getFeatures()
            for (let i = 0; i < features.length; i++) {
                const feature = features[i]
                const properties = feature.getProperties()
                const {readerID} = properties 
                if (readerID === value) {
                    this.layerSource.removeFeature(feature)
                }
            }
        }
    }

    drawOLLine(layerSource, _point, path) {
        const {id, reader_id} = path
        let point = _point
        let linestring = new ol.geom.LineString(point) // 坐标数组

        var lineFeature = new ol.Feature({
            geometry: linestring,
            id: id,
            finished: false
        })

        lineFeature.setId(id)
        lineFeature.setProperties({readerID: reader_id, type: 'reader_path'})

        layerSource.addFeature(lineFeature)
        return { lineFeature: lineFeature, lineLength: linestring.getLength() }
    }

    getPathArrayWithoutName (path) {
        const pathArray = []
        const {b_x, b_y, e_x, e_y} = path
        pathArray.push([b_x, -Number(b_y)])
        pathArray.push([e_x, -Number(e_y)])
        return pathArray
    }
}