import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../entities/Complaint';

function getPriority(category: ComplaintCategory): ComplaintPriority {
  if (category === ComplaintCategory.WATER || category === ComplaintCategory.ELECTRICITY) {
    return ComplaintPriority.HIGH;
  }
  if (category === ComplaintCategory.INTERNET) {
    return ComplaintPriority.MEDIUM;
  }
  return ComplaintPriority.LOW;
}

export const createComplaint = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { category, description } = req.body;
  if (!category || !description) {
    return res.status(400).json({ message: 'category and description are required' });
  }
  const priority = getPriority(category as ComplaintCategory);
  const complaint = AppDataSource.getRepository(Complaint).create({
    studentId,
    category,
    description,
    priority,
    status: ComplaintStatus.PENDING,
  });
  await AppDataSource.getRepository(Complaint).save(complaint);

  // Emit socket update
  const io = req.app.get('io');
  if (io) io.emit('new_complaint', complaint);

  return res.status(201).json(complaint);
};

export const getAllComplaints = async (req: Request, res: Response) => {
  const { status, priority, category } = req.query;
  const qb = AppDataSource.getRepository(Complaint).createQueryBuilder('c')
    .leftJoinAndSelect('c.student', 'student')
    .orderBy('c.createdAt', 'DESC');

  if (status) qb.andWhere('c.status = :status', { status });
  if (priority) qb.andWhere('c.priority = :priority', { priority });
  if (category) qb.andWhere('c.category = :category', { category });

  const complaints = await qb.getMany();
  return res.json(complaints);
};

export const getMyComplaints = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const complaints = await AppDataSource.getRepository(Complaint).find({
    where: { studentId },
    order: { createdAt: 'DESC' },
  });
  return res.json(complaints);
};

export const updateComplaintStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const resolvedBy = req.user!.id;

  const repo = AppDataSource.getRepository(Complaint);
  const complaint = await repo.findOne({ where: { id } });
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  complaint.status = status;
  if (status === ComplaintStatus.RESOLVED) {
    complaint.resolvedBy = resolvedBy;
    complaint.resolvedAt = new Date();
  }
  await repo.save(complaint);

  const io = req.app.get('io');
  if (io) io.emit('complaint_update', complaint);

  return res.json(complaint);
};

export const getComplaintAnalytics = async (_req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Complaint);
  const byCategoryRaw = await repo.createQueryBuilder('c')
    .select('c.category', 'category')
    .addSelect('COUNT(*)', 'count')
    .groupBy('c.category')
    .getRawMany();

  const byStatusRaw = await repo.createQueryBuilder('c')
    .select('c.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('c.status')
    .getRawMany();

  const byPriorityRaw = await repo.createQueryBuilder('c')
    .select('c.priority', 'priority')
    .addSelect('COUNT(*)', 'count')
    .groupBy('c.priority')
    .getRawMany();

  return res.json({ byCategory: byCategoryRaw, byStatus: byStatusRaw, byPriority: byPriorityRaw });
};
