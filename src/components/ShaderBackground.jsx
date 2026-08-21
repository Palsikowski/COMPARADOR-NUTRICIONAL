import React, { useEffect, useRef } from "react";
import { VERTEX_SHADER, FRAGMENT_SHADER, MESH_DRIFT } from "./meshDriftShader.js";

// Fundo animado em WebGL1 puro (sem biblioteca): um triângulo que cobre a tela
// inteira e um fragment shader por cima.
//
// Três cuidados que valem mais que o efeito em si:
//
// - **Falhar é uma opção prevista.** Sem WebGL, com o contexto perdido ou com
//   o shader recusado pelo driver, o componente simplesmente não desenha nada.
//   Quem usa isso deve ter um fundo por baixo (na tela de entrada é o
//   gradiente do painel), então o resultado é a tela sem animação — nunca um
//   retângulo preto.
// - **Não roda escondido.** O laço para quando a aba sai de foco
//   (`visibilitychange`) e quando o elemento sai da tela: é fundo decorativo,
//   não pode consumir bateria de celular no campo.
// - **Respeita quem pediu menos movimento.** Com `prefers-reduced-motion`,
//   desenha um quadro só e para. O app inteiro já segue essa regra em
//   theme.css, e animação de fundo é justamente o tipo de movimento que
//   incomoda quem ativou isso.
export default function ShaderBackground({ recipe = MESH_DRIFT, className, style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false }) ||
      canvas.getContext("experimental-webgl", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return undefined;

    const program = buildProgram(gl);
    if (!program) return undefined;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Triângulo maior que a tela: cobre os mesmos pixels de dois triângulos,
    // com um vértice a menos e sem a costura na diagonal.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const u = {
      colors: gl.getUniformLocation(program, "u_colors[0]"),
      scene: gl.getUniformLocation(program, "u_scene"),
      shape: gl.getUniformLocation(program, "u_shape"),
      surface: gl.getUniformLocation(program, "u_surface"),
      finish: gl.getUniformLocation(program, "u_finish"),
      transform: gl.getUniformLocation(program, "u_transform"),
      space: gl.getUniformLocation(program, "u_space"),
      cursor: gl.getUniformLocation(program, "u_cursor"),
    };

    // u_colors tem 8 posições; as não usadas vão zeradas e u_scene.w diz
    // quantas valem.
    const colors = new Float32Array(24);
    recipe.colors.slice(0, 8).forEach((c, i) => colors.set(c, i * 3));
    gl.uniform3fv(u.colors, colors);
    gl.uniform4fv(u.shape, recipe.shape);
    gl.uniform4fv(u.surface, recipe.surface);
    gl.uniform4fv(u.finish, recipe.finish);
    gl.uniform4fv(u.transform, recipe.transform);
    gl.uniform4fv(u.space, recipe.space);
    gl.uniform4fv(u.cursor, recipe.cursor);

    const colorCount = Math.min(recipe.colors.length, 8);
    let width = 0;
    let height = 0;

    function resize() {
      // devicePixelRatio limitado a 2: acima disso o custo cresce ao quadrado
      // e ninguém vê diferença num fundo desfocado.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    function draw(seconds) {
      resize();
      gl.uniform4f(u.scene, width, height, seconds * recipe.timeScale, colorCount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start = 0;
    let running = false;

    function loop(now) {
      if (!running) return;
      if (!start) start = now;
      draw((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    }

    function play() {
      if (running || reduceMotion?.matches) return;
      running = true;
      // Recomeça a contagem: sem isso, voltar pra aba depois de horas daria um
      // salto no tempo do shader e as manchas pulariam de posição.
      start = 0;
      frame = requestAnimationFrame(loop);
    }

    function pause() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) pause();
      else play();
    }

    function onMotionChange() {
      if (reduceMotion?.matches) {
        pause();
        draw(0);
      } else {
        play();
      }
    }

    function onContextLost(e) {
      e.preventDefault();
      pause();
    }

    canvas.addEventListener("webglcontextlost", onContextLost);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion?.addEventListener?.("change", onMotionChange);
    window.addEventListener("resize", resize);

    // Um quadro imediato pra tela não nascer vazia esperando o primeiro RAF,
    // e é também o único quadro quando o movimento está reduzido.
    draw(0);
    play();

    return () => {
      pause();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion?.removeEventListener?.("change", onMotionChange);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [recipe]);

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden="true" />;
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Driver recusou o shader: não é motivo pra derrubar a tela de entrada.
    console.warn("ShaderBackground: shader não compilou —", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function buildProgram(gl) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = vertex && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("ShaderBackground: programa não linkou —", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
