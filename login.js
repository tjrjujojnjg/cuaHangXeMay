const sql=require('./sql')

function login(username,password,cb){
    sql.executeSQL(`SELECT * FROM users WHERE username=N'${username}' and password='${password}'`,(recordset)=>{
        var user =recordset.recordsets[0][0];
        cb(user);
    });
}

module.exports={
    login: login
}