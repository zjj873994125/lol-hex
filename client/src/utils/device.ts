/**
 * 设备检测工具
 */

// 移动端设备断点
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
} as const

/**
 * 检测是否为移动端（基于屏幕宽度）
 */
export const isMobileByWidth = (): boolean => {
  return window.innerWidth < BREAKPOINTS.mobile
}

/**
 * 检测是否为平板（基于屏幕宽度）
 */
export const isTabletByWidth = (): boolean => {
  const width = window.innerWidth
  return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet
}

/**
 * 检测是否为桌面端（基于屏幕宽度）
 */
export const isDesktopByWidth = (): boolean => {
  return window.innerWidth >= BREAKPOINTS.desktop
}

/**
 * 检测是否为移动设备（基于 User Agent）
 */
export const isMobileDevice = (): boolean => {
  const ua = navigator.userAgent

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.platform)
}

/**
 * 检测是否为 iOS 设备
 */
export const isIOS = (): boolean => {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
}

/**
 * 检测是否为 Android 设备
 */
export const isAndroid = (): boolean => {
  const ua = navigator.userAgent
  return /Android/i.test(ua)
}

/**
 * 检测是否支持触摸
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export const getDeviceType = (): DeviceType => {
  const width = window.innerWidth

  if (width < BREAKPOINTS.mobile) return 'mobile'
  if (width < BREAKPOINTS.tablet) return 'tablet'
  return 'desktop'
}

/**
 * 检测是否应该使用移动端路由
 */
export const shouldUseMobileRoute = (): boolean => {
  // 同时检查屏幕宽度和设备类型
  return isMobileByWidth() || isMobileDevice()
}

/**
 * 获取当前视口尺寸
 */
export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

/**
 * 监听窗口大小变化
 */
export const onResize = (callback: () => void) => {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}
