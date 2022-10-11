const Admin = require('../models/admin.models');


exports.Services = {
  find: () => Admin.find({}),

  findAdminByEmail: (id) => Admin.findOne(id),

  findAdminById: async (id) => {
    const admin = await Admin.findById(id);

    if (!admin) throw new Error('Admin not found');
    return admin;
  },
  signUp: async (data) => {
    const admin = new Admin({ ...data });
    await admin.save();
    if (!admin) throw new Error('Admin not found');
    return admin;
  },
};
