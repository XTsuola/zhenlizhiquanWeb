import "vue-router";

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

export {};
