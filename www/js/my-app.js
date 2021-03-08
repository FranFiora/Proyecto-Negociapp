  
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
      swipe: 'left',
    },
    // Add default routes
    routes: [
      {
        path: '/search/',
        url: 'search.html',
      },
      {
        path: '/register/',
        url: 'register.html',
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



// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");



});


$$(document).on('page:init', function (e) {
    
})


/*Page init de la pantalla ya de busqueda, osea con sesion iniciada*/
$$(document).on('page:init', '.page[data-name="search"]', function (e) {
    
    console.log('search');

    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    $$('#comp').on('click', sesionCheck);
    $$('#signOut').on('click', logOut);

})


/*Page init de Inicio de sesion*/
$$(document).on('page:init', '.page[data-name="index"]', function (e) {
    
    console.log('index');

    $$('#logBtn').on('click', LogIn);
    $$('#RegisBtn').on('click', ()=>{
        mainView.router.navigate('/register/');
    })

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


/*Cerrar sesión*/
let logOut = () => {

    firebase.auth().signOut()
    .then(() => {
        console.log('Cerrar sesión');
        mainView.router.navigate('/index/');
        $$('#mName').text('');
    })
    .catch((error) => {
        console.log('error '+error);
    });

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

        var data = { Nombre: nombre, Apellido: apellido };
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
    app.dialog.alert('Inicio de sesión correcto');
    setTimeout(function () {
        app.dialog.close();
        mainView.router.navigate('/search/');
        }, 1000);

  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    app.dialog.alert(error.code+'<br/>'+errorMessage);
  });
  
}