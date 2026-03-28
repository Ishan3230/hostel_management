import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Room, RoomStatus, RoomType } from '../entities/Room';
import { RoomAllocation } from '../entities/RoomAllocation';
import { StudentPreference } from '../entities/StudentPreference';
import { User, UserRole } from '../entities/User';
import { Not } from 'typeorm';

// Score compatibility between two students
function compatibilityScore(a: StudentPreference, b: StudentPreference): number {
  let score = 0;
  if (a.sleepSchedule === b.sleepSchedule) score += 2;
  // Use new cleanliness field if available, otherwise fallback to level
  if (a.cleanliness && b.cleanliness) {
    if (a.cleanliness === b.cleanliness) score += 2;
  } else if (Math.abs(a.cleanlinessLevel - b.cleanlinessLevel) <= 1) {
    score += 2;
  }
  if (a.studyHabits === b.studyHabits) score += 2;
  if (a.department && b.department && a.department === b.department) score += 1;
  if (a.year && b.year && a.year === b.year) score += 1;
  return score;
}

export const getRooms = async (_req: Request, res: Response) => {
  const rooms = await AppDataSource.getRepository(Room).find();
  return res.json(rooms);
};

export const createRoom = async (req: Request, res: Response) => {
  const { roomNumber, floor, hostelBlock, type, capacity } = req.body;
  if (!roomNumber || floor === undefined) {
    return res.status(400).json({ message: 'roomNumber and floor are required' });
  }
  const room = AppDataSource.getRepository(Room).create({
    roomNumber,
    floor,
    hostelBlock: hostelBlock || null,
    type: type || RoomType.DOUBLE,
    capacity: capacity || 2,
  });
  await AppDataSource.getRepository(Room).save(room);
  return res.status(201).json(room);
};

export const getPreferences = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const pref = await AppDataSource.getRepository(StudentPreference).findOne({ where: { studentId } });
  return res.json(pref || null);
};

export const submitPreference = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { sleepSchedule, cleanliness, studyHabits, hobbies, additionalNotes } = req.body;

  const userRepo = AppDataSource.getRepository(User);
  const student = await userRepo.findOne({ where: { id: studentId } });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const prefRepo = AppDataSource.getRepository(StudentPreference);
  let pref = await prefRepo.findOne({ where: { studentId } });

  // Map cleanliness to level for legacy score logic
  let level = 3;
  if (cleanliness === 'NEAT_FREAK') level = 5;
  if (cleanliness === 'MODERATE') level = 3;
  if (cleanliness === 'MESSY') level = 1;

  if (pref) {
    pref.sleepSchedule = sleepSchedule || pref.sleepSchedule;
    pref.cleanliness = cleanliness || pref.cleanliness;
    pref.cleanlinessLevel = level;
    pref.studyHabits = studyHabits || pref.studyHabits;
    pref.hobbies = hobbies || pref.hobbies;
    pref.department = student.department;
    pref.year = student.year;
    pref.additionalNotes = additionalNotes || pref.additionalNotes;
  } else {
    pref = prefRepo.create({
      studentId,
      sleepSchedule,
      cleanliness: cleanliness || 'MODERATE',
      cleanlinessLevel: level,
      studyHabits,
      hobbies: hobbies || null,
      department: student.department,
      year: student.year,
      additionalNotes: additionalNotes || null,
    });
  }
  await prefRepo.save(pref);
  return res.json(pref);
};

