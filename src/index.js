import { basicMatterConfig, mousePointer, mouseConstraint } from './use_matter';
import { getVerticesFromImageSrc } from './use_opencv';
import './style.css';
import nameData from './json/name_data.json'

// matter.jsオブジェクト用の変数
let Body, Bodies, Bounds, Constraint, Composite, engine;
// 画像要素、canvas要素用の変数
let imgElement, textureCanvas, matterCanvas;
// アイコンの輪郭の座標値の配列
let vertices = [];
// 物理演算を行うcanvas領域のサイズ
const matterWidth = 900;
const matterHeight = 600;

// 固定オブジェクト・その他のオブジェクト
let ground, leftWall, rightWall, slope1, slope2, slope3, slope4, cup, hourglass, hourglassConstraint;

// オブジェクトの共通オプション
const commonOptions = {
  friction: 0.01,
  density: 999,
  render: {
    fillStyle: 'rgb(80, 80, 100)',
  }
};

$(document).ready(() => {
  // 元となる画像要素、canvas要素の取得
  imgElement = $('#image-src')[0];
  textureCanvas = $('#texture-canvas')[0];
  matterCanvas = $('#matter-canvas-area')[0];

  const iconSelect = $('select')[0];
  const isRandom = $('#is-random')[0];
  const isDisplayWalls = $('#is-display-walls')[0];
  const isDisplayGround = $('#is-display-ground')[0];

  // 名前情報オブジェクトの配列
  const names = nameData['names'];

  // 名前情報からアイコン選択プルダウンのoptionを生成する
  $.each(names, (i, data) => {
    $(iconSelect).append(`<option value="${data.id}">${String(data.id).padStart(3, 0)}: ${data.name}</option>`);
  });

  // matter.jsの基本設定
  ({ Body, Bodies, Bounds, Constraint, Composite, engine } = basicMatterConfig(matterCanvas, matterWidth, matterHeight));

  // 初期の基本地形を追加
  ground = Bodies.rectangle(matterWidth / 2, matterHeight, matterWidth, 40, { ...commonOptions, isStatic: true });
  leftWall = Bodies.rectangle(0, matterHeight / 2, 40, matterHeight, { ...commonOptions, isStatic: true });
  rightWall = Bodies.rectangle(matterWidth, matterHeight / 2, 40, matterHeight, { ...commonOptions, isStatic: true });

  Composite.add(engine.world, [ground, leftWall, rightWall]);

  // 生成するアイコンの選択
  $(iconSelect).on('change', () => {
    const id = $('option:selected').val();
    imgElement.src = `./image/${id}.png`;
  });

  // ランダム生成の時はアイコン選択プルダウンを非活性にする
  $(isRandom).on('change', () => {
    $(iconSelect).prop('disabled', $(isRandom).is(':checked'));
  });

  // 左右の壁の表示切り替え
  $(isDisplayWalls).on('change', () => {
    if ($(isDisplayWalls).is(':checked')) {
      Composite.add(engine.world, [leftWall, rightWall]);
    } else {
      Composite.remove(engine.world, [leftWall, rightWall]);
    }
  });

  // 地面の表示切り替え
  $(isDisplayGround).on('change', () => {
    if ($(isDisplayGround).is(':checked')) {
      Composite.add(engine.world, ground);
    } else {
      Composite.remove(engine.world, ground);
    }
  });

  // その他オブジェクトの表示切り替え
  $('input[name="equipment"]').on('change', () => {
    switch ($('input[name="equipment"]:checked').val()) {
      case 'slope':
        removeCup(); removeHourglass(); createSlope();
        break;
      case 'cup':
        removeSlope(); removeHourglass(); createCup();
        break;
      case 'hourglass':
        removeSlope(); removeCup(); createHourglass();
        break;
      default:
        removeSlope(); removeCup(); removeHourglass();
    }
  });

  $(imgElement).on('load', () => {
    setIconObject();
  });

  $(matterCanvas).on('click', () => {
    // オブジェクトのドラッグ中は新規でオブジェクトを追加させない
    if (mouseConstraint.body) { return };

    if ($(isRandom).is(':checked')) {
      // ランダムにオブジェクトを生成する
      const id = Math.floor(Math.random() * names.length) + 1;
      $(iconSelect).prop('selectedIndex', id);
      imgElement.src = `./image/${id}.png`;
      // オブジェクトが生成されるまで時差があるので追加処理の実行を少し遅らせる
      setTimeout(() => {
        addIconObject();
      }, 50);
    } else {
      // 頂点座標が生成されていない場合は新規でオブジェクトを追加させない
      if (vertices.length === 0) { return };
      addIconObject();
    }
  });
});

