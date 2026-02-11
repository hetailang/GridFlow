import { useState, useRef, useEffect } from 'react'
import './Divider.css'

function Divider({ direction, position, onDrag }) {
  const [isDragging, setIsDragging] = useState(false)
  const dividerRef = useRef(null)
  const dragStartPos = useRef(0)
  const initialPosition = useRef(0)
  const containerSize = useRef(0)

  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // 找到最近的 content-wrapper 父容器来获取尺寸
    const wrapper = dividerRef.current?.closest('.content-wrapper')
    if (wrapper) {
      containerSize.current = direction === 'horizontal'
        ? wrapper.offsetWidth
        : wrapper.offsetHeight
    }

    setIsDragging(true)
    dragStartPos.current = direction === 'horizontal' ? e.clientX : e.clientY
    initialPosition.current = position
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = currentPos - dragStartPos.current
      const deltaPercent = (delta / containerSize.current) * 100

      let newPosition = initialPosition.current + deltaPercent
      newPosition = Math.max(20, Math.min(80, newPosition))

      onDrag(newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, direction, onDrag])

  const style = direction === 'horizontal'
    ? { left: `${position}%`, top: 0, cursor: 'col-resize' }
    : { top: `${position}%`, left: 0, cursor: 'row-resize' }

  return (
    <div
      ref={dividerRef}
      className={`divider ${direction} ${isDragging ? 'dragging' : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      <div className="divider-handle" />
    </div>
  )
}

export default Divider
