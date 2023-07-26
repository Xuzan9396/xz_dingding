var qq = "594906616";
app.startActivity({ 
    action: "android.intent.action.VIEW", 
    data:"mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + qq, 
    packageName: "com.tencent.mobileqq", 
});

sleep(2000);