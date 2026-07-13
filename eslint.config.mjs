import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import boundariesPlugin from "eslint-plugin-boundaries";
import checkFilePlugin from "eslint-plugin-check-file";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

const UI_TEXT_CHECKS = [
    {
        selector: "JSXText[value=/[a-zA-ZÀ-ỹ]/]",
        message: "Văn bản cứng chưa được đưa vào UI_TEXT.",
    },
    {
        selector:
            "JSXAttribute[name.name=/^(label|placeholder|title|description|hint)$/] > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/]))",
        message: "Thuộc tính văn bản cứng chưa được đưa vào UI_TEXT.",
    },
    {
        selector: "JSXAttribute[name.name='alt'] > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/]), JSXExpressionContainer > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/])))",
        message: "Thuộc tính alt văn bản cứng chưa được đưa vào UI_TEXT.",
    },
    {
        selector:
            ":matches(JSXElement:not([openingElement.name.name='style']), JSXFragment) > JSXExpressionContainer > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/]))",
        message: "Chuỗi văn bản cứng trong ngoặc nhọn chưa được đưa vào UI_TEXT.",
    },
    {
        selector:
            ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > ConditionalExpression > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/]))",
        message: "Chuỗi văn bản cứng trong ngoặc nhọn (điều kiện) chưa được đưa vào UI_TEXT.",
    },
    {
        selector:
            "Property[key.name=/^(label|placeholder|searchPlaceholder|title|description|hint|tooltip|message|content|columns|cancel|save|empty|filterButton)$/] > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/]))",
        message: "Chuỗi văn bản cứng trong property object chưa được đưa vào UI_TEXT.",
    },
    {
        selector: "CallExpression[callee.object.name='toast'] > :matches(Literal[value=/[a-zA-ZÀ-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[a-zA-ZÀ-ỹ]/]))",
        message: "Chuỗi thông báo trong toast chưa được đưa vào UI_TEXT.",
    },
    {
        selector: ":matches(VariableDeclarator, AssignmentExpression, ReturnStatement) > :matches(Literal[value=/[À-ỹ]/], TemplateLiteral:has(TemplateElement[value.raw=/[À-ỹ]/]))",
        message: "Phát hiện văn bản tiếng Việt cứng. Hãy đưa vào UI_TEXT.",
    },
    {
        selector: "JSXAttribute[name.name='className'] Literal[value=/-\\[#[0-9a-fA-F]{3,6}\\]/]",
        message: "Không được sử dụng mã màu trực tiếp (arbitrary values). Hãy sử dụng màu từ theme (vd: bg-brand-500).",
    },
];

const GENERAL_LOGIC_CHECKS = [
    {
        selector: "SwitchCase > Literal[value=/^[A-Z][A-Z0-9_]+$/]",
        message: "Tránh sử dụng chuỗi viết hoa được mã hóa cứng. Thay vào đó, hãy sử dụng Enum hoặc Constant.",
    },
    {
        selector: "BinaryExpression > Literal[value=/^[A-Z][A-Z0-9_]+$/]",
        message: "Tránh sử dụng các chuỗi viết hoa được mã hóa cứng trong các phép so sánh. Thay vào đó, hãy sử dụng Enum hoặc Constant.",
    },
    {
        selector: "Property[key.name=/^(id|key|status|type|role|category|level|priority|mode|operator|method)$/] > Literal[value=/^[A-Z][A-Z0-9_]+$/]",
        message: "Tránh sử dụng chuỗi viết hoa cố định trong thuộc tính đối tượng. Hãy sử dụng Enum hoặc Constant.",
    },
];

const STRICT_VALUE_CHECKS = [
    {
        selector: "Literal[value=/^#([A-Fa-f0-9]{3}){1,2}$/]",
        message: "Không được sử dụng mã màu trực tiếp (hex code). Hãy sử dụng COLORS từ config hoặc biến theme.",
    },
    {
        selector: ":not(TSEnumMember) > Literal[value=/^(ACTIVE|INACTIVE|PENDING|APPROVED|REJECTED|student|teacher|school|business)$/]",
        message: "Tránh sử dụng magic string. Hãy sử dụng Enum hoặc Constant.",
    },
];

