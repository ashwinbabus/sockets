module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      chat_id: { type: String, ref: "chats" },
      message: String,
      created_by_id: Number, 
      created_by_name: String,
      updated_by_id: Number,
      updated_by_name: String,
    },
    { timestamps: true },
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Messages = mongoose.model("messages", schema);
  return Messages;
};
