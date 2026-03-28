import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';

const sanitizeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  address: user.address,
  dateOfBirth: user.dateOfBirth,
  department: user.department,
  year: user.year,
  studentId: user.studentId,
  role: user.role,
  createdAt: user.createdAt,
});

const generateStudentId = async () => {
  const repo = AppDataSource.getRepository(User);
  let id = '';
  let exists = true;
  while (exists) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
    id = `STU${randomDigits}`;
    const user = await repo.findOne({ where: { studentId: id } });
    if (!user) exists = false;
  }
  return id;
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber, address, dateOfBirth, department, year, studentId, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const userRepository = AppDataSource.getRepository(User);

  const existing = await userRepository.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const assignedRole = Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : UserRole.STUDENT;

  // Auto-generate studentId if not provided and role is STUDENT
  let finalStudentId = studentId || null;
  if (assignedRole === UserRole.STUDENT && !finalStudentId) {
    finalStudentId = await generateStudentId();
  }

  const user = userRepository.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber: phoneNumber || null,
    address: address || null,
    dateOfBirth: dateOfBirth || null,
    department: department || null,
    year: year || null,
    studentId: finalStudentId,
    role: assignedRole,
  });

  await userRepository.save(user);

  return res.status(201).json({
    message: 'User registered successfully',
    user: sanitizeUser(user),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password and role are required' });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.role !== role) {
    return res.status(403).json({ message: `Access denied for ${role} portal` });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT secret not configured' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1d' });

  return res.json({ token, user: sanitizeUser(user) });
};

export const getMe = async (req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(sanitizeUser(user));
};

export const getAllStudents = async (_req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User);
  const students = await userRepository.find({ where: { role: UserRole.STUDENT } });
  return res.json(students.map(sanitizeUser));
};
