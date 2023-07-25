
let CanvasDrawer = require('./CanvasDrawer.js')

let WarningFloatys = require('./WarningFloaty.js')

let WarningFloaty = new WarningFloatys();
const [width, height] = getDisplaySize();
function showLog (text, lineOffset) {
  lineOffset = lineOffset || 0
  WarningFloaty.addText(text, { x: 100, y: height/ 2 + lineOffset })
}
let line = 0;
console.log('width', width)
showLog('准备查找 好友名称 控件')
showLog('准备查找 好友名称 控件',line += 50)

let running = true

threads.start(function () {
  while (running) {
    let line = 0
    showLog('xz准备查找 好友名称 控件')

      // showLog('未找到好友名称控件', line += 50)
    sleep(2000)
    WarningFloaty.clearAll()
  }
})

function getDisplaySize(doNotForcePortrait) {
  let { width, height } = device;
  if (width == 0) {
    // console.warn('AutoX.js获取到的设备尺寸为0，可能会影响正常运行，可以尝试重启设备');
    let metrics = context.getResources().getDisplayMetrics();
    width = metrics.widthPixels;
    height = metrics.heightPixels;
  }
  if (doNotForcePortrait)
    return [width, height]
  return [
    Math.min(width, height),
    Math.max(width, height)
  ];
}


var window = floaty.rawWindow(
  <canvas id="canvas" layout_weight="1" />
);

window.setSize(width, height)
window.setTouchable(false)

let canvasDrawer = null
window.canvas.on("draw", function (canvas) {
  try {
    // 清空内容
    canvas.drawColor(0xFFFFFF, android.graphics.PorterDuff.Mode.CLEAR);

    if (canvasDrawer == null) {
      canvasDrawer = new CanvasDrawer(canvas, null, 0)
    }
    let region =  [100, 100, 300, 300];

    // if (detectRegion && detectRegion.length === 4) {
      canvasDrawer.drawRectAndText('能量球判断区域', region, '#FF00FF')
    //   let configRegion = [config.tree_collect_left, config.tree_collect_top, config.tree_collect_width, config.tree_collect_height]
    //   canvasDrawer.drawRectAndText('已配置的能量球判断区域', configRegion, '#00ff00')
    // }
    // if (showAxis) {
      // canvasDrawer.drawCoordinateAxis()
    // }
  
  } catch (e) {
    toastLog(e)
  }
});