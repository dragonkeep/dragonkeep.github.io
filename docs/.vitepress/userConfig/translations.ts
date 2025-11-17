/**
 * 将目录名（或文件名）翻译成自定义名称
 *
 * ! 由于自动路由脚本是按照字典序排列。
 * ! 如果想要实现特定的顺序，请在文件或目录前人为排序。
 * ! 并在该文件中将其名称进行替换。
 */
export const fileName2Title: Record<string, string> = {
  "0tutorial": "使用指南",
  Interviews: "示例文件",
};

/**
 * 自定义文件夹排序
 * 数字越小，排序越靠前
 * 未配置的文件夹将按字母顺序排在后面
 */
export const folderOrder: Record<string, number> = {
  "Note": 1,
  "CTF": 2,
  "Code Audit": 3,
  "Penetration": 4,
};