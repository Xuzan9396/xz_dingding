"ui";
ui.layout(

  <vertical>
    <appbar>
      <toolbar id="toolbar" title="钉钉全自动看视频和自动做题" />
      <tabs id="tabs" layout_width="match_parent" tabMode="scrollable" />
    </appbar>
    <viewpager id="viewpager">
      <ScrollView>
        <vertical>
          <vertical margin="8">
            <text textSize="14sp" margin="0 0 0 4">配置</text>
            <horizontal>
              <Switch text="是否打开日志窗口" id="console_open" textSize="16sp" margin="8 4" w="0" layout_weight="1" />
              <Switch text="是否启动执行杀死钉钉" id="kill_app_dingding" textSize="16sp" margin="8 4" w="0" layout_weight="1" />
            </horizontal>

          </vertical>
          <vertical margin="8">
            <text textSize="14sp" margin="0 0 0 4">运行或停止脚本</text>
            <horizontal margin="6 15">
              <button id="start" text="启动脚本" layout_weight="1" />
              <button id="stop" text="停止脚本" layout_weight="1" />
              {/* <button id="save" text="保存设置" layout_weight="1" /> */}
            </horizontal>

          </vertical>


          <vertical margin="8 20 0 0">
            <text textSize="14sp" margin="0 0 0 4">注意事项</text>
            <text textSize="16sp" margin="10 2">1.确保开启了无障碍服务</text>
            <text textSize="16sp" margin="10 2">2.确保手机登录钉钉</text>
            <text textSize="16sp" margin="10 2">3.打开app确保能看到“待办”</text>
            <text textSize="16sp" margin="10 2">4.如果日志窗口挡住了点击,请关掉或者手动缩小(建议缩小)</text>
            <text textSize="16sp" margin="10 2">5.启动后请不要触摸屏幕打断自动点击,如果没有进入到视频列表请重启脚本</text>
            <text textSize="16sp" margin="10 2">6.如果脚本卡出现卡死，请重新启动脚本app</text>


          </vertical>

          <horizontal margin="6 15">
            <button id="update" text="更新脚本" layout_weight="1" />
            {/* <button id="save" text="保存设置" layout_weight="1" /> */}
          </horizontal>
          {/* <text id="updateText" text="" textColor="#999999" textSize="12sp" gravity="center" visibility="gone" /> */}
        </vertical>
      </ScrollView>
      <ScrollView>
        <vertical>
          <vertical margin="16 8">
          <vertical margin="8 20 0 0">
            <text textSize="14sp" margin="0 0 0 4">版本信息:</text>
            <text  id="updateText" textSize="18sp" text="xxxxx" margin="10" />
          </vertical>
          </vertical>

          <vertical margin="16 8">
          <vertical margin="8 20 0 0">
            <text textSize="14sp" margin="0 0 0 4">更新内容:</text>
            <text  id="updateContent" textSize="18sp" text="" margin="10" />
          </vertical>
          </vertical>
          
        </vertical>
      </ScrollView>
    </viewpager>



  </vertical>


);
let isScriptRunning = false;

const STORAGES_GITXUZAN = storages.create("gitxuzan_storage");
// STORAGES_GITXUZAN.clear();

ui.start.on("click", function () {
  // 检查脚本是否已经运行
  if (isScriptRunning) {
    toast("脚本已经在运行");
    console.log("尝试启动脚本，但脚本已经在运行");
  } else {
    isScriptRunning = true;
    xiancheng = threads.start(function () {

      toast("启动脚本");
      console.log("启动脚本");
      Run();
    });
  }
});

ui.stop.on("click", function () {
  if (!isScriptRunning) {
    toast("脚本没有运行");
    log("尝试停止脚本，但脚本没有运行");
  } else {

    isScriptRunning = false;

    // if(xiancheng != null && xiancheng.isAlive()){
    //    xiancheng.interrupt();
    //    xiancheng = null;
    threads.shutDownAll()

    // }
    toast("停止脚本");
    log("停止脚本");

  }
});


ui.console_open.on("click", function () {
  STORAGES_GITXUZAN.put('console_open', ui.console_open.isChecked());
});


ui.kill_app_dingding.on("click", function () {
  STORAGES_GITXUZAN.put('kill_app_dingding', ui.kill_app_dingding.isChecked());
});

ui.viewpager.setTitles(["视频脚本"].concat([
  "版本信息",
]));

//让滑动页面和标签栏联动
ui.tabs.setupWithViewPager(ui.viewpager);

