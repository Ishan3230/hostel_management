import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Resource, ResourceBooking, BookingStatus } from '../entities/Resource';

export const getResources = async (_req: Request, res: Response) => {
  const resources = await AppDataSource.getRepository(Resource).find({ where: { isActive: true } });
  return res.json(resources);
};

export const createResource = async (req: Request, res: Response) => {
  const { name, description, totalSlots, type } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const resource = AppDataSource.getRepository(Resource).create({ 
    name, 
    description, 
    totalSlots: totalSlots || 5,
    type: type || 'OTHER'
  });
  await AppDataSource.getRepository(Resource).save(resource);
  return res.status(201).json(resource);
};

export const bookResource = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { resourceId, date, startTime, endTime } = req.body;
  if (!resourceId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'resourceId, date, startTime, endTime are required' });
  }

  const resource = await AppDataSource.getRepository(Resource).findOne({ where: { id: resourceId, isActive: true } });
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  // Check for double booking
  const existing = await AppDataSource.getRepository(ResourceBooking).findOne({
    where: { resourceId, date, startTime, endTime, status: BookingStatus.CONFIRMED },
  });
  if (existing) {
    return res.status(409).json({ message: 'This time slot is already booked' });
  }

  const booking = AppDataSource.getRepository(ResourceBooking).create({
    resourceId,
    studentId,
    date,
    startTime,
    endTime,
    status: BookingStatus.CONFIRMED,
  });
  await AppDataSource.getRepository(ResourceBooking).save(booking);
  return res.status(201).json(booking);
};

export const getMyBookings = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const bookings = await AppDataSource.getRepository(ResourceBooking).find({
    where: { studentId },
    relations: ['resource'],
    order: { date: 'DESC' },
  });
  return res.json(bookings);
};

export const getAllBookings = async (_req: Request, res: Response) => {
  const bookings = await AppDataSource.getRepository(ResourceBooking).find({
    relations: ['resource', 'student'],
    order: { date: 'DESC' },
  });
  return res.json(bookings);
};

export const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const repo = AppDataSource.getRepository(ResourceBooking);
  const booking = await repo.findOne({ where: { id } });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.studentId !== userId && !['SUPER_ADMIN', 'WARDEN'].includes(req.user!.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  booking.status = BookingStatus.CANCELLED;
  await repo.save(booking);
  return res.json(booking);
};
