import { channel } from "diagnostics_channel";
import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema =  new Schema({
    Subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);