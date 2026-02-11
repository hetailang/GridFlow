import { useState, useCallback } from 'react'
import GridLayout from './components/GridLayout'
import ControlPanel from './components/ControlPanel'
import './App.css'

function App() {
  const [config, setConfig] = useState({
    gridCount: 3,
    aspectRatio: '16:9',
    padding: 10,
    cornerRadius: 15,
    backgroundColor: '#ffffff'
  })

  const [images, setImages] = useState({})
  const [layout, setLayout] = useState(null)

  const handleConfigChange = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleImageUpdate = useCallback((cellId, imageData) => {
    setImages(prev => ({ ...prev, [cellId]: imageData }))
  }, [])

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>GridFlow</h1>
        <p>动态拼图生成器</p>
      </header>

      <div className="app-content">
        <div className="main-area">
          <GridLayout
            config={config}
            images={images}
            onImageUpdate={handleImageUpdate}
            onLayoutChange={handleLayoutChange}
          />
        </div>

        <div className="sidebar">
          <ControlPanel
            config={config}
            onConfigChange={handleConfigChange}
            images={images}
            layout={layout}
          />
        </div>
      </div>
    </div>
  )
}

export default App
