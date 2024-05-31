import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  currentMonster: {
    type: Number,  // Assuming you want to store the index of the current monster
    default: 0
  },
  monsters: [{
    name: String,
    health: Number,
    weaknesses: [String],
    resistances: [String],
    image: String
  }],
  monstersKilled: { type: Number, default: 0 }
});


UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Check if the model exists before compiling it
const User = mongoose.models.Customer || mongoose.model('User', UserSchema);

export default { User,};
