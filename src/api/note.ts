import { get, post, del } from "../utils/request";

export interface NoteAddType {
  id?: number;
  name: string;
  title: string;
  time: string;
  content: string;
}

/** 获取留言 */
export const getNoteList = () => get("/note/list");

/** 新增留言 */
export const noteAdd = (data: NoteAddType) => post("/note/add", data);

/** 删除留言 */
export const noteDelete = (id: string) => del("/note/delete", { id });
