import * as THREE from '../vendor/three.module.js';

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BRIGHT_FRAG = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform float uThreshold;
  uniform float uKnee;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float l = max(c.r, max(c.g, c.b));
    float k = smoothstep(uThreshold, uThreshold + uKnee, l);
    gl_FragColor = vec4(c * k, 1.0);
  }
`;

const BLUR_FRAG = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform vec2 uTexel;
  uniform vec2 uDirection;
  varying vec2 vUv;
  void main() {
    vec2 stepUv = uTexel * uDirection;
    vec3 c = texture2D(tDiffuse, vUv).rgb * 0.2270270270;
    c += texture2D(tDiffuse, vUv + stepUv * 1.3846153846).rgb * 0.3162162162;
    c += texture2D(tDiffuse, vUv - stepUv * 1.3846153846).rgb * 0.3162162162;
    c += texture2D(tDiffuse, vUv + stepUv * 3.2307692308).rgb * 0.0702702703;
    c += texture2D(tDiffuse, vUv - stepUv * 3.2307692308).rgb * 0.0702702703;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const COMPOSITE_FRAG = /* glsl */`
  uniform sampler2D tScene;
  uniform sampler2D tBloom;
  uniform float uTime;
  uniform float uBloom;
  uniform float uGrain;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 c = texture2D(tScene, vUv).rgb;
    vec3 bloom = texture2D(tBloom, vUv).rgb;
    c += bloom * uBloom;

    // Gentle S-curve for noir contrast: deeper blacks, controlled highlights.
    c = max(c - 0.012, 0.0) * 1.05;

    // Cinematic noir grade: cool shadows, warm sodium highlights, light desat.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c * vec3(0.9, 1.03, 1.06), c, smoothstep(0.0, 0.55, l));
    c = mix(c, c * vec3(1.07, 1.0, 0.92), smoothstep(0.55, 1.0, l) * 0.6);
    c = mix(vec3(l), c, 0.94);

    // Restrained lens vignette.
    vec2 q = vUv - 0.5;
    c *= 1.0 - dot(q, q) * 0.6;

    // Fine film grain, resolution independent.
    vec2 gp = floor(vUv * uResolution);
    float n = hash(gp + floor(uTime * 24.0));
    c += (n - 0.5) * 0.014 * uGrain;

    c = max(c, 0.0);
    gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
  }
`;

export class PostFX {
  constructor(renderer, scene, camera, opts = {}) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.lowPower = !!opts.lowPower;
    // Internal render scale. Mobile GPUs pay for every full-screen pass, so
    // trade a little sharpness for a stable frame rate there.
    this.scale = this.lowPower ? 0.82 : 1;

    const webgl2 = !!renderer.capabilities?.isWebGL2;
    const floatOK = webgl2 && (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
    this.hdrType = floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType;
    this.samples = webgl2 && !this.lowPower ? 4 : 0;

    this.sceneRT = new THREE.WebGLRenderTarget(1, 1, {
      type: this.hdrType,
      depthBuffer: true,
      stencilBuffer: false,
      samples: this.samples
    });
    this.sceneRT.texture.colorSpace = THREE.LinearSRGBColorSpace;
    this.sceneRT.texture.minFilter = THREE.LinearFilter;
    this.sceneRT.texture.magFilter = THREE.LinearFilter;

    this.bloomA = new THREE.WebGLRenderTarget(1, 1, {
      type: this.hdrType, depthBuffer: false, stencilBuffer: false
    });
    this.bloomB = new THREE.WebGLRenderTarget(1, 1, {
      type: this.hdrType, depthBuffer: false, stencilBuffer: false
    });
    this.bloomA.texture.colorSpace = THREE.LinearSRGBColorSpace;
    this.bloomB.texture.colorSpace = THREE.LinearSRGBColorSpace;

    this.quadScene = new THREE.Scene();
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);

    this.brightMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: BRIGHT_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tDiffuse: { value: null },
        uThreshold: { value: 0.82 },
        uKnee: { value: 0.22 }
      }
    });

    this.blurMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: BLUR_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tDiffuse: { value: null },
        uTexel: { value: new THREE.Vector2(1, 1) },
        uDirection: { value: new THREE.Vector2(1, 0) }
      }
    });

    this.compositeMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        uTime: { value: 0 },
        uBloom: { value: 0.62 },
        uGrain: { value: 1 },
        uResolution: { value: new THREE.Vector2(1, 1) }
      }
    });
  }

  setSize(width, height, pixelRatio = 1) {
    const w = Math.max(1, Math.floor(width * pixelRatio * this.scale));
    const h = Math.max(1, Math.floor(height * pixelRatio * this.scale));
    this.sceneRT.setSize(w, h);
    this.bloomA.setSize(Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.5)));
    this.bloomB.setSize(Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.5)));
    this.width = w;
    this.height = h;
    this.blurMat.uniforms.uTexel.value.set(1 / Math.max(1, w * 0.5), 1 / Math.max(1, h * 0.5));
    this.compositeMat.uniforms.uResolution.value.set(w, h);
  }

  render(dt = 0) {
    if (!this.enabled) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const r = this.renderer;

    r.setRenderTarget(this.sceneRT);
    r.clear();
    r.render(this.scene, this.camera);

    // Bright pass at half resolution.
    this.quad.material = this.brightMat;
    this.brightMat.uniforms.tDiffuse.value = this.sceneRT.texture;
    r.setRenderTarget(this.bloomA);
    r.clear();
    r.render(this.quadScene, this.quadCamera);

    // Two-direction Gaussian blur.
    this.quad.material = this.blurMat;
    this.blurMat.uniforms.tDiffuse.value = this.bloomA.texture;
    this.blurMat.uniforms.uDirection.value.set(1, 0);
    r.setRenderTarget(this.bloomB);
    r.clear();
    r.render(this.quadScene, this.quadCamera);

    this.blurMat.uniforms.tDiffuse.value = this.bloomB.texture;
    this.blurMat.uniforms.uDirection.value.set(0, 1);
    r.setRenderTarget(this.bloomA);
    r.clear();
    r.render(this.quadScene, this.quadCamera);

    // Final grade + bloom composite to the canvas.
    this.quad.material = this.compositeMat;
    this.compositeMat.uniforms.tScene.value = this.sceneRT.texture;
    this.compositeMat.uniforms.tBloom.value = this.bloomA.texture;
    this.compositeMat.uniforms.uTime.value += dt;
    r.setRenderTarget(null);
    r.render(this.quadScene, this.quadCamera);
  }
}