// 设置默认值
// 谁知选中
for (let generalOption of [
  'console_open', 'kill_app_dingding'
])
  ui.findView(generalOption).setChecked(STORAGES_GITXUZAN.get(generalOption, true));


  ui.updateText.setText( STORAGES_GITXUZAN.get('tagName', 'v0.0.1'));
  ui.updateContent.setText( STORAGES_GITXUZAN.get('tagNameContent', '无'));

  


// 检测更新
let globalNewTagName = null;
let versionChangelog = null;
function checkUpdate() {
  if (globalNewTagName != null)
    return globalNewTagName;
  try {
    const releaseAPI = 'https://api.github.com/repos/Xuzan9396/xz_dingding/releases/latest'
    let resp = http.get(releaseAPI);
    if (resp.statusCode != 200) {
      log("请求Github API失败: " + resp.statusCode + " " + resp.statusMessage);
      return null;
    }
    let respJson = resp.body.json();
    globalNewTagName = respJson['tag_name'];
    versionChangelog = respJson['body'];
    return globalNewTagName;
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    return null;
  }
}


ui.update.on("click", function () {
  threads.start(() => {
    const beforeReturn = () => {
      log('控制台即将退出');
      sleep(3000);
      console.hide();
    };
    console.show();
    log('开始更新');
    const curTagName = STORAGES_GITXUZAN.get('tagName', '');
    const newTagName = checkUpdate();
    if (newTagName == null) {
      log('更新失败，请检查网络');
      beforeReturn();
      return;
    } else if (newTagName == curTagName) {
      log("已是最新版本：" + curTagName);
      let forceUpdate = confirm(
        "已是最新版本",
        "是否强制更新？强制更新将重新下载脚本文件，可用于补充/替换意外删除/修改的内容"
      );
      if (forceUpdate == false) {
        beforeReturn();
        return;
      }
    }
    log(`检测到新版本：${newTagName}，下载中……`);
    log("如果耗时过长请关闭本窗口并检查网络");
    // AutoX.js的解压不能替换原文件，只能先放到tmp目录下
    // let fileName = `xz_dingding_${newTagName}.7z`;
    // xz_dingding_v0.0.1.zip
    let fileName = `xz_dingding_${newTagName}.zip`;
    let filePath = files.path(`./tmp/${fileName}`);
    // https://github.blindfirefly.top/https://github.com/Xuzan9396/xz_dingding/releases/download/v0.0.1/dingding_v0.0.1.zip
    // https://ghproxy.com/https://github.com/Xuzan9396/xz_dingding/releases/download/v0.0.1/xz_dingding_v0.0.1.zip
    let fileResp = http.get(`https://ghproxy.com/https://github.com/Xuzan9396/xz_dingding/releases/download/${newTagName}/${fileName}`);
    if (fileResp.statusCode != 200) {
      console(`下载${fileName}失败: ` + fileResp.statusCode + " " + fileResp.statusMessage);
      beforeReturn();
      return;
    }
    files.ensureDir(filePath);
    files.writeBytes(filePath, fileResp.body.bytes());
    log(`下载成功：${fileName}，解压中……`);
    // 解压
    zips.X(filePath, files.path('./tmp'));
    // 删除压缩包
    files.remove(filePath);
    let fileList = [];
    function walkDir(dir) {
      for (let f of files.listDir(dir)) {
        let absolutePath = `${dir}/${f}`;
        if (files.isFile(absolutePath))
          fileList.push(absolutePath);
        else
          walkDir(absolutePath);
      }
    }
    walkDir('./tmp');
    for (let f of fileList) {
      
      let dest = files.path(`./${f.slice(6)}`);
      files.ensureDir(dest);
      files.copy(f, dest);
    }
    files.removeDir('./tmp');
    STORAGES_GITXUZAN.put('tagName', newTagName);
    STORAGES_GITXUZAN.put('tagNameContent', versionChangelog);
    toastLog('更新结束');
    log('更新内容：');
    // ui.updateText.setText( STORAGES_GITXUZAN.get('tagName', 'v0.0.1'));
    // ui.updateContent.setText( STORAGES_GITXUZAN.get('tagNameContent', '无'));
    console.info(versionChangelog);
    beforeReturn();
    ui.finish();
  });
});

//  ----------------上面是ui--------------------
var {
  closeApp,
  getDisplaySize,
  requestScreenCaptureAuto,

} = require('./utils.js');
const [width, height] = getDisplaySize();
// console.log("屏幕宽高", width, height)



