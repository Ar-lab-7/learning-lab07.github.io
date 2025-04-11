
import * as React from "react"

// Exported constants for responsive design across the app
export const BREAKPOINTS = {
  MOBILE: 640,    // For small mobile devices
  TABLET: 768,    // For tablets
  LAPTOP: 1024,   // For laptops
  DESKTOP: 1280   // For desktop screens
}

/**
 * Hook to detect if the current viewport is mobile size
 * @returns {boolean} True if the viewport is mobile sized
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth <= BREAKPOINTS.MOBILE)
    }
    
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth <= BREAKPOINTS.MOBILE)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Hook to detect if the current viewport is tablet size
 * @returns {boolean} True if the viewport is tablet sized
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${BREAKPOINTS.MOBILE + 1}px) and (max-width: ${BREAKPOINTS.LAPTOP - 1}px)`
    )
    
    const onChange = () => {
      setIsTablet(
        window.innerWidth > BREAKPOINTS.MOBILE && 
        window.innerWidth < BREAKPOINTS.LAPTOP
      )
    }
    
    mql.addEventListener("change", onChange)
    setIsTablet(
      window.innerWidth > BREAKPOINTS.MOBILE && 
      window.innerWidth < BREAKPOINTS.LAPTOP
    )
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

/**
 * Hook to detect device type for responsive design
 * @returns {Object} Object containing boolean flags for different device types
 */
export function useDeviceType() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  }
}
