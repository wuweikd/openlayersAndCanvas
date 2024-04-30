import React, {useEffect, useState} from "react";
import {useUpdatePanel} from "./core";
import styled from "styled-components";
import socketIo from 'socket.io-client'
// import

const Canvas = styled.canvas`
`

const defaultData = {
    direction: 127, // 航向,范围为0-360
    roll: 30, // 横滚，范围为-30-30
    elevation: -10 // 仰角，范围-20-20
}

const Panel = () => {
    const [data, setData] = React.useState(defaultData);
    const [control, setControl] = React.useState({direction: true, roll: true, elevation: true})
    const [wsData, setWSData] = React.useState(defaultData)
    const [useWs, setUseWs] = useState(false)

    const [panelRef] = useUpdatePanel(useWs?wsData:data)

    function initWs() {
        let ws = new WebSocket('ws://127.0.0.1:7001/ws')
        // 连接成功后的回调函数
        ws.onopen = function (params) {
            console.log('客户端连接成功')
            // 向服务器发送消息
            ws.send('getData')
        };

        // 从服务器接受到信息时的回调函数
        ws.onmessage = function (e) {
            try {
                console.log('接受到的接口数据1', e.data)
                let d = JSON.parse(e.data)
                const {direction, roll, elevation} = d
                // console.log('接受到的接口数据2', {direction, roll, elevation} )

                if (!(direction>=0 && direction<=360) || !(roll>=-30 && roll<=30) || !(elevation>=-20 && elevation<=20)) {
                    console.log('后端接口服务数据不符合规范', !(direction>=0 && direction<=360) , !(roll>=-30 && roll<=30), !(elevation>=-20 && elevation<=20))
                    throw new Error('后端接口服务数据不符合规范')
                }
                setWSData({direction, roll, elevation})
            } catch (e) {
                // 处理异常
                throw new Error('后端接口服务数据异常', e)
            }
            // console.log('收到服务器响应', e.data)
        };

        // 连接关闭后的回调函数
        ws.onclose = function (evt) {
            console.log("关闭客户端连接");
        };
    }


    useEffect(() => {

        let directionFlag = false
        let rollFlag = false
        let elevationFlag = false

        let interval = setInterval(() => {

            setData(({direction, roll, elevation}) => {
                if (directionFlag && direction >= 360) {
                    directionFlag = false
                } else if (!directionFlag && direction <= 0) {
                    directionFlag = true
                }
                if (rollFlag && roll >= 30) {
                    rollFlag = false
                } else if (!rollFlag && roll <= -30) {
                    rollFlag = true
                }
                if (elevationFlag && elevation >= 20) {
                    elevationFlag = false
                } else if (!elevationFlag && elevation <= -20) {
                    elevationFlag = true
                }

                return {
                    direction: control.direction ? direction + (directionFlag ? 1 : -1) : direction,
                    roll: control.roll ? roll + (rollFlag ? 1 : -1) : roll,
                    elevation: control.elevation ? elevation + (elevationFlag ? 1 : -1) : elevation,
                }
            })
        }, 100)

        return () => clearInterval(interval)
    }, []);

    useEffect(() => {
        initWs()
    }, []);


    return <div>
        <h1>姿态仪</h1>
        <div>
            {/*<button onClick={initWs}>连接websocket</button>*/}
            <button onClick={() => setUseWs(ws => !ws)}>{useWs ? '使用本地数据' : '使用websocket数据'}</button>
            <div>websocket 数据：{JSON.stringify(wsData)}</div>
        </div>
        <br/>
        <div style={{display: 'flex'}}>
            <div style={{margin: '0 20px'}}>旋转：
                <input type="number" value={data.roll} style={{width: '60px'}}
                       onInput={(e) => {
                           setData(Object.assign(data, {roll: +e.target.value}))
                       }}
                />°
                <button onClick={() => setControl(Object.assign(control, {roll: !control.roll}))}>
                    {control.roll ? '暂停' : '开始'}
                </button>
            </div>
            <div style={{margin: '0 20px'}}>方向：
                <input type="number" value={data.direction} style={{width: '60px'}}
                       onInput={(e) => {
                           setData(Object.assign(data, {direction: +e.target.value}))
                       }}
                />°
                <button onClick={() => setControl(Object.assign(control, {direction: !control.direction}))}>
                    {control.direction ? '暂停' : '开始'}
                </button>
            </div>
            <div style={{margin: '0 20px'}}>俯仰：
                <input type="number" value={data.elevation} style={{width: '60px'}}
                       onInput={(e) => {
                           setData(Object.assign(data, {elevation: +e.target.value}))
                       }}
                />°
                <button onClick={() => setControl(Object.assign(control, {elevation: !control.elevation}))}>
                    {control.elevation ? '暂停' : '开始'}
                </button>
            </div>
        </div>
        <Canvas ref={panelRef} height={300} width={300}></Canvas>
    </div>
}

export default Panel
