import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { AppDataSource } from './config/data-source';
import { User, UserRole } from './entities/User';

// Routes
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import qrRoutes from './routes/qrRoutes';
import complaintRoutes from './routes/complaintRoutes';
import visitorRoutes from './routes/visitorRoutes';
import messRoutes from './routes/messRoutes';
import resourceRoutes from './routes/resourceRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import { globalErrorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT) || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: frontendUrl,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// Middlewares
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Hostel Management System API',
      version: '1.0.0',
      description: 'REST API documentation for the Smart Hostel Management System',
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler (MUST BE LAST)
app.use(globalErrorHandler);

// Seed default users
const seedUsers = async () => {
  const userRepository = AppDataSource.getRepository(User);

  const defaults = [
    { name: 'Super Admin', email: 'superadmin@hostel.com', password: 'admin123', role: UserRole.SUPER_ADMIN },
    { name: 'Warden Alice', email: 'warden@hostel.com', password: 'warden123', role: UserRole.WARDEN },
    { name: 'Security Guard', email: 'security@hostel.com', password: 'security123', role: UserRole.SECURITY },
    { name: 'Student Demo', email: 'student@hostel.com', password: 'student123', role: UserRole.STUDENT, studentId: 'STU001', department: 'MCA', year: 1 },
  ];

  for (const d of defaults) {
    const exists = await userRepository.findOne({ where: { email: d.email } });
    if (!exists) {
      const hashed = await bcrypt.hash(d.password, 10);
      const user = userRepository.create({ ...d, password: hashed });
      await userRepository.save(user);
      console.log(`Seeded: ${d.email} / ${d.password} [${d.role}]`);
    } else if (exists.role !== d.role) {
      exists.role = d.role;
      await userRepository.save(exists);
      console.log(`Role updated for: ${d.email} to [${d.role}]`);
    }
  }
};

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected');
    await seedUsers();
    server.listen(port, () => {
      console.log(`\n🏠 Smart Hostel Management System`);
      console.log(`✅ Backend running on http://localhost:${port}`);
      console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
      console.log(`🔌 Socket.io ready for real-time events\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize datasource:', err);
    process.exit(1);
  });

// Prevent process from crashing on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
