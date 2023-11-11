const validator = require('validator')

function validation(data, type){
    switch(type){
        case 'email':
            if (!validator.isEmail(data)) return { valid: false, message: 'Invalid email format' }
            return { valid: true };
        case 'password':
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
            if (!passwordRegex.test(data)) return { valid: false, message: 'Password must 8 character include  uppercase, lowercase, numbers, and special characters'}
            return { valid: true }
        case 'string':
            if(typeof data !== 'string' ) return { valid: false, message: 'Please Check Inputs, Enter String'}
            return { valid: true }
        case 'phone':
            const phoneRegex = /^0[0-9]{10}$/
            if(!phoneRegex.test(data)) return { valid: false, message: 'This Phone Invalid'}
            return { valid: true }
    }
}
 

module.exports = validation