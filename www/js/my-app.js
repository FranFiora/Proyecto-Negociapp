  
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Negociapp',
    // App id
    id: 'com.negociapp.test',
    // Enable swipe panel
    panel: {
      swipe: false,
    },
    // Add default routes
    routes: [
      {
        path: '/search/',
        url: 'search.html',
      },
      {
        path: '/searchCo/',
        url: 'searchComer.html',
      },
      {
        path: '/searchAd/',
        url: 'searchAdmin.html',
      },
      {
        path: '/register/',
        url: 'register.html',
        options: {
        transition: 'f7-circle',
        }
      },
      {
        path: '/index/',
        url: 'index.html',
      },
    ]
    // ... other parameters
  });

var mainView = app.views.create('.view-main');

var db = firebase.firestore();
var userCol = db.collection("usuarios");
var commerceCol = db.collection("negocios");

var map, platform;
var pos, latitud, longitud, localLat, localLng;
var nombreUser;
var arrayMarcadores= [];
var latMark = [];
var lonMark = [];

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    $$('#comp').on('click', sesionCheck);
    $$('#signOut').on('click', logOut);

    platform = new H.service.Platform({
        'apikey': 'gY5i9nh39CW9Hkb8itf7umEsECDyQzdTFVq9Oy5dEiU'
    });

    /*commerceCol.get()
    .then((com) => {
        com.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            larad = doc.data().latitud;
            larab = doc.data().longitud;
            console.log("larad", larad);
            console.log("larab", larab);

        });
    });*/

   /* commerceCol
    .onSnapshot((querySnapshot) => {
        var locales = [];
        querySnapshot.forEach((doc) => {
            locales.push(doc.data().nombre);
        });
        console.log("Locales: ", locales.join(", "));
    });
*/

});


$$(document).on('page:init', function (e) {
    
})


/*Page init de la pantalla ya de busqueda, osea con sesion iniciada*/
$$(document).on('page:init', '.page[data-name="search"]', function (e) {
    
    console.log('search');
    //obtener datos del usuario y mostrar nombre y apellido de la DB
    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    var icon = new H.map.Icon('img/alf.png');
    var iconLocal = new H.map.Icon('img/comerce.png');
    var defaultLayers = platform.createDefaultLayers();

    // observador de posición
    // var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    // Crear y mostrar mapa:
    map = new H.Map(document.getElementById('mapContainer'),
        defaultLayers.vector.normal.map,
        {
        zoom: 14,
        center: { lat: latitud, lng: longitud }
        });
        
        coords = {lat: latitud, lng: longitud};
        markerP = new H.map.Marker(coords, {icon: icon});
        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(markerP);
        map.setCenter(coords);

        //desplazamiento
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        //interfaz
        ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');
        ui.getControl('mapsettings').setDisabled(true);

        var circle1 = new H.map.Circle(
            new H.geo.Point(latitud, longitud), //center
            600, // Radius in meters
            { style: {
                fillColor: 'rgba(106, 90, 205, 0.3)',
                lineWidth: 3,
                strokeColor: 'rgba(110, 0, 255, 1)'
            } }
        );
        circle1.setData('Circle1');
        map.addObject(circle1);


        function distancia(lat1, lon1, lat2, lon2){
            // Usamos la API de google para medir la distancia entre 2 puntos
            var ubi1 = new google.maps.LatLng(lat1, lon1);
            var ubi2 = new google.maps.LatLng(lat2, lon2)
            var distance = google.maps.geometry.spherical.computeDistanceBetween(ubi1, ubi2);
            // distancia en metros
            console.log(((distance).toFixed(0) + ' metros'));
            return ((distance).toFixed(0))
        }  


        function MARCADORES(map) {
            group = new H.map.Group();
            map.addObject(group);
            commerceCol.get()
            .then((com) => {
                coma = com;
                console.log(coma);
                com.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    //console.log(doc.id, " => ", doc.data());
                    lata=(doc.data().latitud);
                    longa=(doc.data().longitud);
                    arrayPushea(lata, longa);

                    //addMarkerToGroup(group, {lat: lata, lng: longa});

                });

            });
            //addMarkerToGroup(group, {lat: -30.21, lng: -40.18});
            //addMarkerToGroup(group, {lat: -32.9751696, lng: -60.6692889});
            //addMarkerToGroup(group, {lat: XXX , lng: XXX};
        }
        function addMarkerToGroup(group, coordinate) {
            markerg = new H.map.Marker(coordinate, {icon: iconLocal});
            group.addObject(markerg);    
        }
        MARCADORES(map);

        distancia(latitud, longitud, -32.979020, -60.669609);
        
        userCol.doc(email).get()
        .then((docRe) => {
            nombreUser = docRe.data().Nombre;
            bubble = new H.ui.InfoBubble({ lng: longitud, lat: latitud }, {
                        content: '<b>Posicion de '+nombreUser+'</b>'
                    });
            // agregar la burbuja al mapa
            ui.addBubble(bubble);
            bubble.close();
        })
        .catch((error) => {
            console.log('error '+error);
        })

        group.addEventListener('pointerdown', function(evt){
            console.log(evt.target);
            if (evt.target == markerg) {
                console.log('group');
            }
        });
        //burbuja al tocar el marcador
        map.addEventListener('tap', function(t){
            //var tap1 = map.screenToGeo(t.currentPointer.viewportX, t.currentPointer.viewportY);
            if (t.target == markerP){
                console.log('tap on user position');
                //console.log(t.target);

                bubble.open();
                
            } else {
                console.log('tap off user position');
                bubble.close();
                /*var bubbleclick = new H.ui.InfoBubble({ lng: tap1.lng, lat: tap1.lat },{
                    content: '<b>what it is</b>'
                });
                ui.addBubble(bubbleclick);
                bubbleclick.open();*/
            }

        });
        window.addEventListener('resize', () => map.getViewPort().resize());

    $$('#btn1').on('click', function(){setTitleBar(this)});
    $$('#btn2').on('click', function(){setTitleBar(this)});
    $$('#btn3').on('click', function(){setTitleBar(this)});

    $$('#regLocal').on('click', LocalReg);

})


