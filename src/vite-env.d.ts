/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "vue-router" {
  interface RouteMeta {
    menuType?: "group" | "folder" | "menu";
    icon?: string;
    key?: string;
    iconType?: "file" | "iconfont";
    label?: string;
    hidden?: boolean;
    extendsRoute?: string;
    breadcrumbs?: unknown[];
    style?: unknown;
    isLevel?: number[];
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_BASE_WS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