function Init() {
  auto.waitFor();
  sleep(1000);
  // 需要在 auto.js 的脚本中开启截图权限
  // 申请截屏全新啊
  requestScreenCaptureAuto();
  device.keepScreenOn(3600 * 1000)



}
function ConsoleOpen() {
  console.show()
  sleep(500)

  // 获取设备的屏幕尺寸
  let deviceWidth = device.width;
  let deviceHeight = device.height;

  // 控制台的尺寸
  let consoleWidth = deviceWidth / 5 * 2;
  let consoleHeight = deviceHeight / 5;

  // 计算控制台的新位置
  let newConsoleX = deviceWidth - consoleWidth;  // 最右侧
  // let newConsoleY = (deviceHeight - consoleHeight);  // 中间位置

  // 移动控制台到新的位置
  console.setPosition(newConsoleX, 0);
  // 设置控制台的尺寸
  console.setSize(consoleWidth, consoleHeight);
}

var chain = {
  init_num: 1,
  currentClickObj: {},
  articleClickObj: {},
  getClickNum(key) {
    let num = this.currentClickObj[key];
    if (num == null) {
      this.currentClickObj[key] = 1;
    } else {
      if (num > 3) {
        return false;
      }
      this.currentClickObj[key] = num + 1;
    }

    return true;

  },
  GetArticleuCheck(level1, level2) {
    if (!this[level1]) { // 判断第一级是否存在
      this[level1] = {}; // 如果不存在，则初始化为一个空对象
    }
    if (!this[level1][level2]) { // 判断第二级是否存在
      this[level1][level2] = 0; // 如果不存在，则初始化为0
    }
    this[level1][level2] += 1; // 累加1

    if (this[level1][level2] > 3) {
      return false;
    } else {
      return true;
    }
  },
  sleep(ms) {
    sleep(ms);
    return this;
  },
  findtextMatches(str) {
    let res = textMatches(str).findOne(4000);
    return res;
  },
  findText(str) {
    let res = text(str).findOne(4000);
    return res;
  },
  clickB(element, timeout) {
    var timeout = (typeof timeout !== 'undefined') ? timeout : 5000;
    var time = 0;
    while (time < timeout) {
      // 检查元素是否可点击

      if (element && element.bounds()) {
        // 计算元素的中心点并点击
        return click(element.bounds().centerX(), element.bounds().centerY());
      }
      // 每次检查间隔1秒
      sleep(1000);
      time += 1000;
    }
    return false;
  },
  click(element, timeout) {
    var timeout = (typeof timeout !== 'undefined') ? timeout : 3000;
    this.sleep(timeout);
    element
  }
};


function Run() {

  if (STORAGES_GITXUZAN.get("console_open", true)) {
    console.hide(); // yincang2
    sleep(1000);
    ConsoleOpen();
  }
  if (chain.init_num == 1) {
 
    chain.init_num = 2;
    Init();
  }

  console.log("开始运行");


  console.log("初始化完成");
  if (STORAGES_GITXUZAN.get("kill_app_dingding", true)) {
    closeApp("钉钉");
  }

  var packageName = "com.alibaba.android.rimet";
  console.log("打开 " + packageName)
  app.launch(packageName);

  // 等待应用启动
  waitForPackage(packageName);
  console.log(packageName + " 已启动");
  for (i = 5; i >= 1; i--) {
    console.log("倒计时:", i, "秒,后运行");
    sleep(1000);
  }



  // 等待"待办"出现,有红点
  var redDian = IsRedDian();
  if (!redDian) {
    toastLog("没有待办课程");
    sleep(3000);
    exit();
    return;
  }
  // 循环列表
  getTaskList();



}

function getTaskList() {
  className("android.view.View").text("进行中").waitFor();
  sleep(4000);
  // 等待"任务类型：学习计划"出现
  var existsBool = className("android.view.View").text("任务类型：学习计划").findOne(3000);
  sleep(1000);

  if (existsBool == null) {
    console.log("没有找到任务类型：学习计划");
    return;
  }

  var elements = className("android.view.View").text("任务类型：学习计划").find();
  sleep(1000);
  for (let i = 0; i < elements.length; i++) {
    // gxz 改

    let obj = {
      element: elements[i],
      maxSwipeTimes: elements.length,
      title: "",
    };
    let [eles, x, y] = getSwipeElementv2(obj);
    if (!eles) {
      return;
    }else if(eles === 3){
      continue
    }
    console.log(`真正开始任务:${obj.title}x,y`, x, y);
    click(x, y);
    sleep(4000);
    // 查看是否有未完成任务

    IsTaskComplete(obj.title);
    sleep(3000);
    // 这里很关键，需要重新获取元素刷新的作用，取最新的元素
    getTaskList();

    return;


  }

  toastLog("全部看完了,没有可以看的视频了!");
}



