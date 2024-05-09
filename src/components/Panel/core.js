import React, {useCallback, useEffect} from "react";

// 工具方法：绘制多面体，带圆角的
function drawRect(p, radius, ctx) {
    ctx.beginPath();
    const startPoint = [
        (p[0][0] + p[p.length - 1][0]) / 2,
        (p[0][1] + p[p.length - 1][1]) / 2,
    ];
    ctx.moveTo(...startPoint);
    for (let i = 0; i < p.length; i++) {
        if (i === p.length - 1) {
            ctx.arcTo(...p[p.length - 1], ...p[0], radius);
        } else {
            ctx.arcTo(...p[i], ...p[i + 1], radius);
        }
    }
    ctx.closePath();
    ctx.fill()
    ctx.stroke();
}

const radius = 100 // 圆的半径
const radiusInCircle = 80 // 内圆半径
const dot = {x: 150, y: 150}


// 绘制灰色外圆环
function drawRound(ctx) {
    // 内圆
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radiusInCircle + 20, 0, Math.PI * 2);
    ctx.lineWidth = 40;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // 圆环
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, Math.PI * 3 / 4, Math.PI / 4);
    ctx.lineWidth = 25;
    ctx.strokeStyle = '#E8ECF0';
    ctx.stroke();
}

// 绘制方向
function drawOutDirection(ctx) {
    ctx.save()
    ctx.translate(dot.x, dot.y - radius - 26)
    ctx.fillStyle = 'red'
    drawRect([[0, -10], [-5, 0], [5, 0]], 0.5, ctx)
    ctx.restore()
}


// 绘制白色圆环，用于遮挡刻度
function drawRoundWhit(ctx) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, Math.PI / 4 - 0.01, Math.PI * 3 / 4 + 0.01); // 多处理0.01是为了遮挡中间黑色的刻度
    ctx.lineWidth = 25;
    ctx.strokeStyle = 'white';
    ctx.stroke();
}


// 绘制文字
function drawWord(ctx, startAngel = 0, text = 'WSEN') {
    const angleStep = (2 * Math.PI) / text.length;
    ctx.fillStyle = 'black'
    ctx.font = '20px Arial'
    ctx.textAlign = "center"; // 文字水平居中对齐
    ctx.textBaseline = "middle"; // 文字垂直居中对齐
    for (let i = 0; i < text.length; i++) {
        const angle = i * angleStep + startAngel;
        const x = dot.x + Math.cos(angle) * radius;
        const y = dot.y + Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(text[i], 0, 0); // 在当前位置绘制文字
        ctx.restore();
    }

}

function drawTickByStart(ctx, startAngel) {
    let angel = startAngel
    let i = 0
    while (i < 25) { // 一个25个刻度
        ctx.beginPath()
        ctx.moveTo(
            dot.x + (radius + 5) * Math.cos(angel),
            dot.y + (radius + 5) * Math.sin(angel)
        )
        ctx.lineTo(
            dot.x + (radius - 5) * Math.cos(angel),
            dot.y + (radius - 5) * Math.sin(angel)
        )
        ctx.lineWidth = 1
        ctx.strokeStyle = i === 12 ? 'black' : 'white';
        ctx.stroke();
        i++
        // 每两个刻度角度为  (Math.PI / 4) * (1 / 15)
        angel = angel + (Math.PI / 4) * (1 / 15)
    }
}

// 绘制刻度
function drawTick(ctx, offSet = 0) {
    drawTickByStart(ctx, offSet + Math.PI / 20)
    drawTickByStart(ctx, offSet + Math.PI / 2 + Math.PI / 20)
    drawTickByStart(ctx, offSet + Math.PI + Math.PI / 20)
    drawTickByStart(ctx, offSet + Math.PI * 3 / 2 + Math.PI / 20)
    // 绘制文字
    drawWord(ctx, offSet)
    // 绘制遮挡圆环
    drawRoundWhit(ctx)
}

// 绘制内圆盘的刻度
function dramTickInCircle(ctx, offSetAngle) {
    ctx.save()
    ctx.translate(dot.x, dot.y)
    ctx.rotate(offSetAngle)
    let angel = Math.PI + Math.PI * (1 / 12)
    let i = 0
    while (i < 11) { // 一个12个刻度
        ctx.beginPath()

        ctx.moveTo(
             (radiusInCircle - 15) * Math.cos(angel),
             (radiusInCircle - 15) * Math.sin(angel)
        )
        ctx.lineTo(
            (radiusInCircle - (i % 2 === 0 ? 8 : 10)) * Math.cos(angel),
            (radiusInCircle - (i % 2 === 0 ? 8 : 10)) * Math.sin(angel)
        )
        ctx.lineWidth = i % 2 === 0 ? 1.12 : 2.25
        ctx.strokeStyle = 'white'
        ctx.stroke();
        i++
        // 每两个刻度角度为  (Math.PI / 4) * (1 / 15)
        angel = angel + Math.PI * (1 / 12)
    }
    ctx.restore()
}

