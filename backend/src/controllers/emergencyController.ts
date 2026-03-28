import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { EmergencyAlert, AlertStatus } from '../entities/EmergencyAlert';

export const triggerAlert = async (req: Request, res: Response) => {
  const triggeredBy = req.user!.id;
  const { category, description, location } = req.body;

  if (!category) {
    return res.status(400).json({ message: 'category is required (MEDICAL/FIRE/SECURITY)' });
  }

  const alert = AppDataSource.getRepository(EmergencyAlert).create({
    triggeredBy,
    category,
    description: description || null,
    location: location || null,
    status: AlertStatus.ACTIVE,
  });
  await AppDataSource.getRepository(EmergencyAlert).save(alert);

  // Real-time broadcast to all connected clients
  const io = req.app.get('io');
  if (io) {
    io.emit('emergency_alert', {
      id: alert.id,
      category: alert.category,
      description: alert.description,
      location: alert.location,
      triggeredBy,
      createdAt: alert.createdAt,
    });
  }

  return res.status(201).json(alert);
};

export const getAlerts = async (_req: Request, res: Response) => {
  const alerts = await AppDataSource.getRepository(EmergencyAlert).find({
    relations: ['triggeredByUser'],
    order: { createdAt: 'DESC' },
  });
  return res.json(alerts);
};

export const resolveAlert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const repo = AppDataSource.getRepository(EmergencyAlert);
  const alert = await repo.findOne({ where: { id } });
  if (!alert) return res.status(404).json({ message: 'Alert not found' });

  alert.status = AlertStatus.RESOLVED;
  alert.resolvedAt = new Date();
  await repo.save(alert);

  const io = req.app.get('io');
  if (io) io.emit('alert_resolved', { id: alert.id });

  return res.json(alert);
};
