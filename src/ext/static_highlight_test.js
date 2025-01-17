"use strict";

var assert = require("assert");
var highlighter = require("./static_highlight");
var EditSession = require("../edit_session").EditSession;
var JavaScriptMode = require("../mode/javascript").Mode;
var TextMode = require("../mode/text").Mode;
var dom = require("../lib/dom");
var config = require("../config");

// Execution ORDER: test.setUpSuite, setUp, testFn, tearDown, test.tearDownSuite
module.exports = {
    timeout: 10000,

    "test loading in node": function(next) {
        require("../test/mockdom").unload();
        if (typeof process != "undefined")
            assert.equal(typeof window, "undefined");
        require("../ace");
        next();
    },

    "test simple snippet": function(next) {
        var theme = require("../theme/tomorrow");
        var snippet = [
            "/** this is a function",
            "*",
            "*/",
            "",
            "function hello (a, b, c) {",
            "    console.log(a * b + c + 'sup$');",
            "           //",
            "\t\t\t//",
            "}"
        ].join("\n");
        var mode = new JavaScriptMode();
        var result = highlighter.render(snippet, mode, theme);
        assert.equal(result.html, `<div class='ace-tomorrow'><div class='ace_static_highlight ace_show_gutter' style='counter-reset:ace_line 0'><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_comment ace_doc'>/**</span><span class='ace_comment ace_doc ace_body'> this is a function</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_comment ace_doc ace_body'>*</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_comment ace_doc'>*/</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_storage ace_type'>function</span> <span class='ace_entity ace_name ace_function'>hello</span> <span class='ace_paren ace_lparen'>(</span><span class='ace_variable ace_parameter'>a</span><span class='ace_punctuation ace_operator'>,</span> <span class='ace_variable ace_parameter'>b</span><span class='ace_punctuation ace_operator'>,</span> <span class='ace_variable ace_parameter'>c</span><span class='ace_paren ace_rparen'>)</span> <span class='ace_paren ace_lparen'>{</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span>    <span class='ace_storage ace_type'>console</span><span class='ace_punctuation ace_operator'>.</span><span class='ace_support ace_function ace_firebug'>log</span><span class='ace_paren ace_lparen'>(</span><span class='ace_identifier'>a</span> <span class='ace_keyword ace_operator'>*</span> <span class='ace_identifier'>b</span> <span class='ace_keyword ace_operator'>+</span> <span class='ace_identifier'>c</span> <span class='ace_keyword ace_operator'>+</span> <span class='ace_string'>&#39;sup$&#39;</span><span class='ace_paren ace_rparen'>)</span><span class='ace_punctuation ace_operator'>;</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_indent-guide'>    </span><span class='ace_indent-guide'>    </span>   <span class='ace_comment'>//</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_indent-guide'>    </span><span class='ace_indent-guide'>    </span>    <span class='ace_comment'>//</span>
</div><div class='ace_line'><span class='ace_gutter ace_gutter-cell'></span><span class='ace_paren ace_rparen'>}</span>
</div></div></div>`);
        assert.ok(!!result.css);
        next();
    },

    "test css from theme is used": function(next) {
        var theme = require("../theme/tomorrow");
        var snippet = [
            "/** this is a function",
            "*",
            "*/",
            "function hello (a, b, c) {",
            "    console.log(a * b + c + 'sup?');",
            "}"
        ].join("\n");
        var mode = new JavaScriptMode();

        var result = highlighter.render(snippet, mode, theme);

        assert.ok(result.css.indexOf(theme.cssText) !== -1);

        next();
    },

    "test theme classname should be in output html": function(next) {
        var theme = require("../theme/tomorrow");
        var snippet = [
            "/** this is a function",
            "*",
            "*/",
            "function hello (a, b, c) {",
            "    console.log(a * b + c + 'sup?');",
            "}"
        ].join("\n");
        var mode = new JavaScriptMode();

        var result = highlighter.render(snippet, mode, theme);
        assert.equal(!!result.html.match(/<div class='ace-tomorrow'>/), true);

        next();
    },
    
    "test js string replace specials": function(next) {
        var theme = require("../theme/tomorrow");
        var snippet = "$'$1$2$$$&";
        var mode = new TextMode();

        var result = highlighter.render(snippet, mode, theme);
        assert.ok(result.html.indexOf("</span>$&#39;$1$2$$$&#38;\n</div>") != -1);

        next();
    },
    
    "test html special chars": function(next) {
        var theme = require("../theme/tomorrow");
        var snippet = "&<>'\"";
        var mode = new TextMode();

        var result = highlighter.render(snippet, mode, theme);
        assert.ok(result.html.indexOf("</span>&#38;&#60;>&#39;&#34;\n</div>") != -1);
        
        var mode = new JavaScriptMode();
        var result = highlighter.render("/*" + snippet, mode, theme);
        assert.ok(result.html.indexOf("<span class='ace_comment'>/*&#38;&#60;>&#39;&#34;</span>") != -1);
        
        next();
    },
    
    "test async highlight": function(next) {
        require("../test/mockdom");
        EditSession.prototype.$modes["./mode/javascript"] = new JavaScriptMode();
        var el = dom.buildDom(["div", {}, "var a = 1"]);
        highlighter.highlight(el, {
            theme: "./theme/tomorrow",
            mode: "./mode/javascript"
        }, function() {
            assert.ok(/class="ace_storage ace_type">var/.test(el.innerHTML));
            next();
        });
    }
};


if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
