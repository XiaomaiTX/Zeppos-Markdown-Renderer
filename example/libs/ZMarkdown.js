import * as hmUI from "@zos/ui";
import * as zosPage from "@zos/page";
import { px } from "@zos/utils";

const DEFAULT_TEXT_SIZE = 24;
const DEFAULT_TEXT_COLOR = 0xffffff;
const DEFAULT_TEXT_STYLE = hmUI.text_style.NONE;

export class ZMarkdown {
    static createWidget(wgtObj, style) {
        this.layout = {
            x: style.x,
            y: style.y,
            w: style.w,
            h: style.h,
            offset: {
                x: 0,
                y: 0,
            },
            getMaxWidth: (x, width) => {
                if (width > this.layout.w - x) {
                    return this.layout.w - x;
                } else {
                    return width;
                }
            },
        };

        this.style = style;
        this.originText = style.text;

        markedText = this.markOriginText(this.originText);
        this.renderMarkedText(markedText);
    }
    static markOriginText(originText) {
        const regexPatterns = [
            {
                name: "headings",
                pattern: /^(#{1,6})\s+(.*)$/gm,
                replace: (match, p1, p2) => {
                    const level = p1.length; 
                    return `<H${level}>${p2.trim()}</H${level}>`; 
                },
            },
            {
                name: "horizontalRule",
                pattern: /^\s*([-*_])\1{2,}\s*$/gm,
                replace: (match) =>
                    `<HorizontalRules>${match.trim()}</HorizontalRules>`, 
            },
            {
                name: "links",
                pattern: /\[(.*?)\]\((.*?)\)/g,
                replace: (match, p1, p2) => `<Links>[${p1}](${p2})</Links>`, 
            },
            {
                name: "boldItalic",
                pattern: /(?:\*\*\*([^*]+)\*\*\*|___([^_]+)___)/g,
                replace: (match, p1, p2) =>
                    `<BoldItalic>${p1 ? p1.trim() : p2.trim()}</BoldItalic>`, 
            },
            {
                name: "bold",
                pattern: /(?:\*\*([^*]+)\*\*|__([^_]+)__)/g,
                replace: (match, p1, p2) =>
                    `<Bold>${p1 ? p1.trim() : p2.trim()}</Bold>`, 
            },
            {
                name: "italic",
                pattern: /(?:\*([^*]+)\*|_([^_]+)_)/g,
                replace: (match, p1, p2) =>
                    `<Italic>${p1 ? p1.trim() : p2.trim()}</Italic>`, 
            },
            {
                name: "blockquotes",
                pattern: /^(>+)\s*(.*)$/gm,
                replace: (match, p1, p2) =>
                    `<BlockQuotes>${p1} ${p2.trim()}</BlockQuotes>`, 
            },
            {
                name: "unorderedList",
                pattern: /^(\s*)([*+\-])\s+(.*)$/gm,
                replace: (match, p1, p2, p3) =>
                    `<UnorderedLists>${p1}${p2} ${p3.trim()}</UnorderedLists>`, 
            },
            {
                name: "orderedList",
                pattern: /^(\s*)(\d+)\.\s+(.*)$/gm,
                replace: (match, p1, p2, p3) =>
                    `<OrderedLists>${p1}${p2}. ${p3.trim()}</OrderedLists>`, 
            },
            {
                name: "codeBlock",
                pattern: /```([^`]*?)```/gs,
                replace: (match, p1) => {
                    
                    const formattedContent = p1.replace(/\r?\n/g, "\\n");
                    return `<CodeBlock>${formattedContent.trim()}</CodeBlock>`;
                },
            },
            {
                name: "inlineCode",
                pattern: /`([^`]+)`/g,
                replace: (match, p1) => `<InlineCode>${p1.trim()}</InlineCode>`, 
            },
        ];

        regexPatterns.forEach(({ pattern, replace }) => {
            originText = originText.replace(pattern, replace);
        });

        
        
        
        
        
        
        
        
        
        
        return originText;
    }
    static renderMarkedText(markedText) {
        const lines = markedText.split("\n");
        for (let i = 0; i < lines.length; i++) {
            ZMarkdown.layout.offset.x = 0;

            const lineText = lines[i];

            const { width, height } = hmUI.getTextLayout(lineText, {
                text_size: ZMarkdown.style.text_size,
                text_width: ZMarkdown.layout.w,
            });

            const regex = /<(\/?)(\w+)>(.*?)<\/\2>/g;
            let match;
            let result = [];
            let _layout = { y: 0 };
            let lastIndex = 0;

            while ((match = regex.exec(lineText)) !== null) {
                if (match.index > lastIndex) {
                    const textContent = lineText.slice(lastIndex, match.index);
                    if (textContent.trim()) {
                        result.push({ tagType: "Text", content: textContent });
                    }
                }

                const tagType = match[2];
                const content = match[3];
                result.push({ tagType: tagType, content: content });

                lastIndex = regex.lastIndex;
            }

            if (lastIndex < lineText.length) {
                const textContent = lineText.slice(lastIndex);
                if (textContent.trim()) {
                    result.push({ tagType: "Text", content: textContent });
                }
            }

            for (let i = 0; i < result.length; i++) {
                const tagType = result[i].tagType;
                const content = result[i].content;
                this.Types[tagType].createWidget(content);
            }

            ZMarkdown.layout.offset.y += ZMarkdown.layout.previous_h;
        }
    }

    static Types = {
        Headings: {
            createWidget(level, text) {
                const { width, height } = hmUI.getTextLayout(text, {
                    text_size: ZMarkdown.Types.Headings.style[level].text_size,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: 0xffffff || 0xffffff,
                    text_size: ZMarkdown.Types.Headings.style[level].text_size,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: text,
                });
                ZMarkdown.layout.offset.x = width;
                ZMarkdown.layout.previous_h = height;
            },
            style: {
                H1: {
                    text_size: DEFAULT_TEXT_SIZE + 14,
                },
                H2: {
                    text_size: DEFAULT_TEXT_SIZE + 10,
                },
                H3: {
                    text_size: DEFAULT_TEXT_SIZE + 8,
                },
                H4: {
                    text_size: DEFAULT_TEXT_SIZE + 6,
                },
                H5: {
                    text_size: DEFAULT_TEXT_SIZE + 4,
                },
                H6: {
                    text_size: DEFAULT_TEXT_SIZE + 2,
                },
            },
        },
        H1: {
            createWidget(text) {
                ZMarkdown.Types.Headings.createWidget("H1", text);
            },
        },
        H2: {
            createWidget(text) {
                ZMarkdown.Types.Headings.createWidget("H2", text);
            },
        },
        H3: {
            createWidget(text) {
                ZMarkdown.Types.Headings.createWidget("H3", text);
            },
        },
        H4: {
            createWidget(text) {
                ZMarkdown.Types.Headings.createWidget("H4", text);
            },
        },
        H5: {
            createWidget(text) {
                ZMarkdown.Types.Headings.createWidget("H5", text);
            },
        },
        H6: {
            createWidget(text) {
                ZMarkdown.Types.Headings.createWidget("H6", text);
            },
        },
        Links: {
            createWidget(content) {
                const match = content.match(
                    /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/
                );
                let text = "";
                let url = "";
                if (match) {
                    text = match[1]; 
                    url = match[2]; 
                } else {
					text = "URL not found";
					url = "";
                }
                QRCode_Style = this.Style.QRCode;

                const { width, height } = hmUI.getTextLayout(text, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });

                const link_text = hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: ZMarkdown.style.color || 0x58a6ff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: text,
                });
                link_text.addEventListener(hmUI.event.CLICK_DOWN, function () {
                    zosPage.setScrollLock({
                        lock: true,
                    });

                    const QRCode = hmUI.createWidget(hmUI.widget.QRCODE, {
                        ...QRCode_Style,
                        y: QRCode_Style.y - zosPage.getScrollTop(),
                        bg_y: QRCode_Style.bg_y - zosPage.getScrollTop(),
                        content: url,
                    });
                    QRCode.addEventListener(hmUI.event.CLICK_DOWN, function () {
                        zosPage.setScrollLock({
                            lock: false,
                        });

                        hmUI.deleteWidget(QRCode);
                    });
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
            Style: {
                color: 0x58a6ff,
                QRCode: {
                    content: "",
                    x: px(140),
                    y: px(140),
                    w: px(200),
                    h: px(200),
                    bg_x: px(0),
                    bg_y: px(0),
                    bg_w: px(480),
                    bg_h: px(480),
                    bg_radius: px(10),
                },
            },
        },
        Text: {
            createWidget(content) {
                const { width, height } = hmUI.getTextLayout(content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: 0xffffff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: content,
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
            Style: {
                color: 0xffffff,
            },
        },
        Bold: {
            createWidget(content) {
                const { width, height } = hmUI.getTextLayout(content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: 0xffffff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: content,
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
            Style: {
                color: 0xffffff,
            },
        },
        Italic: {
            createWidget(content) {
                const { width, height } = hmUI.getTextLayout(content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: 0xffffff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: content,
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
        },
        BoldItalic: {
            createWidget(content) {
                const { width, height } = hmUI.getTextLayout(content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: 0xffffff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: content,
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
        },
        BlockQuotes: {
            createWidget(content) {
                const match = content.match(/^(>+)\s*(.*)$/m);
                let level = 0;
                let quoteContent = "";

                if (match) {
                    level = match[1].length; 
                    quoteContent = match[2]; 
                } else {
					level = 0;
					quoteContent = "BlockQuotes error";
                }
                const { width, height } = hmUI.getTextLayout(text, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                for (let i = 0; i < level; i++) {
                    hmUI.createWidget(hmUI.widget.FILL_RECT, {
                        x: ZMarkdown.layout.x + i * this.Style.x_offset,
                        y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y + 5,
                        w: 4,
                        h: height - 10,
                        radius: 0,
                        color: this.Style.color,
                    });
                }
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + level * this.Style.x_offset,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(
                        ZMarkdown.layout.x + level * this.Style.x_offset,
                        width
                    ),
                    h: height,
                    color: this.Style.text_color,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: text,
                });

                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
            Style: {
                color: 0x30363d,
                text_color: 0x8b949e,
                x_offset: px(20),
            },
        },
        HorizontalRules: {
            createWidget(match) {
                hmUI.createWidget(hmUI.widget.FILL_RECT, {
                    ...this.Style,
                    x: ZMarkdown.layout.x + 5,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y + 5,
                    w: ZMarkdown.layout.w - 10,
                });
                ZMarkdown.layout.offset.y += 15;
                ZMarkdown.layout.previous_h = this.Style.h;
            },
            Style: {
                h: px(5),
                radius: 3,
                color: 0x30363d,
            },
        },
        UnorderedLists: {
            createWidget(content) {
                const matches = content.matchAll(/^(\s*)([*+\-])\s+(.*)$/gm);
                for (const match of matches) {
                    [fullMatch, indent, symbol, text] = match;
                    
                    
                    

                    
                }
                const level = indent.length / 2;
                const { width, height } = hmUI.getTextLayout(text, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.FILL_RECT, {
                    x: ZMarkdown.layout.x + level * 20,
                    y:
                        ZMarkdown.layout.y +
                        ZMarkdown.layout.offset.y +
                        (height - 5) / 2,
                    w: 5,
                    h: 5,
                    radius: 3,
                    color: 0xffffff,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + level * 20 + 10,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(
                        ZMarkdown.layout.x + level * 20 + 10,
                        width
                    ),
                    h: height,
                    color: 0xffffff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: text,
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
            Style: {
                color: 0xffffff,
            },
        },
        OrderedLists: {
            createWidget(content) {
                const { width, height } = hmUI.getTextLayout(content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width),
                    h: height,
                    color: 0xffffff,
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: content,
                });
                ZMarkdown.layout.offset.x += width;
                ZMarkdown.layout.previous_h = height;
            },
            Style: {},
        },
        InlineCode: {
            createWidget(content) {
                const { width, height } = hmUI.getTextLayout(content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.FILL_RECT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(
                        ZMarkdown.layout.x,
                        width + 16
                    ),
                    h: height,
                    radius: 5,
                    color: this.Style.bg_color,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x + 8,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(
                        ZMarkdown.layout.x,
                        width + 8
                    ),
                    h: height,
                    color: this.Style.code_color,
                    text_size:
                        ZMarkdown.style.text_size - 4 || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: content,
                });
                ZMarkdown.layout.offset.x += ZMarkdown.layout.getMaxWidth(
                    ZMarkdown.layout.x,
                    width + 16
                );
                ZMarkdown.layout.previous_h = height + 8;
            },
            Style: {
                bg_color: 0x1a1a1a,
                code_color: 0xffffff,
            },
        },
        CodeBlock: {
            createWidget(content) {
                content = content.replace(/\\n/g, "\n");
                code_type = content.slice(0, content.indexOf("\n"));
                code_content = content.slice(content.indexOf("\n") + 1);
                const { width: code_type_width, height: code_type_height } =
                    hmUI.getTextLayout(code_type, {
                        text_size:
                            ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                        text_width: ZMarkdown.layout.w,
                    });
                const {
                    width: code_content_width,
                    height: code_content_height,
                } = hmUI.getTextLayout(code_content, {
                    text_size: ZMarkdown.style.text_size || DEFAULT_TEXT_SIZE,
                    text_width: ZMarkdown.layout.w,
                });
                hmUI.createWidget(hmUI.widget.FILL_RECT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w:
                        ZMarkdown.layout.getMaxWidth(
                            ZMarkdown.layout.x,
                            code_content_width+16
                        ),
                    h: code_type_height + code_content_height,
                    radius: 5,
                    color: this.Style.bg_color,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x+8,
                    y: ZMarkdown.layout.y + ZMarkdown.layout.offset.y,
                    w: ZMarkdown.layout.getMaxWidth(
                        ZMarkdown.layout.x,
                        code_content_width
                    ),
                    h: code_type_height,
                    color: this.Style.code_type_color,
                    text_size:
                        ZMarkdown.style.text_size - 10 || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: code_type,
                });
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ZMarkdown.layout.x + ZMarkdown.layout.offset.x+8,
                    y:
                        ZMarkdown.layout.y +
                        ZMarkdown.layout.offset.y +
                        code_type_height,
                    w: ZMarkdown.layout.getMaxWidth(
                        ZMarkdown.layout.x,
                        code_content_width+8
                    ),
                    h: code_content_height,
                    color: this.Style.code_content_color,
                    text_size:
                        ZMarkdown.style.text_size - 4 || DEFAULT_TEXT_SIZE,
                    align_h: ZMarkdown.style.align_h || hmUI.align.LEFT,
                    align_v: ZMarkdown.style.align_v || hmUI.align.CENTER_V,
                    text_style:
                        ZMarkdown.style.text_style || DEFAULT_TEXT_STYLE,
                    text: code_content,
                });
                ZMarkdown.layout.offset.x +=
                    ZMarkdown.layout.getMaxWidth(ZMarkdown.layout.x, width) +
                    12;
                ZMarkdown.layout.previous_h =
                    code_type_height + code_content_height + 8;
            },
            Style: {
                bg_color: 0x1a1a1a,
                code_type_color: DEFAULT_TEXT_COLOR || 0x737373,
                code_content_color: DEFAULT_TEXT_COLOR || 0xffffff,
            },
        },
    };
}
