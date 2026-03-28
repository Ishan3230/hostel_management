import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { MarketplaceListing, ListingStatus } from '../entities/MarketplaceListing';
import { User } from '../entities/User';

export const createListing = async (req: Request, res: Response) => {
  const sellerId = req.user!.id;
  const { title, description, price, category } = req.body;
  if (!title || !description || price === undefined) {
    return res.status(400).json({ message: 'title, description, and price are required' });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const listing = AppDataSource.getRepository(MarketplaceListing).create({
    sellerId,
    title,
    description,
    price: Number(price),
    category: category || 'OTHER',
    imageUrl,
    status: ListingStatus.ACTIVE,
  });
  await AppDataSource.getRepository(MarketplaceListing).save(listing);
  return res.status(201).json(listing);
};

export const getListings = async (req: Request, res: Response) => {
  const { category, status } = req.query;
  const qb = AppDataSource.getRepository(MarketplaceListing).createQueryBuilder('l')
    .leftJoinAndSelect('l.seller', 'seller')
    .orderBy('l.createdAt', 'DESC');

  qb.andWhere('l.status = :status', { status: status || ListingStatus.ACTIVE });
  if (category) qb.andWhere('l.category = :category', { category });

  const listings = await qb.getMany();
  return res.json(listings);
};

export const getMyListings = async (req: Request, res: Response) => {
  const sellerId = req.user!.id;
  const listings = await AppDataSource.getRepository(MarketplaceListing).find({
    where: { sellerId },
    order: { createdAt: 'DESC' },
  });
  return res.json(listings);
};

export const updateListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const repo = AppDataSource.getRepository(MarketplaceListing);
  const listing = await repo.findOne({ where: { id } });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.sellerId !== userId) return res.status(403).json({ message: 'Not authorized' });

  const { title, description, price, category, status } = req.body;
  if (title) listing.title = title;
  if (description) listing.description = description;
  if (price !== undefined) listing.price = Number(price);
  if (category) listing.category = category;
  if (status) listing.status = status;

  await repo.save(listing);
  return res.json(listing);
};

export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const repo = AppDataSource.getRepository(MarketplaceListing);
  const listing = await repo.findOne({ where: { id } });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.sellerId !== userId && !['SUPER_ADMIN', 'WARDEN'].includes(userRole)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  listing.status = ListingStatus.REMOVED;
  await repo.save(listing);
  return res.json({ message: 'Listing removed' });
};

export const getSellerContact = async (req: Request, res: Response) => {
  const { id } = req.params;
  const listing = await AppDataSource.getRepository(MarketplaceListing).findOne({
    where: { id },
    relations: ['seller'],
  });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  const { name, email, phoneNumber } = listing.seller as User;
  return res.json({ name, email, phoneNumber });
};
