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