# Zeppos-Markdown-Renderer

## Usage

```js
import * as hmUI from "@zos/ui";
import { ZMarkdown } from "../libs/ZMarkdown";
...

const markdown_text = ZMarkdown.createWidget(hmUI.widget.TEXT, {
    ...MARKDOWN_TEXT,
    text: "Markdown Text",
});

// example style
const MARKDOWN_TEXT = {
    x: 20,
    y: 20,
    w: px(440),
    h: 400,
    text_size: 24,
    align_h: hmUI.align.LEFT,
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.NONE,
};

```
