export class TodoList extends Element {
    value;
    list = [];
    constructor(props) {
        super(); // 必写
    }

    // 组件挂载
    componentDidMount() { }
    
    // 组件销毁前
    componentWillUnmount() { }

    componentUpdate(newdata) {
        if (typeof newdata == "object") {
            Object.assign(this, newdata);
        }
        this.post(() => this.patch(this.render()));
    }

    render() {
        return (
            <div styleset={__DIR__ + "index.css#todolist"}>
                <div class="header">
                    <div class="info">To-Do List</div>
                </div>
                <div class="title">~Today I need to ~</div>
                <div class="form">
                    <div class="form-input">
                        <input type="text" placeholder="Add new todo..." value={this.value} onchange={(event) => this.value = event.target.value} />
                        <button onclick={this.submit}><span class="submit">Submit</span></button>
                    </div>
                </div>
                {this.list.length == 0 && (
                    <div class="empty-todos">
                        <svg class="icon" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="clipboard-check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-v-132cabf7=""><path class="" fill="currentColor" d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm121.2 231.8l-143 141.8c-4.7 4.7-12.3 4.6-17-.1l-82.6-83.3c-4.7-4.7-4.6-12.3.1-17L99.1 285c4.7-4.7 12.3-4.6 17 .1l46 46.4 106-105.2c4.7-4.7 12.3-4.6 17 .1l28.2 28.4c4.7 4.8 4.6 12.3-.1 17z"></path></svg>
                        <span class="todos-text">Congrat, you have no more tasks to do</span>
                    </div>
                )}
                {this.list.length != 0 && (
                    <List data={this.list}
                        finshed={this.finshed}
                        del={this.del}
                    />
                )}
            </div>
        );
    }

    // 提交
    submit = (event) => {
        const value = this.value.trim();
        if (value.length != 0) {

            this.list.unshift({
                id: Math.random(),
                text: value,
                state: false
            });

            this.componentUpdate({
                value: "",
                list: this.list
            });
        }

    }

    // 完成
    finshed = (data) => {
        const i = this.list.findIndex(item => item.id == data.id);
        if (i != -1) this.list[i].state = true;

        this.componentUpdate({ list: this.list });
    }

    // 删除
    del = (data) => {
        data.forEach(item1 => {
            const i = this.list.findIndex(item2 => item2.id == item1.id);
            this.list.splice(i, 1);
        });
        this.componentUpdate({ list: this.list });
    }
}

class List extends Element {
    id; // 组件 id
    Dom; // 组件 DOM

    data = [];

    
    finshed; // 回调 
    del; // 回调

    key = 'All';

    constructor(props) {
        super();
        // 生成唯一 id
        this.id = `list-${Math.ceil(Math.random() * 100)}`;

        this.data = props.data;
        this.finshed = props.finshed;
        this.del = props.del;
    }

    // 挂载前
    componentDidMount() {
        // 保存 list 组件的 Dom 元素
        this.Dom = document.querySelector(`#${this.id}`);
    }

    componentUpdate(newData) {
        if (typeof newdata == "object") {
            this.data = newData.data;
            this.key = newData.key;
        }
        this.post(() => this.patch(this.render()));
    }

    render(props, kids) {
        const activeLen = this.data.filter(item => item.state).length;
        const state = this.data.some(item => item.state);
        const len = this.data.length;
        return (
            <div styleset={__DIR__ + "index.css#list"} id={this.id}>
                <ul class="list">
                    {this.data.map(item => {
                        return (
                            /* key={Math.random()} 使其重新渲染 */
                            <li class={item.state ? 'item active' : 'item'} onclick={this.itemFinshed.bind(this, item)} tag={item.id} key={Math.random()}>
                                <i class='state-icon'></i>
                                <span class='text'>{item.text} </span>
                                <i class='close-icon' onclick={() => this.itemDel(item)}></i>
                            </li>
                        )
                    })}
                </ul>
                <div class="detail">
                    <span>{len} item left</span>
                    <span class={this.key == 'All' ? 'state-active' : ''} onclick={this.itemFilter.bind(this, 'All')}>All</span>
                    <span class={this.key == 'Active' ? 'state-active' : ''} style={(state && activeLen != len) ? '' : 'display: none'} onclick={this.itemFilter.bind(this, 'Active')}>Active</span>
                    <span class={this.key == 'Completed' ? 'state-active' : ''} style={(state && activeLen != len) ? '' : 'display: none'} onclick={this.itemFilter.bind(this, 'Completed')}>Completed</span>
                    <span class={this.key == 'Clear completed' ? 'state-active' : ''} style={state ? '' : 'display: none'} onclick={this.clearCompleted.bind(this)}>Clear completed</span>
                </div>
            </div>
        )
    }

    // 完成
    itemFinshed = (item, event) => {
        if (!event.target.classList.contains('close-icon')) {
            this.finshed && this.finshed(item);
        }
    }

    // 删除
    itemDel = (item) => {
        this.del && this.del([item]);
    }

    // 清除完成
    clearCompleted = () => {
        const completedList = this.data.filter(item => item.state);
        this.del && this.del(completedList);
    } 

    // 过滤
    itemFilter = (key) => {
        const children = this.Dom.querySelector(`.list`).children;
        const stateList = this.Dom.querySelector(`.detail`).children;

        Array.from(stateList).forEach(item => { item.classList.remove('state-active') });

        const activeList = this.data.filter(item => !item.state);
        const completedList = this.data.filter(item => item.state);

        // 手动操作 DOM
        Array.from(children).forEach(item => {
            const id = item.getAttribute('tag');

            if (key == 'All') {
                stateList[1].classList.add('state-active');
                Object.assign(item.style, { display: 'block' });
            }

            if (key == 'Active') {
                stateList[2].classList.add('state-active');
                const i = activeList.findIndex(activeItem => activeItem.id == id);
                const style = i != -1 ? { display: 'block' } : { display: 'none' };
                Object.assign(item.style, style);
            }

            if (key == 'Completed') {
                stateList[3].classList.add('state-active');
                const i = completedList.findIndex(activeItem => activeItem.id == id);
                const style = i != -1 ? { display: 'block' } : { display: 'none' };
                Object.assign(item.style, style);
            }
        });
    }
}