$$(document).on('page:init', '.page[data-name="searchAdmin"]', function (e) {
    
    console.log('search admin');
    //obtener datos del usuario y mostrar nombre y apellido de la DB
    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    var icon = new H.map.Icon('img/alf.png');
    var defaultLayers = platform.createDefaultLayers();

    // observador de posición
    // var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    // Crear y mostrar mapa:
    map = new H.Map(document.getElementById('mapContainerAd'),
        defaultLayers.vector.normal.map,
        {
        zoom: 14,
        center: { lat: latitud, lng: longitud }
        });
        
        coords = {lat: latitud, lng: longitud};
        markerP = new H.map.Marker(coords, {icon: icon});
        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(markerP);
        map.setCenter(coords);

        //desplazamiento
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        //interfaz
        ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');
        ui.getControl('mapsettings').setDisabled(true);

        var circle1 = new H.map.Circle(
            new H.geo.Point(latitud, longitud), //center
            600, // Radius in meters
            { style: {
                fillColor: 'rgba(106, 90, 205, 0.3)',
                lineWidth: 3,
                strokeColor: 'rgba(110, 0, 255, 1)'
            } }
        );
        circle1.setData('Circle1');
        map.addObject(circle1);

        userCol.doc(email).get()
        .then((docRe) => {
            nombreUser = docRe.data().Nombre;
            bubble = new H.ui.InfoBubble({ lng: longitud, lat: latitud }, {
                        content: '<b>Posicion de '+nombreUser+'</b>'
                    });
            // agregar la burbuja al mapa
            ui.addBubble(bubble);
            bubble.close();
        })
        .catch((error) => {
            console.log('error '+error);
        })

        //burbuja al tocar el marcador
        map.addEventListener('tap', function(t){
            if (t.target == markerP){
                console.log('tap on marker');
                //console.log(t.target);

               // var tap1 = map.screenToGeo(t.currentPointer.viewportX, t.currentPointer.viewportY);
                bubble.open();
                
            } else {
                console.log('tap off marker');
                bubble.close();
            }

        });
        window.addEventListener('resize', () => map.getViewPort().resize());

    $$('#btn1ad').on('click', function(){setTitleBar(this)});
    $$('#btn2ad').on('click', function(){setTitleBar(this)});
    $$('#btn3ad').on('click', function(){setTitleBar(this)});

})


