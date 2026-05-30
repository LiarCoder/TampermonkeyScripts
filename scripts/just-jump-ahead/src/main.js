window.onload = function () {
  // jumpBtn 是各个跳转页面中的类似于【继续访问】的按钮，用户可以点击按钮以继续访问被拦截的链接
  let jumpBtn = null;
  // targetAddress 是针对像在PC端QQ中的拦截页面中需要用户手动复制的目标链接
  let targetAddress = "";
  // currentAddress 是当前拦截页面的完整网址
  let currentAddress = location.toString();
  // buttonMap 存储了相应拦截页面与其中的【继续访问】按钮的CSS选择器映射关系
  let buttonMap = new Map();
  // addressMap 存储了相应拦截界面与其中的需要用户手动复制的网址的CSS选择器的映射关系
  let addressMap = new Map();

  // 匹配掘金的跳转拦截页面网址
  buttonMap.set("://link.juejin.cn/", "#app > div > div > button");
  // 匹配简书的跳转拦截页面网址
  buttonMap.set("://www.jianshu.com/go-wild", "._3OuyzjzFBDdQwRGk08HXHz_0");
  // 匹配知乎的跳转拦截页面网址
  buttonMap.set("://link.zhihu.com/", "a.button");
  // 匹配百度贴吧的跳转拦截页面网址
  buttonMap.set("://jump.bdimg.com/safecheck", "div.warning_info.fl > a:nth-child(2)");
  // 匹配CSDN的跳转拦截页面网址
  buttonMap.set("://link.csdn.net/", "a.loading-btn");

  // 匹配PC端QQ的跳转拦截页面网址
  addressMap.set("://c.pc.qq.com/middlem.html", "#url");

  // 开始逐个遍历 buttonMap 中的 key 值，若有匹配上的，则获取相应按钮元素并自动点击完成跳转
  for (let address of buttonMap.keys()) {
    if (currentAddress.indexOf(address) >= 0) {
      jumpBtn = document.querySelector(buttonMap.get(address));
      jumpBtn.click();
      return;
    }
  }

  // 开始逐个遍历 addressMap 中的 key 值，若有匹配上的，则自动将浏览器的location指向目标网站完成跳转
  for (let address of addressMap.keys()) {
    if (currentAddress.indexOf(address) >= 0) {
      targetAddress = document.querySelector(addressMap.get(address)).innerText;
      location = targetAddress;
      return;
    }
  }
};
