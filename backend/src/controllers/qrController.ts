import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { AppDataSource } from '../config/data-source';
import { EntryExitLog, LogType } from '../entities/EntryExitLog';
import { User } from '../entities/User';

// Curfew hour in 24h format (e.g., 22 = 10 PM)
const CURFEW_HOUR = 22;

function isLateEntry(timestamp: Date): boolean {
  const hour = timestamp.getHours();
  return hour >= CURFEW_HOUR || hour < 5; // 10 PM to 5 AM
}

export const getMyQR = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  // QR encodes a signed payload: studentId + timestamp
  const payload = JSON.stringify({ studentId, ts: Date.now() });
  const qrDataUrl = await QRCode.toDataURL(payload);
  return res.json({ qr: qrDataUrl, studentId });
};

export const scanQR = async (req: Request, res: Response) => {
  const { qrPayload, qrToken, type } = req.body;
  const scannedBy = req.user!.id;

  const finalPayload = qrPayload || qrToken;

  if (!finalPayload || !type) {
    return res.status(400).json({ message: 'qrPayload (or qrToken) and type (ENTRY/EXIT) are required' });
  }

  let studentId: string;
  try {
    const parsed = JSON.parse(finalPayload);
    studentId = parsed.studentId;
  } catch {
    // Fallback: maybe qrToken is just the studentId (STU100)
    studentId = finalPayload; 
  }

  const userRepo = AppDataSource.getRepository(User);
  const student = await userRepo.findOne({ where: { id: studentId } });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const logRepo = AppDataSource.getRepository(EntryExitLog);
  const now = new Date();
  const late = type === LogType.ENTRY ? isLateEntry(now) : false;

  const log = logRepo.create({
    studentId,
    type: type as LogType,
    isLate: late,
    scannedBy,
    method: 'QR',
  });
  await logRepo.save(log);

  // Emit socket event for late entry
  if (late) {
    const io = req.app.get('io');
    if (io) {
      io.emit('curfew_violation', {
        studentId,
        studentName: student.name,
        timestamp: now,
      });
    }
  }

  return res.status(201).json({ message: 'Entry/exit logged', log, isLate: late });
};

export const getLogs = async (req: Request, res: Response) => {
  const { studentId, type, date } = req.query;
  const logRepo = AppDataSource.getRepository(EntryExitLog);
  const qb = logRepo.createQueryBuilder('log')
    .leftJoinAndSelect('log.student', 'student')
    .orderBy('log.timestamp', 'DESC');

  if (studentId) qb.andWhere('log.studentId = :studentId', { studentId });
  if (type) qb.andWhere('log.type = :type', { type });
  if (date) {
    qb.andWhere('DATE(log.timestamp) = :date', { date });
  }

  const logs = await qb.getMany();
  return res.json(logs);
};

export const getLateEntries = async (_req: Request, res: Response) => {
  const logs = await AppDataSource.getRepository(EntryExitLog).find({
    where: { isLate: true, type: LogType.ENTRY },
    relations: ['student'],
    order: { timestamp: 'DESC' },
  });
  return res.json(logs);
};