// 是否是红点可以点击
function IsRedDian() {
  className("android.widget.TextView").text("待办").waitFor();
  var targetNode = className("android.widget.TextView").text("待办").findOne();
  if (targetNode != null) {

    var parentNode = targetNode.parent();
    var children = parentNode.children();
    var found = false;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (found) {
        var id = child.id(); // 获取元素的 id
        if (id === "com.alibaba.android.rimet:id/item_red_dot") {
          // 如果是 "红点"，打印信息并返回 true
          console.log("找到了红点");
          clickB(child);
          return true;
        }
        // 如果不是 "红点"，打印信息并返回 false
        console.log("下一个同级节点不是红点，它的 id 是 " + id);
        return false;
        return true
      }
      if (child.text() === "待办") {
        found = true;
      }
    }
    if (!found) {
      console.log("没有找到下一个同级节点");
    }

  } else {
    console.log("没有找到 '待办' 节点");
  }
  return false;

}

// 是否任务完成了获取学时
function IsTaskComplete(taskTitle) {

  // 等待"任务类型：学习计划"出现
  processElements(taskTitle);


}


function getElementsData() {
  id("com.alibaba.android.rimet:id/more_text").waitFor();

  sleep(3000);

  let elements = className("android.view.View").textMatches(/学时:.*分钟|限时:.*/).find().map((targetChild, index) => {


    if (targetChild) {
      let text = targetChild.text();
      console.log("text", text);
      let category = 0; // 0 无 ， 1 视频 2 做题
      let match = text.match(/学时:\s*(\d+)分钟/); // 使用正则表达式匹配分钟数
      let minutes = 0;
      let isNotFinsh = 0;
      if (match) {
        minutes = parseInt(match[1]); // match[1] 包含第一个括号里匹配的部分，即分钟数
        category = 1;
      } else if (text.indexOf("限时") != -1) {
        category = 2;
      }

      let parent = targetChild.parent();
      let percentage = null;
      // 视频取百分比
      let parentCount = parent.childCount();
      if (category == 1 && parentCount >= 4) {
        let percentageText = parent.child(3).text();
        let percentageMatch = percentageText.match(/(\d+)%/); // 使用正则表达式匹配百分比值
        if (percentageMatch) {
          percentage = percentageMatch[1]; // percentageMatch[1] 包含第一个括号里匹配的部分，即百分比值
          if (percentage != '100') {
            isNotFinsh = 1;
          }
        }
      } else if (category == 2 && parentCount >= 3) {
        if (parentCount == 3) {
          // 文本只有三个长度没有完成
          isNotFinsh = 1;

        } else if (parentCount == 4) {
          let percentageText = parent.child(2).text();
          let percentageMatch = percentageText.match(/.*\((.*?)\)/);
          if (percentageMatch) {
            // text("100分 (通过)")
            let status = percentageMatch[1];
            console.log("status:", status);
            // 根据状态判断
            if (status === "通过") {
              console.log("该学生已通过，分数为：" + percentageText);
            } else if (status === "未通过") {
              isNotFinsh = 1;
              console.log("该学生未通过，分数为：" + percentageText);
            } else {
              isNotFinsh = 1;
              console.log("未知状态，分数为：" + percentageText);
            }
          } else {
            isNotFinsh = 1;
            console.log("无法解析分数和状态");
          }
        }
      }


      let title = targetChild.parent().child(0).text();


      // gxz 改
      if (isNotFinsh === 1 && title != "") {
        return {
          minutes: minutes,
          category: category,
          // percentage: 20,
          // gxz 恢复
          finish: 0,
          percentage: percentage,
          element: targetChild,
          title: title,
          rawIndex: 0,
        };
      }else{
        return {
          finish: 1,
          title: title,
          rawIndex: 0,
        };
      }
    }


  });

  let eLen = elements.length;

  console.log("视频数量.length:%d", elements.length); // 视频数量
  // 处理名字相同的视频
  if(elements.length > 0){
    let titleIndices = {};
    for (let i = 0; i < elements.length; i++) {
        let obj = elements[i];
        if (titleIndices[obj.title] === undefined) {
            titleIndices[obj.title] = obj.rawIndex;
        } else {
            obj.rawIndex = ++titleIndices[obj.title];
        }
    }
    // elements = elements.filter(el => el !== undefined);
    elements = elements.filter(function(obj) {
      return obj.finish !== 1;
    });

  }
  return [elements, eLen];
}



