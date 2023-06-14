import { GUI } from "https://cdn.skypack.dev/dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  const TRAY = document.getElementById("js-tray-slide");
  console.log(TRAY);

  const fov = 20;
  const aspect = 45;
  const near = 0.1;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(10, 0.5, 0);

  const controls = new OrbitControls(camera, canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("brown");

  let activeOption = "Torus003";

  const colorpalette = [
    {
      color: "f4a9c9",
    },
    {
      color: "5cc2b7",
    },
    {
      color: "63200d",
    },
    {
      color: "faeadb",
    },
  ];

  {
    const skyColor = 0x7ecdff;
    const groundColor = 0xffb07e;
    const intensity = 0.4;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xffffff;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 6, 2);
    scene.add(light);
    scene.add(light.target);
  }
  let loadedModel;
  {
    const gltfLoader = new GLTFLoader();

    gltfLoader.load("../sprinkles.glb", (gltf) => {
      loadedModel = gltf;
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      controls.maxDistance = boxSize * 5;
      controls.minDistance = boxSize * 2;
      controls.target.copy(boxCenter);
      controls.update();

      scene.add(root);

      const options = document.querySelectorAll(".option");

      for (const option of options) {
        option.addEventListener("click", selectOption);
      }

      function selectOption(e) {
        let option = e.target;
        activeOption = option.dataset.option;
        for (let active of options) {
          active.classList.remove("active");
        }
        option.classList.add("active");
      }

      const swatches = document.querySelectorAll(".colorpalette_color");

      for (const swatch of swatches) {
        swatch.addEventListener("click", selectColor);
      }

      function selectColor(e) {
        let color = colorpalette[parseInt(e.target.dataset.key)];
        let new_material = new THREE.MeshStandardMaterial({
          color: parseInt("0x" + color.color),
          roughness: color.roughness ? color.roughness : 0,
          side: color.side ? color.side : 2,
        });

        setMaterial(root, activeOption, new_material);
      }

      function setMaterial(parent, type, material) {
        parent.traverse((model) => {
          if (model.isMesh && model.name != null) {
            if (model.name == type) {
              model.material = material;
              scene.background = new THREE.Color(material.color);
            }
          }
        });
      }
    });
  }

  function buildColors(colorpalette) {
    for (let [i, color] of colorpalette.entries()) {
      let swatch = document.createElement("div");
      swatch.classList.add("colorpalette_color");

      swatch.style.background = "#" + color.color;

      swatch.setAttribute("data-key", i);
      TRAY.append(swatch);
    }
  }

  buildColors(colorpalette);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    if (loadedModel) {
      loadedModel.scene.rotateX(0.005);
      loadedModel.scene.rotateY(0.01);
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
