import { get, post, del } from "../utils/request";

export interface MemberAddType {
  id?: number;
  name: string;
  donation: number;
  reward: number;
  score: number | null;
  title?: string;
  remark?: string;
}

/** 新增成员 */
export const memberAdd = (data: MemberAddType) => post("/member/add", data);

/** 修改成员 */
export const memberUpdate = (data: MemberAddType) => post(`/member/update/${data.id}/`, data);

/** 获取所有成员 */
export const getMemberList = () => get("/member/list");

/** 获取奖励榜（reward > 0） */
export const getRewardList = () => get("/memberReward/list/");

/** 删除成员 */
export const memberDelete = (id: number) => del(`/member/delete/${id}/`);
