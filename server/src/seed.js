// server/src/seed.js
require('dotenv').config();
const { connect } = require('./db');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');

async function seed() {
  await connect(process.env.MONGO_URI);
  console.log('Connected to DB — seeding...');

  await User.deleteMany({});
  await Student.deleteMany({});
  await Assignment.deleteMany({});

  const teacherPass = await bcrypt.hash('teacher123', 10);
  const parentPass = await bcrypt.hash('parent123', 10);

  const teacher = await User.create({
    name: 'Ms. Sharma',
    email: 'teacher@example.com',
    passwordHash: teacherPass,
    role: 'teacher'
  });

  const parent = await User.create({
    name: 'Mr. Singh',
    email: 'parent@example.com',
    passwordHash: parentPass,
    role: 'parent'
  });

  const s1 = await Student.create({
    firstName: 'Aarav',
    lastName: 'K',
    className: '7A',
    rollNumber: '12',
    guardians: [parent._id]
  });

  const s2 = await Student.create({
    firstName: 'Maya',
    lastName: 'P',
    className: '7A',
    rollNumber: '15',
    guardians: [parent._id]
  });

  const assignment = await Assignment.create({
    title: 'Math Test 1',
    subject: 'Math',
    description: 'Chapters 1-3',
    assignedBy: teacher._id,
    assignedTo: [s1._id, s2._id],
    dueDate: new Date()
  });

  // push assignment ids into students (optional)
  await Student.updateMany({ _id: { $in: [s1._id, s2._id] } }, { $addToSet: { assignments: assignment._id } });

  console.log('Seed complete.');
  console.log('Teacher credentials: teacher@example.com / teacher123');
  console.log('Parent credentials : parent@example.com  / parent123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error', err);
  process.exit(1);
});
