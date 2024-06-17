module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      crId: {
        type: Number,
        default: null,
      },
      userId: {
        type: Number,
        default: null,
      },
      fullName: {
        type: String,
        default: null,
      },
      userTypeId: {
        type: Number,
        default: null,
      },
      userTypeName: {
        type: String,
        default: null,
      },
      profilePicture: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
      role: {
        type: String,
        default: null,
      },
      position: {
        type: String,
        default: null,
      },
      campusName: {
        type: String,
        default: null,
      },
      campusId: {
        type: Number,
        default: null,
      },
      brandId: {
        type: Number,
        default: null,
      },
      brandName: {
        type: String,
        default: null,
      },
      created_by_id: String,
      created_by_name: String,
      updated_by_id: String,
      updated_by_name: String
    },
    { timestamps: true },
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Users = mongoose.model("users", schema);
  return Users;
};
