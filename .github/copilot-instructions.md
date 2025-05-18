
# GitHub Copilot 指南 - Chakra UI 项目

在为本项目生成或修改与 Chakra UI 相关的代码时，请务必参考以下文档以获取全面的上下文和迁移指南：

1.  **Chakra UI v3 完整开发者文档**:
    *   请参考文件：[`llms-full.txt`](./llms-full.txt)
    *   此文件包含 Chakra UI v3 的详细组件用法、示例和 API 说明。

2.  **Chakra UI v3 迁移指南**:
    *   请参考文件：[`llms-v3-migration.txt`](./llms-v3-migration.txt)
    *   此文件详细说明了从旧版本迁移到 Chakra UI v3 的步骤、重大更改、已移除的功能以及属性更改。在进行任何与版本升级相关的代码修改时，请务必查阅此文档。

**通用编码准则:**

*   在生成新组件或重构现有组件时，请优先采用 `llms-v3-migration.txt` 中描述的 v3 版本的新模式和 API。
*   注意 `llms-v3-migration.txt` 中提到的已移除功能和属性更改，确保生成的代码不使用已弃用的部分。
*   对于组件的具体实现和用法示例，请参考 `llms-full.txt`。

请确保您的建议和代码生成与这两个文档中提供的信息保持一致。
