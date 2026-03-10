/// <reference types="vite/client" />

import { HTMLAttributes } from 'vue';
import Breadcrumb from 'echarts/types/src/chart/treemap/Breadcrumb.js'
import 'vue-router'

type AsldeMenuType = "group" | "folder" | "menu";

declare module 'vue-router' {
  interface RouteMeta {
    menuType?: AsldeMenuType,
    icon: string,
    key?: string,
    iconType?: "file" | "iconfont"
    label?: string
    hidden?: boolean,
    extendsRoute?: string,
    breadcrumbs?: Breadcrumb[],
    style?: any | HTMLAttributes["style"]
    isLevel?: number[]
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_BASE_WS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}