const getVerticesFromImageSrc = (imgElement) => {
  // img要素の画像を読み込む
  const src = cv.imread(imgElement);
  // グレースケール化用Matの生成
  const dstGray = new cv.Mat(src.cols, src.rows, cv.CV_8UC1);
  // 二値化用Matの設定
  const dstBinary = new cv.Mat(src.cols, src.rows, cv.CV_8UC4);
  // グレースケール化
  cv.cvtColor(src, dstGray, cv.COLOR_RGBA2GRAY);
  // 二値化
  cv.threshold(dstGray, dstBinary, 1, 255, cv.THRESH_BINARY);
  dstGray.delete();

  // 輪郭の抽出
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(dstBinary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE, { x: 0, y: 0 });
  dstBinary.delete();
  hierarchy.delete();

  // 輪郭の座標を頂点として格納
  const vertices = [];
  for (let i = 0; i < contours.size(); i++) {
    let d = contours.get(i).data32S;
    for (let j = 0; j < d.length; j += 2) {
      vertices.push({ x: d[j], y: d[j + 1] });
    }
  }
  contours.delete();

  return vertices;
};

export { getVerticesFromImageSrc };
