/**
 * @file HeroScene3D.js
 * @description Cena WebGL do hero — malha abstrata com parallax de mouse.
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
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.#renderer.setSize(width, height, false);
    this.#renderer.setClearColor(0x000000, 0);
    const canvas = this.#renderer.domElement;
    // Canvas atrás do fade overlay
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
    this.#animate();
  }

  #buildMesh() {
    // Núcleo cristalino
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshStandardMaterial({
        color: 0xe4c878,
        metalness: 0.95,
        roughness: 0.12,
        emissive: 0x3a2e10,
        emissiveIntensity: 0.35,
      })
    );
    this.#group.add(core);

    // Icosaedro wireframe — presença estrutural
    const geo = new THREE.IcosahedronGeometry(1.55, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    this.#group.add(wire);

    // Casca sólida metalizada
    const shellGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x1a1d26,
      metalness: 0.88,
      roughness: 0.25,
      transparent: true,
      opacity: 0.68,
      flatShading: true,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    this.#group.add(shell);

    // Anéis orbitais
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xc5cdd8,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.55,
    });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.018, 16, 128), torusMat);
    torus.rotation.x = Math.PI / 2.6;
    torus.rotation.y = 0.35;
    this.#group.add(torus);

    const torus2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.55, 0.012, 12, 100),
      torusMat.clone()
    );
    torus2.material.opacity = 0.28;
    torus2.rotation.x = Math.PI / 1.7;
    torus2.rotation.z = 0.8;
    this.#group.add(torus2);

    const torus3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.01, 10, 80),
      new THREE.MeshStandardMaterial({
        color: 0xe4c878,
        metalness: 0.95,
        roughness: 0.15,
        transparent: true,
        opacity: 0.4,
      })
    );
    torus3.rotation.x = Math.PI / 3.2;
    torus3.rotation.y = -0.5;
    this.#group.add(torus3);

    // Satélites dourados
    const satellites = new THREE.Group();
    const satGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xe4c878,
      metalness: 0.9,
      roughness: 0.2,
    });
    for (let i = 0; i < 6; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      const angle = (i / 6) * Math.PI * 2;
      const r = 2.9;
      sat.position.set(Math.cos(angle) * r, Math.sin(angle * 1.3) * 0.45, Math.sin(angle) * r);
      sat.userData.angle = angle;
      sat.userData.radius = r;
      satellites.add(sat);
    }
    this.#group.add(satellites);

    // Campo de partículas
    const pointsGeo = new THREE.BufferGeometry();
    const count = 110;
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

    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 60;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xc5cdd8,
        size: 0.02,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
      })
    );
    this.#scene.add(dust);

    this.#group.position.set(1.35, 0.1, 0);
    this.#group.userData = { core, wire, shell, torus, torus2, torus3, points, satellites, dust };
  }

  #addLights() {
    const ambient = new THREE.AmbientLight(0xc5cdd8, 0.35);
    this.#scene.add(ambient);

    const key = new THREE.DirectionalLight(0xe4c878, 1.1);
    key.position.set(4, 3, 5);
    this.#scene.add(key);

    const fill = new THREE.DirectionalLight(0xc5cdd8, 0.45);
    fill.position.set(-3, -1, 2);
    this.#scene.add(fill);

    const rim = new THREE.PointLight(0xc9a84c, 1.2, 12);
    rim.position.set(-2, 2, 3);
    this.#scene.add(rim);
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
      },
      { threshold: 0.05 }
    );
    this.#io.observe(this.#container);

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
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.#renderer.setSize(width, height, false);

    // Empurra a malha mais ao centro em telas estreitas
    if (this.#group) {
      this.#group.position.x = width < 768 ? 0.15 : 1.35;
      this.#group.scale.setScalar(width < 768 ? 0.85 : 1);
    }
  }

  #animate = () => {
    this.#raf = requestAnimationFrame(this.#animate);
    if (!this.#renderer || !this.#scene || !this.#camera || !this.#group) return;
    if (!this.#visible) return;

    const t = this.#clock.getElapsedTime();
    const lerp = 0.06;
    this.#pointer.x += (this.#target.x - this.#pointer.x) * lerp;
    this.#pointer.y += (this.#target.y - this.#pointer.y) * lerp;

    if (!this.#reducedMotion) {
      this.#group.rotation.y = t * 0.14 + this.#pointer.x * 0.42;
      this.#group.rotation.x = this.#pointer.y * 0.28 + Math.sin(t * 0.35) * 0.06;
      this.#group.position.y = 0.1 + Math.sin(t * 0.5) * 0.1;

      const { core, torus, torus2, torus3, points, satellites, dust } = this.#group.userData;
      if (core) {
        core.rotation.y = t * 0.7;
        core.rotation.x = t * 0.35;
        core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.04);
      }
      if (torus) torus.rotation.z = t * 0.22;
      if (torus2) torus2.rotation.z = -t * 0.14;
      if (torus3) torus3.rotation.z = t * 0.3;
      if (points) points.rotation.y = t * 0.07;
      if (dust) {
        dust.rotation.y = t * 0.02;
        dust.position.x = this.#pointer.x * 0.3;
      }
      if (satellites) {
        satellites.children.forEach((sat, i) => {
          const a = sat.userData.angle + t * (0.35 + i * 0.02);
          const r = sat.userData.radius;
          sat.position.set(Math.cos(a) * r, Math.sin(a * 1.3 + t * 0.4) * 0.5, Math.sin(a) * r);
          sat.rotation.x = t + i;
          sat.rotation.y = t * 1.2;
        });
      }
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
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = null;

    this.#ro?.disconnect();
    this.#ro = null;
    this.#io?.disconnect();
    this.#io = null;

    if (this.#container?._onPointer) {
      window.removeEventListener('pointermove', this.#container._onPointer);
      delete this.#container._onPointer;
    }
    if (this.#container?._onMq) {
      this.#container._onMq.mq.removeEventListener?.('change', this.#container._onMq.onMq);
      delete this.#container._onMq;
    }

    if (this.#group) {
      const { dust } = this.#group.userData || {};
      if (dust) {
        this.#scene?.remove(dust);
        dust.geometry?.dispose();
        dust.material?.dispose();
      }
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
