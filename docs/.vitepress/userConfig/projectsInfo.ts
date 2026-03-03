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
  {
    banner: "/project-img/GoAttack.png",
    title: "GoAttack",
    description:
      "GoAttack 是一款运用Go语言作为后端和Vue 3作为前端开发的现代化网络安全扫描分析平台。它被设计用于对标商业级漏洞扫描器，并提供一系列包括主机探测、端点梳理、资产测绘、漏扫POC验证和自动报告等多位一体的安全分析能力。旨在为安全工程师、红蓝渗透测试人员及安全运维管理团队提供一个精练、高效、可扩展且界面友好的集成式作战平台。",
    link: "https://github.com/dragonkeep/GoAttack",
    tag: "Go, Vue3",
  },
];