const setIconObject = () => {
  // アイコンの輪郭の頂点座標を取得する
  vertices = getVerticesFromImageSrc(imgElement);

  // 輪郭の頂点を内包する矩形の境界線を生成
  const bounds = Bounds.create(vertices);
  // 境界を少し広げて元のアイコン画像の欠損を防ぐ
  const factor = 5;
  bounds.min.x -= factor;
  bounds.max.x += factor;
  bounds.min.y -= factor;
  bounds.max.y += factor;

  textureCanvas.width = bounds.max.x - bounds.min.x;
  textureCanvas.height = bounds.max.y - bounds.min.y;

  // 境界線で切り取ったアイコン（テクスチャ）をcanvasに描画する
  const textureContext = textureCanvas.getContext('2d');
  textureContext.drawImage(
    imgElement,
    bounds.min.x,
    bounds.min.y,
    textureCanvas.width,
    textureCanvas.height,
    0,
    0,
    textureCanvas.width,
    textureCanvas.height);
};

const addIconObject = () => {
  const pokeIcon = Bodies.fromVertices(mousePointer.x, mousePointer.y, vertices, {
    render: {
      sprite: {
        texture: textureCanvas.toDataURL(),
      }
    },
    friction: 0.01,
    restitution: 0.5,
  });

  Composite.add(engine.world, pokeIcon);
};

const createSlope = () => {
  if (!slope1 || !slope2 || !slope3 || !slope4) {
    slope1 = Bodies.rectangle(matterWidth * 5 / 8, matterHeight / 6, 300, 10, { ...commonOptions, angle: -Math.PI / 8, isStatic: true });
    slope2 = Bodies.rectangle(matterWidth * 3 / 8, matterHeight * 1 / 3, 300, 10, { ...commonOptions, angle: Math.PI / 8, isStatic: true });
    slope3 = Bodies.rectangle(matterWidth * 5 / 8, matterHeight / 2, 300, 10, { ...commonOptions, angle: -Math.PI / 8, isStatic: true });
    slope4 = Bodies.rectangle(matterWidth * 3 / 8, matterHeight * 2 / 3, 300, 10, { ...commonOptions, angle: Math.PI / 8, isStatic: true });
  }

  Composite.add(engine.world, [slope1, slope2, slope3, slope4]);
};

const removeSlope = () => {
  if (slope1 || slope2 || slope3 || slope4) {
    Composite.remove(engine.world, [slope1, slope2, slope3, slope4]);
  }
};

const createCup = () => {
  if (!cup) {
    const center = { x: matterWidth / 2, y: 400 },
      bottomLength = 400,
      sideHeight = 500,
      cupThickness = 30,
      cupCommon = { render: { fillStyle: 'rgb(70, 120, 30)' } };

    // 部品（底、左右の側面）をそれぞれ生成する
    const bottom = Bodies.rectangle(center.x, center.y, bottomLength, cupThickness, {
      ...commonOptions, ...cupCommon
    });
    const sideL = Bodies.rectangle(bottom.bounds.min.x + cupThickness / 2, bottom.bounds.max.y - sideHeight / 2, cupThickness, sideHeight, {
      ...commonOptions, ...cupCommon
    });
    const sideR = Bodies.rectangle(bottom.bounds.max.x - cupThickness / 2, bottom.bounds.max.y - sideHeight / 2, cupThickness, sideHeight, {
      ...commonOptions, ...cupCommon
    });

    // 部品を結合してカップを生成する
    cup = Body.create({
      parts: [bottom, sideL, sideR],
      inertia: Infinity
    });
  }

  Composite.add(engine.world, cup);
};

