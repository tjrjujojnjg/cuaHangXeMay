// start import ham va thu vien
const express = require('express');
const sql= require('mssql');
const path=require('path');
var moment = require('moment');
var app=express();
app.use(express.static(path.join(__dirname,'public')));
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

const executesql = require('./sql')
const login= require('./login');
const login_ad=require('./login_admin')
const shoppingCard=require('./shoppingCard') // file.js

// end import cac thu vien ham
//user custommer
//trang home
app.get('/home',(req,res)=>{
    res.sendFile(__dirname+"/home.html");
});
//end trang home
//trang view
app.get('/view',(req,res)=>{
    res.sendFile(__dirname+"/motorcycle-list.html");
});

app.get('/',function(req,res){
    var strSql='SELECT * FROM products';
    executesql.executeSQL(strSql,(recordset)=>{
        var result = "";
        recordset.recordsets[0].forEach(row => {
            result += `
            <div style='display:inline;width:200px;height: 300px;float:left;border: 2px;border-style: groove; border-radius: 10px; border-color: black'>
                <a href="/detail/${row['id']}"><img style="width:100%" src='/images/${row['productimage']}'/></a>
                <div style="text-align:center;line-height: 30px;"><b>${row['productname']}</b></div>
                <div style="text-align:center"><span style="color:red"> ${row['productprice']}VNĐ</span> </div>
                <div><input type="button" class="mua" value="Mua" onclick="addToCard(${row['id']})"> </div>
            </div>
            `;
        });
        res.send(result);
    })
});
//end trang view

//company
app.get('/list/:com',(req,res)=>{
    res.sendFile(__dirname+"/list.html")
});
app.get('/getlist/:com', function (req, res) {
    var strSql=`select * from products where productcompany ='${req.params.com}'`;
    executesql.executeSQL(strSql,(recordset)=>{
        var result = "";
        recordset.recordsets[0].forEach(row => {
            result += `
            <div style='display:inline;width:200px;height: 300px;float:left;border: 2px;border-style: groove; border-color: black;border-radius: 10px;'>
                <a href="/detail/${row['id']}"><img style="width:100%" src='/images/${row['productimage']}'/></a>
                <div style="text-align:center;line-height: 30px;"><b>${row['productname']}</b></div>
                <div style="text-align:center"><span style="color:red"> ${row['productprice']}VNĐ</span> </div>
                <div><input type="button" class="mua" value="buy" onclick="addToCard(${row['id']})"> </div>
            </div>
            `;
        });
        res.send(result);
    })
 });
//end company

//detail
app.get('/detail/:id', function (req, res) {
    res.sendFile(__dirname+"/detail.html");
});

app.get('/getdetail/:id', function (req, res) {
   executesql.executeSQL(`select * from products where id = ${req.params.id}`, (recordset) => {
         var row = recordset.recordsets[0][0];
            res.send(row);
    });
});
//end detial

//shopping card
app.get('/shopping-card',function(req,res){
    res.sendFile(__dirname+'/shopping-card.html')
})
app.post('/getshoppingcard',function(req,res){
    shoppingCard.shoppingCard(req.body.arrProductId,(result)=>{
        res.send(result);
    });
});
app.post('/buyProduct',function(req,res){
    shoppingCard.buyProduct(req.body.MaKH,req.body.arrSP);
    res.send("ok");
});
//end shopping card

//lịch sử mua hàng
app.get('/history/:makh',(req,res)=>{
    res.sendFile(__dirname+"/history.html");
});

app.get('/gethistory/:makh',function(req,res){
    var strSql=`SELECT * FROM HoaDon,ChiTietHoaDon,products where HoaDon.MaHD=ChiTietHoaDon.MaHD and products.id=ChiTietHoaDon.MaSP and MaKH=${req.params.makh}`;
    var date;
    var total=0;
        executesql.executeSQL(strSql,(recordset)=>{
            var result = "<table  border='1'><tr><th>Ngày mua</th><th>Tên sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr>";
            recordset.recordsets[0].forEach(row => {
                date=moment(row.NgayBan).format("DD/MM/yyyy")
                total=row.GiaBan*row.SoLuong;
               result +=`<tr>
               <td>${date}</td>
               <td>${row['productname']}</td>
               <td>${row['SoLuong']}</td>
               <td>${row['GiaBan']}</td>
               <td>${total}</td>
               </tr>`
            });
            result+="</table>"
            res.send(result);
        })
})
// end lịch sử mua hàng


//end user custommer

//login
app.get('/login',function(req,res){
    res.sendFile(__dirname+'/login.html');
});
app.post('/getlogin',function(req,res){
    login.login(req.body.username,req.body.password,(user)=>{
        res.send(user);
    });
});
//end

//trang dang ky
app.get('/register',(req,res)=>{
    res.sendFile(__dirname+"/register.html");
});
app.post('/getregister',function(req,res,next){
    var username=req.body.txtusername;
    var password=req.body.txtpassword;
    var tel=req.body.txttel;
    var strsql="INSERT INTO users (username, password,tel) VALUES (N'"+username+"','"+password+"','"+tel+"')";
    executesql.executeSQL(strsql,()=>{
    });
    res.redirect('/login');
});
//end dang ky

