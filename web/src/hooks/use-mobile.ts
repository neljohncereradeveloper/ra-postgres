import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Modern way to handle media queries in React 19
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    
    // Add event listener
    mql.addEventListener("change", onChange)
    
    // Clean up function
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  // Return false as fallback when undefined (during SSR)
  return isMobile ?? false
}
