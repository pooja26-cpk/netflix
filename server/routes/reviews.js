import express from "express";
import Review from "../models/Review.js";
import authenticate from "../verifyToken.js";

const router = express.Router();

// Movie reviews
router.get("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movie: movieId }).populate("user", "username");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    
    // Check if user already has a review for this movie
    const existingReview = await Review.findOne({ movie: movieId, user: req.user.id });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      const populatedReview = await Review.findById(existingReview._id).populate("user", "username");
      return res.status(200).json(populatedReview);
    }
    
    // Create new review
    let review;
    try {
      review = new Review({
        movie: movieId,
        user: req.user.id,
        rating,
        comment,
      });
      await review.save();
    } catch (saveError) {
      // If duplicate key error, try to update existing review
      if (saveError.code === 11000) {
        const updatedReview = await Review.findOneAndUpdate(
          { movie: movieId, user: req.user.id },
          { rating, comment },
          { new: true }
        ).populate("user", "username");
        if (updatedReview) {
          return res.status(200).json(updatedReview);
        }
      }
      throw saveError;
    }
    
    const populatedReview = await Review.findById(review._id).populate("user", "username");
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ message: "Failed to save review" });
  }
});

// Update a review
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    
    const populatedReview = await Review.findById(review._id).populate("user", "username");
    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review" });
  }
});

// Delete a review
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

export default router;