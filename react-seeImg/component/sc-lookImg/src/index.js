import { useLayoutEffect, useState, useEffect, useRef } from '../../../util/preact';


// 根据当前图片缩放比例，计算新的图片比例
const useImgRatio = (cur, state) => {
  const ratioList = [10, 15, 20, 40, 60, 80, 100];
  const MIN = 10;
  const SPACE = 25;
  const len = ratioList.length;
  let newRatio;

  // 放大
  if (state) {
    for (let i = 0; i < len; i++) {
      const val = ratioList[i];
      if (val > cur) {
        newRatio = val;
        break;
      };
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
  const [orginImage, setOrginImage] = useState({});
  const [currentImage, setCurrentImage] = useState({});
  const [ratio, setRatio] = useState();

  const dom = useRef();
  const imgStyle = useRef();

  // 挂载后
  useEffect(() => {
    dom.current = document.querySelector(`#${props.config.id}`);
  }, []);


  // 监听 （在渲染前监听 imgsrc 的变化）
  useLayoutEffect(async () => {
    if (props.config.imgsrc) {
      const image = await Graphics.Image.load(props.config.imgsrc);

      imgStyle.current = `width: ${image.width}px; height: ${image.height}px`;
      setOrginImage(image);
      setCurrentImage(image);
      setRatio('100%');
    }
  }, [props.config.imgsrc]);


  // 放大
  const enlarge = () => {
    console.log(123);
    if (props.config.imgsrc) {

      const newRatio = useImgRatio(parseInt(ratio.split('%')[0]), true);
      const width = Math.ceil(orginImage.width * newRatio / 100);
      const height = Math.ceil(orginImage.height * newRatio / 100);

      imgStyle.current = `width: ${width}px; height: ${height}px;`;
      setRatio(`${newRatio}%`);
      setCurrentImage({ width, height });
    }
  }

  // 缩小
  const shrink = () => {
    if (props.config.imgsrc) {
      const newRatio = useImgRatio(parseInt(ratio.split('%')[0]), false);
      const width = Math.ceil(orginImage.width * newRatio / 100);
      const height = Math.ceil(orginImage.height * newRatio / 100);

      imgStyle.current = `width: ${width}px; height: ${height}px;`;
      setRatio(`${newRatio}%`);
      setCurrentImage({ width, height });
    }
  }

  // 实际大小
  const origin = () => {
    if (props.config.imgsrc) {
      const width = orginImage.width;
      const height = orginImage.height;

      imgStyle.current = `width: ${width}px; height: ${height}px;`;
      setCurrentImage({ width, height });
      setRatio(`100%`);
    }

  }

  // 自适应
  const adaptation = () => {
    if (props.config.imgsrc) {
      const imgWidth = orginImage.width;
      const imgHeight = orginImage.height;

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

      imgStyle.current = `width: ${width}px; height: ${height}px;`;
      setCurrentImage({ width, height });
      setRatio(`${ratio}%`);
    }
  }

  return (
    <div class="lookImg " styleset={__DIR__ + "index.css#look-img"} id={props.config.id}>
      <div class="img-container">
        <img src={props.config.imgsrc || ''} style={imgStyle.current || ''} />
      </div>
      <div class="img-option">
        <div class="item">{orginImage.width || 0} * {orginImage.height || 0}</div>
        <div class="item">{currentImage.width || 0} * {currentImage.height || 0}</div>
        <div class="item" style="width: 60px;">{ratio || 0}</div>
        <div class="item">
          <span class="enlarge" οnclick={enlarge} title="放大"></span>
          <span class="shrink" οnclick={shrink} title="缩小"></span>
          <span class="origin" οnclick={origin} title="实际大小"></span>
          <span class="adaptation" οnclick={adaptation} title="适应窗口"></span>
        </div>
      </div>
    </div>
  )
}