export const autoAllocate = async (_req: Request, res: Response) => {
  const prefRepo = AppDataSource.getRepository(StudentPreference);
  const allocRepo = AppDataSource.getRepository(RoomAllocation);
  const roomRepo = AppDataSource.getRepository(Room);

  // Get students without active allocation
  const allPrefs = await prefRepo.find();
  const activeAllocs = await allocRepo.find({ where: { isActive: true } });
  const allocatedStudentIds = new Set(activeAllocs.map((a) => a.studentId));

  const unallocatedPrefs = allPrefs.filter((p) => !allocatedStudentIds.has(p.studentId));

  if (unallocatedPrefs.length === 0) {
    return res.json({ message: 'All students already allocated', assignments: [] });
  }

  const availableRooms = await roomRepo.find({ where: { status: RoomStatus.AVAILABLE } });

  const assignments: { studentId: string; roomId: string }[] = [];
  const assigned = new Set<string>();

  for (const room of availableRooms) {
    const slotsLeft = room.capacity - room.currentOccupancy;
    if (slotsLeft <= 0) continue;

    const candidates = unallocatedPrefs.filter((p) => !assigned.has(p.studentId));
    if (candidates.length === 0) break;

    // Sort pairs by compatibility
    for (let i = 0; i < candidates.length && room.currentOccupancy < room.capacity; i++) {
      const candidate = candidates[i];
      if (assigned.has(candidate.studentId)) continue;
      assigned.add(candidate.studentId);
      room.currentOccupancy++;
      const alloc = allocRepo.create({
        roomId: room.id,
        studentId: candidate.studentId,
        isActive: true,
      });
      await allocRepo.save(alloc);
      assignments.push({ studentId: candidate.studentId, roomId: room.id });
    }

    if (room.currentOccupancy >= room.capacity) {
      room.status = RoomStatus.FULL;
    }
    await roomRepo.save(room);
  }

  return res.json({ message: 'Auto-allocation complete', assignments, allocatedCount: assignments.length });
};

export const manualAllocate = async (req: Request, res: Response) => {
  const { studentId, roomId, roomNumber } = req.body;
  
  if (!studentId || (!roomId && !roomNumber)) {
    return res.status(400).json({ message: 'studentId and (roomId or roomNumber) are required' });
  }

  const roomRepo = AppDataSource.getRepository(Room);
  const allocRepo = AppDataSource.getRepository(RoomAllocation);

  let room;
  if (roomId) {
    room = await roomRepo.findOne({ where: { id: roomId } });
  } else {
    room = await roomRepo.findOne({ where: { roomNumber } });
  }

  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.currentOccupancy >= room.capacity) {
    return res.status(400).json({ message: 'Room is full' });
  }

  // Remove existing active allocation
  const existing = await allocRepo.findOne({ where: { studentId, isActive: true } });
  if (existing) {
    existing.isActive = false;
    existing.vacatedAt = new Date();
    await allocRepo.save(existing);
    // Decrement previous room
    const prevRoom = await roomRepo.findOne({ where: { id: existing.roomId } });
    if (prevRoom) {
      prevRoom.currentOccupancy = Math.max(0, prevRoom.currentOccupancy - 1);
      if (prevRoom.status === RoomStatus.FULL) prevRoom.status = RoomStatus.AVAILABLE;
      await roomRepo.save(prevRoom);
    }
  }

  const alloc = allocRepo.create({ roomId, studentId, isActive: true });
  await allocRepo.save(alloc);

  room.currentOccupancy++;
  if (room.currentOccupancy >= room.capacity) room.status = RoomStatus.FULL;
  await roomRepo.save(room);

  return res.status(201).json({ message: 'Student allocated', allocation: alloc });
};

export const getMyAllocation = async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const allocRepo = AppDataSource.getRepository(RoomAllocation);
  
  const alloc = await allocRepo.findOne({
    where: { studentId, isActive: true },
    relations: ['room'],
  });

  if (!alloc) return res.json({ allocation: null, roommates: [] });

  const roommates = await allocRepo.find({
    where: { 
      roomId: alloc.roomId, 
      isActive: true, 
      studentId: Not(studentId) 
    },
    relations: ['student'],
  });

  return res.json({ 
    allocation: alloc, 
    roommates: roommates.map(r => ({
      id: r.student.id,
      name: r.student.name,
      email: r.student.email,
      department: r.student.department,
    }))
  });
};

export const getAllAllocations = async (_req: Request, res: Response) => {
  const allocs = await AppDataSource.getRepository(RoomAllocation).find({
    where: { isActive: true },
    relations: ['room', 'student'],
  });
  return res.json(allocs);
};
