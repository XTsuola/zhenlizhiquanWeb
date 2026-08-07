import { get, post } from "../utils/request";

export interface QuestionAddType {
  id?: number;
  name: string;
  time: string;
  info: string;
}

export interface AnswerAddType {
  id?: number;
  questionId: number | undefined;
  name: string;
  time: string;
  content: string;
}

/** 获取问题 */
export const getQuestionList = () => get("/question/list");

/** 新增问题 */
export const questionAdd = (data: QuestionAddType) => post("/question/add", data);

/** 获取问题详情 */
export const questionDetail = () => get("/question/detail");

/** 获取答案 */
export const getAnswerList = (questionId: number | undefined) => get("/answer/list", { questionId });

/** 获取所有答案 */
export const getAnswerAllList = () => get("/answer/allList");

/** 新增答案 */
export const answerAdd = (data: AnswerAddType) => post("/answer/add", data);
