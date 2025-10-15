import mongoose from "mongoose";

const UserSchema = new mongoose.Schema( // Define o template de objeto que deve ser retornado ao BD
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    pass: {type: String, required: true, trim: true},
    role: { type: String, enum: ["admin", "user"], default: "user" }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);