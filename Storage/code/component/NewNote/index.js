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