exports.Response = function(data){
    var res = {
        "links": {},
        "errors": {},
        "data" : data
    };
    
    return res;
}