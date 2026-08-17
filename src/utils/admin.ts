/** 管理员角色：super 超级管理员，normal 普通管理员 */
export type AdminRole = "super" | "normal";

const ADMIN_KEY = "isAdmin";

/** 兼容旧值 admin 视为超级管理员 */
export const isSuperAdmin = () => {
  const role = sessionStorage.getItem(ADMIN_KEY);
  return role === "super" || role === "admin";
};

export const isNormalAdmin = () => sessionStorage.getItem(ADMIN_KEY) === "normal";

/** 任意管理员（超级 / 普通） */
export const isAdmin = () => {
  const role = sessionStorage.getItem(ADMIN_KEY);
  return role === "super" || role === "normal" || role === "admin";
};

export const getAdminRole = (): AdminRole | null => {
  const role = sessionStorage.getItem(ADMIN_KEY);
  if (role === "super" || role === "admin") return "super";
  if (role === "normal") return "normal";
  return null;
};

export const setAdminRole = (role: AdminRole) => {
  sessionStorage.setItem(ADMIN_KEY, role);
};

export const clearAdminRole = () => {
  sessionStorage.removeItem(ADMIN_KEY);
};

/** 普通管理员可访问的路径 */
export const NORMAL_ADMIN_PATHS = ["/msgDetail", "/cardGrade", "/gradeOutline", "/admin"] as const;

export const canAccessAdminPath = (path: string) => {
  if (isSuperAdmin()) return true;
  if (!isAdmin()) return false;
  return (NORMAL_ADMIN_PATHS as readonly string[]).some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
};
