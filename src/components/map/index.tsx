import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Vector as VectorSource, XYZ} from 'ol/source.js';
import {useEffect, useMemo, useRef, useState} from "react";
import {Draw, Translate} from "ol/interaction";
import {Style, Fill, Stroke, Circle, Text, Circle as CircleStyle, Image, Icon} from "ol/style";
import {Feature, Overlay} from "ol";
import {LineString, Point} from "ol/geom";
import {transform} from "ol/proj";
// @ts-ignore
import ShowTip from "./showTip.tsx";
import styled from "styled-components";

// 地图圆心
const demoGempmetryData = [
    [
        113.63822189978862,
        23.139600974377615
    ]
]

enum ENodeType {
    start = '开始节点',
    middle = '中间节点',
    end = '结束节点',
}

const MaskParent = styled.div`
    position: absolute;
    width: 100%;
    height: 400px;
    //background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    pointer-events: none;
`
const MaskContent = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
`


const MapIndex = () => {
    let mapRef = useRef<Map>(null)
    const olPopupRef = useRef()
    const [nodeType, setNodeType] = useState<ENodeType>(ENodeType.start)
    const nodeTypeRef = useRef<ENodeType>(ENodeType.start)
    const nodeMapRef = useRef({})
    const chosedNode = useRef(null)
    const vectorSourceRef = useRef<VectorSource>(null)
    const vectorLayerPointRef = useRef<VectorLayer<any>>(null) as any
    const vectorLayerPointTransLateRef = useRef<VectorLayer<any>>(null) as any
    const translateRef = useRef(null)
    const vectorLayerLineRef = useRef<VectorLayer<any>>(null) as any
    const pointFeatureRef = useRef<Feature>(null) as any
    const drawPointRef = useRef<Draw>(null) as any
    const [tipMap, steTipMap] = useState({})
    const [showTip, setShowTip] = useState(true)

    const createPointStyle = useMemo(() => {
        return new Style({
            image: new CircleStyle({
                radius: 12,
                fill: new Fill({color: 'rgb(62, 254,194)'}),
                stroke: new Stroke({color: 'black', width: 1})
            }),
            text: new Text({
                text: '1', // 将编号转为字符串以便显示
                scale: 1.5,
                fill: new Fill({color: '#000'}),
            })
        });
    }, [])
    const getNewStyle = (num) => {
        return new Style({
            image: new CircleStyle({
                radius: 12,
                fill: new Fill({color: 'rgb(62, 254,194)'}),
                stroke: new Stroke({color: 'black', width: 1})
            }),
            text: new Text({
                text: num + '', // 将编号转为字符串以便显示
                scale: 1.5,
                fill: new Fill({color: '#000'}),
            })
        });
    }


    const deleteNode = () => {
        delete nodeMapRef.current[chosedNode.current]
        reDrawPoint()
        drawLine()
        setDiv()
    }

    const lineStyle = useMemo(() => {
        return new Style({
            stroke: new Stroke({
                color: "rgb(62, 254,194)",
                width: 6,
                lineCap: "butt"
            }),
        });
    }, [])

    const lineStyle2 = useMemo(() => {
        return new Style({
            stroke: new Stroke({
                color: "black",
                width: 6,
                lineDash: [15, 15],
                lineCap: "butt"
            }),
        });
    }, [])

    function getMap() {
        if (mapRef.current) {
            return mapRef.current
        }
        let vectorSource = new VectorSource()
        vectorSourceRef.current = vectorSource

        const map = new Map({
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    }),
                }),
                // vectorLayer
            ],
            target: 'map',
            view: new View({
                center: transform(demoGempmetryData[0], 'EPSG:4326', 'EPSG:3857'), //地图初始中心点
                projection: 'EPSG:3857',
                zoom: 13,
            }),
        });
        map.on('click', e => {
            console.log('click', e);
        })


        mapRef.current = map
        return mapRef.current
    }

    // 圆点添加可操作手势
    function addTransLatePoint() {
        // return
        let map = getMap()
        vectorLayerPointTransLateRef.current && map.removeLayer(vectorLayerPointTransLateRef.current)
        translateRef.current && map.removeInteraction(translateRef.current)
        // 矢量图层
        let vectorLayerPointTransLate = new VectorLayer({
            source: vectorSourceRef.current,
            style: createPointStyle,
            zIndex: 10
        })

        let translate = new Translate({
            layers: [vectorLayerPointTransLate]
        })
        translateRef.current = translate
        map.addInteraction(translate)
        translate.on('translateend', e => {
            let key = e.features.getArray()[0].get('key')
            const co = transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
            nodeMapRef.current[key] = co
            drawLine()
            setDiv()
        })
        translate.on('translatestart', e => {
            let features = vectorSourceRef.current.getFeatures()
            features.forEach(item => {
                let styleItem = item.getStyle() as Style
                let imageItem = styleItem.getImage().clone() as CircleStyle
                imageItem.getFill().setColor('rgb(62, 254,194)')
                styleItem.setImage(imageItem)
                item.setStyle(styleItem)
            })


            const style = e.features.getArray()[0].getStyle() as Style
            let image = style.getImage().clone() as CircleStyle
            image.getFill().setColor('rgb(25,134,253)')
            style.setImage(image)

            e.features.getArray()[0].setStyle(style)
            chosedNode.current = e.features.getArray()[0].get('key')
        })
        translate.on('translating', e => {
            let key = e.features.getArray()[0].get('key')
            const co = transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
            nodeMapRef.current[key] = co
            drawLine()
            setDiv()
        })
        map.addLayer(vectorLayerPointTransLate)


        vectorLayerPointTransLateRef.current = vectorLayerPointTransLate
    }

    // 增加绘制圆点点击事件
    function addDrawPoint() {
        let map = getMap()
        drawPointRef.current && map.removeInteraction(drawPointRef.current)
        let draw = new Draw({
            source: vectorSourceRef.current,
            type: 'Point',
        })

        draw.on('drawend', e => {

            let key = ''
            if (nodeTypeRef.current === ENodeType.start) {
                let str = '起'
                key = str
                // 删除旧的起点
                let old = vectorSourceRef.current.getFeatureById(key)
                old && vectorSourceRef.current.removeFeature(old)
                // 设置新的起点
                e.feature.setStyle(getNewStyle(str))
                e.feature.set('key', str)
                e.feature.setId(key)
            } else if (nodeTypeRef.current === ENodeType.end) {
                let str = '降'
                key = str
                // 删除旧的降点
                let old = vectorSourceRef.current.getFeatureById(key)
                old && vectorSourceRef.current.removeFeature(old)
                // 设置新的降点
                e.feature.setStyle(getNewStyle(str))
                e.feature.set('key', str)
                e.feature.setId(key)
            } else {
                let list = Object.keys(nodeMapRef.current)
                // 直接添加中间节点
                let len = list.length
                let str = len + (list.find(i => i === '起') ? 0 : 1) + (list.find(i => i === '降') ? -1 : 0)
                e.feature.setStyle(getNewStyle(str))

                key = '' + new Date().getTime()
                e.feature.set('key', key)
                e.feature.setId(key)
            }

            const co = transform(e.feature.get('geometry').getCoordinates(), 'EPSG:3857', 'EPSG:4326')
            nodeMapRef.current[key] = co
            drawLine()
            setDiv()
        })

        map.addInteraction(draw)

        drawPointRef.current = draw
    }

    // 重绘圆点
    function reDrawPoint() {
        if (!nodeMapRef.current || !Object.keys(nodeMapRef.current).length) {
            return
        }
        const map = getMap()
        vectorSourceRef.current.clear()
        map.removeLayer(vectorLayerPointRef.current)

        let orderListkey = Object.keys(nodeMapRef.current).sort((a, b) => {
            let v1 = a === '起' ? 0 : a === '降' ? Number.MAX_SAFE_INTEGER : +a
            let v2 = b === '起' ? 0 : b === '降' ? Number.MAX_SAFE_INTEGER : +b
            return v1 - v2
        })

        let features = orderListkey.map((corrdKey, index) => {
            const corrd = nodeMapRef.current[corrdKey]
            const point = new Point(corrd).transform('EPSG:4326', 'EPSG:3857')
            const feature = new Feature({
                geometry: point
            })

            let str = index + (orderListkey.find(i => i === '起') ? 0 : 1)

            feature.setStyle(getNewStyle(corrdKey === '起' ? '起' : corrdKey === '降' ? '降' : str))
            feature.set('key', corrdKey)
            feature.setId(corrdKey)
            return feature
        })

        let vectorSource = new VectorSource()
        vectorSource.addFeatures(features)

        const vectorLayerPoint = new VectorLayer({
            source: vectorSource,
            zIndex: 10
        })

        vectorLayerPointRef.current = vectorLayerPoint
        pointFeatureRef.current = features
        vectorSourceRef.current = vectorSource

        getMap().addLayer(vectorLayerPoint)
        addDrawPoint()
        addTransLatePoint()
    }

    // 绘制航线
    function drawLine() {
        if (!nodeMapRef.current || Object.keys(nodeMapRef.current).length < 1) {
            return
        }
        getMap().removeLayer(vectorLayerLineRef.current)


        let keys = Object.keys(nodeMapRef.current).sort((a, b) => {
            let v1 = a === '起' ? 0 : a === '降' ? Number.MAX_SAFE_INTEGER : +a
            let v2 = b === '起' ? 0 : b === '降' ? Number.MAX_SAFE_INTEGER : +b
            return v1 - v2
        })
        const orderList = keys.map(key => nodeMapRef.current[key])
        const lineString = new LineString(orderList).transform('EPSG:4326', 'EPSG:3857');
        // 创建矢量要素，并设置其几何体为上面定义的 lineString
        const feature = new Feature({
            geometry: lineString
        })
        // 初始化向量源，并加入刚刚创建好的 feature
        const vectorSource = new VectorSource({
            features: [feature]
        })

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: [lineStyle, lineStyle2], // 应用style
            zIndex: 8
        })
        getMap().addLayer(vectorLayer)
        vectorLayerLineRef.current = vectorLayer
    }

    // 切换选择的节点
    function clickNodeType(type: ENodeType) {
        setNodeType(type)
        nodeTypeRef.current = type
    }

    // 一次性添加大量的节点
    function addManyNode(number) {
        const defaultNode = demoGempmetryData[0]
        let nodeList = []
        let i = 0
        nodeMapRef.current = {}
        let time = new Date().getTime()
        while (i < number) {
            i++
            nodeMapRef.current[i] = [defaultNode[0] - i * 0.001, defaultNode[1] - i * 0.001]
        }
        reDrawPoint()
        drawLine()
        setDiv()
        setTimeout(() => {
            console.log('绘制完所有节点耗时', new Date().getTime() - time)
        }, 0)
    }

    // 新建div，显示坐标的信息
    function setDiv() {
        if (!mapRef.current) {
            return
        }
        console.log('绘制tip')
        let nodeMap = nodeMapRef.current
        let tipMap = {}
        Object.keys(nodeMap).forEach(key => {
            let co = nodeMap[key]
            co = transform(nodeMap[key], 'EPSG:4326', 'EPSG:3857',)
            let pos = mapRef.current.getPixelFromCoordinate(co).map(i => Math.round(i))
            tipMap[key] = pos
        })
        steTipMap(tipMap)
    }

    useEffect(() => {
        let map = getMap()
        let onMoveend = map.on("moveend",function(e){
            setShowTip(true)
            setDiv() // 重新绘制tip
        });
        let onMovestart = map.on("movestart",function(e){
            setShowTip(false)
        });

        return () => {
            map.un('moveend', onMoveend.listener)
            map.un('movestart', onMovestart.listener)
        }
    }, []);

    useEffect(() => {
        getMap()
        addTransLatePoint()
        addDrawPoint()
    }, [])


    return (<div>
        <h1>Map</h1>
        <button onClick={() => addManyNode(50)}>测试一次性绘制50个节点</button>
        <button onClick={() => addManyNode(500)}>测试一次性绘制500个节点</button>
        <button onClick={() => addManyNode(5000)}>测试一次性绘制5000个节点</button>
        <button onClick={() => addManyNode(1)}>测试一次性绘制1个节点</button>
        <div>
            <h3>当前选择绘制的节点：<span style={{color: 'red'}}>{nodeType}</span></h3>
            <button onClick={() => clickNodeType(ENodeType.start)}>设置开始节点</button>
            <button onClick={() => clickNodeType(ENodeType.middle)}>添加中间节点</button>
            <button onClick={() => clickNodeType(ENodeType.end)}>设置结束节点</button>
            <button onClick={() => deleteNode()}>删除当前选择的节点</button>
        </div>

        <div style={{display: showTip ? 'block' : 'none'}}>
            <MaskParent>
                {
                    <MaskContent>
                        {
                            Object.keys(tipMap).map(key => (
                                <div key={key}>
                                    <ShowTip pos={tipMap[key]}></ShowTip>
                                </div>
                            ))
                        }
                    </MaskContent>
                }
            </MaskParent>
        </div>
        <div>当前时间：{new Date().getTime()}</div>
        <div id="map" className="map" style={{width: '100%', height: '400px'}}></div>
        <br/>
    </div>)
}


export default MapIndex
