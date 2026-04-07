import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/views/home.vue";

const routeList: any = [
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
    component: () => import("@/views/zhongzu/gradeList.vue")
  },
  {
    path: "/cardTag",
    name: "cardTag",
    component: () => import("@/views/zhongzu/tagList.vue")
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
    path: "/resource",
    name: "resource",
    component: () => import("@/views/source/resource.vue")
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
    path: "/deepseek",
    name: "deepseek",
    component: () => import("@/views/ai/deepseek.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routeList
});

// 路由拦截
router.beforeEach((to, from, next) => {
  next();
});

export default router;
