import { Movie } from "../models/Movies.js";
import { TheaterOwner } from "../models/Theater.js";

// Add a new movie (Only Theater Owners & Admins)
export const addMovie = async (req, res) => {
  try {
    const { title, genre, duration, releaseDate, rating, director, cast, bannerImage, posterImage, description, language } = req.body;
    if (req.user.role !== "theaterOwner" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied! Only Theater Owners and Admins can add movies." });
    }
    const newMovie = new Movie({ title, genre, duration, releaseDate, rating, director, cast, bannerImage, posterImage, description, language, createdBy: req.user._id, creatorRole: req.user.role });
    await newMovie.save();
    res.status(201).json({ success: true, message: "Movie added successfully!", movie: newMovie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Get all movies (Accessible to All Users)
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Get movies added by a Theater Owner
export const getMoviesByTheaterOwner = async (req, res) => {
  try {
    if (req.user.role !== "theaterOwner") {
      return res.status(403).json({ success: false, message: "Access Denied! Only Theater Owners can view their movies." });
    }
    const movies = await Movie.find({ createdBy: req.user._id });
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Get movie by ID (Accessible to All Users)
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });
    res.status(200).json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Update movie (Only Theater Owners & Admins)
export const updateMovie = async (req, res) => {
  try {
    const { title, genre, duration, releaseDate, rating, director, cast, bannerImage, posterImage, description, language } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    if (req.user.role === "theaterOwner" && movie.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access Denied! You can only edit movies that you have created." });
    }
    if (req.user.role === "theaterOwner" && movie.creatorRole === "admin") {
      return res.status(403).json({ success: false, message: "Access Denied! You cannot edit movies created by an Admin." });
    }

    movie.title = title ?? movie.title;
    movie.genre = genre ?? movie.genre;
    movie.duration = duration ?? movie.duration;
    movie.releaseDate = releaseDate ?? movie.releaseDate;
    movie.rating = rating ?? movie.rating;
    movie.director = director ?? movie.director;
    movie.cast = cast ?? movie.cast;
    movie.bannerImage = bannerImage ?? movie.bannerImage;
    movie.posterImage = posterImage ?? movie.posterImage;
    movie.description = description ?? movie.description;
    movie.language = language ?? movie.language;

    await movie.save();
    res.status(200).json({ success: true, message: "Movie updated successfully!", movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Delete movie (Only Admins or Movie Creator)
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    if (movie.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied! You are not the creator of this movie." });
    }

    await movie.deleteOne();
    res.status(200).json({ success: true, message: "Movie deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};
