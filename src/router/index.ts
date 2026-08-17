import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { message } from "ant-design-vue";
import Home from "@/views/home.vue";
import { isAdmin, isSuperAdmin } from "@/utils/admin";

/** 需管理员登录的后台路径；未标 superOnly 的普通管理员也可进（图表 / 卡牌评级） */
const ADMIN_GUARD_PATHS = [
  { path: "/msgDetail", superOnly: false },
  { path: "/cardGrade", superOnly: false },
  { path: "/gradeOutline", superOnly: false },
  { path: "/cardsAdmin", superOnly: true },
  { path: "/passwordAdmin", superOnly: true },
  { path: "/logList", superOnly: true },
  { path: "/questionAdmin", superOnly: true },
  { path: "/answerAdmin", superOnly: true },
  { path: "/skinDiyAdmin", superOnly: true }
] as const;

const routeList: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    name: "home",
    component: Home
  },
  {
    path: "/zhongzu",
    name: "zhongzu",
    component: () => import("@/views/zhongzu/index.vue")
  },
  {
    path: "/cardGrade",
    name: "cardGrade",
    component: () => import("@/views/admin/gradeList.vue")
  },
  {
    path: "/gradeOutline",
    name: "gradeOutline",
    component: () => import("@/views/admin/gradeOutlineList.vue")
  },
  {
    path: "/cardOutline",
    name: "cardOutline",
    component: () => import("@/views/zhongzu/cardOutlineList.vue")
  },
  {
    path: "/shenqi",
    name: "shenqi",
    component: () => import("@/views/shenqi/index.vue")
  },
  {
    path: "/chongwu",
    name: "chongwu",
    component: () => import("@/views/chongwu/index.vue")
  },
  {
    path: "/yiji",
    name: "yiji",
    component: () => import("@/views/source/yiji.vue")
  },
  {
    path: "/resourceCard",
    name: "resourceCard",
    component: () => import("@/views/source/resourceCard.vue")
  },
  {
    path: "/resourceShenqi",
    name: "resourceShenqi",
    component: () => import("@/views/source/resourceShenqi.vue")
  },
  {
    path: "/resourceGuzhi",
    name: "resourceGuzhi",
    component: () => import("@/views/source/resourceGuzhi.vue")
  },
  {
    path: "/heroList",
    name: "heroList",
    component: () => import("@/views/hero/heroList.vue")
  },
  {
    path: "/chongwuSkillList",
    name: "chongwuSkillList",
    component: () => import("@/views/chongwu/skillList.vue")
  },
  {
    path: "/shardList",
    name: "shardList",
    component: () => import("@/views/hero/shardList.vue")
  },
  {
    path: "/skinList",
    name: "skinList",
    component: () => import("@/views/skin/skinList.vue")
  },
  {
    path: "/skinDiyList",
    name: "skinDiyList",
    component: () => import("@/views/diy/skinDiyList.vue")
  },
  {
    path: "/cardDiyList",
    name: "cardDiyList",
    component: () => import("@/views/diy/cardDiyList.vue")
  },
  {
    path: "/chongwuStar",
    name: "chongwuStar",
    component: () => import("@/views/chongwu/star.vue")
  },
  {
    path: "/gameMenu",
    name: "gameMenu",
    component: () => import("@/views/shijiesai/menu.vue")
  },
  {
    path: "/gameList",
    name: "gameList",
    component: () => import("@/views/shijiesai/gameList.vue")
  },
  {
    path: "/gameAdd",
    name: "gameAdd",
    component: () => import("@/views/shijiesai/gameAdd.vue")
  },
  {
    path: "/gameUpdate",
    name: "gameUpdate",
    component: () => import("@/views/shijiesai/gameUpdate.vue")
  },
  {
    path: "/gameDetail",
    name: "gameDetail",
    component: () => import("@/views/shijiesai/gameDetail.vue")
  },
  {
    path: "/gameAnalysisList",
    name: "gameAnalysisList",
    component: () => import("@/views/shijiesai/gameAnalysis/index.vue")
  },
  {
    path: "/gameAnalysis/listAll",
    name: "gameAnalysisAll",
    component: () => import("@/views/shijiesai/gameAnalysis/index0.vue")
  },
  {
    path: "/gameAnalysis/gameCompare",
    name: "gameCompare",
    component: () => import("@/views/shijiesai/gameAnalysis/index2.vue")
  },
  {
    path: "/gameAnalysis/list8",
    name: "gameAnalysis8",
    component: () => import("@/views/shijiesai/gameAnalysis/index8.vue")
  },
  {
    path: "/gameAnalysis/list4",
    name: "gameAnalysis4",
    component: () => import("@/views/shijiesai/gameAnalysis/index4.vue")
  },
  {
    path: "/gameAnalysis/heroList",
    name: "gameAnalysisHeroList",
    component: () => import("@/views/shijiesai/gameAnalysis/index1.vue")
  },
  {
    path: "/gameAnalysis/zhongzuList",
    name: "gameAnalysisZhongzuList",
    component: () => import("@/views/shijiesai/gameAnalysis/index3.vue")
  },
  {
    path: "/cardsList",
    name: "cardsList",
    component: () => import("@/views/cardFrequency/list.vue")
  },
  {
    path: "/cardsDetail",
    name: "cardsDetail",
    component: () => import("@/views/cardFrequency/detail.vue")
  },
  {
    path: "/cardsUpload",
    name: "cardsUpload",
    component: () => import("@/views/cardFrequency/upload.vue")
  },
  {
    path: "/cardsAdmin",
    name: "cardsAdmin",
    component: () => import("@/views/admin/frequencyAdmin.vue")
  },
  {
    path: "/skinDiyAdmin",
    name: "skinDiyAdmin",
    component: () => import("@/views/admin/skinDiyAdmin.vue")
  },
  {
    path: "/passwordAdmin",
    name: "passwordAdmin",
    component: () => import("@/views/admin/passwordAdmin.vue")
  },
  {
    path: "/logList",
    name: "logList",
    component: () => import("@/views/note/logList.vue")
  },
  {
    path: "/msgDetail",
    name: "msgDetail",
    component: () => import("@/views/note/msgDetail.vue")
  },
  {
    path: "/note",
    name: "note",
    component: () => import("@/views/note/index.vue")
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/views/admin/editAdmin.vue")
  },
  {
    path: "/qingshu",
    name: "qingshu",
    component: () => import("@/views/qingshu/login.vue")
  },
  {
    path: "/qingshuRoom",
    name: "qingshuRoom",
    component: () => import("@/views/qingshu/index.vue")
  },
  {
    path: "/menuTools",
    name: "menuTools",
    component: () => import("@/views/tools/menu.vue")
  },
  {
    path: "/heroZuanshiTools",
    name: "heroZuanshiTools",
    component: () => import("@/views/tools/heroZuanshi.vue")
  },
  {
    path: "/shenqiTools",
    name: "shenqiTools",
    component: () => import("@/views/tools/shenqi.vue")
  },
  {
    path: "/zuanshishouruTools",
    name: "zuanshishouruTools",
    component: () => import("@/views/tools/zuanshishouru.vue")
  },
  {
    path: "/questionHistory",
    name: "questionHistory",
    component: () => import("@/views/question/history.vue")
  },
  {
    path: "/question",
    name: "question",
    component: () => import("@/views/question/index.vue")
  },
  {
    path: "/questionAdmin",
    name: "questionAdmin",
    component: () => import("@/views/admin/questionAdmin.vue")
  },
  {
    path: "/answerAdmin",
    name: "answerAdmin",
    component: () => import("@/views/admin/answerAdmin.vue")
  },
  {
    path: "/member",
    name: "member",
    component: () => import("@/views/member/index.vue")
  },
  {
    path: "/reward",
    name: "reward",
    component: () => import("@/views/member/reward.vue")
  },
  {
    path: "/position",
    name: "position",
    component: () => import("@/views/simulation/position.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routeList
});

router.beforeEach((to) => {
  const guard = ADMIN_GUARD_PATHS.find(
    (item) => to.path === item.path || to.path.startsWith(`${item.path}/`)
  );
  if (!guard) return true;

  if (!isAdmin()) {
    message.warning("请先激活管理员");
    return { path: "/admin" };
  }
  if (guard.superOnly && !isSuperAdmin()) {
    message.warning("当前账号无权限访问该页面");
    return { path: "/admin" };
  }
  return true;
});

export default router;