$$(document).on('page:init', '.page[data-name="searchComer"]', function (e) {
    
    console.log('search comercio');
    //obtener datos del usuario y mostrar nombre y apellido de la DB
    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    commerceCol.doc(email).get()
    .then((comercio) => {
        $$('#nomCom').val(comercio.data().nombre);
        $$('#dirCom').val(comercio.data().direccion);
        $$('#hsCom').val(comercio.data().horario);
        $$('#tipCom').val(comercio.data().tipo);
    })

    var icon = new H.map.Icon('img/alf.png');
    var defaultLayers = platform.createDefaultLayers();

    // observador de posición
    // var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    // Crear y mostrar mapa:
    map = new H.Map(document.getElementById('mapContainerCo'),
        defaultLayers.vector.normal.map,
        {
        zoom: 14,
        center: { lat: latitud, lng: longitud }
        });
        
        coords = {lat: latitud, lng: longitud};
        markerP = new H.map.Marker(coords, {icon: icon});
        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(markerP);
        map.setCenter(coords);

        //desplazamiento
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        //interfaz
        ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');
        ui.getControl('mapsettings').setDisabled(true);

        var circle1 = new H.map.Circle(
            new H.geo.Point(latitud, longitud), //center
            600, // Radius in meters
            { style: {
                fillColor: 'rgba(106, 90, 205, 0.3)',
                lineWidth: 3,
                strokeColor: 'rgba(110, 0, 255, 1)'
            } }
        );
        circle1.setData('Circle1');
        map.addObject(circle1);

        userCol.doc(email).get()
        .then((docRe) => {
            nombreUser = docRe.data().Nombre;
            bubble = new H.ui.InfoBubble({ lng: longitud, lat: latitud }, {
                        content: '<b>Posicion de '+nombreUser+'</b>'
                    });
            // agregar la burbuja al mapa
            ui.addBubble(bubble);
            bubble.close();
        })
        .catch((error) => {
            console.log('error '+error);
        })

        //burbuja al tocar el marcador
        map.addEventListener('tap', function(t){
            if (t.target == markerP){
                console.log('tap on marker');
                //console.log(t.target);

               // var tap1 = map.screenToGeo(t.currentPointer.viewportX, t.currentPointer.viewportY);
                bubble.open();
                
            } else {
                console.log('tap off marker');
                bubble.close();
            }

        });
        window.addEventListener('resize', () => map.getViewPort().resize());

    $$('#btn1co').on('click', function(){setTitleBar(this)});
    $$('#btn2co').on('click', function(){setTitleBar(this)});
    $$('#btn3co').on('click', function(){setTitleBar(this)});

    $$('#status').on('click', function(){
        if (this.checked) {
          console.log('chequeado');
          $$('#statusST').text('Abierto').removeClass('cerrado').addClass('abierto');
        } else {
            console.log('no chequeado');
            $$('#statusST').text('Cerrado').removeClass('abierto').addClass('cerrado');
        }
    });

})