const removeCup = () => {
  if (cup) {
    Composite.remove(engine.world, cup);
  }
};

const createHourglass = () => {
  if (!hourglass || !hourglassConstraint) {
    const center = { x: matterWidth / 2, y: matterHeight / 2 },
      upperCenterY = 62,
      halfAxisHeight = center.y - upperCenterY,
      theta = Math.PI / 6,
      plateThickness = 40,
      glassThickness = 20,
      plateDiameter = 310,
      glassRadius = 135;

    // 部品（上面、底面、左上・右上・左下・右下のガラス部分）をそれぞれ生成する
    const glassUL = Bodies.fromVertices(center.x, upperCenterY, [
      { x: 0, y: 0 }, { x: glassRadius, y: glassRadius / Math.tan(theta) },
      { x: glassRadius, y: glassRadius / Math.tan(theta) + glassThickness / Math.sin(theta) },
      { x: 0, y: glassThickness / Math.sin(theta) }
    ], { ...commonOptions, render: { fillStyle: 'rgb(200, 230, 255)' } });
    Body.translate(glassUL, { x: -85, y: 120 });

    const glassUR = Bodies.fromVertices(center.x, upperCenterY, [
      { x: plateDiameter, y: 0 }, { x: plateDiameter - glassRadius, y: glassRadius / Math.tan(theta) },
      { x: plateDiameter - glassRadius, y: glassRadius / Math.tan(theta) + glassThickness / Math.sin(theta) },
      { x: plateDiameter, y: glassThickness / Math.sin(theta) },
    ], { ...commonOptions, render: { fillStyle: 'rgb(200, 230, 255)' } });
    Body.translate(glassUR, { x: 85, y: 120 });

    const plateU = Bodies.rectangle(center.x, upperCenterY, plateDiameter, plateThickness, {
      ...commonOptions, render: { fillStyle: 'rgb(160, 60, 60)' }
    });

    const glassLL = Bodies.fromVertices(center.x, center.y + halfAxisHeight, [
      { x: plateDiameter, y: 0 }, { x: plateDiameter - glassRadius, y: glassRadius / Math.tan(theta) },
      { x: plateDiameter - glassRadius, y: glassRadius / Math.tan(theta) + glassThickness / Math.sin(theta) },
      { x: plateDiameter, y: glassThickness / Math.sin(theta) },
    ], { ...commonOptions, render: { fillStyle: 'rgb(200, 230, 255)' } });
    Body.translate(glassLL, { x: -85, y: -120 });

    const glassLR = Bodies.fromVertices(center.x, center.y + halfAxisHeight, [
      { x: 0, y: 0 }, { x: glassRadius, y: glassRadius / Math.tan(theta) },
      { x: glassRadius, y: glassRadius / Math.tan(theta) + glassThickness / Math.sin(theta) },
      { x: 0, y: glassThickness / Math.sin(theta) },
    ], { ...commonOptions, render: { fillStyle: 'rgb(200, 230, 255)' } });
    Body.translate(glassLR, { x: 85, y: -120 });

    const plateL = Bodies.rectangle(center.x, center.y + halfAxisHeight, plateDiameter, plateThickness, {
      ...commonOptions, render: { fillStyle: 'rgb(160, 60, 60)' }
    });

    // 部品を結合して砂時計を生成する
    hourglass = Body.create({
      parts: [glassUL, glassUR, plateU, glassLL, glassLR, plateL],
    });

    // 砂時計の中心とcanvas中心を合わせて結び付ける
    hourglassConstraint = Constraint.create({
      pointA: center,
      bodyB: hourglass,
      length: 0,
    });
  }

  Composite.add(engine.world, [hourglass, hourglassConstraint]);
};

const removeHourglass = () => {
  if (hourglass) {
    Composite.remove(engine.world, [hourglass, hourglassConstraint]);
  }
};
