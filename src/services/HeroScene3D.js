/**
 * @file HeroScene3D.js
 * @description Cena WebGL do hero — malha abstrata com parallax de mouse.
 * Carregada sob demanda (dynamic import) apenas em desktop.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

export class HeroScene3D {
  /** @type {HTMLElement|null} */
  #container = null;
  /** @type {THREE.WebGLRenderer|null} */
  #renderer = null;
  /** @type {THREE.Scene|null} */
  #scene = null;
  /** @type {THREE.PerspectiveCamera|null} */
  #camera = null;
  /** @type {THREE.Group|null} */
  #group = null;
  /** @type {number|null} */
  #raf = null;
  /** @type {ResizeObserver|null} */
  #ro = null;
  /** @type {IntersectionObserver|null} */
  #io = null;
  #visible = true;
  #reducedMotion = false;
  #pointer = { x: 0, y: 0 };
  #target = { x: 0, y: 0 };
  #clock = new THREE.Clock();
  #onVisibility = null;

  /**
   * @param {HTMLElement} container
   */
  init(container) {
    this.destroy();
    if (!container) return;

    this.#container = container;
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.#scene = new THREE.Scene();
    this.#camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.#camera.position.set(0, 0.15, 5.2);

    this.#renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    this.#renderer.setPixelRatio(1);
    this.#renderer.setSize(width, height, false);
    this.#renderer.setClearColor(0x000000, 0);
    const canvas = this.#renderer.domElement;
    if (this.#container.firstChild) {
      this.#container.insertBefore(canvas, this.#container.firstChild);
    } else {
      this.#container.appendChild(canvas);
    }

    this.#group = new THREE.Group();
    this.#scene.add(this.#group);

    this.#buildMesh();
    this.#addLights();

    this.#bindEvents();
    this.#startLoop();
  }

  #buildMesh() {
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshBasicMaterial({
        color: 0xe4c878,
      })
    );
    this.#group.add(core);

    const geo = new THREE.IcosahedronGeometry(1.55, 0);
    const wire = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
    );
    this.#group.add(wire);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 0),
      new THREE.MeshBasicMaterial({
        color: 0x1a1d26,
        transparent: true,
        opacity: 0.68,
      })
    );
    this.#group.add(shell);

    const pointsGeo = new THREE.BufferGeometry();
    const count = 48;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.7 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      pointsGeo,
      new THREE.PointsMaterial({
        color: 0xe4c878,
        size: 0.03,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      })
    );
    this.#group.add(points);

    this.#group.position.set(1.35, 0.1, 0);
    this.#group.userData = { core, wire, shell, points };
  }

  #addLights() {
    // MeshBasicMaterial não precisa de luzes — mantém ambient leve caso
    // materiais mudem no futuro, sem custo significativo.
    this.#scene.add(new THREE.AmbientLight(0xc5cdd8, 0.5));
  }

  #bindEvents() {
    const onPointer = (e) => {
      const rect = this.#container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.#target.x = nx;
      this.#target.y = ny;
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    this.#container._onPointer = onPointer;

    this.#ro = new ResizeObserver(() => this.#resize());
    this.#ro.observe(this.#container);

    this.#io = new IntersectionObserver(
      ([entry]) => {
        this.#visible = entry?.isIntersecting ?? true;
        if (this.#visible) this.#startLoop();
        else this.#stopLoop();
      },
      { threshold: 0.05 }
    );
    this.#io.observe(this.#container);

    this.#onVisibility = () => {
      if (document.hidden) this.#stopLoop();
      else if (this.#visible) this.#startLoop();
    };
    document.addEventListener('visibilitychange', this.#onVisibility);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      this.#reducedMotion = mq.matches;
    };
    mq.addEventListener?.('change', onMq);
    this.#container._onMq = { mq, onMq };
  }

  #resize() {
    if (!this.#container || !this.#renderer || !this.#camera) return;
    const width = this.#container.clientWidth;
    const height = this.#container.clientHeight;
    if (!width || !height) return;
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    this.#renderer.setPixelRatio(1);
    this.#renderer.setSize(width, height, false);

    if (this.#group) {
      this.#group.position.x = width < 768 ? 0.15 : 1.35;
      this.#group.scale.setScalar(width < 768 ? 0.85 : 1);
    }
  }

  #startLoop() {
    if (this.#raf != null || document.hidden || !this.#visible) return;
    this.#animate();
  }

  #stopLoop() {
    if (this.#raf != null) cancelAnimationFrame(this.#raf);
    this.#raf = null;
  }

  #animate = () => {
    if (!this.#renderer || !this.#scene || !this.#camera || !this.#group) return;
    if (!this.#visible || document.hidden) {
      this.#raf = null;
      return;
    }

    this.#raf = requestAnimationFrame(this.#animate);

    const t = this.#clock.getElapsedTime();
    const lerp = 0.06;
    this.#pointer.x += (this.#target.x - this.#pointer.x) * lerp;
    this.#pointer.y += (this.#target.y - this.#pointer.y) * lerp;

    if (!this.#reducedMotion) {
      this.#group.rotation.y = t * 0.14 + this.#pointer.x * 0.42;
      this.#group.rotation.x = this.#pointer.y * 0.28 + Math.sin(t * 0.35) * 0.06;
      this.#group.position.y = 0.1 + Math.sin(t * 0.5) * 0.1;

      const { core, points } = this.#group.userData;
      if (core) {
        core.rotation.y = t * 0.7;
        core.rotation.x = t * 0.35;
      }
      if (points) points.rotation.y = t * 0.07;
    } else {
      this.#group.rotation.y = this.#pointer.x * 0.15;
      this.#group.rotation.x = this.#pointer.y * 0.1;
    }

    this.#camera.position.x = this.#pointer.x * 0.22;
    this.#camera.position.y = 0.15 + this.#pointer.y * 0.14;
    this.#camera.lookAt(0.6, 0, 0);

    this.#renderer.render(this.#scene, this.#camera);
  };

  destroy() {
    this.#stopLoop();

    this.#ro?.disconnect();
    this.#ro = null;
    this.#io?.disconnect();
    this.#io = null;

    if (this.#onVisibility) {
      document.removeEventListener('visibilitychange', this.#onVisibility);
      this.#onVisibility = null;
    }

    if (this.#container?._onPointer) {
      window.removeEventListener('pointermove', this.#container._onPointer);
      delete this.#container._onPointer;
    }
    if (this.#container?._onMq) {
      this.#container._onMq.mq.removeEventListener?.('change', this.#container._onMq.onMq);
      delete this.#container._onMq;
    }

    if (this.#group) {
      this.#group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    if (this.#renderer) {
      this.#renderer.dispose();
      this.#renderer.domElement?.remove();
    }

    this.#renderer = null;
    this.#scene = null;
    this.#camera = null;
    this.#group = null;
    this.#container = null;
  }
}
