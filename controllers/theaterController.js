import Theater from "../models/Theater.js";
import Movie from "../models/Movie.js";

// CREATE Theater
export const createTheater = async (req, res) => {
  try {
    const { name, location, totalSeats, contactEmail, contactPhone } = req.body;

    const theater = new Theater({
      owner: req.user.id,
      name,
      location,
      totalSeats,
      availableSeats: totalSeats,
      contactEmail,
      contactPhone,
      shows: [],
    });

    await theater.save();
    res.status(201).json({ message: "Theater created successfully", theater });
  } catch (error) {
    res.status(500).json({ message: "Error creating theater", error });
  }
};

// GET all theaters
export const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find().populate("owner", "name email");
    res.status(200).json(theaters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching theaters", error });
  }
};

// GET single theater by ID
export const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id).populate(
      "owner",
      "name email"
    );
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    res.status(200).json(theater);
  } catch (error) {
    res.status(500).json({ message: "Error fetching theater", error });
  }
};

// UPDATE Theater
export const updateTheater = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) return res.status(404).json({ message: "Theater not found" });

    if (theater.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update" });
    }

    Object.assign(theater, req.body);
    await theater.save();

    res.status(200).json({ message: "Theater updated successfully", theater });
  } catch (error) {
    res.status(500).json({ message: "Error updating theater", error });
  }
};

// DELETE Theater
export const deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) return res.status(404).json({ message: "Theater not found" });

    if (theater.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete" });
    }

    await theater.deleteOne();
    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting theater", error });
  }
};

// ADD a show
export const addShow = async (req, res) => {
  try {
    const { movieId, showTime } = req.body;
    const theater = await Theater.findById(req.params.id);

    if (!theater) return res.status(404).json({ message: "Theater not found" });

    if (theater.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to add a show" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    theater.shows.push({ movie: movieId, showTime });
    await theater.save();

    res.status(201).json({ message: "Show added successfully", theater });
  } catch (error) {
    res.status(500).json({ message: "Error adding show", error });
  }
};
