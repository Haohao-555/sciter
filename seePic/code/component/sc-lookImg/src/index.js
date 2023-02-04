import { useState, useEffect, useRef, useLayoutEffect } from '../../../util/preact';


// 根据当前图片缩放比例，计算新的缩放比例
const useImgRatio = (cur = 10, state = true) => {
    // 最小缩小值
    const MIN = 10;
    // 超过 100 后的每次添加的比例 
    const SPACE = 25;
    // !按升序排列
    const ratioList = [MIN, 15, 20, 40, 60, 80, 100];
    const len = ratioList.length;
    let newRatio;

    // 放大
    if (state) {
        for (let i = 0; i < len; i++) {
            const val = ratioList[i];
            if (val > cur) {
                newRatio = val;
                break;
            }
        }
    }

    // 缩小
    if (!state && ratioList[len - 1] >= cur) {
        for (let i = 0; i < len; i++) {
            const val = ratioList[i];
            if (val < cur) {
                newRatio = val;
            }
        }
    }


    if (!newRatio) {
        if (state) newRatio = cur + SPACE;
        if (!state) newRatio = cur - SPACE < MIN ? MIN : cur - SPACE;
    }

    return newRatio;
}

export const LookImg = (props) => {

    console.log('LookImg props', props);

    // 组件 LookImg DOM
    const domRef = useRef();
    useEffect(() => domRef.current = document.$(`#${props.config.id}`), []);

    // ! 2像素是存放图片容器边框大小
    const MARGIN = 2;

    // 图片样式
    const imgStyleRef = useRef();
    // ! adapt：自适应; oto：按原图片大小; scale：缩放状态
    const imgStateRef = useRef({});
    // 缩放比例
    const ratioRef = useRef('');


    // 响应式数据
    const [orginImage, setOrginImage] = useState({});
    const [currentImage, setCurrentImage] = useState({});
    const [ratio, setRatio] = useState();


    // 缩放： 修改当前图片大小及缩放比例
    const changeImgRatio = (currentRatio = 10) => {
        const width = parseInt((orginImage.width) * currentRatio / 100);
        const height = parseInt((orginImage.height) * currentRatio / 100);
        imgStyleRef.current = `width: ${width}px; height: ${height}px;`;

        setRatio(`${currentRatio}%`);
        setCurrentImage({ width, height });
    }

    // 宽度自适应
    const widthAdapt = () => {
        const imgWidth = orginImage.width;
        const imgHeight = orginImage.height;

        const width = domRef.current.$(`.img-container`).offsetWidth - MARGIN;
        const newRatio = (width / imgWidth * 100).toFixed(2);
        const height = Math.ceil(imgHeight * newRatio / 100);

        imgStyleRef.current = `width: ${width}px; height: ${height}px;`;

        setCurrentImage({ width, height });
        setRatio(`${newRatio}%`);

        ratioRef.current = newRatio;
        imgStateRef.current = 'adapt';
    }

    // 高度自适应
    const heightAdapt = () => {
        const imgWidth = orginImage.width;
        const imgHeight = orginImage.height;

        const height = domRef.current.$(`.img-container`).offsetHeight - MARGIN;
        const newRatio = (height / imgHeight * 100).toFixed(2);
        const width = Math.ceil(imgWidth * newRatio / 100);

        imgStyleRef.current = `width: ${width}px; height: ${height}px;`;

        setCurrentImage({ width, height });
        setRatio(`${newRatio}%`);

        ratioRef.current = newRatio;
        imgStateRef.current = 'adapt';
    }

    // 放大
    const enlarge = () => {
        if (props.config.imgsrc) {
            console.log('enlarge');

            // 获取当前缩放值的下一个放大比例
            const newRatio = useImgRatio(parseInt(ratio.split('%')[0]), true);
            changeImgRatio(newRatio);

            imgStateRef.current = 'scale';
            ratioRef.current = newRatio;
        }
    }

    // 缩小
    const shrink = () => {
        if (props.config.imgsrc) {
            console.log('shrink');

            const newRatio = useImgRatio(parseInt(ratio.split('%')[0]), false);
            changeImgRatio(newRatio);

            imgStateRef.current = 'scale';
            ratioRef.current = newRatio;
        }
    }

    // 实际大小
    const oto = () => {
        if (props.config.imgsrc) {
            console.log('oto');

            changeImgRatio(100);

            imgStateRef.current = 'oto';
            ratioRef.current = 100;
        }
    }

    // 自适应
    const adapt = () => {
        if (props.config.imgsrc) {
            console.log('adap');

            const imgSizeType = orginImage.width > orginImage.height;
            const width = domRef.current.$(`.img-container`).offsetWidth - MARGIN;
            const height = domRef.current.$(`.img-container`).offsetHeight - MARGIN;

            const resetImg = () => {
                imgStateRef.current = 'adapt';
                ratioRef.current = 100;
                changeImgRatio(100);
            }

            // 自适应
            if (imgSizeType) { // 宽度自适应

                if (orginImage.width <= width) { // 容器能够在图片不缩放的情况下自适应图片宽度
                    if (ratio.current != 100) resetImg();
                } else {
                    widthAdapt();
                }

            } else { // 高度自适应

                if (orginImage.imgHeight <= height) { // 容器能够在图片不缩放的情况下自适应图片高度
                    if (ratio.current != 100) resetImg();
                } else {
                    heightAdapt();
                }

            }
        }
    }


    // 订阅事件 getImgState-lookImg
    document.off('getImgState-lookImg');
    document.on('getImgState-lookImg', evt => {
        if (props.config.imgsrc && evt.data && evt.data.callback) {
            console.log('on getImgState-lookImg');

            evt.data.callback({
                state: imgStateRef.current,
                scale: parseFloat(ratioRef.current)
            });
        }
    });

    // 订阅事件 changeImgState-lookImg
    document.off('changeImgState-lookImg');
    document.on('changeImgState-lookImg', evt => {
        console.log('on getImgState-lookImg');

        switch (evt.data.state) {
            case 'adapt':
                adapt();
                break;
            case 'oto':
                oto();
                break;
            case 'scale':
                changeImgRatio(evt.data.scale);
                imgStateRef.current = evt.data.state;
                ratioRef.current = evt.data.scale;
                break;
        }
    });


    // 处理加载图片信息
    useLayoutEffect(() => {
        if (props.config.imgsrc) {
            // ! 图片加载过程是异步的
            (async () => {
                const img = await Graphics.Image.load(props.config.imgsrc);
                imgStyleRef.current = `width: ${img.width}px; height: ${img.height}px;`;

                setRatio('100%');
                setOrginImage(img);
                setCurrentImage(img);
               
                imgStateRef.current = 'oto';
                ratioRef.current = 100;
            })();
        }
    }, [props.config.imgsrc]);


    return (
        <div class="lookImg" styleset={__DIR__ + "index.css#look-img"} id={props.config.id}>
            <div class="img-container">
                <img src={props.config.imgsrc || ''} style={imgStyleRef.current || ''} />
            </div>
            <div class="img-option">
                <div class="item">{orginImage.width || 0} * {orginImage.height || 0}</div>
                <div class="item">{currentImage.width || 0} * {currentImage.height || 0}</div>
                <div class="item" style="width: 60px;">{ratio || 0}</div>
                <div class="item">
                    <span class="enlarge" onclick={enlarge} title="放大"></span>
                    <span class="shrink" onclick={shrink} title="缩小"></span>
                    <span class="origin" onclick={oto} title="实际大小"></span>
                    <span class="adaptation" onclick={adapt} title="适应窗口"></span>
                </div>
            </div>
        </div>
    )
}