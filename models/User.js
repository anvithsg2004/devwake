// models/User.js
// UPDATED - Changed mongoose import to be compatible with standalone Node scripts.

import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        unique: true,
    },
    image: String,
});

const User = models.User || model('User', UserSchema);

export default User;
