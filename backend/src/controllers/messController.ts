import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { MessFeedback, MessMenu } from '../entities/MessMenu';

export const uploadMenu = async (req: Request, res: Response) => {
  const { date, mealType, items } = req.body;
  const uploadedBy = req.user!.id;
  if (!date || !mealType || !items) {
    return res.status(400).json({ message: 'date, mealType, and items are required' });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const menu = AppDataSource.getRepository(MessMenu).create({
    date,
    mealType,
    items: Array.isArray(items) ? items : items.split(',').map((i: string) => i.trim()),
    uploadedBy,
    imageUrl,
  });
  await AppDataSource.getRepository(MessMenu).save(menu);
  return res.status(201).json(menu);
};

export const getMenus = async (req: Request, res: Response) => {
  const { date, mealType } = req.query;
  const qb = AppDataSource.getRepository(MessMenu).createQueryBuilder('m').orderBy('m.date', 'DESC');
  if (date) qb.andWhere('m.date = :date', { date });
  if (mealType) qb.andWhere('m.mealType = :mealType', { mealType });
  const menus = await qb.getMany();
  return res.json(menus);
};

export const submitFeedback = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { menuId, rating, comment } = req.body;
  if (!menuId || !rating) {
    return res.status(400).json({ message: 'menuId and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const menu = await AppDataSource.getRepository(MessMenu).findOne({ where: { id: menuId } });
  if (!menu) return res.status(404).json({ message: 'Menu not found' });

  // Check for duplicate feedback
  const existing = await AppDataSource.getRepository(MessFeedback).findOne({
    where: { menuId, studentId },
  });
  if (existing) {
    return res.status(409).json({ message: 'You have already submitted feedback for this meal' });
  }

  const feedback = AppDataSource.getRepository(MessFeedback).create({
    menuId,
    studentId,
    rating: Number(rating),
    comment: comment || null,
  });
  await AppDataSource.getRepository(MessFeedback).save(feedback);
  return res.status(201).json(feedback);
};

export const getMessAnalytics = async (_req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(MessFeedback);
  const analytics = await repo.createQueryBuilder('f')
    .leftJoin('f.menu', 'menu')
    .select('menu.mealType', 'mealType')
    .addSelect('menu.date', 'date')
    .addSelect('AVG(f.rating)', 'avgRating')
    .addSelect('COUNT(f.id)', 'totalRatings')
    .groupBy('menu.mealType')
    .addGroupBy('menu.date')
    .orderBy('menu.date', 'DESC')
    .getRawMany();
  return res.json(analytics);
};
export const getAllFeedbacks = async (_req: Request, res: Response) => {
  const feedbacks = await AppDataSource.getRepository(MessFeedback).find({
    relations: ['student', 'menu'],
    order: { createdAt: 'DESC' },
  });
  return res.json(feedbacks);
};