// 列表循环
function processElements(taskTitle) {
  console.log("开始看视频和做题！！");
  //  视频数量
  let [elements, maxSwipeTimes] = getElementsData();
  console.log("最大滑动次数:", maxSwipeTimes); // 视频数量
  // 开始循环点击视频和题目
  for (let i = 0; i < elements.length; i++) {
    let obj = elements[i];
    // gxz 改
    if (obj) {
      obj.maxSwipeTimes = maxSwipeTimes;
      console.log("第", i + 1, "视频,title: ", obj.title, "minutes: ", obj.minutes, "percentage: ", obj.percentage, "text", obj.element.text(), "bottomY", obj.element.bounds().bottom);
      let [targetElement, targetX, targetY] = getSwipeElement(obj);


      // 如果找到目标元素，进行点击操作
      if (targetElement) {
        obj.num = i + 1;
        switch (obj.category) {
          case 1:
            // 点击视频
            WatchVideo(obj, targetX, targetY);
            
            // 改成刷新列表方式
            processElements(taskTitle);
            return;
            // break;
          case 2:

            // 点击考试
            console.log(`点击个${obj.num},考试:`, targetX, targetY, obj.title);
            if (!chain.GetArticleuCheck(taskTitle, obj.title)) {
              // 这里已经是返回状态了
              console.log("已经超过3次了，跳过", taskTitle, obj.title);
              BackOut(); // 会返回到任务列表
              sleep(3000);
              return;
            }

            click(targetX, targetY);
            sleep(3000);
            DoExercises(obj);
            sleep(2000);

            processElements(taskTitle);
            return;
        }

        // 全部看完返回上级
        // if (i == elements.length - 1) {

        // }
      } else {
        console.log("未找到视频，跳过");
        continue;
      }

    }
  }

  BackOut()
  sleep(3000);

}


function getSwipeElement(obj) {
  let screenHeight = height;

  let bottomY = obj.element.bounds().bottom;
  let targetX = obj.element.bounds().centerX();
  let targetY = obj.element.bounds().centerY();

  // let maxSwipeTimes = eLen; // 最大滑动次数，可以根据需要调整
  let swipeCount = 0; // 已滑动次数
  // let lastY; // 用于保存上一次的Y坐标

  let targetElement;
  let bounds;
  if (bottomY >= screenHeight - screenHeight * 0.15) {
    // 循环滑动直到元素在屏幕上 我不想根据 title 来找了，我想根据当前obj 本身元素判断可以判断吗
    while (bottomY >= screenHeight - screenHeight * 0.15 && swipeCount < obj.maxSwipeTimes) {
      console.log("滑动了次数:", swipeCount);
      // swipe(width / 2, height * 0.65, width / 2, 0, 500); // 滑动屏幕
      SwipePhone(width, height)


      // 重新获取目标元素的位置
      if(obj.rawIndex > 0){
        // 处理标题相同的
        console.log("处理标题相同的");
        let targetElements = className("android.view.View").text(obj.title).find();
        if (targetElements.length >= obj.rawIndex) {

           targetElement = targetElements[obj.rawIndex];
          // 在这里使用 targetObj
        } 
      }else{
        targetElement = className("android.view.View").text(obj.title).findOne(3000);

      }

      if (targetElement) {
        bounds = targetElement.bounds();
        targetX = bounds.centerX();
        targetY = bounds.centerY();
        bottomY = bounds.bottom;
        console.log("new bottom y坐标: ", bottomY);

      }

      swipeCount++;
    }
  } else {
    // 重新获取目标元素的位置
    targetElement = className("android.view.View").text(obj.title).findOne(3000);
    bounds = targetElement.bounds();
    targetX = bounds.centerX();
    targetY = bounds.centerY();
  }


  return [targetElement, targetX, targetY];
}


