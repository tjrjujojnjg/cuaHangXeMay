const sql=require('./sql')

function login_admin(id,password,cb){
    sql.executeSQL(`SELECT * FROM admin WHERE id='${id}' and password='${password}'`,(recordset)=>{
        var user =recordset.recordsets[0][0];
        cb(user);
    });
}

module.exports={
    login_admin: login_admin
}