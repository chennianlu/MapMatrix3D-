/**
 * @format
 */

module.exports = {
  printWidth: 100,
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象字面量中的属性名引号添加方式: 只在需要的情况下加引号
  semi: true, // 末尾分号
  tabWidth: 2,
  trailingComma: 'all', // 尽可能添加尾后逗号（如函数的参数列表）
  requirePragma: true, // 只对包含 #pragma 注释的文件使用 prettier
  bracketSpacing: true,
  arrowParens: 'always', // 箭头函数只有一个参数也添加括号
  insertPragma: true, // Prettier 可以在文件头部插入特定的 @format 标记以表示该文件已被 Prettier 格式化过。
};