function getSwipeElementv2(obj) {
  let screenHeight = height;


  // let maxSwipeTimes = eLen; // 最大滑动次数，可以根据需要调整
  let swipeCount = 0; // 已滑动次数
  // let lastY; // 用于保存上一次的Y坐标


  try {
    var textObj = obj.element.parent().parent().child(0).child(1).child(0).child(0).child(2); // 找到两个元素的共同父元素
    obj.title = textObj.text();
    console.log("标题", obj.title);
    if (!chain.getClickNum(obj.title)) {
      console.log("已经超过3次了，跳过");
      return [3, null, null];
    }
  } catch (e) {
    console.log("元素变化了，没找到请及时更新代码");
    return [null, null, null];

  }

  let bottomY = obj.element.bounds().bottom;
  let targetX = obj.element.bounds().centerX();
  let targetY = obj.element.bounds().centerY();
  let targetElement;
  let bounds;
  if (bottomY >= screenHeight - screenHeight * 0.25) {
    // 循环滑动直到元素在屏幕上
    while (bottomY >= screenHeight - screenHeight * 0.25 && swipeCount < obj.maxSwipeTimes) {
      console.log("滑动了次数:", swipeCount);
      // swipe(width / 2, height * 0.65, width / 2, 0, 500); // 滑动屏幕
      SwipePhoneSlow(width, height)
      // 重新获取目标元素的位置
      sleep(3000);
      targetElement = className("android.view.View").text(obj.title).findOne(3000);

      if (targetElement) {
        bounds = targetElement.bounds();
        targetX = bounds.centerX();
        targetY = bounds.centerY();
        bottomY = bounds.bottom;
        console.log("new bottom y坐标: ", bottomY, targetElement.text());

      }

      swipeCount++;
    }
  } else {
    // 元素已在屏幕上，更新其位置信息
    bounds = obj.element.bounds();
    targetX = bounds.centerX();
    targetY = bounds.centerY();
  }

  return [obj.element, targetX, targetY];
}

// 观看视频
function WatchVideo(obj, targetX, targetY) {

  if (obj.minutes > 0 && parseInt(obj.percentage) >= 0 && parseInt(obj.percentage) < 100) {
    //gxz 改恢复上面
    // if (obj.minutes > 0 && parseInt(obj.percentage) >= 0 && parseInt(obj.percentage) <= 100) {
    console.log(`观看第${obj.num}视频:`, obj.title, targetX, targetY);
    click(targetX, targetY);

    sleep(2000);


    let isVideo = className("android.view.View").textMatches(/继续学习|开始学习/).findOne(3000)
    sleep(1000);


    if (isVideo) {
      // 点击播放按钮
      clickB(isVideo)
      sleep(3000);
      clickConfirmIfPresent();

    }
    let watchTime = obj.minutes * 60 * 1000 * (100 - obj.percentage) / 100 + 1000 * 60

    console.log("停留分钟:", watchTime / 1000 / 60);

    // gxz 需要开启等待看视频时间
    sleep(watchTime);
    // sleep(1000); // 睡眠
    // 返回上级
    console.log("看完了，返回视频了列表");
    BackOut();

  }


  sleep(1000); // 睡眠

}


// 点击考试
function DoExercises(obj) {

  let res = chain.sleep(2000).findtextMatches(/(继续测验|开始测验|重新测验)/);
  if (!res) {
    BackOut();
    return
  }

  if (res.text() == "重新测验") {
    click("回顾答题");
    sleep(4000)
    let ele = text("正确答案:").find().map((item, index) => {
      let daAn = item.parent().child(item.parent().childCount() - 1).text().split("、").map(item => item.toLowerCase());
      console.log(daAn);
      return {
        daAn: daAn,
        itme: item,
      };
    })
    // 找到正确答案回到上一级答题
    BackOut();
    sleep(2000);
    if (ele.length <= 0) {
      console.log("未找到答案");
      BackOut();
      sleep(2000);
      return;
    }
    // 找到的情况
    if (ele.length > 0) {
      click("重新测验");

      sleep(3000);
      let elements = text("重新测验").clickable(true).find();
      console.log("elements", elements.length);
      let minYElement = elements.reduce((min, current) => {
        return (current.bounds().top < min.bounds().top) ? current : min;
      }, elements[0]);
      if (minYElement) {
        console.log(minYElement.text(), minYElement.bounds().centerX(), minYElement.bounds().centerY());
        minYElement.click();
        sleep(3000);
        click("开始测验");
        sleep(2000);
        // 黑色背景
        click(width / 2, height / 2);
        let is = 0;
        while (xia = chain.sleep(2000).findtextMatches(/下一题|交卷/)) {
          textMatches(/单选题|多选题/).waitFor();
          sleep(1000);
          let isDan = textMatches(/单选题|多选题/).findOne(2000);
          console.log(isDan.text(), ",第：", is + 1, "题,", ele[is].daAn);
          let colorArr = GetIsSelectXuZhe();

          if (colorArr && Object.keys(colorArr).length > 0) {

            for (let i = 0; i < ele[is].daAn.length; i++) {

              if (colorArr[ele[is].daAn[i]].isSelect) {
                console.log("已经选择了:", ele[is].daAn[i], "不用点击了");
                continue;
              }
              // if (isDan.text() === "单选题"){
              let point = {};
              point.x = colorArr[ele[is].daAn[i]].obj.bounds().centerX();
              point.y = colorArr[ele[is].daAn[i]].obj.bounds().centerY();

              if (point) {
                console.log("选择了", ele[is].daAn[i], "点击:", point.x, point.y);
                click(point.x, point.y);
                sleep(2000);
              }
            }


          } else {
            log("未找到题目");
          }




          chain.sleep(1000).clickB(xia);



          if (xia.text() == "交卷") {
            sleep(3000);
            click("确定")
            sleep(3000);
            BackOut();
            break;
          }
          is++;
        }

      }

    }


    return;
  }
  // 上面是重新测验情况
  console.log("点击考试:", res.text(), res.bounds().centerX(), res.bounds().centerY());
  if (clickB(res)) {
    sleep(2000);
    // 黑色背景
    click(width / 2, height / 2);
    let randArr = ['a', 'b', 'c', 'd'];
    let is = 0;
    while (xia = chain.sleep(2000).findtextMatches(/下一题|交卷/)) {
      textMatches(/单选题|多选题/).waitFor();
      sleep(1000);
      let isDan = textMatches(/单选题|多选题/).findOne(2000);

      let randomElement = randArr[Math.floor(Math.random() * randArr.length)];


      let colorArr = GetIsSelectXuZhe();
      log(colorArr);
      if (colorArr && Object.keys(colorArr).length > 0) {


        if (colorArr[randomElement].isSelect) {
          console.log("已经选择了:", randomElement, "不用点击了");
          continue;
        }
        // if (isDan.text() === "单选题"){
        let point = {};

        point.x = colorArr[randomElement].obj.bounds().centerX();
        point.y = colorArr[randomElement].obj.bounds().centerY();
        console.log("随机点击:", randomElement, point.x, point.y);

        if (point) {
          click(point.x, point.y);
          sleep(1000);
        }



      } else {
        log("未找到题目");
      }


      chain.sleep(1000).clickB(xia);
      sleep(1000);

      if (xia.text() == "交卷") {
        sleep(3000);
        click("确定")
        sleep(3000);

        break;
      }
      is++;

    }

    console.log("点击考试成功");

    sleep(3000);
    BackOut();
  } else {
    console.log("点击考试失败");
    BackOut();
  }
}



