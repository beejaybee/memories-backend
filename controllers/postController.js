import mongoose from "mongoose";
import PostModel from "../models/postModel.js";

export const getPosts = async (req, res) => {
    const { page } = req.query;

    try {
        const LIMIT = 9;

        const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of every page

        const total = await PostModel.countDocuments({});
        
        const posts = await PostModel.find().sort({_id: -1}).limit(LIMIT).Math.abs(skip(startIndex));
        
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
export const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await PostModel.findById(id);

        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;
    
    try {
        const title = new RegExp(searchQuery, 'i');
        
        const posts = await PostModel.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] });

        res.json({ data: posts });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;

    if (!req.userId) return res.status(401).json({ message: "unauthenticated user" });


    const newPost = new PostModel({...post, creator: req.userId, createdAt: new Date().toISOString()});

    try {
        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        res.status(409).json({ message: error.message }); 
    }
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    const post = req.body;

    if (!req.userId) return res.status(401).json({ message: "unauthenticated user" });
    if (post.creator !== req.userId) return res.status(401).json({ message: "unauthorized user" });

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).json({ message: "Post does not exist" });
    }

    const updatedPost = await PostModel.findByIdAndUpdate(_id, post, { new: true });

    res.json(updatedPost);
}


export const deletePost = async (req, res) => {
    const { id } = req.params;
    
    if (!req.userId) return res.status(401).json({ message: "unauthenticated user" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Post does not exist" });
    }

    await PostModel.findByIdAndRemove(id);
    res.json({message: "Post Deleted Successfully!!!"})
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    
    if (!req.userId) return res.status(401).json({ message: "unauthenticated user" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Post does not exist" });
    }

    const post = await PostModel.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
        //like a post
        post.likes.push(req.userId);
    } else {
        //dislike a post
        post.likes = post.likes.filter(id => id !== String(req.userId));
    }
    
    const updatedPost = await PostModel.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    const post = await PostModel.findById(id);

    post.comments.push(value);

    const updatedPost = await PostModel.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
        
    
}

