import Matter from 'matter-js';

const mousePointer = { x: 0, y: 0 };
let mouseConstraint = null;

const basicMatterConfig = (canvas, width, height) => {
  // 使用モジュール
  const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Bounds = Matter.Bounds,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    Composite = Matter.Composite;

  // エンジンの生成
  const engine = Engine.create();

  // レンダリングの設定
  const render = Render.create({
    element: canvas,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: '#f0f6da'
    }
  });

  // マウス、マウス制約を生成
  const mouse = Mouse.create(canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      angularStiffness: 0,
      render: {
        visible: false
      }
    }
  });

  // マウスポインタの座標を格納する
  Events.on(mouseConstraint, 'mousemove', e => {
    mousePointer.x = e.mouse.position.x;
    mousePointer.y = e.mouse.position.y;
  });

  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  // レンダリングを実行
  Render.run(render);

  // エンジンを実行
  Runner.run(engine);

  return { Body, Bodies, Bounds, Constraint, Composite, engine };
};

export { basicMatterConfig, mousePointer, mouseConstraint };
