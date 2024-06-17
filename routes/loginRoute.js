const router = require('express').Router();
const User = require("../models/Users");
const bcrypt = require("bcryptjs");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+91\d{10}$|^\d{10}$/;

function isValidEmail(email){
    return emailRegex.test(email);
}

function isValidPhone(phone){
    return phoneRegex.test(phone);
}

const doesEmailExist = async(email) => {
    const user = await User.findOne({email:email});
    return user;
}

const doesPhoneExist = async(phoneNo) => {
    const user = await User.findOne({phoneNo:phoneNo});
    return user;
}

//Register New User
router.post("/signUp", async(req,res)=>{

    const {name, email, phoneNumber, password} = req.body;

    if(!isValidEmail(email) || !isValidPhone(phoneNumber)){
        return res.status(400).json({message: "Please enter valid email id or phone number"});
    }

    try{
        const user1 = await doesEmailExist(email);
        const user2 = await doesPhoneExist(phoneNumber);

        // Checking if user with similar email ID already exist in our database or not. If exist, there is no need to sign up.
        if(user1 || user2){
            return res.status(409).json({error: "The User already Exist, please login with correct credentials"});
        }
        
        // Hashing passwords to avoid data leak
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name,
            email: email,
            phoneNo: phoneNumber,
            password: secPass,
        });

        await newUser.save();
        return res.status(200).json({message: "Congratulations!! you have successfully signed up"});
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while signing you up", error: error});
    }
});


// Login Procedure
router.get("/login", async(req,res)=>{
    const {email, password} = req.query;

    try{
        const user = await User.findOne({email:email});

        if(!user){
            return res.status(404).json({error: "Invalid UserID or Password!"});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Invalid UserID or Password!" });
        }

        return res.status(200).json({message:'You are now logged In!!!', user:user._id});
    }
    catch(error){
        res.status(500).json({message: "Error occured while logging in", error: error});
    }

})

module.exports = router;