//thanh phan admin
app.get('/admin',function(req,res){
    res.sendFile(__dirname+'/login_admin.html');
});
app.post('/getadmin',function(req,res){
    login_ad.login_admin(req.body.id,req.body.password,(user)=>{
        res.send(user);
    });
});
app.get('/error_admin',function(req,res){
    res.sendFile(__dirname+'/error_admin.html');
});
//end thanh phan admin

// add
app.get('/administrator/add',(req,res)=>{
    res.sendFile(__dirname+"/insert-motorcycle.html");
    });

app.post('/administrator/add',function(req,res,next){
    var pdcompany=req.body.cbcom;
    var pdimage=req.body.txtimage;
    var pdname =req.body.txtname;
    var pdtype=req.body.txttype;
    var pdprice=req.body.txtprice;
     var strsql="INSERT INTO products (productcompany,productimage,productname,producttype,productprice) VALUES ('"+pdcompany+"','"+pdimage+"',N'"+pdname+"','"+pdtype+"','"+pdprice+"')";
     executesql.executeSQL(strsql,()=>{
         res.end('');
     });
   // next();
    
    res.redirect('/administrator/add');
});
//end add

//admin view
app.get('/administrator/view',(req,res)=>{
    res.sendFile(__dirname+"/view_products.html");
});
app.get('/administrator/getview',function(req,res){
        var strSql='SELECT * FROM products';
        executesql.executeSQL(strSql,(recordset)=>{
            var result = "<table  border='1'><tr colspan='5'>VIEW ADD UPDATE DELETE</tr><tr><th>Product Image</th><th>Product Company</th><th>Product Name</th><th>Product Type</th><th>Product Price</th><th>Update</th><th>Delete</th></tr>";
            recordset.recordsets[0].forEach(row => {
               result +=`<tr><td>${row['productimage']}</td><td>${row['productcompany']}</td><td>${row['productname']}</td><td>${row['producttype']}</td><td>${row['productprice']}</td><td><button><a href="/administrator/update/${row['id']}">Update</a></td></button><td><button ><a onclick="return confirm('Are you sure to delete ${row['productname']} ?')" href="/administrator/delete/${row['id']}">Delete</a></button></td></tr>`
            });
            result+="</table>"
            res.send(result);
        })
});
//end admin view

// admin update
app.get('/administrator/update/:id',(req,res)=>{
    res.sendFile(__dirname+"/update_motorcycle.html");
});
app.get('/administrator/getupdate/:id', function (req, res) {
    executesql.executeSQL(`select * from Products where id = ${req.params.id}`, (recordset) => {
          var row = recordset.recordsets[0][0];
            // res.send(row);
            var result=` <form method="post" action="/administrator/update" enctype="application/x-www-form-urlencoded">
            <div>
              <label for="cars">Brand</label>
                      <select name="cbcom" id="cars" class="form-control">
                          <option value="${row['productcompany']}">${row['productcompany']}</option>
                          <option value="Yamaha">Yamaha</option>
                          <option value="Suzuki">Suzuki</option>
                          <option value="Honda">Honda</option>
                          <option value="Kawasaki">Kawasaki</option>
                          <option value="BMW">BMW</option>
                      </select> 
                    </div><br/>
                   <div>
                  <label >Product Image</label>
                  <input type="text"  value='${row['productimage']}' name="txtimage">
                  </div><br/>
                <div>
                  <label for="pdname">Product Name</label>
                  <input type="text"  name="txtname" value='${row['productname']}'>
                </div><br/>
              </div>
              <div >
                  <label >Product Type</label>
                  <input type="text" value='${row['producttype']}' name="txttype" id="pdtype" >
                </div><br/>
                <div>
                  <label>Product Price</label>
                  <input type="text"value='${row['productprice']}' name="txtprice" id="pdprice">
                </div><br/>
              </div>
              <button type="submit" class="btn btn-primary">Update</button>
              <input type="hidden"  name="txtid" value='${row['id']}'>
            </form>
            `;
            res.send(result);
     });
});
app.post('/administrator/update',function(req,res,next){
    var pdcompany=req.body.cbcom;
    var pdimage=req.body.txtimage;
    var pdname =req.body.txtname;
    var pdtype=req.body.txttype;
    var pdprice=req.body.txtprice;
    var pdid=req.body.txtid;
    var strsql="update products set productcompany='"+pdcompany+"',productimage='"+pdimage+"',productname=N'"+pdname+"',producttype='"+pdtype+"',productprice='"+pdprice+"' where id='"+pdid+"'";
             executesql.executeSQL(strsql,()=>{
                 res.end('');
             });
            res.redirect('/administrator/view');
    });
//end admin update

//admin delete
app.get('/administrator/delete/:id',(req,res)=>{
    var strsql="delete from products where id='"+req.params.id+"'";
             executesql.executeSQL(strsql,()=>{
                 res.end('');
             });
            res.redirect('/administrator/view');
});
//end admin delete

