// script.js
// Import necessary modules from Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Get the canvas element
const canvas = document.getElementById('webgl-canvas');

// Get modal DOM elements
const modalOverlay = document.getElementById('modal-overlay');
const tattooModal = document.getElementById('tattoo-modal');
const modalCloseButton = document.querySelector('.modal-close-button');
const tattooModalTitle = document.getElementById('tattoo-modal-title');
const tattooModalImage = document.getElementById('tattoo-modal-image');
const tattooModalDescription = document.getElementById('tattoo-modal-description');
// The following elements (tattooModalArtist, tattooModalDate) will become redundant if
// all content is consolidated into tattooModalDescription.
// Consider removing them from your HTML if they are not used elsewhere.
// const tattooModalArtist = document.getElementById('tattoo-modal-artist');
// const tattooModalDate = document.getElementById('tattoo-modal-date');


// Define your tattoo data
// KEY: Use the exact name of your mesh from Blender (e.g., 'polySurface1.001')
const tattooData = {

//LAIKA
    'polySurface1001': { // Use the exact name of your tattoo mesh from Blender
        title: "Laika the dog",
        image: "images/laika-tattoo.png", // Ensure 'laika-tattoo.png' is in your 'images' folder
        description: "A tribute to Laika, the first living being sent into space. Engulfed in heat, she died in orbit. Man's best friend obeyed a one-way mission in the name of humanity's reach for the stars",
        artistName: "Erin M. OKeefe", // Changed: The artist's actual name
        artistLink: "https://www.hellhiatus.com/", // OPTIONAL: Link for the artist's name
        artistHandle: "@ Black Serum, SF", // OPTIONAL: The artist's handle or other non-linked text
        date: "April 4th, 2025",
        // NEW: Data for linking a word in the title
        linkedTitleWord: "Laika", // The specific word in the title to turn into a link
        linkedTitleUrl: "https://en.wikipedia.org/wiki/Laika" // The URL for that word
    },
    // Add more tattoo objects here as you add more meshes in Blender
    // Example for another tattoo:
    // 'another_tattoo_mesh_name': {
    //     title: "Geometric Wolf",
    //     image: "images/wolf-tattoo.jpg", // Remember to add this image file
    //     description: "A stylized geometric wolf on the left forearm.",
    //     artistName: "John Smith",
    //     artistLink: "https://example.com/john-smith",
    //     artistHandle: "", // No handle for this artist
    //     date: "March 2022",
    //     linkedTitleWord: "Wolf",
    //     linkedTitleUrl: "https://en.wikipedia.org/wiki/Wolf"
    // }
};


