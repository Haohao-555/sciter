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