exports.Response = function(data, status, err){
    var res = {
        "links": {},
        "errors": err || {},
        "status": status || "",
        "data" : data
    };
    
    return res;
}