const sql = require('./sql');
 
function formatCash(str) {
    return str.split('').reverse().reduce((prev, next, index) => {
        return ((index % 3) ? next : (next + ',')) + prev
    })
}

function shoppingCard(arrProductId,cb) {
    sql.executeSQL(`select * from products where id in ${arrProductId}`,(recordset)=> {
        if (recordset.recordsets[0] == undefined ||recordset.recordsets[0].length === 0) {
            cb("Ban chua chon san pham");
        }
        else {
            var result = "<table border='1'><tr><th>Xe</th><th>Tên Xe</th><th>Đơn Giá</th><th>Số Lượng</th><th>Hủy 1 sản phẩm</th></tr>";
            var mysum=0;
            recordset.recordsets[0].forEach(row => {
                result += `<tr>
                <div style='display:inline;width:300px;float:left' class="product" productid="${row['id']}" price=" ${row['productprice']}">
                    <td><a href="/detail/${row['id']}"><img style="width:300px" src='/images/${row['productimage']}'/></a></td>
                    <td><div style="text-align:center;line-height: 30px;"><b>${row['productname']}</b></div></td>
                    <td><div style="text-align:center"><span style="color:red"> ${row['productprice']} VNĐ</span> </div></td>
                    <td><input type="number" id="soluong" value="1"></td>
                    <td><div><input type="button" value="Hủy" onclick="onDeleteProduct(${row['id']})"> </div></td>
                 </div></tr>
                `;
                mysum += row.productprice;
            });
            result+=`<tr>
                <td colspan="2">Tổng thành tiền</td>
                <td colspan="3">${mysum} VNĐ</td>
            </tr></table>`
            cb(result);
        }
    })
}

async function buyProduct(MaKH,arrSP){
    await sql.executeSQLSync(`insert into HoaDon(MaKH,NgayBan) values('${MaKH}',getdate())`);
    var data=await sql.executeSQLSync(`select @@IDENTITY as MaHD`);
    //console.log(data.recordsets[0][0].MaHD)
    arrSP.forEach(async item=>{
        await sql.executeSQLSync(`insert into ChiTietHoaDon(MaHD,MaSP,SoLuong,GiaBan) values('${data.recordsets[0][0].MaHD}','${item.MaSP}','${item.SoLuong}','${item.GiaBan}')`);
    })
}
 
module.exports = {
    shoppingCard: shoppingCard,
    buyProduct:buyProduct
}