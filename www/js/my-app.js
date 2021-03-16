  
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

var map, platform;
var pos, latitud, longitud;
//var mapEvents, behavior;



// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    $$('#comp').on('click', sesionCheck);
    $$('#signOut').on('click', logOut);

    platform = new H.service.Platform({
        'apikey': 'gY5i9nh39CW9Hkb8itf7umEsECDyQzdTFVq9Oy5dEiU'
    });


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

    var icon = new H.map.Icon('img/user.png');
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

        var bubble = new H.ui.InfoBubble({ lng: longitud, lat: latitud }, {
                    content: '<b>Fiora position</b>'
                });
                // agregar la burbuja al mapa
                ui.addBubble(bubble);
                bubble.close();

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

    $$('#btn1').on('click', function(){setTitleBar(this)});
    $$('#btn2').on('click', function(){setTitleBar(this)});
    $$('#btn3').on('click', function(){setTitleBar(this)});

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
        /*alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');*/
    };
 
    // onError Callback receives a PositionError object
    //
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

/*Setear titulo navbar*/
let setTitleBar = (d) => {
    console.log(d.id);
    bID = d.id
    switch (bID) {
        case 'btn1': $$('#titleBar').html('Buscar negocios');
        break
        case 'btn2': $$('#titleBar').html('Registrar negocio');
        break
        case 'btn3': $$('#titleBar').html('Negocios guardados');
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