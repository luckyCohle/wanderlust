const Listing = require("../models/listing");
const axios = require("axios");
require('dotenv').config();

const mapKey = process.env.MAP_API_KEY;

// Log the value of MAP_API_KEY for debugging
// console.log('MAP_API_KEY:', mapKey);

// Forward geocoding function
async function forwardGeocode(query) {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapKey}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to fetch geocoding data');
    }
}

// Rest of your code...

  //fucntion end



module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm =async(req,res)=>{
    
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id)
    .populate(
        {path:"reviews"
        ,populate:{
             path:"author"}})
             .populate("owner");
    if(!listing){
        req.flash("error","the listing you are trying to access does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {
    console.log("request received to create listing");
    console.log(req.body); 
    
    // let result = await forwardGeocode(req.body.listing.location);
    // console.log(result.features[0].geometry);

    


    // Create a new listing
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // Save the new listing to the database
    await newListing.save();

    req.flash("success", "New listing created!");

    

    // Update the listing with the geocoding result
    newListing.geometry = result.features[0].geometry;
    await newListing.save();

    res.redirect("/listings");
};
     module.exports.renderEditForm =async(req,res)=>{let {id}=req.params;
     const listing = await Listing.findById(id);
     if(!listing){
         req.flash("error","the listing you are trying to access does not exist");
         res.redirect("/listings");
     }
     let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
     res.render("listings/edit.ejs",{listing,originalImageUrl});
 }

 module.exports.updateListing =async(req,res)=>{
    let {id}=req.params;
    // let listing = Listing.findById(id);
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }  
    req.flash("success","listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success"," listing deleted!");
    res.redirect("/listings")
};