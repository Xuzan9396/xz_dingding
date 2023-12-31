/*
 * @Author: TonyJiangWJ
 * @Date: 2023-07-05 15:54:16
 * @Last Modified by: TonyJiangWJ
 * @Last Modified time: 2023-07-08 17:39:23
 * @Description: 
 */


let CanvasDrawer = require('./CanvasDrawer.js')

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


function WarningFloaty () {
  let self = this
  this.window = null
  this.toDrawList = []
  this.drawer = null
  this.disableTips = false
  this.inited = false
  this.initing = false

  this.init = function () {
    if (this.inited || this.initing) {
      return
    }
    this.initing = true
    this.window = floaty.rawWindow(
      <canvas id="canvas" layout_weight="1" />
    )
    let [width, height] = getDisplaySize();
    var config = {};
    config.device_width = width;
    config.device_height = height;
    config.bang_offset = 0;
    this.window.setSize(config.device_width,  config.device_height)
    this.window.setTouchable(false)

    this.window.canvas.on("draw", function (canvas) {
      canvas.drawColor(0xFFFFFF, android.graphics.PorterDuff.Mode.CLEAR)
      if (self.disableTips || self.toDrawList.length == 0) {
        ui.run(function () {
          self.window.setPosition(config.device_width, 0)
        })
        return
      }
      if (self.drawer == null) {
        // debugInfo(['初始化drawer，offset: {}', config.bang_offset])
        self.drawer = new CanvasDrawer(canvas, null, config.bang_offset)
      }
      ui.run(function () {
        self.window.setPosition(0, 0)
      })

      let toDrawList = self.toDrawList
      if (toDrawList && toDrawList.length > 0) {
        toDrawList.forEach(drawInfo => {
          try {
            switch (drawInfo.type) {
              case 'rect':
                self.drawer.drawRectAndText(drawInfo.text, drawInfo.rect, drawInfo.color || '#00ff00')
                break
              case 'circle':
                self.drawer.drawCircleAndText(drawInfo.text, drawInfo.circle, drawInfo.color || '#00ff00')
                break
              case 'text':
                self.drawer.drawText(drawInfo.text, drawInfo.position, drawInfo.color || '#00ff00', drawInfo.textSize)
                break
              default:
                // debugInfo(['no match draw event for {}', drawInfo.type], true)
            }
          } catch (e) {
            errorInfo('执行异常' + e)
            // commonFunction.printExceptionStack(e)
          }
        })
      }
    })
    this.initing = false
    this.inited = true
  }

  this.disableTip = function () {
    this.disableTips = true
  }

  this.enableTip = function () {
    this.disableTips = false
  }

  this.closeDialog = function () {
    // debugInfo('关闭悬浮窗')
    if (this.window !== null) {
      this.window.canvas.removeAllListeners()
      this.window.close()
      this.window = null
    }
  }

  this.clearAll = function () {
    this.toDrawList = []
    return this
  }

  this.addRectangle = function (text, rectRegion, color) {
    this.init()
    if (!validRegion(rectRegion)) {
      // errorInfo(['区域信息无效: {}', JSON.stringify(rectRegion)])
      return this
    }
    ui.run(function () {
      // debugInfo(['添加方形区域 {} {}', text, JSON.stringify(rectRegion)])
      self.toDrawList.push({
        type: 'rect',
        text: text,
        rect: rectRegion,
        color: color,
      })
    })
    return this
  }

  this.isValidRectangle = function (r) {
    return validRegion(r)
  }

  this.addCircle = function (text, circleInfo, color) {
    this.init()
    ui.run(function () {
      // debugInfo(['添加圆形区域 {} {}', text, JSON.stringify(circleInfo)])
      self.toDrawList.push({
        type: 'circle',
        text: text,
        circle: circleInfo,
        color: color,
      })
    })
    return this
  }

  this.addText = function (text, position, color, textSize) {
    this.init()
    ui.run(function () {
      // debugInfo(['添加文本区域 {} {}', text, JSON.stringify(position)])
      self.toDrawList.push({
        type: 'text',
        text: text,
        position: position,
        color: color,
        textSize: textSize,
      })
    })
    return this
  }

}

function validRegion (region) {
  if (!region || region.length !== 4) {
    return false
  }
  if (region.filter(v => v < 0).length > 0) {
    return false
  }
  if (region[2] == 0 || region[3] == 0) {
    return false
  }
  return true
}
module.exports = WarningFloaty;