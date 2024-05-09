import React, {useEffect, useRef, useState} from "react";
import {useUpdatePanel} from "./core";
import styled from "styled-components";

const Canvas = styled.canvas`
`

const defaultData = {
    direction: 127, // 航向,范围为0-360
    roll: 30, // 横滚，范围为-30-30
    elevation: -10 // 仰角，范围-20-20
}
const defautControl = {direction: true, roll: true, elevation: true}

// 错误重连次数
const MAX_RETRY_TIME = 3

const Panel = () => {
    const [data, setData] = useState(defaultData);
    const [control, setControl] = useState(defautControl)
    const controlRef = React.useRef(defautControl);
    const [wsData, setWSData] = useState(defaultData)
    const [useWs, setUseWs] = useState(false)

    const {panelRef} = useUpdatePanel(useWs?wsData:data)
    const retryTimeRef = useRef(0) // 错误重连次数

    function initWs() {
        if(retryTimeRef.current >= MAX_RETRY_TIME) {
            console.error('错误重连次数达到上限', MAX_RETRY_TIME)
            return
        }
        let ws = new WebSocket('ws://127.0.0.1:7001/ws')
        // 连接成功后的回调函数
        ws.onopen = function (params) {
            console.log('客户端连接成功')
            retryTimeRef.current = 0
            // 向服务器发送消息
            ws.send('getData')
        };

        // 从服务器接受到信息时的回调函数
        ws.onmessage = function (e) {
            try {
                console.log('接受到的接口数据1', e.data)
                let d = JSON.parse(e.data)
                let {direction, roll, elevation} = d
                // console.log('接受到的接口数据2', {direction, roll, elevation} )

                if (!(direction>=0 && direction<=360)) {
                    direction = 0
                    console.error('后端接口服务数据不符合规范',)
                }
                if (!(roll>=-30 && roll<=30)) {
                    roll= 0
                    console.error('后端接口服务数据不符合规范')
                }
                if (!(elevation>=-20 && elevation<=20)) {
                    elevation= 0
                    console.error('后端接口服务数据不符合规范')
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
            // 需判断链接关闭的类型
            retryTimeRef.current = retryTimeRef.current + 1
            if(retryTimeRef.current < MAX_RETRY_TIME) {
                initWs()
            }
        };
    }

    // 监听输入的参数
    const onInputData = (e, type) => {
        setData(pre => {
            return {...pre, [type]: +e.target.value}
        })
    }

    // 控制暂停参数
    const onClickControl = (type) => {
        setControl(pre => {
            return {...pre, [type]: !pre[type]}
        })
        controlRef.current =  {...controlRef.current, [type]: !controlRef.current[type]}
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
                    direction: controlRef.current.direction ? direction + (directionFlag ? 1 : -1) : direction,
                    roll: controlRef.current.roll ? roll + (rollFlag ? 1 : -1) : roll,
                    elevation: controlRef.current.elevation ? elevation + (elevationFlag ? 1 : -1) : elevation,
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
                       onInput={(e) =>  onInputData(e, 'roll')}
                />°
                <button onClick={() => onClickControl('roll')}>
                    {control.roll ? '暂停' : '开始'}
                </button>
            </div>
            <div style={{margin: '0 20px'}}>方向：
                <input type="number" value={data.direction} style={{width: '60px'}}
                       onInput={(e) =>  onInputData(e, 'direction')}
                />°
                <button onClick={() => onClickControl('direction')}>
                    {control.direction ? '暂停' : '开始'}
                </button>
            </div>
            <div style={{margin: '0 20px'}}>俯仰：
                <input type="number" value={data.elevation} style={{width: '60px'}}
                       onInput={(e) =>  onInputData(e, 'elevation')}
                />°
                <button onClick={() => onClickControl('elevation')}>
                    {control.elevation ? '暂停' : '开始'}
                </button>
            </div>
        </div>
        <Canvas ref={panelRef} height={300} width={300}></Canvas>
    </div>
}

export default Panel
