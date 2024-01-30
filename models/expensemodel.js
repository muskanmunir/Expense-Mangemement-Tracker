const mongoose = require("mongoose");

const expensemodel = new mongoose.Schema(
    {
        amount: Number,
        remark: String,
        category: {
          type: String,
          enum: ["utilities", "entertainment", "shopping", "food", "transportation", "rent", "miscellaneous", "travel"]
        },
        paymentmode: {
            type: String,
            enum: ["cash", "online", "cheque"],
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("expense", expensemodel);
