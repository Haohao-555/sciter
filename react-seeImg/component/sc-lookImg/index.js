import { LookImg } from './src/index';
import { render } from '../../util/preact';
import { uuid } from "@sciter";
export class ScLookImg {
    id; // 组件唯一 id
    container; // 容器
    constructor(config = {}) {
        this.id = `look-img-${uuid()}`;
        this.container = document.querySelector(config.container);

        if (!this.container) return { state: false, message: `容器 ${config.container} 找不到` };

        render(<LookImg config={{ id: this.id }} />, this.container);

        return { state: true, look: this.look, id: this.id };
    }

    look = (config = {}) => {
        render(<LookImg config={config} />, this.container);
    }
}
