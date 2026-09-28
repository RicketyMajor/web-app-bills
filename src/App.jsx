import { ThemeProvider } from 'styled-components'
import { MotionConfig } from 'motion/react'
import { MyRoutes } from './routers/routes'
import { Light, Dark } from './styles/themes'
import { GlobalStyle } from './styles/GlobalStyle'
import { useThemeStore } from './store/themeStore'

function App() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <ThemeProvider theme={theme === 'light' ? Light : Dark}>
      {/* OS "reduce motion" → transforms off, fades only */}
      <MotionConfig reducedMotion="user">
        <GlobalStyle />
        <MyRoutes />
      </MotionConfig>
    </ThemeProvider>
  )
}

export default App
