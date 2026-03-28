import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { AppDataSource } from '../config/data-source';
import { VisitorPass, VisitorStatus } from '../entities/VisitorPass';

export const createVisitorPass = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { visitorName, visitorPhone, purpose, expectedArrival, expectedDeparture, expiryHours } = req.body;

  if (!visitorName || !visitorPhone) {
    return res.status(400).json({ message: 'visitorName and visitorPhone are required' });
  }

  const qrToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (expiryHours || 24));

  const pass = AppDataSource.getRepository(VisitorPass).create({
    studentId,
    visitorName,
    visitorPhone,
    purpose: purpose || null,
    qrToken,
    status: VisitorStatus.PENDING,
    expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
    expectedDeparture: expectedDeparture ? new Date(expectedDeparture) : null,
    expiresAt,
  });
  await AppDataSource.getRepository(VisitorPass).save(pass);

  const qrImage = await QRCode.toDataURL(qrToken);
  return res.status(201).json({ pass, qrImage });
};

export const getMyVisitors = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const passes = await AppDataSource.getRepository(VisitorPass).find({
    where: { studentId },
    order: { createdAt: 'DESC' },
  });
  return res.json(passes);
};

export const getAllVisitors = async (_req: Request, res: Response) => {
  const passes = await AppDataSource.getRepository(VisitorPass).find({
    relations: ['student'],
    order: { createdAt: 'DESC' },
  });
  return res.json(passes);
};

export const scanVisitorQR = async (req: Request, res: Response) => {
  const { qrToken, type } = req.body; // type: 'entry' | 'exit'
  if (!qrToken) return res.status(400).json({ message: 'qrToken is required' });

  const repo = AppDataSource.getRepository(VisitorPass);
  const pass = await repo.findOne({ where: { qrToken } });
  if (!pass) return res.status(404).json({ message: 'Visitor pass not found' });

  const now = new Date();
  if (pass.expiresAt < now) {
    pass.status = VisitorStatus.EXPIRED;
    await repo.save(pass);
    return res.status(400).json({ message: 'Visitor pass has expired' });
  }

  if (type === 'entry') {
    pass.actualEntry = now;
    pass.status = VisitorStatus.ACTIVE;
  } else {
    pass.actualExit = now;
    if (pass.expiresAt < now) {
      pass.status = VisitorStatus.EXPIRED;
    }
  }
  await repo.save(pass);
  return res.json({ message: 'Visitor log updated', pass });
};

export const denyVisitor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const repo = AppDataSource.getRepository(VisitorPass);
  const pass = await repo.findOne({ where: { id } });
  if (!pass) return res.status(404).json({ message: 'Visitor pass not found' });
  pass.status = VisitorStatus.DENIED;
  await repo.save(pass);
  return res.json(pass);
};