// Check if the canvas element was found
if (!canvas) {
    console.error("Canvas element with ID 'webgl-canvas' not found. Make sure your HTML has <canvas id='webgl-canvas'></canvas>");
} else {
    // 2. Create a Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background for the 3D viewport

    // 3. Create a Camera
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    // Adjust camera position (x, y, z) - you will need to fine-tune these for your specific model
    camera.position.set(0, 5, 40); // Example: Increased Y (camera height) and Z (distance)

    // 4. Create a Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight); // Set renderer size to canvas's CSS size
    renderer.setPixelRatio(window.devicePixelRatio); // Handle high-DPI screens

    // 5. Add Lighting (Removed, as MeshBasicMaterial does not react to lights)
    // If you switch to MeshStandardMaterial or MeshPhongMaterial, you would uncomment these:
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    // scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // directionalLight.position.set(1, 1, 1).normalize();
    // scene.add(directionalLight);

    // 6. Load Your 3D Model
    const loader = new GLTFLoader();
    let loadedModel; // To store the reference to the loaded model for raycasting later
    loader.load(
        'models/model.glb', // Ensure this path matches your file structure!
        function (gltf) {
            loadedModel = gltf.scene; // Store the model
            scene.add(loadedModel);

            // Adjust model position/scale if it's too big/small or off-center
            // These values are examples; you will need to fine-tune them based on your model's scale in Blender.
            loadedModel.scale.set(60, 60, 60); // Example: Significantly increased scale
            loadedModel.position.set(0, -5, 0); // Example: Adjust model Y position for centering

            // Correctly placed: Traverse the model to change materials after it's loaded
            loadedModel.traverse((child) => {
                if (child.isMesh) {
                    // If you want textures from Blender to show, keep child.material as is,
                    // or apply a material that reacts to light (MeshStandardMaterial/MeshPhongMaterial)
                    // and ensure lights are uncommented above.

                    // --- If you want the model to appear flat/unlit (current state): ---
                    const originalMap = child.material.map;
                    const originalColor = child.material.color;
                    child.material = new THREE.MeshBasicMaterial({
                        map: originalMap,
                        color: originalColor
                    });

                    // --- Make the tattoo mesh transparent for interaction: ---
                    if (child.name === 'polySurface1001') { // Target your specific tattoo mesh by name
                        // REVERTED to use originalMap from the GLTF model
                        child.material = new THREE.MeshBasicMaterial({
                            transparent: true,
                            opacity: 1, // TEMPORARY CHANGE FOR TESTING - Set to 0 for invisible
                            map: originalMap, // Reverted to originalMap
                            color: new THREE.Color(0xFFFFFF) // Explicitly set color to white for brightness
                        });
                        console.log("Tattoo mesh found and material set:", child.name); // Debugging log
                    }
                }
            });

            // console.log('Model loaded successfully:', loadedModel); // Debugging log (can be removed)
        },
        // Optional: called while loading is progressing (useful for loading bars)
        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // Debugging log (can be removed)
        },
        // Called when loading has errors
        function (error) {
            console.error('An error occurred while loading the model:', error);
        }
    );

    // 7. Add OrbitControls (allows you to rotate the model with your mouse)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // For a smoother "feel"
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Prevent camera from panning up/down with right-click

    // Restrict vertical rotation to only the horizontal plane
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;

    // Disable zooming in/out
    controls.enableZoom = false;

    // Adjust the target point that the camera orbits around.
    // This 'y' value (second parameter) should be adjusted to vertically center your model.
    controls.target.set(0, 5, 0); // Example: Target Y = 5 for a taller model (fine-tune this)

    controls.update(); // Must be called after any manual changes to the controls' target


    // --- START: JAVASCRIPT FOR CLICK DETECTION AND MODAL CONTROL ---

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to populate and show the modal
    function showTattooModal(tattooName) {
        // console.log("Attempting to show modal for:", tattooName);
        const data = tattooData[tattooName];
        if (data) {
            // Handle the title with a possible linked word
            let titleHtml = data.title;
            if (data.linkedTitleWord && data.linkedTitleUrl) {
                const linkedSpan = `<a href="${data.linkedTitleUrl}" target="_blank">${data.linkedTitleWord}</a>`;
                // Use a regular expression with 'g' flag if you want to replace all occurrences,
                // otherwise it replaces only the first. For a single word, first is usually fine.
                titleHtml = data.title.replace(new RegExp(`\\b${data.linkedTitleWord}\\b`, 'g'), linkedSpan);
            }
            tattooModalTitle.innerHTML = titleHtml; // Use innerHTML for the link

            tattooModalImage.src = data.image;

            let contentHtml = '';

            // Artist (name with link and handle)
            if (data.artistName) {
                let artistText = `<b>Artist:</b> `;
                if (data.artistLink) {
                    artistText += `<a href="${data.artistLink}" target="_blank">${data.artistName}</a>`;
                } else {
                    artistText += `${data.artistName}`;
                }
                if (data.artistHandle) { // Add handle, no link
                    artistText += ` ${data.artistHandle}`;
                }
                contentHtml += artistText + `<br>`;
            }

            // Gotcha date: date
            if (data.date) {
                contentHtml += `<b>Gotcha date:</b> ${data.date}<br>`;
            }

            // About:
            if (data.description) {
                contentHtml += `<b>About:</b> ${data.description}`;
            }

            tattooModalDescription.innerHTML = contentHtml; // Set the combined HTML content

            // --- START MODIFICATION FOR MODAL VISIBILITY ---
            // Directly set inline styles to ensure visibility
            modalOverlay.style.display = 'flex'; // Ensure it's displayed
            modalOverlay.style.opacity = '1';    // Make it fully opaque
            modalOverlay.style.visibility = 'visible'; // Make it visible
            modalOverlay.classList.remove('modal-hidden');
            // --- END MODIFICATION FOR MODAL VISIBILITY ---

            // You can remove the class removal line, as we're now setting styles directly
            // modalOverlay.classList.remove('modal-hidden'); // Original line

            // console.log("Modal should now be visible."); // Debugging log
        } else {
            console.warn("No data found for tattoo:", tattooName);
        }
    }

    // Function to hide the modal
    function hideTattooModal() {
        // --- START MODIFICATION FOR MODAL HIDING ---
        // Hide the modal by setting inline styles
        modalOverlay.style.opacity = '0';
        modalOverlay.style.visibility = 'hidden';
        modalOverlay.classList.add('modal-hidden');
        // You might also want to set display: 'none' after the transition ends for accessibility/performance
        // For now, let's rely on opacity/visibility for the transition
        // --- END MODIFICATION FOR MODAL HIDING ---

        // Original line to add the class back
        // modalOverlay.classList.add('modal-hidden');
    }

    // Event listener for clicks on the canvas
    function onClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        // from the center of the screen
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        // Only intersect with children of the loaded model
        if (loadedModel) { // Ensure model is loaded before raycasting
            const intersectableObjects = [];

            // --- START MODIFICATION HERE for detailed logging ---
            console.log("--- Raycasting Scan Start ---");
            loadedModel.traverse((child) => {
                if (child.isMesh) {
                    console.log(`Scanning mesh: ${child.name}, isMesh: ${child.isMesh}`);
                    // Check if the child's name is one of your defined tattoos in tattooData
                    if (tattooData[child.name]) {
                        intersectableObjects.push(child);
                        console.log(`   --> MATCH: Added ${child.name} to intersectableObjects.`);
                    }
                } else {
                    console.log(`Scanning object (not mesh): ${child.name}, type: ${child.type}`);
                }
            });
            console.log("--- Raycasting Scan End ---");
            // --- END MODIFICATION HERE ---


            // Perform raycasting only on intersectable objects
            const intersects = raycaster.intersectObjects(intersectableObjects, false);

            console.log("Raycaster intersects:", intersects); // Keep this for debugging

            // Check if any of our identified tattoo meshes were clicked
            for (let i = 0; i < intersects.length; i++) {
                const clickedObject = intersects[i].object;
                console.log("Clicked object detected by raycaster:", clickedObject.name);

                // Check if clicked object name is in our tattooData
                if (tattooData[clickedObject.name]) { // This condition will now only pass for actual tattoos
                    console.log("Match found in tattooData for:", clickedObject.name);
                    showTattooModal(clickedObject.name); // Show modal with data for this tattoo
                    return; // Stop after finding the first clicked tattoo
                }
            }
            console.log("No relevant object clicked.");
        }
    }


    // Add click event listeners
    canvas.addEventListener('click', onClick);
    modalCloseButton.addEventListener('click', hideTattooModal);
    // Optional: Hide modal if clicking outside the modal content (on the overlay)
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            hideTattooModal();
        }
    });

    // --- END: JAVASCRIPT FOR CLICK DETECTION AND MODAL CONTROL ---


    // 8. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        controls.update();

        renderer.render(scene, camera);
    }
    animate();

    // 9. Handle Window Resizing
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    });

    // console.log("Three.js script initialized and canvas found!"); // Debugging log (can be removed)
}