// -----------------------
function BackOut() {
  // 找到所有id为back_layout的元素
  // id("back_layout").className("android.widget.RelativeLayout").waitFor();
  id("com.alibaba.android.rimet:id/back_layout").clickable(true).waitFor()

  sleep(1000);

  let hulv = text("忽略").findOne(3000)
  if (hulv) {
    click(hulv.bounds().centerX(), hulv.bounds().centerY());
    sleep(1000);
  }

  let elements = id("com.alibaba.android.rimet:id/back_layout").className("android.widget.RelativeLayout").clickable(true).find();
  // 如果没有找到任何元素，打印提示并退出
  if (elements.empty()) {
    console.log("没有找到任何退出按钮");
    return;
  }
  // 按照元素的y坐标进行排序，最后一个元素的y坐标最大
  elements.sort((a, b) => {
    return a.bounds().centerY() - b.bounds().centerY();
  });

  // 点击y坐标最大的元素
  elements[elements.length - 1].click();
  sleep(2000);
}





function clickB(element, timeout) {
  var timeout = (typeof timeout !== 'undefined') ? timeout : 5000;
  var time = 0;
  while (time < timeout) {
    // 检查元素是否可点击

    if (element && element.bounds()) {
      // 计算元素的中心点并点击
      return click(element.bounds().centerX(), element.bounds().centerY());
    }
    // 每次检查间隔1秒
    sleep(1000);
    time += 1000;
  }
  return false;
}



function SwipePhone(deviceWidth, deviceHeight) {
  var x1 = deviceWidth / 2; // 定义滑动起点的x坐标为屏幕宽度的一半
  var y1 = deviceHeight * 0.7; // 定义滑动起点的y坐标为屏幕高度的80%
  var x2 = deviceWidth / 2; // 定义滑动终点的x坐标为屏幕宽度的一半
  var y2 = deviceHeight * 0.4; // 定义滑动终点的y坐标为屏幕高度的20%

  swipe(x1, y1, x2, y2, 500); // 执行滑动操作
  sleep(3000); // 滑动后等待一段时间，让界面更新

}


function SwipePhoneSlow(deviceWidth, deviceHeight) {
  var x1 = deviceWidth / 2;
  var y1 = deviceHeight * 0.65;
  var x2 = deviceWidth / 2;
  var y2 = deviceHeight * 0.5;

  swipe(x1, y1, x2, y2, 500);
  sleep(3000); // 滑动后等待一段时间，让界面更新

}


