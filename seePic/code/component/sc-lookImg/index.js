import { LookImg } from './src/index';
import { render } from '../../util/preact';
import { uuid } from "@sciter";
export class ScLookImg {
    id = `look-img-${uuid()}`; // 组件唯一 id
    container; // 容器

    // ! adapt：自适应; oto：按原图片大小; scale：缩放状态
    STATE = ['oto', 'scale', 'adapt'];
    INITSTATE = this.STATE[0];

    constructor(config = {}) {
        this.container = document.querySelector(config.container);
        if (!this.container) return { state: false, message: `容器 ${config.container} 找不到` };

        render(<LookImg config={{ id: this.id }} />, this.container);

        return {
            id: this.id,
            state: true,
            lookImg: this.lookImg,
            changeImgState: this.changeImgState,
            getImgState: this.getImgState
        };
    }

    formatImgState = (imgState = {}) => {
        const config = Object.assign({}, imgState);
        // 参数处理 （确保传入到组件的数据为合法数据）
        if (!this.STATE.includes(config.state)) {
            config.state = this.INITSTATE;
            config.scale = 100;
        } else {
            switch (config.state) {
                case 'adapt':
                    config.scale = -1;
                    break;
                case 'oto':
                    config.scale = 100;
                    break;
                case 'scale':
                    if (!config.scale || parseInt(config.scale) < 10) config.scale = 10;
                    config.scale = parseInt(config.scale);
                    break;
            }
        }
        return config;
    }

    lookImg = (config = {}) => {
        if (config.imgsrc) {
            Object.assign(config, { id: this.id });
            render(<LookImg config={config} />, this.container);
        }
    }

    // 改变图片状态
    changeImgState = (config = {}) => {
        // ! 必须使用 postEvent 发布事件，否则组件内部读取存放图片容器大小会出现比较大的偏差
        document.postEvent(new Event('changeImgState-lookImg', {
            data: this.formatImgState(config)
        }));
    }

    // 获取图片当前状态
    getImgState = () => {
        let imgState = {};

        /**
         *  ! 使用了闭包的方式获取图片状态，向 dom 层抛出事件时 在该方法中必须使用 dispatchEvent
         * 
         *  ? dispatchEvent 与 postEvent 的区别
         *    1、dispatchEvent 抛出的事件是同步的
         *    2、postEvent 抛出的事件是异步的
         *  
         *  在该方法中是使用了闭包的方式去获取图片状态的，故不能在获取图片状态的过程不能出现异步任务
         */
        document.dispatchEvent(new Event('getImgState-lookImg', {
            data: {
                callback: (res) => imgState = res
            }
        }));

        return imgState;
    }
}