const express  = require('express')
const router   = express.Router()
const request = require('request')
const userController = require('../controllers/userController')

const verifyToken = require('../config/verifyToken.js')
// ========== Auth ==========
router.post('/register' , userController.user_register_post)
router.post('/login' , userController.user_login_post)
router.post('/resetpassword' , userController.user_resetpassword_post)
router.patch('/updatepassword' , verifyToken, userController.user_updatepassword_patch)
router.delete('/logout',  userController.user_logout_delete)

// ========== Data ==========
router.get('/data' ,  verifyToken,userController.user_data_get)
router.patch('/update' , verifyToken, userController.user_update_patch)






module.exports = router
// /////////////////////////////////////////////////////////////////////////////////////////////


// /// logout:
// router.delete('/logout',async(req,res)=>{
//     try{
//         console.log(req.user)
//         req.user.tokens = req.user.tokens.filter((el)=>{
//             return el !== req.token
//         })
//         await req.user.save()
//         res.send()
//     }
//     catch(e){
//         res.status(500).send(e)
//     }
// })
// /////////////////////////////////////////////////////////////////////////////////////////////


// //git profile
// router.get('/profile',async(req,res)=>{
//     res.status(200).send(req.user)
// })
////////////////////////////////////////////////////////////////////////////////////////////

