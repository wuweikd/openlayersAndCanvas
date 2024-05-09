import styled from "styled-components";
import {memo, useMemo} from "react";


const Mask = styled.div`
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    width: 100px;
    height: 50px;
    //text-align: center;
    color: white;
    font-size: 12px;
`

const ShowTip = ({pos}) => {
    if (pos[0] < 10 || pos[1] < 50 || pos[1] > 400) {
        return
    }

    return <Mask style={{left: pos[0] + 10, top: pos[1] - 50}}>
        <div>
            高:{pos[0]}
        </div>
        <div>
            宽:{pos[1]}
        </div>
        <div>
            <div>{new Date().getTime()}</div>
        </div>
    </Mask>
}

// 缓存子组件，避免重新绘制
export default memo(
    ShowTip,
    (p, n) => {
        return p.pos[0] === n.pos[0] && p.pos[1] === n.pos[1]
    }
)
