## # 原理

组件数据持久化指的是：重新加载组件后，能否将重新加载前组件所存在的数据，在重新加载后数据依旧保存在组件中。

组件数据持久化实现原理：将每次更新组件数据同步到 Storage 中。并且监听组件重新加载（刷新），**在刷新前将 Storage 关闭（确保数据不丢失）。当加载完毕后，组件从 Storage 中取出数据**。

<hr/>

## # 案例

> 下诉案例是使用 JSX + Stroage 实现一个日志列表

[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-DO6iTylX-1672819990822)(C:\Users\huangjh\Desktop\1.png)]

### # 页面

```html
<script type="module">
   import { NewNote, NoteList } from './component/index';
   globalThis.NoteList = NoteList;
   globalThis.NewNote = NewNote;
</script>
<reactor|NoteList>
<reactor|NewNote>    
```

### # NewNote 组件

```jsx
import * as DB from "../../storage/index";
export class NewNote extends Element {
    render() {
        return (
            <form styleset={__DIR__ + "index.css#new"}>
                <plaintext novalue="type Markdown text here" />
                <button>Add</button>
            </form>
        );
    }

    ["on click at button"](evt, button) {
        let plaintext = this.$("plaintext");
        if (plaintext.value) {
            // 将数据保存到 Storage 中
            new DB.Note(plaintext.value);
            plaintext.value = "";
        }
    }
}
```

### # NoteList 组件

```jsx
import * as DB from "../../storage/index";
export class NoteList extends Element {
  constructor() {
    super();
    // 订阅事件 new-note 
    document.on("new-note", (evt) => {
      console.log('新增加的数据:', evt.data); // 新增加的数据
      // 组件更新
      this.componentUpdate();
    });
  }

  render() {
    let list = [];

    /**
     * DB.Note.all() 从 Storage 中取出数据 
     * 需通过 for of 进行遍历
     */
    for (let note of DB.Note.all()) {
      list.push(
        <div class="note" key={note.id}>
          <div class="date">{note.date.toLocaleString()}</div>
          <div class="text" state-html={note.text} />
        </div>
      );
    }
    return <section styleset={__DIR__ + "index.css#list"}>{list}</section>
  }
}
```

<hr/>

## # Storage

```javascript
import * as Storage from "@storage";
import * as Sciter from "@sciter";


// 创建 Storage 存储空间 note.db
let storage = Storage.open(URL.toPath(__DIR__ + "/note.db"));

// 将指针 root 指向 storage 中的根元素 storage.root
let root = storage.root || initDb(storage);

// 初始化 storage 中数据，并将 storage 中的根元素 storage.root
function initDb(storage) {
    storage.root = {
        // 版本号
        version: 1,
        // 数据索引，通过索引可以获取到数据
        notesById: storage.createIndex("string", true)

        /**
         *   storage.createIndex 参数说明
         *   第一个参数：索引类型 支持 string | integer | long | float | date
         *   第二个参数： true | false
         *        * true 代表 索引是唯一（即一个索引对应一条数据）
         *        * false 代表 索引不唯一（即一个索引可能对应多条数据）比如：索引为 时间类型
         */

        // notesByDate: storage.createIndex("date", false), 
    }
    return storage.root;
}

// 在刷新前将 storage 关闭 
document.on("beforeunload", function () {
    // 将 storage 关闭
    storage.close();
    // 将 root 指针置空
    root = undefined;
    // 将 storage 置空
    storage = undefined;
});

export class Note {

    constructor(text, date = undefined, id = undefined) {
        this.id = id || Sciter.uuid(); // 生成唯一标识符
        this.date = date || new Date();
        this.text = text;

        // 将数据 this 绑定到索引 notesById 上，且索引值设置为 this.id
        root.notesById.set(this.id, this);
        // root.notesByDate.set(this.date, this);

        // 提交
        storage.commit(); 

        // 发布事件 new-note （在组件 NoteList 已经订阅该事件）
        document.post(new Event("new-note", { bubbles: true,  data: this }));
    }

    delete() {
        // 将索引 notesById 值 为 this.id 下的数据删除 （索引唯一）
        root.notesById.delete(this.id);

        /**
         * 索引不唯一的情况下，删除指定数据
         *  root.notesByDate.delete(this.date, this);
         */
    }

    // 获取索引notesById值 为 id 下的数据
    static getById(id) {
        return storage.root.notesById.get(id); 
    }

    // 获取指定索引下的所有数据
    static all() { 
        // 获取 notesById 索引下的所有数据
        return root.notesById;
        // return root.notesByDate;
    }
}
```

<hr/>

## # 总结

组件数据持久化关键点在于借助 Storage 存储

## # 其他

```css
@set list {
    :root {
        margin-top: 20px;
        size:*;
        overflow-y:auto;
        border-spacing:1em;
    } 
    :root .note {
        margin: auto;
        padding: 6px;
        box-sizing: border-box;
        margin-bottom: 12px;
        background: hsla(0,0%,100%,.5);
        border-radius: 12px 8px 8px 12px;
        border: hsla(0,0%,100%,.5);
        box-shadow:  0px 0px 12px rgba(0,0,0,0.12);
    }

    :root .note:hover {
        cursor: pointer;
        box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.2)
    }

    :root .note .date {
        line-height: 24px;
        font-size: 12px;
    }
    :root .note .text {
        font-size: 16px;
        padding: 12px 0px;
    }
}
@set new {
    :root {
        flow:horizontal;
        height:3.6em;
    }

    :root > plaintext {
        size:*;
    }

    :root > plaintext:empty::marker {
        content:attr(novalue);
        size:*;
        color:#888;
        z-index:-1;
        text-align:center;
        vertical-align:middle;
    }

    :root > button {
        display:block;
        padding:* 1em;
    }
}
```