import { useRef } from 'react'
import { exportToImage } from '../utils/exportCanvas'
import './ControlPanel.css'

function ControlPanel({ config, onConfigChange, images, layout }) {
  const canvasRef = useRef(null)

  const handleExport = () => {
    exportToImage(config, images, layout)
  }

  return (
    <div className="control-panel">
      <h2>控制面板</h2>

      <div className="control-section">
        <h3>布局设置</h3>

        <div className="control-item">
          <label>图片数量</label>
          <select
            value={config.gridCount}
            onChange={(e) => onConfigChange('gridCount', Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <option key={n} value={n}>{n} 张</option>
            ))}
          </select>
        </div>

        <div className="control-item">
          <label>画布比例</label>
          <select
            value={config.aspectRatio}
            onChange={(e) => onConfigChange('aspectRatio', e.target.value)}
          >
            <option value="16:9">16:9 (宽屏)</option>
            <option value="4:3">4:3 (标准)</option>
            <option value="1:1">1:1 (方形)</option>
            <option value="9:16">9:16 (竖屏)</option>
            <option value="3:4">3:4 (竖版标准)</option>
          </select>
        </div>
      </div>

      <div className="control-section">
        <h3>样式设置</h3>

        <div className="control-item">
          <label>
            间距: <span className="value">{config.padding}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={config.padding}
            onChange={(e) => onConfigChange('padding', Number(e.target.value))}
          />
        </div>

        <div className="control-item">
          <label>
            圆角: <span className="value">{config.cornerRadius}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={config.cornerRadius}
            onChange={(e) => onConfigChange('cornerRadius', Number(e.target.value))}
          />
        </div>

        <div className="control-item">
          <label>背景颜色</label>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
            />
            <input
              type="text"
              value={config.backgroundColor}
              onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      <div className="control-section">
        <h3>导出</h3>
        <button className="export-button" onClick={handleExport}>
          💾 导出图片
        </button>
        <p className="hint">导出为高清 PNG 图片</p>
      </div>

      <div className="control-section">
        <h3>使用说明</h3>
        <ul className="instructions">
          <li>📷 拖放图片到网格区域</li>
          <li>🖱️ 点击区域选择图片</li>
          <li>⌨️ Ctrl+V 粘贴截图</li>
          <li>🎨 调整样式参数</li>
          <li>💾 导出最终拼图</li>
        </ul>
      </div>
    </div>
  )
}

export default ControlPanel
