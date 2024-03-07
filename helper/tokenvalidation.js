const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = {
    isAuthorized(){
        var token = localStorage.getItem('authtoken')
        if (!token) return { auth: false, decoded:{ role:'' }};
        const validated = jwt.verify(token, config.secret, function(err, decoded) {
            if (err) return { auth: false, decoded:{ role:'' }};
            else{
                return { auth: true, decoded};
            }
        });
        return validated;
    }
}