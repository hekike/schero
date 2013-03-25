define(["lib/three.min", "lib/pubsub"], function (_THREE, PubSub) {
    var viewModule;
    viewModule = {

        // container
        container: null,
        containerWidth: window.innerWidth,
        containerHeight: window.innerHeight,

        // three objects
        camera: null,
        scene: null,
        renderer: null,

        // three geometries
        cube: null,
        noteArr: [],

        // note time
        noteTime: 5000,
        noteHitTime: 4300,
        controller: {
            left: null,
            middle: null,
            right: null
        },

        // create view (constructor)
        createView: function (containerDom, width, height) {

            viewModule.container = containerDom;

            if(width && height) {
                viewModule.containerWidth = width;
                viewModule.containerHeight = height;
            }

            viewModule.init();
            viewModule.animate();
        },

        // initialize
        init: function () {

            // camera
            viewModule.camera = new THREE.PerspectiveCamera(
                70,             // Field of view
                viewModule.containerWidth / viewModule.containerHeight,      // Aspect ratio
                1,            // Near plane
                3000           // Far plane
            );

            viewModule.camera.position.y = -700;
            viewModule.camera.position.z = 280;

            var lookVec = new THREE.Vector3(0,500,0);
            viewModule.camera.lookAt(lookVec);


            // scene
            viewModule.scene = new THREE.Scene();

            // light
            var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
            directionalLight.position.set( 0, 1, 0 );
            viewModule.scene.add( directionalLight );

            // floor
            var planeSimple = new THREE.PlaneGeometry( 200, 200, 10, 10);
            var matSolid = new THREE.MeshBasicMaterial( { color: 0x78d1ca } );

            var floor = new THREE.Mesh( planeSimple, matSolid );

            floor.scale.set( 25, 25, 25 );
            floor.position.z = -400;
            viewModule.scene.add( floor );


            // add table
            var geometry = new THREE.CubeGeometry(400, 1100, 20);
            var matTable = new THREE.MeshBasicMaterial( { color: 0x68a39b } );
            var cube = new THREE.Mesh(geometry, matTable);
            cube.position.y = 150;
            viewModule.scene.add(cube);

            // left
            viewModule.controller.left = new THREE.Mesh( new THREE.PlaneGeometry( 80, 80, 1, 1), new THREE.MeshBasicMaterial( { color: 0x666666 } ) );
            viewModule.controller.left.position.x = -140;
            viewModule.controller.left.position.y = -300;
            viewModule.controller.left.position.z = 10;
            viewModule.scene.add( viewModule.controller.left );

            // middle
            viewModule.controller.middle = new THREE.Mesh( new THREE.PlaneGeometry( 80, 80, 1, 1), new THREE.MeshBasicMaterial( { color: 0xd96868 } ) );
            viewModule.controller.middle.position.x = 0;
            viewModule.controller.middle.position.y = -300;
            viewModule.controller.middle.position.z = 10;
            viewModule.scene.add(  viewModule.controller.middle );

            // right
            viewModule.controller.right = new THREE.Mesh( new THREE.PlaneGeometry( 80, 80, 1, 1), new THREE.MeshBasicMaterial( { color: 0x5666e0 } ) );
            viewModule.controller.right.position.x = 140;
            viewModule.controller.right.position.y = -300;
            viewModule.controller.right.position.z = 10;
            viewModule.scene.add( viewModule.controller.right );


            // renderer
            viewModule.renderer = new THREE.CanvasRenderer();
            viewModule.renderer.setSize(viewModule.containerWidth, viewModule.containerHeight);

            viewModule.container.appendChild(viewModule.renderer.domElement);


            // events
            window.addEventListener('resize', viewModule.onWindowResize, false);

        },

        // add note
        addNote : function(type) {
            var x = -70;
            var color = 0x3c3c3c;
            switch(type) {
                case 2:
                    x = 0;
                    color = 0xdd0000;
                    break;
                case 3:
                    x = 70;
                    color = 0x0b43d1;
                    break;
            }

            // add note to scene
            var geometry = new THREE.CylinderGeometry(10, 18, 10, 10, 3, false);
            var material = new THREE.MeshBasicMaterial( { color: color } );
            var note = new THREE.Mesh(geometry, material);
            note.overdraw = true;

            note.rotation.x = Math.PI / 2;
            note.rotation.y = 0;
            note.rotation.z = 0;

            note.position.x = x;
            note.position.y = 150;
            note.position.z = 150;

            viewModule.scene.add(note);


            // controller
            note.createTime = new Date();
            viewModule.noteArr.push(note);
            note.noteType = type;

            return note;
        },

        // render
        render: function () {

            // animate notes
            for(var i in viewModule.noteArr) {
                var note = viewModule.noteArr[i];

                var dif = new Date().getTime() - note.createTime.getTime();
                var pos = ((viewModule.noteTime - dif) / viewModule.noteTime) * 541 - 541;
                note.position.y =  pos;

                if(dif >= viewModule.noteTime) {
                    viewModule.scene.remove(note);
                    viewModule.noteArr.splice(i,1);
                }
            }

            // render
            viewModule.renderer.render(viewModule.scene, viewModule.camera);

        },

        // hit note (controller pressed)
        hitNote: function(type) {
            var activeController = null;
            switch(type) {
                case 1 :
                    activeController = viewModule.controller.left;
                    break;
                case 2 :
                    activeController = viewModule.controller.middle;
                    break;
                case 3 :
                    activeController = viewModule.controller.right;
                    break;
            }

            var defaultColorHex =  activeController.material.color.getHex();
            activeController.material.color.setHex(0xff0000);

            // set color back
            setTimeout(function() {
                activeController.material.color.setHex(defaultColorHex);
            }, 160);

            // detect intersect
            var isIntersect = false;
            for(var i in viewModule.noteArr) {
                var note = viewModule.noteArr[i];

                if(note.position.y <= -460 && note.position.y >= -520 && note.noteType == type) {
                    isIntersect = true;
                    note.material.color.setHex(0xffffff);
                }

            }

            // publish hit
            PubSub.publish( 'game.hit', {
                hit: isIntersect
            });
        },


        /* ************ viewModule closure ************ */

        // on window resize
        onWindowResize: function () {

            if(viewModule.containerWidth != window.innerWidth) {
                viewModule.containerWidth = window.innerWidth;
            }

            if(viewModule.containerHeight != window.innerHeight) {
                viewModule.containerHeight = window.innerHeight;
            }

            viewModule.camera.aspect = viewModule.containerWidth / viewModule.containerHeight;
            viewModule.camera.updateProjectionMatrix();

            viewModule.renderer.setSize(viewModule.containerWidth, viewModule.containerHeight);

        },

        // animate
        animate: function () {
            window.requestAnimationFrame( viewModule.animate );
            viewModule.render();

        }

    };

    // public methods
    return {
        init: viewModule.createView,
        addNote: viewModule.addNote,
        noteHitTime: viewModule.noteHitTime,
        hitNote: viewModule.hitNote
    };
});