function Save() {
  // 需要在 auto.js 的脚本中开启截图权限
  sleep(3000);


  // 截取屏幕
  let img = captureScreen();

  // 截取你想要的部分
  // let clip = images.clip(img, 72, 954, 144 - 72, 1029 - 954); // a
  // let clip = images.clip(img, 72, 1107, 144 - 72, 1182 - 1107); // b
  // let clip = images.clip(img, 72, 1332, 144 - 72, 1407 - 1332); // c
  // let clip = images.clip(img, 72, 1264, 144 - 72, 1339 - 1264); // _c
  // let clip = images.clip(img, 72, 1485, 144 - 72, 1560 - 1485); // d
  // let clip = images.clip(img, 72, 1417, 144 - 72, 1492 - 1417); // _d
  // let clip = images.clip(img, 72, 1638, 144 - 72, 1713 - 1638); // e
  // let clip = images.clip(img, 72, 1570, 144 - 72, 1645 - 1570); // _e
  // screen, 0, height/5, width / 2, height/5*4
  // let clip = images.clip(img, 0,height/5, width / 2-0, height/5*4 - height/5); // _c

  // let clip = images.clip(img, 114, 1151, 189 - 114, 1226 - 1151); //x_a
  // let clip = images.clip(img, 114, 1373, 189 - 114, 1448 - 1373); //x_b
  // let clip = images.clip(img, 114, 1592, 189 - 114, 1667 - 1592); //x_c
  // let clip = images.clip(img, 114, 1814, 189 - 114, 1889 - 1814); //x_d
  let clip = images.clip(img, 72, 1788, 144 - 72, 1863 - 1788); //x_f


  // 保存到文件b
  let path = "/sdcard/脚本/x_f.png";
  images.save(clip, path);
  // 保存到文件b
  let path2 = "/sdcard/脚本/f.png";
  images.save(clip, path2);

  console.log("截图已保存至 " + path);

}


function ByAImg(fileName) {

  // 判断文件是否存在，如果不存在，返回null  gxz 恢复
  if (!files.exists("./img/" + fileName + ".png")) {
    // if (!files.exists("./" + fileName + ".png")) {
    console.log(fileName + "文件不存在");
    return null;
  }

  sleep(1000);

  // 截取屏幕
  let screen = captureScreen();

  // 读取你的图片
  // gxz 回复
  let clip = images.read("./img/" + fileName + ".png");
  // let clip = images.read("./" + fileName + ".png");

  let options = {
    threshold: 0.7,
    region: [0, height / 5, width / 5 * 2.5, height / 5 * 4]
  };

  // 在屏幕上查找图片
  let point = findImage(screen, clip, options);

  // 回收图片
  clip.recycle();

  return point;
}





// 解决弹窗 确定的问题
function clickConfirmIfPresent() {

  sleep(2000);
  var confirmButton = textMatches("确定|继续").clickable(true).findOnce();

  if (confirmButton != null) {
    confirmButton.click();
    console.log("Clicked the confirm button.");
  }

}




function GetIsSelectXuZhe() {
  let ress = textMatches(/A|B|C|D|E|F/).find();
  if (ress.length == 0) {
    return null;
  }
  let colors = {};

  for (let i = 0; i < ress.length; ++i) {
    if (ress[i].bounds().left > 0 && ress[i].bounds().left < width / 2) {

      log(ress[i].text().toLowerCase(), ress[i].bounds().centerX(), ress[i].bounds().centerY());

      // 获取屏幕截图    
      let bools = getColorBool(ress[i]);
      colors[ress[i].text().toLowerCase()] =
      {
        isSelect: bools,
        obj: ress[i],
      }


    }
  }

  return colors;


}

function getColorBool(obj) {
  let img = captureScreen();
  let color = images.pixel(img, obj.bounds().left + 5, obj.bounds().centerY());

  // 转换为16进制颜色代码
  // let colorHex = colors.toString(color);
  return colors.isSimilar(color, "#ffd23c32", 4);  // 输出16进制颜色代码，例如#ff0000
}





  // home();
  // sleep(2000);
  // var packageName = "com.alibaba.android.rimet";
  // console.log("打开 " + packageName)
  // // app.launch(packageName);
  // app.launchApp("钉钉");
  // // 等待应用启动
  // console.log("等待应用启动");
  // waitForPackage(packageName);
  // console.log(packageName + " 已启动");
  // sleep
  // // Save();
  // // return;
  //   // ByAImg();
  //   // return;
  //   // 做题
  //   // DoExercises(null);
  //   // return ;
  //     // 查看是否有未完成任务
  // // IsTaskComplete();
  // // return;
  // getTaskList();
  //     return;

