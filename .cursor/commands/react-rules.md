## AI 开发规范（Cursor）

本项目 **强制遵循 Vercel 官方 React Best Practices**
来源：**vercel-labs/agent-skills / react-best-practices**

### 基本原则（必须遵守）

* 所有 AI 生成或修改的代码 **必须遵循 Vercel React Best Practices**
* 主动识别并避免 **异步瀑布（Async Waterfall）**
* 优先减少 **Bundle 体积** 和不必要的客户端 JavaScript
* 不做无实际收益的微优化（例如滥用 useMemo / useCallback）
* 优先保证真实性能与用户体验，而不是代码“看起来很高级”

### Next.js 相关规范

* **默认使用 Server Components**
* 仅在确有交互需求时使用 Client Components
* SEO 关键内容 **禁止依赖 useEffect 在客户端获取**
* 数据获取优先放在服务端（SSR / RSC）
* 确保首屏内容与 metadata 在服务端渲染

### 编写代码时

* 如果用户需求违反最佳实践，**必须先说明问题，再给出更优方案**
* 优先选择对真实用户体验影响最大的优化点
* 避免过度抽象，保持代码清晰、可维护

### 审查代码时

* 明确指出违反了哪一条 **Vercel Best Practice**
* 给出可落地的重构建议，而不是泛泛而谈

如存在不确定性，以 **性能、稳定性和用户体验优先** 为准。