// 绘制内圆（天空）
function drawInCircle(ctx) {
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, radiusInCircle, 0, Math.PI * 2);
    ctx.fillStyle = '#4B8BD1'
    ctx.fill()
}

// 绘制

// 绘制圆内地面
function drawInCircleGround(ctx, offSetHeight = 0, offSetAngle = Math.PI / 6) {
    ctx.save()
    ctx.fillStyle = 'green';
    ctx.translate(dot.x + offSetHeight * Math.sin(offSetAngle), dot.y - offSetHeight * Math.cos(offSetAngle))
    ctx.rotate(offSetAngle)
    ctx.fillRect(-radiusInCircle, 0, radiusInCircle * 2, radiusInCircle + offSetHeight); // x位置、y位置、宽度、高度
    ctx.restore()
}

// 绘制圆内地面线
function drawInCircleGroundLine(ctx, offSetHeight = 0, offSetAngle = Math.PI / 6) {
    // 白色的地平线需要懂
    ctx.save()
    ctx.translate(dot.x + offSetHeight * Math.sin(offSetAngle), dot.y - offSetHeight * Math.cos(offSetAngle))
    ctx.rotate(offSetAngle)
    ctx.beginPath()
    ctx.moveTo(-radiusInCircle, 0,)
    ctx.lineTo(radiusInCircle, 0)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    // 黑色部分不动
    ctx.save()
    ctx.translate(dot.x,dot.y)
    ctx.rotate(0)
    ctx.beginPath()
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.moveTo(-radiusInCircle + 35, 0,)
    ctx.lineTo(-radiusInCircle + 60, 0)
    ctx.lineTo(-radiusInCircle + 60, 10)

    ctx.moveTo(radiusInCircle - 35, 0,)
    ctx.lineTo(radiusInCircle - 60, 0)
    ctx.lineTo(radiusInCircle - 60, 10)

    ctx.lineWidth = 5; // 定义总体宽度大于黑色折线，从而让黑色显示出来时依然保留白边
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
}

// 绘制圆内的距离刻度
function drawInCircleGroundLengthTick(ctx, offSetAngle = Math.PI / 6) {
    ctx.save()
    ctx.translate(dot.x, dot.y)
    // ctx.rotate(offSetAngle)

    ctx.beginPath()

    let i = -4
    while (i <= 4) {
        ctx.moveTo(i % 2 !== 0 ? -7.5 : -15, i * 8)
        ctx.lineTo(i % 2 !== 0 ? 7.5 : 15, i * 8)
        i++
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = "white";
    ctx.stroke()

    // 绘制圆角三角形
    ctx.fillStyle = 'black'
    drawRect([[0, -60], [-5, -45], [5, -45]], 1, ctx)

    // 绘制距离文字
    ctx.font = '14px Arial'
    ctx.textAlign = "center"; // 文字水平居中对齐
    ctx.textBaseline = "middle"; // 文字垂直居中对齐
    ctx.fillStyle = 'white'
    ctx.fillText('20', 35, 35); // 在当前位置绘制文字
    ctx.fillText('20', 35, -35); // 在当前位置绘制文字
    ctx.fillText('10', 35, -15); // 在当前位置绘制文字
    ctx.fillText('10', 35, 15); // 在当前位置绘制文字
    ctx.restore()
}


/*
* @params
* direction: '', // 航向,范围为0-360
* roll: '', // 横滚，范围为0-30
* elevation: '' // 仰角，范围-20-20
*
* */
const useUpdatePanel = ({direction, roll, elevation}) => {
    const panelRef = React.useRef(null);
    const ctx = React.useRef(null)
    useEffect(() => {
        const canvas = panelRef.current
        const ctx = canvas.getContext('2d')
        drawInCircle(ctx) /// 绘制天空内圆
        drawInCircleGround(ctx, elevation * 1.6, roll * Math.PI / 180) /// 绘制内圆地面
        drawInCircleGroundLine(ctx, elevation * 1.6, roll * Math.PI / 180) // 绘制圆内地面线
        drawInCircleGroundLengthTick(ctx, roll * Math.PI / 180) // 绘制圆内地面距离的
        drawRound(ctx) // 绘制圆环
        drawTick(ctx, direction * Math.PI / 180) // 绘制刻度
        dramTickInCircle(ctx, roll * Math.PI / 180) // 绘制圆内刻度
        drawOutDirection(ctx) // 绘制外部方向

    }, [direction, roll, elevation]);

    return {panelRef}
}

export {useUpdatePanel}
