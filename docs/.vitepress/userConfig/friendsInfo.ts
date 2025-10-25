interface Friend {
  avatar: string; // 头像链接
  name: string; // 用户 id
  link: string; // 博客链接
  title?: string; // 用户头衔
  tag?: string; // 用户标签
  color?: string; // 标签颜色
}

/**
 * TODO: 缺项处理
 * 在此处填写你的友情链接
 */
export const friendsInfo: Friend[] = [
  {
    avatar: "https://bfs.iloli.moe/logo.png",
    name: "IceCliffs",
    title: "全栈",
    link: "https://iloli.moe/",
    tag: "CTFer",
    color: "indigo",
  },
  {
    avatar: "https://gitlab.com/brokenpoems/picture/-/raw/master/Avatar(800).png",
    name: "brokenpoems",
    title: "算法&CTF",
    link: "https://www.brokenpoems.xyz/",
    tag: "CTFer",
    color: "sky",
  },
];
