import mongoose, {Schema, models} from "mongoose";
const userStockSchema = new Schema(
    {
      email: {
        type: String,
        required: true,
      },
      aboveThreshold: {
        type: Number,
        required: true,
      },
      belowThreshold: {
        type: Number,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  const UserSockInfo = models?.UserSockInfo || mongoose.model("UserSockInfo", userStockSchema);
  export default UserSockInfo;