//admin receipt
app.get('/administrator/receipt',(req,res)=>{
    res.sendFile(__dirname+"/receipt.html");
});
app.get('/administrator/getreceipt',function(req,res){
    var strSql='SELECT * FROM HoaDon,users where  HoaDon.MaKH=users.id and HoaDon.HoanThanh is null';
    executesql.executeSQL(strSql,(recordset)=>{
        var result = "<table  border='5'><tr colspan='5'>ĐƠN CHƯA CHỐT</tr><tr><th>Mã Hóa Đơn</th><th>View</th><th>Chi Tiết</th><th>Chốt Đơn</th></tr>";
        recordset.recordsets[0].forEach(row => {
           result +=`<tr><td>${row['MaHD']}</td>
           <td>${row['username']}</td>
           <td><button><a href="/administrator/viewreceipt/${row['MaHD']}">Chi Tiết</a></button></td>
           <td><button><a href="/administrator/singleClosing/${row['MaHD']}">Hoàn Thành</a></button></td>
           </tr>`
        });
        result+="</table>"
        res.send(result);
    })
});

//Chốt đơn
app.get('/administrator/singleClosing/:mahd',(req,res)=>{
    var strsql=`update HoaDon set HoanThanh='Y' where MaHD=${req.params.mahd}`;
             executesql.executeSQL(strsql,()=>{
                 res.end('');
             });
            res.redirect('/administrator/receipt');
});
//

app.get('/administrator/viewreceipt/:code',(req,res)=>{
    res.sendFile(__dirname+"/detailsReceipt.html");
});
app.get('/administrator/getdetailsreceipt/:code',function(req,res){
    var strSql=`select * from ChiTietHoaDon, products,HoaDon,users where ChiTietHoaDon.MaHD=${req.params.code} and ChiTietHoaDon.MaSP=products.id and ChiTietHoaDon.MaHD=HoaDon.MaHD and HoaDon.MaKH=users.id`;
    executesql.executeSQL(strSql,(recordset)=>{
        var result=`<h2>Mã đơn hàng:${req.params.code}</h2>`
        var date;
        var username="";
        var total=0;
        result += "<table  border='1'><tr><th>Xe</th><th>Giá</th><th>Số Lượng</th><th>Thành Tiền</th></tr>";
        recordset.recordsets[0].forEach(row => {
            var thanhtien=row.productprice*row.SoLuong;
            total+=thanhtien;
           result +=`<tr>
           <td>${row['productname']}</td>
           <td>${row['productprice']} VNĐ</td>
           <td>${row['SoLuong']}</td>
           <td>${thanhtien} VNĐ</td>
           </tr>`
           username=row.username
           date=moment(row.NgayBan).format("DD/MM/yyyy");
           thanhtien=0;
        });
        result+=`<tr>
            <td colspan="3">Tổng thành tiền:</td><td>${total} VNĐ</td>
        </tr>`
        result+=`</table><br><div>Ngày lập hóa đơn:${date}</div><br><div>Người mua:<span style="font-weight: bold; color: rgb(27, 216, 216); font-size: 20px;">${username}</span></div>`
        res.send(result);
    })
});
//end admin receipt

//xu li hoa don khach hang
app.get('/confirm/:makh',(req,res)=>{
    res.sendFile(__dirname+"/confirm.html");
});


app.get('/getconfirm/:makh', function (req, res) {
    var total=0;
    var result=`<form method="post" action="/geteditamount/masp" enctype="application/x-www-form-urlencoded"><table border=1>`;
    result+="<th>Hiệu</th><th>Giá</th><th>Số Lượng</th><th>Thành Tiền</th>"
    executesql.executeSQL(`select * from HoaDon,ChiTietHoaDon,users,products where ChiTietHoaDon.MaHD=HoaDon.MaHD and HoaDon.MaKH=users.id and products.id=ChiTietHoaDon.MaSP and users.id=${req.params.makh} and HoaDon.HoanThanh is null`, (recordset) => {
        recordset.recordsets[0].forEach(row => {
            var thanhtien=row.productprice*row.SoLuong;
            total+=thanhtien;
           result +=`<tr>
           <td>${row['productname']}</td>
           <td>${row['productprice']} VNĐ</td>
           <td>${row['SoLuong']}</td>
           <td>${thanhtien} VNĐ</td>
           </tr>`
        });
        result+=`</table><div>Tổng hóa đơn:${total}</div></form>`;
        res.send(result);
    });
     
});

app.get('/editamount/:makh/:masp',(req,res)=>{
    res.sendFile(__dirname+"/editamount.html");
});

app.get('/geteditamount/:makh/:masp', function (req, res) {
    executesql.executeSQL(`select * from users,HoaDon where MaKH = ${req.params.makh} and HoanThanh is null`, (recordset) => {

          var row = recordset.recordsets[0][0];
          var result='';
          result+=`<div>${row.MaHD}</div>
          <div>${req.body.textsoluong}</div>
          `;
          res.send(result);
     });
});
//end xu li hoa don khach hang

// open port 
var server =app.listen(1081,()=>{
    console.log('Server is running at port 1081');
});
//end