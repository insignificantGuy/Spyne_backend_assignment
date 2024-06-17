const router = require('express').Router();
const User = require('../models/Users');
const Follower = require('../models/Followers');
const Post = require('../models/Posts');
const Comment = require("../models/Comments");
const HashTag = require('../models/HashTags');
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');


// Get User by Name
router.get("/getUsersByName", async(req,res)=>{
    const {name} = req.query;

    // We can make sure that we do not get empty spaces from the frontend. Hence there is no need to handle
    // those cases here.

    try{
        const user = await User.fuzzySearch(name).select('name email _id phoneNo');
        if(user.length>0){
            return res.status(200).json({message:"User does Exist", user:user});    
        }
        else{
            return res.status(404).json({message:"User does not Exist"});
        }
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});


// Get all User
router.get("/getAllUser",async(req,res)=>{
    try{
        const users = await User.find();
        return res.status(200).json({message:"User does Exist", user:users});
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Follow a User
router.post("/followUser",async(req,res)=>{
    const {followed, followerId} = req.body;

    const newFollower = new Follower({
        followerID: followerId,
        followed: followed,
    });

    try{
        await newFollower.save();
        return res.status(200).json({message:"You are now following this user."});
    }
    catch(error){
        return res.status(500).json({message: "Error Occured while searching DB", error: error});
    }
});

// List all your followers
router.get("/listAllFollowers",async(req,res)=>{
    const {userId} = req.query;

    try{
        const followers = await Follower.find({followed: userId}).select('followerID');
        
        var followersInformation = [];

        for (const follower of followers) {
            const user = await User.findOne({ _id: follower.followerID }).select('_id name email phoneNo');
            followersInformation.push(user);
        }

        return res.status(200).json({message: "Request completed successfully", followers:followersInformation});
    }
    catch(error){
        return res.status(500).json({message: "Error Occured while searching DB", error: error});
    }
});

// List all People you are following
router.get("/listAllFollowing",async(req,res)=>{
    const {userId} = req.query;

    try{
        const following = await Follower.find({followerID: userId}).select('followed');
        
        var followingInformation = [];

        for (const follower of following) {
            const user = await User.findOne({ _id: follower.followed }).select('_id name email phoneNo');
            followingInformation.push(user);
        }

        return res.status(200).json({message: "Request completed successfully", following:followingInformation});
    }
    catch(error){
        return res.status(500).json({message: "Error Occured while searching DB", error: error});
    }
});

// Update the user
router.put("/updateUser",async(req,res)=>{
    const {userId} = req.query;
    const updates = req.body;
    try{

        // Check if the password is being updated
        if (updates.password) {
            const saltRounds = 10; // Adjust the salt rounds as per your security requirements
            const hashedPassword = await bcrypt.hash(updates.password, saltRounds);
            updates.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('name email _id phoneNo');
        if(!updatedUser){
            return res.status(404).json({message:"User does not exist"});
        }

        return res.status(200).json({message: 'User updated successfully', user: updatedUser});
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Delete the user
router.delete("/deleteUser",async(req,res)=>{
    const {userId} = req.query;
    const session = await mongoose.startSession();
    session.startTransaction();

    // Add fields for deleting user,post,comments,like everything.

    try{
        
        const user = await User.findByIdAndDelete(userId).session(session);

        if(!user){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message: "User does not exist in our profile"});
        }

        // Delete user's posts
        const post = await Post.deleteMany({ userID: userId }).session(session);

        // Delete comments made by user
        await Comment.deleteMany({ userID: userId }).session(session);

        // Remove likes by user
        await Post.updateMany({}, { $pull: { likes: userId } }).session(session);
        await Comment.updateMany({}, { $pull: { isLikedBy: userId } }).session(session);

        // Delete followers
        await Follower.deleteMany({ followerID: userId }).session(session);
        await Follower.deleteMany({ followed: userId }).session(session);

        //Delete Hashtags
        await HashTag.deleteMany({postID:post._id}).session(session);

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({message: "Successfully deleted the User"});

    }
    catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }

});

module.exports = router;