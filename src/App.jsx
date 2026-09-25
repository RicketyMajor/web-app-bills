import { ThemeProvider } from 'styled-components'
import { MyRoutes } from './routers/routes'
import { Light, Dark } from './styles/themes'
import { GlobalStyle } from './styles/GlobalStyle'
import { useThemeStore } from './store/themeStore'

function App() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <ThemeProvider theme={theme === 'light' ? Light : Dark}>
      <GlobalStyle />
      <MyRoutes />
    </ThemeProvider>
  )
}

export default App
