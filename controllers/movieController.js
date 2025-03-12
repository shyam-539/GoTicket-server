import Movie from "../models/Movie.js";

// Add a new movie (Requires admin approval)
export const addMovie = async (req, res) => {
  try {
    const { title, description, duration, releaseDate, language, genre, cast, director, certificate, posterUrl } = req.body;

    const newMovie = new Movie({
      title,
      description,
      duration,
      releaseDate,
      language,
      genre,
      cast,
      director,
      certificate,
      posterUrl,
      theaterOwner: req.user._id, // Associate with the logged-in theater owner
    });

    const savedMovie = await newMovie.save();
    res.status(201).json({ success: true, message: "Movie added. Pending admin approval.", data: savedMovie });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get all approved movies (Only approved movies are public)
export const getAllApprovedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isApproved: true });
    res.status(200).json({ success: true, data: movies });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get movies added by the logged-in theater owner
export const getMoviesByTheaterOwner = async (req, res) => {
  try {
    const movies = await Movie.find({ theaterOwner: req.user._id });
    res.status(200).json({ success: true, data: movies });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get a single movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    if (!movie.isApproved && movie.theaterOwner.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: "This movie is not yet approved" });
    }

    res.status(200).json({ success: true, data: movie });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Theater Owner updates their own movie
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    if (movie.theaterOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this movie" });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({ success: true, message: "Movie updated. Needs re-approval.", data: updatedMovie });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Admin approves a movie
export const approveMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    movie.isApproved = true;
    await movie.save();

    res.status(200).json({ success: true, message: "Movie approved successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Delete a movie (Admin can delete any, Owner can delete their own)
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });

    if (movie.theaterOwner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this movie" });
    }

    await movie.deleteOne();

    res.status(200).json({ success: true, message: "Movie deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
