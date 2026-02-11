/**
 * 导出拼图为图片
 * @param {Object} config - 配置信息
 * @param {Object} images - 图片数据
 * @param {Object} layoutInfo - 布局信息（包含比例）
 */
export const exportToImage = async (config, images, layoutInfo) => {
  const { aspectRatio, padding, cornerRadius, backgroundColor, gridCount } = config

  // 解析宽高比
  const [w, h] = aspectRatio.split(':').map(Number)

  // 设置输出尺寸（高清）
  const outputWidth = 2400
  const outputHeight = Math.round(outputWidth * (h / w))

  // 创建 Canvas
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')

  // 填充背景色
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, outputWidth, outputHeight)

  // 计算布局
  const layout = calculateLayout(gridCount, outputWidth, outputHeight, padding, layoutInfo)

  // 绘制图片
  for (let i = 0; i < layout.length; i++) {
    const cell = layout[i]
    const imageData = images[`cell-${i}`]

    if (imageData && imageData.src) {
      await drawImageToCell(ctx, imageData.src, cell, cornerRadius)
    }
  }

  // 导出为图片
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gridflow-${Date.now()}.png`
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/**
 * 计算网格布局
 */
const calculateLayout = (count, width, height, padding, layoutInfo) => {
  const cells = []

  // 内容区域（减去外边距）
  const contentWidth = width - padding * 2
  const contentHeight = height - padding * 2

  if (!layoutInfo || count === 1) {
    cells.push({
      x: padding,
      y: padding,
      width: contentWidth,
      height: contentHeight
    })
  } else if (count === 2 && layoutInfo.type === 'horizontal') {
    const ratioX = layoutInfo.ratioX || 50
    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2

    cells.push(
      { x: padding, y: padding, width: leftWidth, height: contentHeight },
      { x: padding + leftWidth + padding, y: padding, width: rightWidth, height: contentHeight }
    )
  } else if (count === 3 && layoutInfo.type === 'left-right-1x2') {
    const ratioX = layoutInfo.ratioX || 50
    const ratioY = layoutInfo.ratioY || 50

    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2
    const topHeight = (contentHeight * ratioY / 100) - padding / 2
    const bottomHeight = (contentHeight * (100 - ratioY) / 100) - padding / 2

    cells.push(
      { x: padding, y: padding, width: leftWidth, height: contentHeight },
      { x: padding + leftWidth + padding, y: padding, width: rightWidth, height: topHeight },
      { x: padding + leftWidth + padding, y: padding + topHeight + padding, width: rightWidth, height: bottomHeight }
    )
  } else if (count === 4 && layoutInfo.type === 'grid-2x2') {
    const ratioX = layoutInfo.ratioX || 50
    const ratioY = layoutInfo.ratioY || 50

    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2
    const topHeight = (contentHeight * ratioY / 100) - padding / 2
    const bottomHeight = (contentHeight * (100 - ratioY) / 100) - padding / 2

    cells.push(
      { x: padding, y: padding, width: leftWidth, height: topHeight },
      { x: padding + leftWidth + padding, y: padding, width: rightWidth, height: topHeight },
      { x: padding, y: padding + topHeight + padding, width: leftWidth, height: bottomHeight },
      { x: padding + leftWidth + padding, y: padding + topHeight + padding, width: rightWidth, height: bottomHeight }
    )
  } else if (count === 5 && layoutInfo.type === 'left-right-2x2') {
    const ratioX = layoutInfo.ratioX || 50
    const ratioY = layoutInfo.ratioY || 50

    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2
    const topHeight = (contentHeight * ratioY / 100) - padding / 2
    const bottomHeight = (contentHeight * (100 - ratioY) / 100) - padding / 2

    const rightCellWidth = (rightWidth - padding) / 2

    cells.push(
      { x: padding, y: padding, width: leftWidth, height: contentHeight },
      { x: padding + leftWidth + padding, y: padding, width: rightCellWidth, height: topHeight },
      { x: padding + leftWidth + padding + rightCellWidth + padding, y: padding, width: rightCellWidth, height: topHeight },
      { x: padding + leftWidth + padding, y: padding + topHeight + padding, width: rightCellWidth, height: bottomHeight },
      { x: padding + leftWidth + padding + rightCellWidth + padding, y: padding + topHeight + padding, width: rightCellWidth, height: bottomHeight }
    )
  } else if (count === 6 && layoutInfo.type === 'grid-2x3') {
    const ratioX = layoutInfo.ratioX || 50
    const ratioY1 = layoutInfo.ratioY1 || 33.33
    const ratioY2 = layoutInfo.ratioY2 || 66.67

    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2

    const row1Height = (contentHeight * ratioY1 / 100) - padding * 2 / 3
    const row2Height = (contentHeight * (ratioY2 - ratioY1) / 100) - padding * 2 / 3
    const row3Height = (contentHeight * (100 - ratioY2) / 100) - padding * 2 / 3

    const heights = [row1Height, row2Height, row3Height]
    let currentY = padding

    for (let row = 0; row < 3; row++) {
      cells.push(
        { x: padding, y: currentY, width: leftWidth, height: heights[row] },
        { x: padding + leftWidth + padding, y: currentY, width: rightWidth, height: heights[row] }
      )
      currentY += heights[row] + padding
    }
  } else if (count === 7 && layoutInfo.type === 'left-right-2x3') {
    const ratioX = layoutInfo.ratioX || 50
    const ratioY1 = layoutInfo.ratioY1 || 33.33
    const ratioY2 = layoutInfo.ratioY2 || 66.67

    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2

    const row1Height = (contentHeight * ratioY1 / 100) - padding * 2 / 3
    const row2Height = (contentHeight * (ratioY2 - ratioY1) / 100) - padding * 2 / 3
    const row3Height = (contentHeight * (100 - ratioY2) / 100) - padding * 2 / 3

    const rightCellWidth = (rightWidth - padding) / 2

    cells.push(
      { x: padding, y: padding, width: leftWidth, height: contentHeight }
    )

    let currentY = padding
    const heights = [row1Height, row2Height, row3Height]
    for (let row = 0; row < 3; row++) {
      cells.push(
        { x: padding + leftWidth + padding, y: currentY, width: rightCellWidth, height: heights[row] },
        { x: padding + leftWidth + padding + rightCellWidth + padding, y: currentY, width: rightCellWidth, height: heights[row] }
      )
      currentY += heights[row] + padding
    }
  } else if (count === 8 && layoutInfo.type === 'left2-right-2x3') {
    const ratioX = layoutInfo.ratioX || 50
    const ratioYLeft = layoutInfo.ratioYLeft || 66.67
    const ratioY1 = layoutInfo.ratioY1 || 33.33
    const ratioY2 = layoutInfo.ratioY2 || 66.67

    const leftWidth = (contentWidth * ratioX / 100) - padding / 2
    const rightWidth = (contentWidth * (100 - ratioX) / 100) - padding / 2

    // 左侧两张图片
    const leftTopHeight = (contentHeight * ratioYLeft / 100) - padding / 2
    const leftBottomHeight = (contentHeight * (100 - ratioYLeft) / 100) - padding / 2

    cells.push(
      { x: padding, y: padding, width: leftWidth, height: leftTopHeight },
      { x: padding, y: padding + leftTopHeight + padding, width: leftWidth, height: leftBottomHeight }
    )

    // 右侧2×3网格
    const row1Height = (contentHeight * ratioY1 / 100) - padding * 2 / 3
    const row2Height = (contentHeight * (ratioY2 - ratioY1) / 100) - padding * 2 / 3
    const row3Height = (contentHeight * (100 - ratioY2) / 100) - padding * 2 / 3

    const rightCellWidth = (rightWidth - padding) / 2

    let currentY = padding
    const heights = [row1Height, row2Height, row3Height]
    for (let row = 0; row < 3; row++) {
      cells.push(
        { x: padding + leftWidth + padding, y: currentY, width: rightCellWidth, height: heights[row] },
        { x: padding + leftWidth + padding + rightCellWidth + padding, y: currentY, width: rightCellWidth, height: heights[row] }
      )
      currentY += heights[row] + padding
    }
  } else {
    // 自动网格
    const cols = Math.ceil(Math.sqrt(count))
    const rows = Math.ceil(count / cols)
    const cellWidth = (contentWidth - padding * (cols - 1)) / cols
    const cellHeight = (contentHeight - padding * (rows - 1)) / rows

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      cells.push({
        x: padding + col * (cellWidth + padding),
        y: padding + row * (cellHeight + padding),
        width: cellWidth,
        height: cellHeight
      })
    }
  }

  return cells
}

/**
 * 绘制图片到单元格（带圆角）
 */
const drawImageToCell = (ctx, imageSrc, cell, cornerRadius) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const { x, y, width, height } = cell

      // 保存上下文状态
      ctx.save()

      // 创建圆角矩形路径
      if (cornerRadius > 0) {
        ctx.beginPath()
        ctx.moveTo(x + cornerRadius, y)
        ctx.lineTo(x + width - cornerRadius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius)
        ctx.lineTo(x + width, y + height - cornerRadius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height)
        ctx.lineTo(x + cornerRadius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius)
        ctx.lineTo(x, y + cornerRadius)
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y)
        ctx.closePath()
        ctx.clip()
      }

      // 计算图片缩放（Center Crop）
      const imgAspect = img.width / img.height
      const cellAspect = width / height

      let drawWidth, drawHeight, offsetX, offsetY

      if (imgAspect > cellAspect) {
        // 图片更宽，按高度缩放
        drawHeight = height
        drawWidth = height * imgAspect
        offsetX = x - (drawWidth - width) / 2
        offsetY = y
      } else {
        // 图片更高，按宽度缩放
        drawWidth = width
        drawHeight = width / imgAspect
        offsetX = x
        offsetY = y - (drawHeight - height) / 2
      }

      // 绘制图片
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

      // 恢复上下文状态
      ctx.restore()

      resolve()
    }

    img.onerror = () => {
      console.error('Failed to load image:', imageSrc)
      resolve()
    }

    img.src = imageSrc
  })
}
