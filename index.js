const express = require('express');
const app = express();
const ejs = require('ejs')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const session = require('express-session');
// const { calculateMac } = require('request/lib/hawk');


const port = '8080';

mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"db_store"
})




app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secrete',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))



// set view engine
app.set('view engine','ejs');


function isProductInCart(cart,id){
// to check if there is product in cart
// by looping thru the cart
    for(let i=0; i<=cart.length; i++){
        if(cart[i].id = id ){
                return true;
        }
    }
    return false;
}

// gettotal price
function calculateTotal(cart,req){
    
    total = 0;
    for(let i=0; i<cart.length; i++){
        if(cart[i].sales_price){
            total = total + (cart[i].sales_price*cart[i].quantity)
        }else{
            total = total + (cart[i].price*cart[i].quantity)
        }
    }
    req.session.total = total;
    return total;
}

// connection
app.get('/',(req,res)=>{


const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"db_store"
})

con.query("SELECT * FROM prod_store",(err,result)=>{
    

    res.render('pages/index',{result:result});

})
});


app.post('/add_to_cart',(req,res)=>{
   let id =  req.body.id;
   let name =  req.body.name;
   let price =  req.body.price;
   let quantity =  req.body.quantity;
   let sales_price =  req.body.sales_price;
   let image =  req.body.image;
   let product = {id:id,name:name,price:price,quantity:quantity,sales_price,image:image}


   //    store product in session
    if(req.session.cart){
        let cart = req.session.cart;

            // if prod is not in cart
            if(!isProductInCart(cart,id)){

            // push products to cart
            cart.push(product)

            }
    }else{

            req.session.cart = [product];
             cart = req.session.cart;
   
}
    // calc total
    calculateTotal(cart,req);

    // return to cart page
    res.redirect('/cart')

});

// create cart url
app.get('/cart',(req,res)=>{
let cart = req.session.cart;
let total = req.session.total;

res.render('pages/cart',{cart:cart, total:total})
})




app.listen(port,()=>{
    console.log('server is listening on port:'+ port);
}) 