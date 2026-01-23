/**
 * 英雄相关映射工具
 */

// 角色标签中文映射
export const RoleLabelMap: Record<string, string> = {
  tank: '坦克',
  support: '辅助',
  mage: '法师',
  fighter: '战士',
  marksman: '射手',
  assassin: '刺客'
}

/**
 * 获取角色标签中文名称
 * @param tag 英文标签
 * @returns 中文名称，未知标签返回原标签
 */
export function getRoleLabel(tag: string): string {
  return RoleLabelMap[tag] || tag
}

/**
 * 获取角色标签中文名称（批量）
 * @param tags 英文标签数组
 * @returns 中文名称数组
 */
export function getRoleLabels(tags: string[]): string[] {
  if (!Array.isArray(tags)) return []
  return tags.map(tag => RoleLabelMap[tag] || tag)
}

/**
 * 角色标签颜色映射
 */
export const RoleColorMap: Record<string, string> = {
  tank: '#FF6B6B',      // 红色
  support: '#52C41A',    // 绿色
  mage: '#9C27B0',      // 紫色
  fighter: '#FF9800',     // 橙色
  marksman: '#2196F3',    // 蓝色
  assassin: '#7E57C2',   // 紫青色
}

/**
 * 获取角色标签颜色
 * @param tag 英文标签
 * @returns 颜色值
 */
export function getRoleColor(tag: string): string {
  return RoleColorMap[tag] || '#999'
}
