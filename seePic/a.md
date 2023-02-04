# 使用 react 结合 sciter 封装 图片查看器 组件

##  # 效果图

### 1、图片：宽度大于高度

![]()

### 2、图片：宽度小于高度

![]()

<hr/>

## # 如何使用

```html
<div class="container"></div>
<script type="module">
 import { ScLookImg } from './component/index';
 const lookImg = new ScLookImg({ container: '.container' });
 if (lookImg.state) {
     lookImg.look({ imgsrc: '图片地址（必须为绝对路径）' })
 } else {
     console.log('初始化失败，错误信息为：'， lookImg.message);
 }
</script>
```

> `lookImg.id`：组件唯一标识，该标识绑定在 **组件最外层的 DOM 元素上** 可以通过 `document.$('#' + lookImg.id)` 获取该组件的 dom 元素

<hr/> 

## # 使用到的 PReact 的哪些技术点

* Hooks： `useLayoutEffect`，`useEffect`，`useState`，`useRef`
* 自定义 Hooks 
* 函数式组件

<hr/>

## # 开发过程遇到的问题

### 1、如何结合 PReact 进行组件化编程

sciter 本身也是支持 **组件化编程** 的。并其本身也是有组件 **渲染函数JSX** ，若使用了 React 的编程方式。则需要覆写**渲染函数JSX**

```javascript
import { h } from './react';
// 覆写 sciter 原有的渲染函数 JSX 
JSX = h;
```

### 2、如何获取图片大小

问题描述：通过 sciter 提供 的读取路径下文件的信息，并不能读取到图片的宽高。

解决方法：使用 `Graphics.Image` 来加载图片生成图片对象

```javascript
const image = await Graphics.Image.load(props.config.imgsrc);
```

> 注：图片加载过程是异步的

### 3、窗口如何适配不同的宽高的图片

问题描述：但宽度和高度不同时，如何进行适配窗口，使其图片不会变形。

解决方法：取两者（宽度和高度）中最大值，并以其最大值（高度或宽度）为基础，计算其最大边撑满其容器的对应边的比例，进而换算出小边的大小

```javascript
let width;
let ratio;
let height;
if (imgWidth > imgHeight) {
    width = dom.current.$(`.img-container`).offsetWidth - 12;
    ratio = Math.ceil((width / imgWidth) * 100);
    height = Math.ceil(imgHeight * ratio / 100);
} else {
    height = dom.current.$(`.img-container`).offsetHeight - 12;
    ratio = Math.ceil((height / imgHeight) * 100);
    width = Math.ceil(imgWidth * ratio / 100);
}
```

### 4、在 PReact 的基础上 如何结合 Sciter 进行组件间的通信

```javascript
const LookImg = (props) => {
     document.off('getImgState-lookImg');
     // 订阅事件 getImgState-lookImg
     document.on('getImgState-lookImg', evt => {
        if (evt.data && evt.data.callback) {
            evt.data.callback({
                state: imgStateRef.current,
                scale: parseFloat(ratioRef.current)
            });
        }
    });
}
```

```javascript
// 发布事件 getImgState-lookImg
let imgState;
document.dispatchEvent(new Event('getImgState-lookImg', {
    data: {
        callback: (res) => imgState = res
    }
}));
console.log('获取到子组件传递的信息', imgState);
```

> 注：`dispatchEvent` 与 `postEvent`有所不同

### 5、dispatchEvent 与 postEvent 区别

* `dispatchEvent` 抛出的事件是**同步**的

* `postEvent` 抛出的事件是**异步**的

<hr/>

## # 使用过程需要注意的地方

### 1、图片地址

通过 `Window.this.selectFile()` 获取图片路径时，可以通过设置 `filter` 来控制选中的文件类型。并且在传入图片地址时，需要将地址进行解码。这里需要注意的地方：要使用 `decodeURIComponent`  进行转码，不要使用 `decodeURI`。

```javascript
const filter = 'img files only(*.jpg, *.png)|*.jpg;*.png';
let path = Window.this.selectFile({ filter, mode: "open" });
 if (path && lookImg.state) {
    // 解码需要使用 decodeURIComponent （用 decodeURI h会有些路径解码不出来）
    path = decodeURIComponent(path).split("file://")[1];
    document.$('.path').innerText = path;

    // 加载图片
    lookImg.look({ imgsrc: path });
}
```



 