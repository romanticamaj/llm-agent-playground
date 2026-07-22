// three.js 粒子場背景 — 隨章節變色、滑鼠視差、開 demo 時脈衝
import * as THREE from 'three'

let renderer, scene, camera, points, material
let targetColor = new THREE.Color('#8ea9e8')
let currentColor = new THREE.Color('#8ea9e8')
let mouseX = 0, mouseY = 0
let scrollVel = 0, lastScrollY = 0
let pulse = 0
const COUNT = 2600

export function initBg(canvas) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0d0e0b, 0.055)
  camera = new THREE.PerspectiveCamera(62, 1, 0.1, 100)
  camera.position.z = 16

  // 粒子雲：三層深度的漂浮點
  const pos = new Float32Array(COUNT * 3)
  const seed = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 46
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30
    pos[i * 3 + 2] = (Math.random() - 0.5) * 26
    seed[i] = Math.random() * Math.PI * 2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

  material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: currentColor.clone() },
      uPulse: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uPulse;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.35 + aSeed * 7.0) * 0.6;
        p.x += cos(uTime * 0.22 + aSeed * 5.0) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float size = (1.4 + sin(aSeed * 13.0) * 0.9) * (1.0 + uPulse * 1.6);
        gl_PointSize = size * (30.0 / -mv.z);
        vAlpha = smoothstep(30.0, 4.0, -mv.z) * (0.35 + 0.4 * sin(uTime * 0.6 + aSeed * 9.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.05, d) * vAlpha;
        gl_FragColor = vec4(uColor, a);
      }`,
  })
  points = new THREE.Points(geo, material)
  scene.add(points)

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
  }
  resize()
  addEventListener('resize', resize)
  addEventListener('pointermove', e => {
    mouseX = (e.clientX / innerWidth - 0.5) * 2
    mouseY = (e.clientY / innerHeight - 0.5) * 2
  }, { passive: true })
  addEventListener('scroll', () => {
    scrollVel += Math.abs(scrollY - lastScrollY) * 0.0012
    lastScrollY = scrollY
  }, { passive: true })

  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime()
    material.uniforms.uTime.value = t
    currentColor.lerp(targetColor, 0.045)
    material.uniforms.uColor.value.copy(currentColor)
    pulse = Math.max(0, pulse - 0.02)
    scrollVel = Math.max(0, scrollVel - 0.01)
    material.uniforms.uPulse.value = pulse + Math.min(scrollVel, 0.6)
    points.rotation.y += 0.0006 + scrollVel * 0.002
    points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, mouseY * 0.06, 0.03)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX * 1.2, 0.03)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -mouseY * 0.8, 0.03)
    camera.lookAt(0, 0, 0)
    if (!reduced) renderer.render(scene, camera)
    else { renderer.render(scene, camera); renderer.setAnimationLoop(null) }
  })
}

export function setBgAccent(hex) {
  targetColor = new THREE.Color(hex)
}

export function pulseBg() {
  pulse = 1
}
