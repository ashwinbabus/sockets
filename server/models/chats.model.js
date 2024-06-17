module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      users: [{ type: Number, ref: "users" }],
      latest_message: String,
      latest_message_date: Date,
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

  const Chats = mongoose.model("chats", schema);
  return Chats;
};
