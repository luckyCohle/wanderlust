const Listing = require("./models/listing.js");
const review = require("./models/review.js");
const Review = require("./models/review.js")
const {listingSchema,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
module.exports.bodyCheck = (req,res,next)=>{
    console.log("from bodyCheck middleware->",req.body);
    next();
}
module.exports.isLoggedIn = (req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be loggedin to add new listing! ");
        res.redirect("/login")
    }
    //for debuging
    console.log("from isLoggedIn middleware->",req.body);
    next();
}
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.isOwner = async (req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        console.log(listing);
        req.flash("error","You are not permited to make changes to this listing ");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isAuthor = async (req,res,next)=>{
    let{id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        console.log(listing);
        req.flash("error","You are not the author of this review ");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateListing = (req,res,next)=>{
    console.log("from validateListing middleware->",req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

