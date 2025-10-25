interface Project {
  banner: string; // 图片链接
  title: string; // 项目标题
  description: string; // 项目简介
  link: string; // 项目链接
  tag?: string; // 项目标签
}

/**
 * TODO: 缺项处理
 * 在此处填写你的项目介绍
 */
export const projectsInfo: Project[] = [
  {
    banner: "/project-img/GoSSRF.png",
    title: "GoSSRF",
    description:
      "一款用Go语言编写的SSRF（Server-Side Request Forgery）漏洞检测工具，可以自动测试网站参数是否存在SSRF漏洞。",
    link: "https://github.com/dragonkeep/GoSSRF",
    tag: "Go",
  },

];
