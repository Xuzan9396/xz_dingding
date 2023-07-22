
var { 
    unlockIfNeed, 
    getDisplaySize,
    requestScreenCaptureAuto,
  
   } = require('./utils.js');
  const [width, height] = getDisplaySize();
  console.log("屏幕宽高", width, height)
  requestScreenCaptureAuto();
var res = textMatches(/单选题|多选题/).findOne(2000);
if(!res){
    toastLog("未找到题目");
    exit();
}
// log(res.text());
var ress = textMatches(/A|B|C|D|E|F/).find();
log(ress.length);




// for (let i = 0; i < ress.length; ++i) {
//     if(ress[i].bounds().left>0 && ress[i].bounds().left < 700){
//         log(ress[i].text(), ress[i].bounds().centerX(),ress[i].bounds().centerY());
//         // click(ress[i].bounds().centerX(), ress[i].bounds().centerY());
//         // 获取屏幕中心的颜色（整数值）
//         // 获取屏幕截图
//         let img = captureScreen();
//         let color = images.pixel(img, ress[i].bounds().left+5,ress[i].bounds().centerY());

//         // 转换为16进制颜色代码
//         let colorHex = colors.toString(color);
//         let color1 = "#ffd23c32";
//         console.log(colorHex,colors.isSimilar(color,"#ffd23c32",4));  // 输出16进制颜色代码，例如#ff0000
//         sleep(1000)

//     }
// }
// log(ress);

colorArr = GetIsSelectXuZhe();
log(colorArr);
if (colorArr && Object.keys(colorArr).length > 0) {
    log("找到题目");
}else{
    log("未找到题目");
}

function GetIsSelectXuZhe(){
    let list = textMatches(/A|B|C|D|E|F/).find();
    if (list.length == 0) {
        return null;
    }
    let colors = {};

    for (let i = 0; i < ress.length; ++i) {
        if(ress[i].bounds().left>0 && ress[i].bounds().left < width/2){

            log(ress[i].text().toLowerCase(), ress[i].bounds().centerX(),ress[i].bounds().centerY());

            // 获取屏幕截图    
            let bools = getColorBool(ress[i]);        
            colors[ress[i].text().toLowerCase()] = bools;
          
    
        }
    }

    return colors;


}

function getColorBool(obj){
    let img = captureScreen();
    let color = images.pixel(img, obj.bounds().left+5,obj.bounds().centerY());

    // 转换为16进制颜色代码
    // let colorHex = colors.toString(color);
   return  colors.isSimilar(color,"#ffd23c32",4);  // 输出16进制颜色代码，例如#ff0000
}