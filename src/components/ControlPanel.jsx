import { useState } from 'react'
import { exportToImage, copyToClipboard, exportFinetuned, copyFinetuned } from '../utils/exportCanvas'
import './ControlPanel.css'

function ControlPanel({
  config, onConfigChange, images, layout,
  phase, onEnterFinetune, onReturnToLayout,
  selectedElement, onElementChange, onLayerChange,
  elements, canvasDisplaySize,
}) {
  const [copyStatus, setCopyStatus] = useState(null)

  const handleExport = () => {
    if (phase === 'finetune') {
      exportFinetuned(elements, config, canvasDisplaySize.width, canvasDisplaySize.height)
    } else {
      exportToImage(config, images, layout)
    }
  }

  const handleCopy = async () => {
    try {
      setCopyStatus('copying')
      if (phase === 'finetune') {
        await copyFinetuned(elements, config, canvasDisplaySize.width, canvasDisplaySize.height)
      } else {
        await copyToClipboard(config, images, layout)
      }
      setCopyStatus('success')
      setTimeout(() => setCopyStatus(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      setCopyStatus('error')
      setTimeout(() => setCopyStatus(null), 2000)
    }
  }

  const handleNumInput = (field, value) => {
    const n = parseFloat(value)
    if (!isNaN(n)) onElementChange(selectedElement.id, { [field]: n })
  }

  if (phase === 'finetune') {
    return (
      <div className="control-panel">
        <h2>精细调整</h2>

        <div className="control-section">
          <button className="phase-button return-button" onClick={onReturnToLayout}>
            ← 返回布局调整
          </button>
        </div>

        {selectedElement && (
          <div className="control-section">
            <h3>选中元素属性</h3>

            <div className="control-row">
              <div className="control-item half">
                <label>X</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) => handleNumInput('x', e.target.value)}
                />
              </div>
              <div className="control-item half">
                <label>Y</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) => handleNumInput('y', e.target.value)}
                />
              </div>
            </div>

            <div className="control-row">
              <div className="control-item half">
                <label>宽</label>
                <input
                  type="number"
                  min="20"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => handleNumInput('width', e.target.value)}
                />
              </div>
              <div className="control-item half">
                <label>高</label>
                <input
                  type="number"
                  min="20"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => handleNumInput('height', e.target.value)}
                />
              </div>
            </div>

            <div className="control-item">
              <label>旋转: <span className="value">{Math.round(selectedElement.rotation || 0)}°</span></label>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedElement.rotation || 0}
                onChange={(e) => handleNumInput('rotation', e.target.value)}
              />
            </div>

            <div className="control-item">
              <label>圆角: <span className="value">{selectedElement.cornerRadius || 0}px</span></label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.cornerRadius || 0}
                onChange={(e) => handleNumInput('cornerRadius', e.target.value)}
              />
            </div>

            {selectedElement.src && (
              <>
                <h3>图片裁剪</h3>

                <div className="control-item">
                  <button
                    className="fit-image-button"
                    onClick={() => {
                      const { width, naturalWidth, naturalHeight } = selectedElement
                      onElementChange(selectedElement.id, {
                        height: width * (naturalHeight / naturalWidth),
                        cropZoom: 1,
                        cropOffsetX: 0,
                        cropOffsetY: 0,
                      })
                    }}
                  >
                    自适应图片大小
                  </button>
                </div>

                <div className="control-item">
                  <label>内容缩放: <span className="value">{(selectedElement.cropZoom || 1).toFixed(2)}x</span></label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.05"
                    value={selectedElement.cropZoom || 1}
                    onChange={(e) => handleNumInput('cropZoom', e.target.value)}
                  />
                  <p className="hint" style={{ fontSize: '11px', margin: '4px 0 0', color: '#999' }}>
                    &lt;1 显示更多内容 | &gt;1 显示更少内容
                  </p>
                </div>

                <div className="control-item">
                  <label>裁剪偏移 X: <span className="value">{Math.round(selectedElement.cropOffsetX || 0)}%</span></label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={selectedElement.cropOffsetX || 0}
                    onChange={(e) => handleNumInput('cropOffsetX', e.target.value)}
                  />
                </div>

                <div className="control-item">
                  <label>裁剪偏移 Y: <span className="value">{Math.round(selectedElement.cropOffsetY || 0)}%</span></label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={selectedElement.cropOffsetY || 0}
                    onChange={(e) => handleNumInput('cropOffsetY', e.target.value)}
                  />
                </div>
              </>
            )}

            <h3>图层顺序</h3>
            <div className="layer-buttons">
              <button onClick={() => onLayerChange(selectedElement.id, 'top')}>置顶</button>
              <button onClick={() => onLayerChange(selectedElement.id, 'up')}>上移</button>
              <button onClick={() => onLayerChange(selectedElement.id, 'down')}>下移</button>
              <button onClick={() => onLayerChange(selectedElement.id, 'bottom')}>置底</button>
            </div>
          </div>
        )}

        {!selectedElement && (
          <div className="control-section">
            <p className="hint">点击画布中的元素以选中并编辑</p>
          </div>
        )}

        <div className="control-section">
          <h3>导出</h3>
          <button className="export-button" onClick={handleExport}>
            💾 导出图片
          </button>
          <button className="export-button copy-button" onClick={handleCopy} disabled={copyStatus === 'copying'}>
            {copyStatus === 'copying' ? '⏳ 复制中...' : copyStatus === 'success' ? '✅ 已复制' : copyStatus === 'error' ? '❌ 复制失败' : '📋 复制图片'}
          </button>
          <p className="hint">导出精细调整后的高清 PNG</p>
        </div>
      </div>
    )
  }

  // Phase 1: layout panel
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
        <button className="phase-button enter-finetune-button" onClick={onEnterFinetune}>
          进入精细调整 →
        </button>
      </div>

      <div className="control-section">
        <h3>导出</h3>
        <button className="export-button" onClick={handleExport}>
          💾 导出图片
        </button>
        <button className="export-button copy-button" onClick={handleCopy} disabled={copyStatus === 'copying'}>
          {copyStatus === 'copying' ? '⏳ 复制中...' : copyStatus === 'success' ? '✅ 已复制' : copyStatus === 'error' ? '❌ 复制失败' : '📋 复制图片'}
        </button>
        <p className="hint">导出或复制为高清 PNG 图片</p>
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