/*Page init de Inicio de sesion*/
$$(document).on('page:init', '.page[data-name="index"]', function (e) {
    
    console.log('index');

    $$('#logBtn').on('click', LogIn);
    $$('#RegisBtn').on('click', ()=>{
        mainView.router.navigate('/register/');
    })

    onSuccess = function(position) {
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
        console.log(latitud);
        console.log(longitud);
    };

    onError = function(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
 
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    
})


/*Page init de Registro*/
$$(document).on('page:init', '.page[data-name="register"]', function (e) {
    console.log('register');
    $$('#backBtn').on('click', ()=>{
        app.dialog.confirm('¿Quieres cancelar el registro?',()=>{
            mainView.router.navigate('/index/');
        });
    })

    $$('#btnRegistrar').on('click', SignIn);
})


/* --- FUNCIONES --- */


/*Radio cercano
let testObjectsEvents = (map, logEvent) => {
    // Let's create the same style for all objects
    var style = {
        fillColor: 'rgba(35, 51, 129, 0.3)',
        lineWidth: 2,
        strokeColor: 'rgba(114, 38, 51, 1)'
    }
}*/

arrayPushea = (lt, lg) => {
    console.log(lt, lg);
    latMark.push(lt);
    console.log("latitudes: ", latMark);
    lonMark.push(lg);
    console.log("longitud: ", lonMark);
}

/*Setear titulo navbar*/
let setTitleBar = (d) => {
    bID = d.id
    switch (bID) {
        case 'btn1': $$('#titleBar').html('Buscar negocios');
        break
        case 'btn2': $$('#titleBar').html('Registrar negocio');
        break
        case 'btn3': $$('#titleBar').html('Negocios guardados');
        break
        case 'btn1co': $$('#titleBarCo').html('Buscar negocios');
        break
        case 'btn2co': $$('#titleBarCo').html('Mi negocio');
        break
        case 'btn3co': $$('#titleBarCo').html('Negocios guardados');
        break
        case 'btn1ad': $$('#titleBarAd').html('Buscar negocios');
        break
        case 'btn2ad': $$('#titleBarAd').html('Registrar negocio');
        break
        case 'btn3ad': $$('#titleBarAd').html('Negocios guardados');
        break
    }
}

/*Cerrar sesión*/
let logOut = () => {
    var user = firebase.auth().currentUser;
    if (user) {
        app.dialog.confirm('¿Desea cerrar sesión?', function(){

            firebase.auth().signOut()
            .then(() => {
                console.log('Cerrar sesión');
                mainView.router.navigate('/index/');
                $$('#mName').text('');
                app.panel.close('.panel');
            })
            .catch((error) => {
                console.log('error '+error);
            });
        });
    } else {
      console.log('Ya cerre sesion');
    }
}


/*Sesion actual check*/
let sesionCheck = () => {
    var user = firebase.auth().currentUser;

    if (user) {
      console.log('Sesion actual '+user.email);
    } else {
      console.log('no inicio sesion');
    }
}

/*Registrar negocio*/
let LocalReg = () => {

    app.dialog.confirm("Si los datos son correctos presione OK", "Verifique sus datos", function(){

        nLocal = $$('#nameLocal').val();
        dLocal = $$('#dirLocal').val();
        hLocal = $$('#horaLocal').val();
        tLocal = $$('#tipoLocal').val();
        eLocal = $$('#emailLocal').val();
        if (dLocal != "") {
           var linka = 'https://geocoder.ls.hereapi.com/6.2/geocode.json';
            app.request.json(linka, {
                searchtext: dLocal+', Rosario, Santa Fe',
                apiKey: 'a5WyBGHmz8PggN7Ys6vvPWbTiiyAciHQROYMPYRHWPQ',
                gen: '9'
            }, 
            function (data) {
             // hacer algo con data
             //lpos = JSON.stringify(data);
             localLat = data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
             localLng = data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
             console.log(localLat);
             console.log(localLng);
             GoCommer();
            }, 
            function(xhr, status) { console.log("error geo: "+status); } );
        }

        function GoCommer(){

            if (nLocal != "" && dLocal != "" && hLocal != "" && tLocal != "" && eLocal != "") {
            dataLocal = { nombre: nLocal, direccion: dLocal, horario: hLocal, tipo: tLocal, latitud: localLat, longitud: localLng }
            commerceCol.doc(eLocal).set(dataLocal)
                .then(() => { 
                    app.dialog.alert('Local registrado correctamente'); 
                    userCol.doc(eLocal).update({ Cuenta: "comercio" })
                        .then(() => {
                            console.log("Usuario actualizado (Cuenta)");
                            mainView.router.navigate('/searchCo/');
                        })
                        .catch((error) => {
                            console.error("Error al ACTUALIZAR documento: ", error);
                        });
                })
                .catch((error) => {
                    console.error("Error al CREAR DOCUMENTO del LOCAL: ", error);
                })
            console.log('IF correctamente');
            } else {
                app.dialog.alert('Complete los campos faltantes');
                console.log('ELSE correctamente');
            }  
        }
    })
}

/*Registro de usuario*/
let SignIn = () => {
     nombre=$$('#regisNom').val();
     apellido=$$('#regisApe').val();
     email=$$('#regisEmail').val();
     password=$$('#regisPass').val();

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user) => {

        var data = { Nombre: nombre, Apellido: apellido, Cuenta: 'usuario' };
        userCol.doc(email).set(data);
        app.dialog.alert('Usuario creado con éxito!'+'<br/>Bienvenido '+nombre,()=>{
            mainView.router.navigate('/search/');

        });

      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        app.dialog.alert('Falló la creación<br/>'+errorCode+'<br/>'+errorMessage);
    });
}

/*Inicio de sesion*/
let LogIn = () => {

    email=$$('#Email').val();
    password=$$('#Pass').val();

    firebase.auth().signInWithEmailAndPassword(email, password)
  .then((user) => {
        userCol.doc(email).get()
        .then((docRe) => {
            tCuenta = docRe.data().Cuenta;
            switch (tCuenta) {
                case 'admin': app.dialog.alert('Inicio de sesión correcto');
                                    setTimeout(function () {
                                        app.dialog.close();
                                        mainView.router.navigate('/searchAd/');
                                }, 1000);
                break
                case 'usuario': app.dialog.alert('Inicio de sesión correcto');
                                    setTimeout(function () {
                                        app.dialog.close();
                                        mainView.router.navigate('/search/');
                                }, 1000);
                break
                case 'comercio':app.dialog.alert('Inicio de sesión correcto');
                                    setTimeout(function () {
                                        app.dialog.close();
                                        mainView.router.navigate('/searchCo/');
                                }, 1000);
                break
            }
        })
        .catch((error) => {
            console.log('error '+error);
        })
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        app.dialog.alert(error.code+'<br/>'+errorMessage);
    });
  
}