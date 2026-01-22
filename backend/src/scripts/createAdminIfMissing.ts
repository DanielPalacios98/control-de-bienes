import dotenv from 'dotenv';
import connectDB from '../db';
import User, { UserRole } from '../models/User';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const existing = await User.findOne({ role: UserRole.SUPER_ADMIN });
    if (existing) {
      console.log(`Super admin already exists: ${existing.email} (id: ${existing._id})`);
      process.exit(0);
    }

    // ensure there is a branch to attach
    const Branch = require('../models/Branch').default;
    let branch = await Branch.findOne();
    if (!branch) {
      branch = await Branch.create({ name: 'Bodega Equipo y Vestuario', location: 'Sede', managerId: null });
      console.log('Created default branch:', branch._id.toString());
    }

    const admin = await User.create({
      name: 'Cbos. Rios Siulin',
      email: 'admin@fae.com',
      password: 'admin123',
      role: UserRole.SUPER_ADMIN,
      branchId: branch._id,
      status: 'active'
    });

    console.log('Created super admin:');
    console.log(`  email: ${admin.email}`);
    console.log(`  password: admin123`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

run();