export default tseslint.config(
    {
        ignores: ["node_modules/", ".next/", "dist/", "build/", "report/"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            "check-file": checkFilePlugin,
        },
        rules: {
            "check-file/filename-naming-convention": [
                "error",
                {
                    "src/{views,components,hooks,services,shared}/**/*.{ts,tsx,js,jsx}": "KEBAB_CASE",
                },
                {
                    ignoreMiddleExtensions: true,
                },
            ],
            "check-file/folder-naming-convention": [
                "error",
                {
                    "src/{views,components,hooks,services,shared}/**/": "KEBAB_CASE",
                },
            ],
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "@next/next": nextPlugin,
            react: reactPlugin,
            "react-hooks": hooksPlugin,
            "unused-imports": unusedImports,
            boundaries: boundariesPlugin,
        },
        settings: {
            react: {
                version: "detect",
            },
            "boundaries/include": ["src/**/*"],
            "boundaries/elements": [
                {
                    type: "app",
                    pattern: "src/app/**/*",
                },
                {
                    type: "views",
                    pattern: "src/views/**/*",
                },
                {
                    type: "components",
                    pattern: "src/components/**/*",
                },
                {
                    type: "hooks",
                    pattern: "src/hooks/**/*",
                },
                {
                    type: "services",
                    pattern: "src/services/**/*",
                },
                {
                    type: "constants",
                    pattern: "src/constants/**/*",
                },
                {
                    type: "config",
                    pattern: "src/config/**/*",
                },
                {
                    type: "utils",
                    pattern: "src/utils/**/*",
                },
                {
                    type: "mocks",
                    pattern: "src/mocks/**/*",
                },
                {
                    type: "shared",
                    pattern: [
                        "src/types/**/*",
                        "src/styles/**/*",
                        "src/base/**/*",
                        "src/lib/**/*",
                        "src/providers/**/*",
                        "src/store/**/*",
                        "src/stores/**/*",
                        "src/instrumentation.ts",
                    ],
                },
            ],
        },
        rules: {
            ...reactPlugin.configs["recommended"].rules,
            ...hooksPlugin.configs["recommended"].rules,
            ...nextPlugin.configs["recommended"].rules,
            ...nextPlugin.configs["core-web-vitals"].rules,

            // Boundaries rules
            "boundaries/no-unknown": ["off"], // Disabled due to false positives with Next.js bracket/parentheses folders
            "boundaries/no-unknown-files": ["off"], // Allow files not matching elements (like root files)
            "boundaries/element-types": [
                "warn",
                {
                    default: "disallow",
                    rules: [
                        {
                            from: ["app"],
                            allow: ["views", "components", "hooks", "services", "shared", "constants", "config", "utils", "mocks"],
                        },
                        {
                            from: ["views"],
                            allow: ["components", "hooks", "services", "shared", "constants", "config", "utils", "mocks"],
                        },
                        {
                            from: ["components"],
                            allow: ["hooks", "services", "shared", "components", "constants", "config", "utils"],
                        },
                        {
                            from: ["hooks"],
                            allow: ["services", "shared", "hooks", "constants", "config", "utils", "mocks"],
                        },
                        {
                            from: ["services"],
                            allow: ["shared", "services", "constants", "config", "utils", "mocks"],
                        },
                        {
                            from: ["utils"],
                            allow: ["shared", "constants", "config", "utils"],
                        },
                        {
                            from: ["config"],
                            allow: ["shared", "constants", "config"],
                        },
                        {
                            from: ["constants"],
                            allow: ["shared", "constants"],
                        },
                        {
                            from: ["mocks"],
                            allow: ["shared", "constants", "mocks"],
                        },
                        {
                            from: ["shared"],
                            allow: ["shared", "constants", "config", "utils"],
                        },
                    ],
                },
            ],

            // Core overrides
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],

            "@typescript-eslint/no-magic-numbers": ["warn", { ignore: [-1, 0, 1] }],
            "react/jsx-no-literals": ["warn", { noStrings: false, ignoreProps: true }],

            "no-restricted-syntax": ["error", ...UI_TEXT_CHECKS, ...GENERAL_LOGIC_CHECKS, ...STRICT_VALUE_CHECKS],

            "react-hooks/incompatible-library": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/preserve-manual-memoization": "off",
        },
    },
    {
        files: ["src/config/ui-text.ts", "eslint.config.mjs"],
        rules: {
            "no-restricted-syntax": "off",
            "@typescript-eslint/no-magic-numbers": "off",
        },
    },
    {
        files: [
            "src/services/**/*.ts",
            "src/services/**/*.tsx",
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    {
        files: ["src/services/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "src/providers/**/*.{ts,tsx}", "src/stores/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "warn",
                {
                    selector: ":matches(ExportNamedDeclaration, Program) > TSInterfaceDeclaration",
                    message: "Không nên định nghĩa Interface trong Service/Hook/Store/Provider. Hãy chuyển sang `src/types`.",
                },
                {
                    selector: ":matches(ExportNamedDeclaration, Program) > TSTypeAliasDeclaration",
                    message: "Không nên định nghĩa Type trong Service/Hook/Store/Provider. Hãy chuyển sang `src/types`.",
                },
                {
                    selector: ":matches(ExportNamedDeclaration, Program) > TSEnumDeclaration",
                    message: "Không nên định nghĩa Enum trong Service/Hook/Store/Provider. Hãy chuyển sang `src/constants` hoặc `src/types`.",
                },
                {
                    selector: ":matches(ExportNamedDeclaration, Program) > VariableDeclaration[kind='const'] > VariableDeclarator[id.name=/^[A-Z][A-Z0-9_]+$/]",
                    message: "Không nên định nghĩa Constants (UPPER_CASE) trong Service/Hook/Store/Provider. Hãy chuyển sang `src/constants`.",
                },
            ],
        },
    },
    {
        files: ["src/constants/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-magic-numbers": "off",
            "no-restricted-syntax": [
                "warn",
                ...UI_TEXT_CHECKS,
                ...GENERAL_LOGIC_CHECKS,
                {
                    selector: ":matches(ExportNamedDeclaration, Program) > FunctionDeclaration",
                    message: "Constants files should only contain static data. Move logic/functions to `src/utils`.",
                },
                {
                    selector:
                        ":matches(ExportNamedDeclaration, Program) > VariableDeclaration > VariableDeclarator[init.type=/(ArrowFunctionExpression|FunctionExpression)/]",
                    message: "Constants files should only contain static data. Move logic/functions to `src/utils`.",
                },
            ],
        },
    },
    {
        files: ["src/utils/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "warn",
                {
                    selector: "VariableDeclaration[kind='const'] > VariableDeclarator[id.name=/^[A-Z][A-Z0-9_]+$/]",
                    message: "All constants (UPPER_CASE) must be moved to `src/constants`.",
                },
            ],
        },
    },
    {
        files: ["src/views/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "error",
                ...UI_TEXT_CHECKS,
                ...GENERAL_LOGIC_CHECKS,
                ...STRICT_VALUE_CHECKS,
                {
                    selector: "VariableDeclarator[init.callee.object.name='z'][init.callee.property.name='object']",
                    message: "Không nên định nghĩa Zod Schema trong Views/Components. Hãy chuyển sang `src/schemas` hoặc `src/services`.",
                },
                {
                    selector: "VariableDeclaration[kind='const'] > VariableDeclarator[id.name=/^[A-Z][A-Z0-9_]+$/]",
                    message: "Không nên định nghĩa Constants (UPPER_CASE) trong Views/Components. Hãy chuyển sang `src/constants` hoặc `src/utils`.",
                },
                {
                    selector: "TSInterfaceDeclaration",
                    message: "Không nên định nghĩa Interface trong Views/Components. Hãy chuyển sang `src/types`.",
                },
                {
                    selector: "TSTypeAliasDeclaration",
                    message: "Không nên định nghĩa Type trong Views/Components. Hãy chuyển sang `src/types`.",
                },
                {
                    selector: ":matches(Program, ExportNamedDeclaration) > FunctionDeclaration[id.name=/^[a-z]/][id.name!=/^use/]",
                    message: "Không nên định nghĩa helper function trong views/components. Hãy chuyển sang `src/utils` hoặc `src/hooks`.",
                },
                {
                    selector:
                        ":matches(Program, ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator[id.name=/^[a-z]/][id.name!=/^use/][init.type=/(ArrowFunctionExpression|FunctionExpression)/]",
                    message: "Không nên định nghĩa helper function trong views/components. Hãy chuyển sang `src/utils` hoặc `src/hooks`.",
                },
                {
                    selector:
                        ":matches(Program, ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator[id.name=/^[a-z]/][init.type=/(ObjectExpression|ArrayExpression)/]",
                    message: "Không nên định nghĩa biến tĩnh (Object/Array) trong views/components. Hãy chuyển sang `src/mocks` (dữ liệu mock) hoặc `src/constants` / `src/config`.",
                },
            ],
        },
    },
    {
        files: ["src/mocks/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-magic-numbers": "off",
            "no-restricted-syntax": [
                "warn",
                ...GENERAL_LOGIC_CHECKS,
                {
                    selector: ":matches(ExportNamedDeclaration, Program) > FunctionDeclaration",
                    message: "Mock files should only contain static data. Move logic/functions to `src/utils` or `src/hooks`.",
                },
                {
                    selector:
                        ":matches(ExportNamedDeclaration, Program) > VariableDeclaration > VariableDeclarator[init.type=/(ArrowFunctionExpression|FunctionExpression)/]",
                    message: "Mock files should only contain static data. Move logic/functions to `src/utils` or `src/hooks`.",
                },
            ],
        },
    },
    {
        files: ["src/views/**/!(*-view).{ts,tsx}"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: "Program",
                    message: "File này đặt trong `src/views` nhưng không có hậu tố `-view`. Hãy di chuyển sang `src/components` hoặc đổi tên.",
                },
            ],
        },
    },
    {
        files: [
            "src/constants/app.constants.ts",
            "src/constants/application.constants.ts",
            "src/constants/base-components.constants.ts",
            "src/constants/ui-text.constants.ts",
            "src/constants/admin-sidebar.constants.ts",
            "src/components/base/checkbox/checkbox.tsx",
            "src/components/base/radio-buttons/radio-buttons.tsx",
            "src/components/base/toggle/toggle.tsx",
            "src/components/base/select/multi-select.tsx",
        ],
        rules: {
            "no-restricted-syntax": "off",
            "@typescript-eslint/no-magic-numbers": "off",
        },
    },
);
