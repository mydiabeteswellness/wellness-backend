const Appointment = require("../models/Appointment");
const User = require("../models/User");

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(400).json({ msg: "Invalid doctor" });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      notes,
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Patient: see own
// Doctor: see own
exports.getMyAppointments = async (req, res) => {
  try {
    const query =
      req.user.role === "DOCTOR"
        ? { doctor: req.user.id }
        : { patient: req.user.id };

    const appointments = await Appointment.find(query)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // PENDING / CONFIRMED / COMPLETED / CANCELLED
    const allowed = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: "Not found" });

    // Only doctor or admin can change status
    if (
      req.user.role === "DOCTOR" &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
