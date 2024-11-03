import * as hmUI from "@zos/ui";
import { getText } from "@zos/i18n";
import { setPageBrightTime } from "@zos/display";

import * as STYLE from "zosLoader:./index.[pf].layout.js";
import { ZMarkdown } from "../libs/ZMarkdown";

Page({
    onInit() {
        console.log("onInit");
        if (
            setPageBrightTime({
                brightTime: 60000,
            }) === 0
        ) {
            console.log("setPageBrightTime success");
        }
    },
    build() {
        const markdown_text = ZMarkdown.createWidget(hmUI.widget.TEXT, {
            ...STYLE.MARKDOWN_TEXT,
            text: `# Zeppos-Markdown-Renderer
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
----------------
普通文本测试

----------------
*斜体文本* 或 _1_
**粗体文本** 或 __粗体文本__
***粗斜体文本*** 或 ___粗斜体文本___
----------------
- 项目1
- 项目2
  - 子项目1
+ 项目1
+ 项目2
  + 子项目1
----------------
1. 第一项
2. 第二项
1. 子项1
----------------
[链接文本](https://docs.zepp.com/zh-cn/docs/intro/)
----------------
> 这是一个引用
>> 这是一个二级引用
>>> 这是一个三级引用
>>>>>>>>>>>>> 这是一个N级引用
----------------
***
___
\`1\` 2\`3\`4\`5\`6\`7\`
\`\`\`shell
code block
fuckyou
\`\`\`
\`\`\`shell
code block
fuckyou
\`\`\`

----------------


`,
        });
    },
});
