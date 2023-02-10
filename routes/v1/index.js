import express from 'express';
import { createCourse,
        getCourse,
        getCourseLectures,
        addCourseLectures,
        deleteCourse,
        deleteLecture,
     } 
    from '../../controllers/course-controller.js';



import { 
    createUser,
    loginUser,
    logout,
    getMyProfile,
    changePassword,
    updateProfile,
    updateProfilepicture,
    forgetPassword,
    resetPassword,
    addToPlaylist,
    removeFromPlaylist,
    getAllUser,
    updateUserRole,
    deleteUser,
} from '../../controllers/user-controller.js';


import { 
    buySubscription,
    paymentVerification,
    getRazorpayKey,
    cancelSubscription,
} from '../../controllers/payment-controller.js';


import {
    contact,
    courseRequest,
    getDashboardStats,
}   from '../../controllers/other-controller.js';


import { isAuthenticated,authorizeAdmin,authorizeSubscribers } from'../../middlewares/auth.js';
import singleUpload  from '../../middlewares/multer.js';



const router = express.Router();


//  ALL APIs for Course.
router.post('/createcourse', isAuthenticated,authorizeAdmin,singleUpload,createCourse);     // create new course  - only admin
router.get('/getallcourse', isAuthenticated,getCourse);     // get all course without lectures
router.get('/course/:id', isAuthenticated,authorizeSubscribers,getCourseLectures);   // get all lectures of a particular course
router.post('/course/:id', isAuthenticated,authorizeAdmin,singleUpload,addCourseLectures) // add course lectures  - only admin
router.delete('/course/:id', isAuthenticated,authorizeAdmin,deleteCourse);    // Delete course  -  admin only
router.delete('/deletelecture' ,isAuthenticated,authorizeAdmin,deleteLecture)   // Delete lectures  - admin only







//  ALL APIs for users
router.post('/register', singleUpload,createUser);
router.post('/login',loginUser);
router.get('/logout', logout);
router.get('/me', isAuthenticated,getMyProfile);
router.put('/changepassword', isAuthenticated,changePassword);
router.put('/updateprofile', isAuthenticated,updateProfile);
router.put('/updateprofilepicture', isAuthenticated,singleUpload,updateProfilepicture);
router.post('/forgetpassword', forgetPassword);
router.put('/resetpassword/:token', resetPassword); 
router.post('/addtoplaylist', isAuthenticated,addToPlaylist);
router.put('/removefromplaylist', isAuthenticated,removeFromPlaylist);


//  Admin Routers
router.get('/admin/getalluser', isAuthenticated,authorizeAdmin,getAllUser);   //  get all users
router.put('/admin/user/:id', isAuthenticated,authorizeAdmin,updateUserRole);   // Chnage user role
router.delete('/admin/user/:id', isAuthenticated,authorizeAdmin,deleteUser);    //  delete user




//  Razorpay Payment Routes  
router.get('/subscribe', isAuthenticated,buySubscription);
router.post('/paymentverification', isAuthenticated,paymentVerification);
router.get('/razorpaykey', getRazorpayKey);
router.delete('/subscribe/cancel' ,isAuthenticated,authorizeSubscribers,cancelSubscription);




 // Other routes
router.post('/contact' ,contact);   //  Contact form
router.post('/courserequest',courseRequest)      //  course request


//  Get Admin Dashboard Stats
router.get('/admin/stats' ,isAuthenticated,authorizeAdmin,getDashboardStats);




export default router;


