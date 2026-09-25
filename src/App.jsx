import { MyRoutes } from './routers/routes'
import { createContext, useState } from 'react'
import { Light, Dark } from './styles/themes'
import { ThemeProvider } from 'styled-components'

// ponytail: not exported; replaced by a Zustand theme store in spec 04
const ThemeContext = createContext(null)

function App() {
  const [theme, setTheme] = useState('light')
  const themeStyle = theme === 'light' ? Light : Dark

  return (
    <>
      <ThemeContext.Provider value={{ setTheme, theme }}>
        <ThemeProvider theme={themeStyle}>
          <MyRoutes />
        </ThemeProvider>
      </ThemeContext.Provider>
    </>
  )
}

export default App
