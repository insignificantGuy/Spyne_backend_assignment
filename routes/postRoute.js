const router = require('express').Router();
const Post = require("../models/Posts");
const User = require("../models/Users");
const HashTag = require('../models/HashTags');
const Comment = require("../models/Comments");
const mongoose = require('mongoose');

// Update a Post
router.post('/postDiscussion',async(req,res)=>{
    const {userId, text, imageLink, tags} = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const user = await User.findById(userId).session(session);

        if(!user){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message: "The User does not exist!!"});
        }

        const newPost = new Post({
            userID: userId,
            textField: text||'',
            imageSrc: imageLink||'',
        });
        
        const savedPost = await newPost.save({session});

        if (tags) {
            const tagsArray = tags.split(',');
            for (let tag of tagsArray) {
                const newTag = new HashTag({
                    text: tag.trim(),
                    postID: savedPost._id
                });
                await newTag.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({message:"You have posted a new discussion", post: savedPost});
    }
    catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Get a Post
router.get("/getDiscussion",async(req,res)=>{
    const {postId} = req.query;
    try{
        const post = await Post.findById(postId);
        const comments = await Comment.find({postID: postId});
        const hashTags = await HashTag.find({postID: postId});

        if(!post){
            return res.status(404).json({message: "Post Does not Exist"});
        }

        return res.status(200).json({post: post, comments: comments, hashTags: hashTags});
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Update a Post
router.put("/updatePost",async(req,res)=>{
    const {postId} = req.query;
    const updates = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const updatedPost = await Post.findByIdAndUpdate(postId, updates, { new: true, runValidators: true }, {session});

        if(!updatedPost){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message:"Post does not exist"});
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({message: 'Post updated successfully', post: updatedPost});
    }
    catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Delete a Post
router.delete("/deleteDiscussion", async(req,res)=>{
    const {postId} = req.query;
    const session = await mongoose.startSession();
    session.startTransaction();

    // Add logic to delete likes and comments as well

    try{
        const post = await Post.findByIdAndDelete(postId).session(session);

        if(!post){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message:"Post does not exist"});
        }
        await HashTag.deleteMany({postID: post._id}).session(session);
        await Comment.deleteMany({postID: post._id}).session(session);
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({message: "Post deleted successfully"});
    }
    catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Like a post
router.post("/like", async(req,res)=>{
    const {userId, postId} = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const post = await Post.findById(postId).session(session);

        if(!post){
            return res.status(404).json({message:"Post does not exist"});
        }
        
        if(post.likes.includes(userId)){
            return res.status(400).json({message: "User already liked this post"});
        }

        post.likes.push(userId);
        await post.save();
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({message: "Your Post has been liked"});
    }
    catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Get list of discussions based on certain text, which is available in Text field

router.get("/filterDiscussionByText",async(req,res)=>{
    const {text, page} = req.query;
    try{
        const posts = await Post.fuzzySearch(text);
        const lowerLimit = 10*(page-1);
        const upperLimit = 10*page-1;

        var displayedPost = posts.slice(lowerLimit, upperLimit);
        var displayablePost = [];

        if(displayedPost.length>0){
            for(let post of displayedPost){
                var allInformationAboutPost = {};
                post.viewCount+=1;
                await post.save();


                var tagArray = [];
                const tags = await HashTag.find({postID:post._id});
                
                for(var tag of tags){
                    tagArray.push(tag.text);
                }
                allInformationAboutPost = post.toObject();
                allInformationAboutPost.tags = tagArray;
                displayablePost.push(allInformationAboutPost);
            }

            return res.status(200).json({message:"Following Post Exist with text", post:displayablePost, count: posts.length});    
        }
        else{
            return res.status(404).json({message:"No Post Exist"});
        }
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Search Discussions using HashTag
router.get("/filterDiscussionByTags", async(req,res)=>{
    const {tag, page} = req.query;
    const lowerLimit = 10*(page-1);
    const upperLimit = 10*page-1;

    const tags = await HashTag.find({text:tag});
    var displayedTag = tags.slice(lowerLimit, upperLimit);

    if(displayedTag.length>0){
        try{
            let allPostsContainigHashTag = [];
            for(var hashtags of displayedTag){

                const post = await Post.findById(hashtags.postID);

                post.viewCount+=1;
                await post.save();
                
                const allInformationAboutPost = post.toObject();
                
                allPostsContainigHashTag.push(allInformationAboutPost);
            }

            return res.status(200).json({message: "Following Post Exist with Tags", post: allPostsContainigHashTag, count: tags.length})
        }
        catch(error){
            return res.status(500).json({message:"Error Occured while searching DB", error: error});
        }
    }
    else{
        return res.status(404).json({message:"No Post Exist"})
    }

});

//Comment on a post
router.post("/comment",async(req,res)=>{
    const {userId, postId, text} = req.body;

    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if(!user || !post){
        return res.status(404).json({message:"The post or the user does not exist"});
    }

    try{
        const newComment = new Comment({
            userID: userId,
            postID: postId,
            text:text
        });

        await newComment.save();

        return res.status(200).json({message:"Comment Added", comment: newComment});
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Like a Comment
router.post('/likeComment', async(req,res)=>{
    const {userId, commentId} = req.body;

    try{
        const user = await User.findById(userId);
        const comment = await Comment.findById(commentId);
        console.log(user);
        console.log(comment);
    
        if(!user || !comment){
            return res.status(404).json({message:"The User or the Comment does not exist"});
        }


        if(comment.isLikedBy.includes(userId)){
            return res.status(400).json({message: 'User has already liked this comment'});
        }

        comment.likes+=1;
        comment.isLikedBy.push(userId);

        await comment.save();
        return res.status(200).json({ message: 'Comment liked successfully', comment });
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});


//reply to a comment
router.post("/replyComment", async(req,res)=>{
    const {commentId, userId, text} = req.body;
    try{
        const comment = await Comment.findById(commentId);

        if(!comment){
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        const reply = {
            userID: userId,
            text: text,
            createdOn: new Date()
        };

        comment.replies.push(reply);
        await comment.save();

        return res.status(200).json({ message: 'Reply added successfully', comment });
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

//delete a Comment
router.delete("/deleteComment", async(req,res)=>{
    const {commentId} = req.query;

    try{
        const comment = await Comment.findById(commentId);

        if(!comment){
            return res.status(404).json({message: "The given comment does not exist"});
        }

        if(comment.replies.length>0){
            // Delete all replies (if required)
            await Comment.updateOne({ _id: commentId }, { $set: { replies: [] } });
        }

        // Delete the comment itself
        await Comment.findByIdAndDelete(commentId);
        return res.status(200).json({ message: 'Comment deleted successfully'});
    }
    catch(error){
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

// Delete a reply
router.delete("/deleteReply",async(req,res)=>{
    const {commentId, replyId} = req.query;
    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({message:'The given comment does not exist'});
        }

        // Find the reply to delete
        const replyToDelete = comment.replies.find(reply => reply._id.toString() === replyId);

        if (!replyToDelete) {
            return res.status(404).json({message: 'The reply does not exist'});
        }

        // Delete the reply from the replies array
        comment.replies = comment.replies.filter(reply => reply._id.toString() !== replyId);
        await comment.save();

        return res.status(200).json({message: 'Reply deleted successfully'});
    } catch (error) {
        console.error('Error deleting reply:', error);
        return res.status(500).json({message:"Error Occured while searching DB", error: error});
    }
});

module.exports = router;